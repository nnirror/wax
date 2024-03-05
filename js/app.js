/* BEGIN audio context initialization */
// create audio context
const WAContext = window.AudioContext || window.webkitAudioContext;
const context = new WAContext();
// set channelCount to maximum amount of channels available
context.destination.channelCount = context.destination.maxChannelCount;
// set channelCountMode to "explicit"
context.destination.channelCountMode = "explicit";
// set channelInterpretation to "discrete"
context.destination.channelInterpretation = "discrete";
// create channel merger for speaker output
const channelMerger = context.createChannelMerger(context.destination.channelCount);
channelMerger.connect(context.destination);
/* END audio context initialization */

/* BEGIN IndexedDB */
let db;
let request = indexedDB.open('myDatabase', 1);
request.onupgradeneeded = function(e) {
    db = e.target.result;
    db.createObjectStore('workspaceState', { autoIncrement: true });
};
request.onsuccess = function(e) {
    db = e.target.result;
};
request.onerror = function(e) {
    console.error('Unable to open database.', e);
};
/* END IndexedDB */

/* BEGIN UI initialization */
// create workspace DOM elements
const workspace = document.getElementById('workspace');
const navBar = document.getElementById('ui-container');
// create dropdown of all audio devices
let deviceDropdown = createDropdownofAllDevices();

// create a button for starting audio
createButtonForNavBar(
    'Start Audio',
    'startAudioButton navbarButton',
    () => context.resume()
);

// create a button for adding audio devices to the workspace
createButtonForNavBar(
    'Add device',
    'deviceSelectButton navbarButton',
    () => {
        openAwesompleteUI(true);
    }
);

// create a button for saving workspace state
createButtonForNavBar('Save State', 'saveStateButton navbarButton', ()=>{getWorkspaceState(true)});

// create a button for reloading workspace state
createButtonForNavBar('Retrieve State', 'reloadStateButton navbarButton', async () => {
    await reconstructWorkspaceState();
    context.resume();
});

createButtonForNavBar('Copy State', 'copyStateButton navbarButton', async () => {
    // get the workspace state
    let workspaceState = getWorkspaceState();
    
    // serialize the workspace state
    let serializedState = JSON.stringify(workspaceState);
    
    // encode the serialized state as a URI component
    let encodedState = LZString.compressToEncodedURIComponent(serializedState);
    
    // format as a query string
    let queryString = `state=${encodedState}`;
    
    // get the current URL without query parameters
    let currentUrl = window.location.origin + window.location.pathname;
    
    // combine the current URL with the query string
    let fullUrl = `${currentUrl}?${queryString}`;
    
    // copy to clipboard
    navigator.clipboard.writeText(fullUrl).then(function() {
        alert('successfully copied to clipboard!');
    }, function(err) {
        // TODO: error handling
    });
});

let container = document.createElement("div");
let label = document.createElement("span");
label.textContent = "bpm";

let numberInput = document.createElement("input");
numberInput.type = "number";
numberInput.min = "1";
numberInput.max = "1000";
numberInput.value = "120";
numberInput.id = "bpm-input";
numberInput;
let debounceTimer;
numberInput.onchange = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const inputElements = workspace.querySelectorAll('input');
        inputElements.forEach((inputElement) => {
            // create/trigger a change event
            const event = new Event('change');
            inputElement.dispatchEvent(event);
        });
    }, 250); // 250ms delay
};
container.id = "bpm";
container.append(numberInput);
container.append(label);
navBar.append(container);

/* END UI initialization */

/* BEGIN globally acessible objects */
let deviceCounts = {};
let devices = {};
let mousePosition = { x: 0, y: 0 };
let sourceDeviceId = null;
let sourceOutputIndex = null;
let selectedDevice = null;
let shiftHeld = false;
/* END globally acessible objects */

checkForQueryStringParams();

/* BEGIN event handlers */
jsPlumb.bind("connectionDetached", function(info) {
    let sourceDevice = devices[info.sourceId];
    let targetDevice = devices[info.targetId];
    if (sourceDevice && targetDevice && sourceDevice.connections) {
        let connection = sourceDevice.connections.find(conn => conn.target === info.targetId);
        if (connection) {
            sourceDevice.device.node.disconnect(connection.splitter);
            connection.splitter.disconnect(devices[connection.target].device.node, connection.output, connection.input);
            // remove the connection from the list
            sourceDevice.connections = sourceDevice.connections.filter(conn => conn !== connection);
        }
    }
});
// listen for the keydown event
window.addEventListener('keydown', (event) => {
    if (event.key === 'Shift') {
        shiftHeld = true;
    }
});
// listen for the keyup event
window.addEventListener('keyup', (event) => {
    if (event.key === 'Shift') {
        shiftHeld = false;
        jsPlumb.clearDragSelection();
    }
});

document.addEventListener('mousemove', function(event) {
    mousePosition.x = event.pageX;
    mousePosition.y = event.pageY;
});

initializeAwesomplete();
/* END event handlers */

/* BEGIN functions */
function addMicrophoneInputDeviceToDropdown (deviceDropdown) {
    const micInputOption = document.createElement('option');
    micInputOption.value = "mic";
    micInputOption.innerText = "microphone input";
    deviceDropdown.appendChild(micInputOption);
}

function openAwesompleteUI(fromButtonClick) {
    // get the dropdown element
    var dropdown = document.querySelector('.deviceDropdown');
    
    // get the options from the dropdown
    var list = Array.from(dropdown.options).map(function(option) {
        return option.text;
    });

    var p = document.createElement('p');
    p.textContent = "Type to select a device...";

    // create a new div element for autocomplete
    var div = document.createElement('div');
    div.className = 'awesomplete';
    div.style.position = 'absolute';
    div.style.left = fromButtonClick ? '10px' : mousePosition.x + 'px';
    div.style.top = fromButtonClick ? '70px' : mousePosition.y + 'px';

    div.appendChild(p);

    // create a new input element for autocomplete
    var input = document.createElement('input');
    div.appendChild(input);
    document.body.appendChild(div);

    // initialize autocomplete with the input and list
    var awesomplete = new Awesomplete(input, {
        list: list,
        minChars: 1
    });

    // focus the input
    input.focus();

    // function for hiding the Awesomplete widget
    var hideAwesomplete = function() {
        if (!awesomplete.selected) {
            awesomplete.close();
            div.style.display = 'none';
        }
    };

    // create a new button element
    var button = document.createElement('button');
    button.textContent = 'add';
    button.className = 'awesomplete-submit';
    div.appendChild(button);

    // function to handle the creation of the device by name
    async function handleCreateDeviceByName() {
        // if there's only one result in the autocomplete list, use that result
        if (awesomplete.ul.childNodes.length === 1) {
            if ( awesomplete.ul.childNodes[0].textContent == 'microphone input' ) {
                await createDeviceByName('mic');
            }
            else if ( awesomplete.ul.childNodes[0].textContent == 'speaker' ) {
                await createDeviceByName('outputnode');
            }
            else {
                await createDeviceByName(awesomplete.ul.childNodes[0].textContent);
            }
        } else {
            // use exactly what the user typed
            if ( input.value == 'speaker' ) {
                await createDeviceByName('outputnode');
            }
            else {
                await createDeviceByName(input.value);
            }
        }
    }

    // add event listener for click event on the button
    button.addEventListener('mousedown', function(event) {
        event.preventDefault();
        handleCreateDeviceByName();
    });

    // add event listener for keydown event on the input
    input.addEventListener('keydown', async function(event) {
        // if enter key is pressed, call the createDeviceByName function
        if (event.key === 'Enter') {
            event.preventDefault();
            await handleCreateDeviceByName();
            hideAwesomplete();
        }
        // if escape key is pressed, hide autocomplete
        else if (event.key === 'Escape') {
            hideAwesomplete();
        }
    });

    // add event listener for blur event to also hide the autocomplete
    input.addEventListener('blur', hideAwesomplete);
}

function initializeAwesomplete () {
    document.addEventListener('keydown', function(event) {
        // check if 'n' key is pressed and no input is focused
        if (event.key === 'n' && document.activeElement.tagName.toLowerCase() !== 'input') {
            event.preventDefault();
            openAwesompleteUI();
        }
    });
}

async function createMicrophoneDevice() {
    // TODO: look into / fix occasional garbled mic input
    // get access to the microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // create a source node from the stream
    const source = context.createMediaStreamSource(stream);
    // create a wrapper object for the source
    const device = {
        node: source,
        it: {
            T: {
                outlets: [{ comment: 'microphone output' }], // these need to exist so they work like the other WASM modules built with RNBO
                inlets: [{ comment: 'microphone input' }]
            }
        }
    };
    return device;
}

function attachOutports(device,deviceDiv) {
    const outports = device.outports;
    if (typeof outports =='undefined' || outports.length < 1) {
        return;
    }
    // listen on outports for any "regen" events to regenerate its parameters
    device.messageEvent.subscribe((ev) => {
        // ignore message events that don't belong to an outport
        if (outports.findIndex(elt => elt.tag === ev.tag) < 0) return;

        // select all input elements within the deviceDiv
        const inputElements = deviceDiv.querySelectorAll('input');

        inputElements.forEach((inputElement) => {
            // create/trigger a change event
            const event = new Event('change');
            inputElement.dispatchEvent(event);
        });
    });
}

function removeDeviceFromWorkspace(deviceId) {
    const { device, div } = devices[deviceId];

    // remove the device div from the workspace
    div.parentNode.removeChild(div);

    if (!deviceId.startsWith('outputnode')) {
        // disconnect the device from the web audio graph
        device.node.disconnect();
    }

    // remove the device from storage
    delete devices[deviceId];
}

function addInputsForDevice(device) {
    const inportForm = document.createElement('form');
    const inportContainer = document.createElement('div');
    let inportTag = null;
    let inports = [];

    const messages = device.messages;
    if (typeof messages !== 'undefined') {
        inports = messages.filter(message => message.type === RNBO.MessagePortType.Inport);
    }

    if (inports.length > 0) {
        inports.forEach(inport => {
            const inportText = document.createElement('input');
            inportText.type = 'text';
            inportText.id = inport.tag;
            inportText.className = 'deviceInport'
            inportText.addEventListener('change', function(event) {
                if (document.activeElement !== event.target) {
                    scheduleDeviceEvent(device, inport, this.value);
                }
            });
            
            inportText.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    scheduleDeviceEvent(device, inport, this.value);
                }
            });
    
            // create a label for the input
            const inportLabel = document.createElement('label');
            inportLabel.htmlFor = inportText.id;
            inportLabel.textContent = inport.tag;
            inportLabel.className = 'deviceInportLabel';
    
            // append the label and input to the inportContainer
            inportContainer.appendChild(inportLabel);
            inportContainer.appendChild(inportText);
        });
    
        inportForm.appendChild(inportContainer);
    }
    return inportForm;
}

function calculateNoteValues(bpm) {
    let out = '';
    for (var i = 1; i <= 128; i++) {
      let calculated_nv = Math.round((((60000/bpm)/i)*4)*(44100*0.001));
      out += `var n${i} = ${calculated_nv};`;
    }
    return out;
}

function scheduleDeviceEvent(device, inport, value) {
    eval(calculateNoteValues(numberInput.value));
    try {
        // TODO: prevent evalation if input element is focused, or some way of stopping evaluation becuase
        // if i'm in the middle of composing a pattern and it evaluates something in the interim, it can 
        // crash the system or cause undesired behavior
        let values;
        // TODO: pretty hacky but functioning - evaluation of the inport of a pattern~ device should 
        // produces an array of data for a wavetable. the array going into the inport needs to be 
        // prepended with the length of the array so the buffer can be reallocated in RNBO
        value = value.replace(/_\./g, '$().');
        if (device.dataBufferIds == 'pattern') {
            // anonymous facet pattern replacement
            values = eval(value).data;
            values.unshift(values.length);
        }
        else {
            values = value.split(/\s+/).map(s => parseFloat(eval(s)));
        }
        let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inport.tag, values);
        device.scheduleEvent(messageEvent);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

function startConnection(deviceId, outputIndex) {
    sourceDeviceId = deviceId;
    sourceOutputIndex = outputIndex;
}

function finishConnection(deviceId, inputIndex) {
    if (sourceDeviceId) {
        const sourceDevice = devices[sourceDeviceId].device;
        const targetDevice = devices[deviceId] ? devices[deviceId].device : null;

        // create channel splitter
        let splitter = context.createChannelSplitter(sourceDevice.numOutputChannels);

        // connect source device's output to the splitter
        sourceDevice.node.connect(splitter);

        if (targetDevice) {
            // If the target device is a regular device, connect it as usual
            splitter.connect(targetDevice.node, sourceOutputIndex, inputIndex);
        } else {
            // If the target device is one of the special divs, connect it to the channelMerger
            splitter.connect(channelMerger, sourceOutputIndex, inputIndex);
        }

        let connectionId = Date.now();
        devices[sourceDeviceId].connections = devices[sourceDeviceId].connections || [];
        devices[sourceDeviceId].connections.push({ id: connectionId, splitter, target: deviceId, output: sourceOutputIndex, input: inputIndex });
        devices[sourceDeviceId].splitter = splitter;

        let targetDeviceInputName;
        if (deviceId.startsWith('outputnode')) {
            targetDeviceInputName = `speaker channel`;
        }
        else {
            targetDeviceInputName = devices[deviceId].device.it.T.inlets[inputIndex].comment;
        }
        let sourceDeviceOutputName = devices[sourceDeviceId].device.it.T.outlets[sourceOutputIndex].comment;

        // visualize the connection
        const connection = jsPlumb.connect({
            source: sourceDeviceId,
            target: deviceId,
            anchors: [
                ["Perimeter", { shape: "Rectangle", anchorCount: 50 }],
                ["Perimeter", { shape: "Rectangle", anchorCount: 50 }]
            ],
            endpoint: ["Dot", { radius: 4 }],
            paintStyle: { stroke: "grey", strokeWidth: 2, fill: "transparent" },
            endpointStyle: { fill: "black", outlineStroke: "transparent", outlineWidth: 12 },
            connector: ["StateMachine"],
            overlays: [
                ["Arrow", { width: 12, length: 12, location: 1 }],
                ["Custom", {
                    create: function() {
                        return document.createElement("div");
                    },
                    id: "customOverlay"
                }],
                ["Label", {
                    label: `${sourceDeviceOutputName} -> ${targetDeviceInputName}`,
                    cssClass: "aLabelClass",
                    location: 0.85
                }]
            ],
        });
        sourceDeviceId = null;
        sourceOutputIndex = null;
    }
    jsPlumb.repaintEverything();
}

async function createDeviceByName(filename) {
    let deviceDiv;
    if (filename === "mic") {
        const device = await createMicrophoneDevice();
        deviceDiv = addDeviceToWorkspace(device, "microphone input", false);
    }
    else if ( filename.startsWith('outputnode') ) {
        deviceDiv  = addDeviceToWorkspace(null, 'outputnode', true);
    }
    else {
        const response = await fetch(`wasm/${filename}.json`);
        const patcher = await response.json();
        const device = await RNBO.createDevice({ context, patcher });
        deviceDiv = addDeviceToWorkspace(device, filename, false);
    }
    return deviceDiv;
}

function addDeviceToWorkspace(device, deviceType, isSpeakerChannelDevice = false) {
    const count = deviceCounts[deviceType] || 0;
    deviceCounts[deviceType] = count + 1;
    const deviceDiv = document.createElement('div');
    
    deviceDiv.id = `${deviceType}-${count}`;
    deviceDiv.className = 'node';
    deviceDiv.innerText = isSpeakerChannelDevice ? `speaker channel🔊` : `${deviceType}`;
    
    // place the object at the mouse's last position
    deviceDiv.style.left = mousePosition.x + 'px';
    deviceDiv.style.top = mousePosition.y + 'px';

    devices[deviceDiv.id] = { device: isSpeakerChannelDevice ? { node: channelMerger } : device , div: deviceDiv };
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    deviceDiv.appendChild(inputContainer);

    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'x';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() {
        let sourceConnections = jsPlumb.getConnections({source: deviceDiv.id});
        let targetConnections = jsPlumb.getConnections({target: deviceDiv.id});
        sourceConnections.forEach(connection => jsPlumb.deleteConnection(connection));
        targetConnections.forEach(connection => jsPlumb.deleteConnection(connection));
        removeDeviceFromWorkspace(deviceDiv.id);
        deviceDiv.remove();
    });

    if(isSpeakerChannelDevice){
        const button = document.createElement('button');
        button.innerText = 'signal in';
        const speakerChannelSelectorInput = document.createElement('input');
        speakerChannelSelectorInput.type = 'text';
        speakerChannelSelectorInput.className = 'speakerChannelSelectorInput';
        speakerChannelSelectorInput.id = 'output_channel';
        speakerChannelSelectorInput.value = 1;
        button.onclick = () => finishConnection(deviceDiv.id, Number(speakerChannelSelectorInput.value)-1);
        inputContainer.appendChild(button);
        inputContainer.appendChild(deleteButton);
        deviceDiv.append(inputContainer);
        deviceDiv.appendChild(speakerChannelSelectorInput);
    } else {
        const inportForm = addInputsForDevice(device);
        inportForm.addEventListener('submit', function(event) {
            event.preventDefault();
        });
        deviceDiv.appendChild(inportForm);
        const outputContainer = document.createElement('div');
        outputContainer.className = 'output-container';
        deviceDiv.appendChild(outputContainer);
        let deviceWidth = 0;
        device.it.T.outlets.forEach((output, index) => {
            const outputButton = document.createElement('button');
            outputButton.innerText = `${output.comment}`;
            outputButton.onclick = () => startConnection(deviceDiv.id, index);
            outputContainer.appendChild(outputButton);
        });
        device.it.T.inlets.forEach((input, index) => {
            const inputButton = document.createElement('button');
            inputButton.innerText = `${input.comment}`;
            inputButton.onclick = () => {
                if (input.comment == 'regen') {
                    // clicking a 'regen' button triggers a change event in all of the device's inputs
                    const inputElements = deviceDiv.querySelectorAll('input');
                    inputElements.forEach((inputElement) => {
                        // create/trigger a change event
                        const event = new Event('change');
                        inputElement.dispatchEvent(event);
                    });
                }
                finishConnection(deviceDiv.id, index);
            };
            inputContainer.appendChild(inputButton);
            deviceWidth += input.comment.length;
        });
        inputContainer.appendChild(deleteButton);
        deviceDiv.style.width = `${(deviceWidth/2)+1.5}em`;
        if (inportForm.elements.length > 0) {
            deviceDiv.style.minWidth = '10em';
        }
        deviceDiv.addEventListener('mousedown', (event) => {
            if (shiftHeld) {
                jsPlumb.addToDragSelection(deviceDiv);
            }
        });
        attachOutports(device,deviceDiv);
    }

    workspace.appendChild(deviceDiv);
    jsPlumb.draggable(deviceDiv);
    return deviceDiv;
}

function createDropdownofAllDevices () {
    const deviceDropdown = document.createElement('select');
    deviceDropdown.className = 'deviceDropdown navbarButton';

    // load each WASM device into dropdown
    wasmDeviceURLs.sort().forEach((filename) => {
        const option = document.createElement('option');
        option.value = filename;
        option.innerText = filename;
        deviceDropdown.appendChild(option);
    });

    // add dropdown to navBar
    navBar.appendChild(deviceDropdown);
    // create microphone input module
    addMicrophoneInputDeviceToDropdown(deviceDropdown);
    return deviceDropdown;
}

function createButtonForNavBar(text, className, clickHandler) {
    const button = document.createElement('button');
    button.innerText = text;
    button.className = className;
    button.onclick = clickHandler;
    navBar.appendChild(button);
}

function getWorkspaceState(saveToDB = false) {
    let workspaceState = [];

    for (let id in devices) {
        let device = devices[id];
        let deviceElement = document.getElementById(id);

        let connections = [];
        if (Array.isArray(device.connections)) {
            // create a new array of connections without the splitter property which cannot be serialized
            connections = device.connections.map(connection => {
                let { splitter, ...connectionWithoutSplitter } = connection;
                return connectionWithoutSplitter;
            });
        }

        let deviceState = {
            id: id,
            connections: connections,
            left: deviceElement.style.left,
            top: deviceElement.style.top,
            inputs: {}
        };

        // save the values of the input elements
        let inputs = deviceElement.getElementsByTagName('input');
        for (let input of inputs) {
            deviceState.inputs[input.id] = input.value;
        }

        workspaceState.push(deviceState);
    }
    if (saveToDB) {
        let transaction = db.transaction(['workspaceState'], 'readwrite');
        let store = transaction.objectStore('workspaceState');
        store.clear().onsuccess = function() {
            store.add(workspaceState);
        };
    }
    return workspaceState;
}

async function reconstructWorkspaceState(workspaceState = null) {
    let deviceStates;
    let connectionsToMake = [];
    let idMap = {};

    if (workspaceState) {
        // if a workspaceState object was provided, use it
        deviceStates = workspaceState;
    } else {
        // otherwise, load the state from IndexedDB
        let transaction = db.transaction(['workspaceState'], 'readonly');
        let store = transaction.objectStore('workspaceState');

        deviceStates = await new Promise((resolve, reject) => {
            let request = store.openCursor();
            request.onsuccess = function(e) {
                resolve(e.target.result.value);
            }
            request.onerror = function(e) {
                reject(e.target.error);
            }
        });
    }

    for (let deviceState of deviceStates) {
        let deviceName = deviceState.id.split('-')[0];            
        let deviceElement;
        deviceElement = await createDeviceByName(deviceName);

        // move the device to its previous position
        deviceElement.style.left = deviceState.left;
        deviceElement.style.top = deviceState.top;

        // set the values of its input elements
        let inputs = deviceElement.getElementsByTagName('input');
        for (let input of inputs) {
            if (deviceState.inputs[input.id]) {
                input.value = deviceState.inputs[input.id];
                input.dispatchEvent(new Event('change'));
            }
        }

        // map the old id to the new id
        idMap[deviceState.id] = deviceElement.id;

        // if deviceState has connection data, store it for later
        if (deviceState.connections) {
            for (let connection of deviceState.connections) {
                connectionsToMake.push({
                    source: deviceState.id,
                    target: connection.target,
                    output: connection.output,
                    input: connection.input
                });
            }
        }
    }
    // make the connections
    for (let connection of connectionsToMake) {
        startConnection(idMap[connection.source], connection.output);
        finishConnection(idMap[connection.target], connection.input);
    }

    // repaint everything after all devices have been added
    jsPlumb.repaintEverything();
}

function checkForQueryStringParams() {
    // get the query string from the current URL
    let params = new URLSearchParams(window.location.search);

    // check if the 'state' parameter is present
    if (params.has('state')) {
        // get the 'state' parameter
        let encodedState = params.get('state');

        // decode the state
        let serializedState = LZString.decompressFromEncodedURIComponent(encodedState);

        // parse the state
        let workspaceState = JSON.parse(serializedState);

        // load the workspace state
        reconstructWorkspaceState(workspaceState);
    }
}

/* END functions */