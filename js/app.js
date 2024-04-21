/* BEGIN audio context initialization */
// create audio context
let WAContext = window.AudioContext || window.webkitAudioContext;
let context = new WAContext();
// set channelCount to maximum amount of channels available
context.destination.channelCount = context.destination.maxChannelCount;
// set channelCountMode to "explicit"
context.destination.channelCountMode = "explicit";
// set channelInterpretation to "discrete"
context.destination.channelInterpretation = "discrete";
// create channel merger for speaker output
context.suspend();
let channelMerger = context.createChannelMerger(context.destination.channelCount);
channelMerger.connect(context.destination);
/* END audio context initialization */

/* BEGIN UI initialization */
// create workspace DOM elements
const workspace = document.getElementById('workspace');
const navBar = document.getElementById('ui-container');
// create dropdown of all audio devices
let deviceDropdown = createDropdownofAllDevices();

// create a button for starting audio
createButtonForNavBar(
    'start audio',
    'startAudioButton navbarButton',
    () => {
        if (isAudioPlaying) {
            stopAudio();
        } else {
            startAudio();
        }
    }
);

// create a button for saving workspace state
createButtonForNavBar('save', 'saveStateButton navbarButton', ()=>{getWorkspaceState(true)});

// create a button for reloading workspace state
createButtonForNavBar('load', 'reloadStateButton navbarButton', async () => {
    await reconstructWorkspaceState();
    startAudio();
});

// create button for viewing all devices
createButtonForNavBar(
    'all devices',
    'viewAllDevices navbarButton',
    (event) => {
        event.stopPropagation(); // stop the click event from propagating to the window
        var modal = displayAllDevices();
        modal.style.display = 'block';
    }
);

createButtonForNavBar(
    '?',
    'helpButton navbarButton',
    (event) => {
        document.getElementById('infoDiv').style.display = 'block';
        event.stopPropagation();
    }
);

createButtonForNavBar(
    'start recording',
    'recordButton navbarButton',
    async (event) => {
        try {
            if (!recorder) {
                // start recording
                destination = context.createMediaStreamDestination();
                channelMerger.connect(destination);
                recorder = RecordRTC(destination.stream, { type: 'audio' });
                recorder.startRecording();
                event.target.textContent = 'stop recording';
            } else {
                // stop recording
                recorder.stopRecording(async function() {
                    const blob = recorder.getBlob();
                    if (destination && destination.stream) {
                        destination.stream.getTracks().forEach(track => track.stop());
                    }
    
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const arrayBuffer = reader.result;
                        try {
                            context.decodeAudioData(arrayBuffer, audioBuffer => {
                                const wavArrayBuffer = audioBufferToWav(audioBuffer);
                                const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
                                const audioURL = URL.createObjectURL(wavBlob);
                        
                                // prompt the user for a filename
                                let fileName = prompt("Save recording as:", `recording_${Date.now()}.wav`);
                                if (fileName === null) {
                                    // if the user clicked "Cancel", don't save the file
                                    return;
                                }
                                if (!fileName.endsWith('.wav')) {
                                    fileName += '.wav';
                                }
                        
                                // create a download link
                                let downloadLink = document.createElement('a');
                                downloadLink.href = audioURL;
                                downloadLink.download = fileName;
                                downloadLink.textContent = 'Download recording';
                                document.body.appendChild(downloadLink);
                        
                                downloadLink.click();
                                downloadLink.remove();
                        
                                // reset
                                recorder = null;
                            }, error => {
                                console.error('Failed to decode audio data:', error);
                                // reset
                                recorder = null;
                            });
                        } catch (error) {
                            console.error('An error occurred:', error);
                            // reset
                            recorder = null;
                        }
                    };
                    reader.readAsArrayBuffer(blob);
                });
                recreateWorkSpaceState();
                event.target.textContent = 'start recording';
            }
        }
        catch (error) {
            console.error('An error occurred:', error);
            recorder = null;
        }
    }
);

// create the button
var toggleButton = document.createElement('button');
toggleButton.id = 'toggleNavbarButton';
toggleButton.className = 'hamburger';

// create the hamburger icon
for (let i = 0; i < 3; i++) {
    var line = document.createElement('div');
    line.className = 'hamburger-line';
    toggleButton.appendChild(line);
}

// add the event listener
toggleButton.addEventListener('click', toggleNavbar);

// append the button to the body
document.body.appendChild(toggleButton);

// prevent accidental refreshes which would lose unsaved changes
window.onbeforeunload = function() {
    return "Are you sure you want to leave? Unsaved changes will be lost.";
};

// add the initial speaker objects and getting started text
window.onload = async function() {
    mousePosition.x = (document.documentElement.clientWidth / 2) - 158;
    mousePosition.y = document.documentElement.clientHeight * 0.8;
    let speaker1Div = await createDeviceByName('outputnode');
    let inputElement = speaker1Div.querySelector('input');
    if (inputElement) {
        inputElement.value = 1;
    }
    mousePosition.x = (document.documentElement.clientWidth / 2);
    mousePosition.y = document.documentElement.clientHeight * 0.8;
    let speaker2Div = await createDeviceByName('outputnode');
    inputElement = speaker2Div.querySelector('input');
    if (inputElement) {
        inputElement.value = 2;
    }
    document.addEventListener('mousemove', function(event) {
        mousePosition.x = event.pageX;
        mousePosition.y = event.pageY;
    });
    
    // create the info div element
    let infoDiv = document.createElement('div');
    infoDiv.id = 'infoDiv';
    var link = document.createElement('a');
    link.href = "https://github.com/nnirror/wax/blob/main/README.md";
    link.textContent = "full documentation";
    link.target = "_blank"; // to open the link in a new tab

    infoDiv.textContent = "Wax is a browser-based audio synthesis environment inspired by Max and other data-flow programming systems. Double-click or press 'n' to add devices to the workspace. Connect to a 'speaker' object to hear the output. For more information, see the ";
    infoDiv.appendChild(link);

    var period = document.createTextNode(".");
    infoDiv.appendChild(period);
    infoDiv.style.display = 'none';

    // stop propagation of click event in infoDiv
    infoDiv.onclick = function(event) {
        event.stopPropagation();
    };

    // create the button to close the info div
    let closeButton = document.createElement('button');
    closeButton.textContent = 'x';
    closeButton.onclick = function(event) {
        infoDiv.style.display = 'none';
        event.stopPropagation();
    };

    // add event listener to document to hide infoDiv when clicked
    document.onclick = function() {
        infoDiv.style.display = 'none';
    };

    // add the close button to the info div and the info div to body
    infoDiv.appendChild(closeButton);
    document.body.appendChild(infoDiv);
};

// create a dropdown select
var dropdown = document.createElement('select');
dropdown.id = 'exampleFiles';

// add an unselectable first option
var firstOption = document.createElement('option');
firstOption.text = 'examples';
firstOption.disabled = true;
firstOption.selected = true;
dropdown.appendChild(firstOption);

// add an option for each file
['amplitude_modulation.zip', 'audio_file_playback.zip', 'fm.zip', 'hello_world_tri.zip', 'patterns_with_facet.zip', 'regen_example.zip', 'microphone_input.zip'].forEach(function(file) {
    var option = document.createElement('option');
    option.value = file;
    // remove underscores and '.zip' from the display text
    option.text = file.replace(/_/g, ' ').replace('.zip', '');
    dropdown.appendChild(option);
});

// add the dropdown to the body
document.body.appendChild(dropdown);

// add an event listener to the dropdown to load the selected file when changed
dropdown.addEventListener('change', function(event) {
    // replace spaces with underscores and add '.zip' back
    var selectedFile = event.target.value.replace(/ /g, '_');
    loadExampleFile('examples/' + selectedFile);
});

/* END UI initialization */

/* BEGIN globally acessible objects */
let chunks = [];
let destination;
let recorder = null;
let lastClicked = null;
let deviceCounts = {};
let isAudioPlaying = false;
let devices = {};
let audioBuffers = {};
let mousePosition = { x: 0, y: 0 };
let sourceDeviceId = null;
let sourceOutputIndex = null;
let selectedDevice = null;
let workspaceElement = document.getElementById('workspace');
let selectionDiv = null;
let startPoint = null;
/* END globally acessible objects */

/* BEGIN event handlers */
jsPlumb.bind("connectionDetached", function(info) {
    let sourceDevice = devices[info.sourceId];
    let targetDevice = devices[info.targetId];
    if (sourceDevice && targetDevice && sourceDevice.connections) {
        let connection = sourceDevice.connections.find(conn => conn.target === info.targetId);
        if (connection) {
            try {
                sourceDevice.device.node.disconnect(connection.splitter);
                connection.splitter.disconnect(devices[connection.target].device.node, connection.output, connection.input);
            } catch (error) {
                console.error('Failed to disconnect:', error);
            }
            // remove the connection from the list
            sourceDevice.connections = sourceDevice.connections.filter(conn => conn !== connection);
        }
    }
});

connectionManagementClickHandler();

// listen for mousedown events on the workspaceElement
workspaceElement.addEventListener('mousedown', (event) => {
    // only start the selection if the target is the workspaceElement itself
    if (event.target === workspaceElement) {
        let rect = workspaceElement.getBoundingClientRect();
        startPoint = { x: event.clientX - rect.left, y: event.clientY - rect.top };
        // create the selection div and add it to the workspaceElement
        if ( !selectionDiv) {
            selectionDiv = document.createElement('div');
        }
        selectionDiv.style.position = 'absolute';
        selectionDiv.style.border = '1px dashed #fff';
        selectionDiv.style.background = 'rgba(0, 0, 0, 0.1)';
        selectionDiv.style.pointerEvents = 'none'; // Ignore mouse events
        workspaceElement.appendChild(selectionDiv);
    }
});

// listen for mousemove events on the workspaceElement
workspaceElement.addEventListener('mousemove', (event) => {
    if (startPoint) {
        let rect = workspaceElement.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        // update the size and position of the selection div
        selectionDiv.style.left = Math.min(x, startPoint.x) + 'px';
        selectionDiv.style.top = Math.min(y, startPoint.y) + 'px';
        selectionDiv.style.width = Math.abs(x - startPoint.x) + 'px';
        selectionDiv.style.height = Math.abs(y - startPoint.y) + 'px';
    }
});

// listen for mouseup events on the workspaceElement
workspaceElement.addEventListener('click', (event) => {
    if (startPoint) {
        // check which elements are within the selection div
        let nodes = document.querySelectorAll('.node');
        nodes.forEach((node) => {
            let rect = node.getBoundingClientRect();
            let selRect = selectionDiv.getBoundingClientRect();
            if (rect.right > selRect.left && rect.left < selRect.right &&
                rect.bottom > selRect.top && rect.top < selRect.bottom) {
                jsPlumb.addToDragSelection(node);

                // add a special CSS class to the selected node
                node.classList.add('selectedNode');
            } else {
                if ( event.target.id == 'workspace' ) {
                    // remove the special class from the node if it's not selected
                    node.classList.remove('selectedNode'); 
                }
            }
        });

        // remove the selection div and reset the start point
        workspaceElement.removeChild(selectionDiv);
        selectionDiv = null;
        startPoint = null;
    }
});

workspaceElement.addEventListener('mouseup', (event) => {
    if (event.target !== workspaceElement) {
        jsPlumb.clearDragSelection();
    }
});

// listen for keydown events on the document
document.addEventListener('keydown', (event) => {
    // check if Delete or Backspace key was pressed
    if (event.key === 'Delete' || event.key === 'Backspace') {
        // get all selected nodes
        let nodes = document.querySelectorAll('.node');
        nodes.forEach((node) => {
            // check if the node is selected
            if (node.classList.contains('selectedNode')) {
                // remove the node from the workspace
                let sourceConnections = jsPlumb.getConnections({source: node.id});
                let targetConnections = jsPlumb.getConnections({target: node.id});
                sourceConnections.forEach(connection => jsPlumb.deleteConnection(connection));
                targetConnections.forEach(connection => jsPlumb.deleteConnection(connection));
                removeDeviceFromWorkspace(node.id);
                node.remove();
            }
        });

        // clear the drag selection
        jsPlumb.clearDragSelection();
        jsPlumb.repaintEverything();
    }
    // 'f' creates a number input
    else if (event.key === 'f' && document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
        event.preventDefault();
        createDeviceByName('number');
    }
    else if (event.key === 'c' && document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
        event.preventDefault();
        createDeviceByName('comment');
    }
});

// copy-paste functionality
document.addEventListener('keydown', async function(event) {
    // command-d for duplicate
    if (event.metaKey && event.key === 'd') {
        event.preventDefault();
        await copySelectedNodes();
    }
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

function openAwesompleteUI() {
    // get the dropdown element
    var dropdown = document.querySelector('.deviceDropdown');
    
    // get the options from the dropdown
    var list = Array.from(dropdown.options).map(function(option) {
        return option.text;
    });

    var deviceSelectTextDiv = document.createElement('div');
    deviceSelectTextDiv.textContent = "type to select a device...";
    deviceSelectTextDiv.className = 'deviceSelectText';

    // create a new div element for autocomplete
    var div = document.createElement('div');
    div.className = 'awesompleteContainer';
    div.style.position = 'absolute';
    div.style.left = mousePosition.x + 'px';
    div.style.top = mousePosition.y + 'px';

    div.appendChild(deviceSelectTextDiv);

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
        // remove all elements with class name "awesomplete"
        var elements = document.getElementsByClassName('awesompleteContainer');
        try {
            while(elements.length > 0){
                elements[0].parentNode.removeChild(elements[0]);
            }
        }
        catch(err) {}
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
        if (event.key === 'n' && document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
            event.preventDefault();
            openAwesompleteUI();
        }
    });

    document.addEventListener('dblclick', function(event) {
        if ( event.target.id == 'workspace' ) {
            event.preventDefault();
            openAwesompleteUI();
        }
    });
}

async function createMicrophoneDevice() {
    const constraints = {
        audio: {
            autoGainControl: false,
            noiseSuppression: false,
            echoCancellation: false
        }
    };
    // get access to the microphone
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    // create a source node from the stream
    const source = context.createMediaStreamSource(stream);

    // create a wrapper object for the source
    const device = {
        node: source,
        stream: stream,
        source: source,
        it: {
            T: {
                outlets: [{ comment: 'signal out' }], // these need to exist so they work like the other WASM modules built with RNBO
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
        const inputElements = deviceDiv.querySelectorAll('input, textarea');

        inputElements.forEach((inputElement) => {
            // create/trigger a change event
            // console.log('triggering change...');
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
    inportForm.autocomplete = 'off';
    const inportContainer = document.createElement('div');
    let inports = [];

    const messages = device.messages;
    if (typeof messages !== 'undefined') {
        inports = messages.filter(message => message.type === RNBO.MessagePortType.Inport);
    }

    if (inports.length > 0) {
        inports.forEach(inport => {
            let inportText;
            if (device.it.T.inports[0].tag == 'pattern') {
                inportText = document.createElement('textarea');
                inportText.style.width = '32em';
                inportText.style.height = '6em';
            }
            else if (device.it.T.inports[0].tag == 'comment') {
                inportText = document.createElement('textarea');
                inportText.style.width = '12em';
                inportText.style.height = '4em';
            }
            else {
                inportText = document.createElement('input');
            }
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

async function scheduleDeviceEvent(device, inport, value) {
    try {
        let values;
        value = value.replace(/_\./g, '$().');
        if (device.dataBufferIds == 'pattern') {
            values = eval(value).data;
            const float32Array = new Float32Array(values);
            // create a new AudioBuffer
            const audioBuffer = context.createBuffer(1, float32Array.length, context.sampleRate);
            // copy the Float32Array to the AudioBuffer
            audioBuffer.copyToChannel(float32Array, 0);
            // set the AudioBuffer as the data buffer for the device
            await device.setDataBuffer('pattern', audioBuffer);
        }
        else {
            if (inport.tag !== 'comment') {
                values = value.split(/\s+/).map(s => parseFloat(eval(s)));
            }
        }
        if (typeof values === 'number' || (Array.isArray(values) && !isNaN(values[0]))) {
            let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inport.tag, values);
            device.scheduleEvent(messageEvent);
        }
    } catch (error) {
        showGrowlNotification(`Error in device parameter: ${value}, ${error}`);
    }
}

function handleButtonClick(deviceId, index, isInputButton) {
    if (lastClicked && ((lastClicked.isInputButton && !isInputButton) || (!lastClicked.isInputButton && isInputButton))) {
        if (lastClicked.isInputButton && !isInputButton) {
            startConnection(deviceId, index);
            finishConnection(lastClicked.deviceId, lastClicked.index);
        } else if (!lastClicked.isInputButton && isInputButton) {
            startConnection(lastClicked.deviceId, lastClicked.index);
            finishConnection(deviceId, index);
        }
        lastClicked = null;
    } else {
        lastClicked = {
            isInputButton,
            deviceId,
            index
        };
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

function reconnectNodeConnections(nodeId) {
    // get the device
    let device = devices[nodeId];

    // check if the device has connections
    if (Array.isArray(device.connections)) {
        // create a new array of connections without the splitter property which cannot be serialized
        let connectionsData = device.connections.map(connection => {
            let { splitter, ...connectionWithoutSplitter } = connection;
            return connectionWithoutSplitter;
        });

        // delete the connections
        let sourceConnections = jsPlumb.getConnections({source: nodeId});
        let targetConnections = jsPlumb.getConnections({target: nodeId});
        sourceConnections.forEach(connection => jsPlumb.deleteConnection(connection));
        targetConnections.forEach(connection => jsPlumb.deleteConnection(connection));

        // reconnect the connections
        connectionsData.forEach(connectionData => {
            startConnection(nodeId, connectionData.output);
            finishConnection(connectionData.target, connectionData.input);
        });

        // update the device connections
        device.connections = connectionsData;
    }
}
async function createDeviceByName(filename, audioBuffer = null, devicePosition = null) {
    try {
        let deviceDiv;
        if (filename === "mic") {
            const device = await createMicrophoneDevice();
            deviceDiv = addDeviceToWorkspace(device, "microphone input", false);
            await createInputDeviceSelector(device, context, deviceDiv);
            // listen for the streamChanged event
            deviceDiv.addEventListener('streamChanged', async (event) => {
                // stop the old stream
                device.stream.getTracks().forEach(track => track.stop());
            
                // update the stream
                device.stream = event.detail;
            
                // create a new source with the new stream
                const newSource = context.createMediaStreamSource(device.stream);
            
                // update the source and node
                device.source = newSource;
                device.node = newSource;

                if (devices[deviceDiv.id].connections && devices[deviceDiv.id].connections.length > 0) {
                    reconnectNodeConnections(deviceDiv.id);
                }
            });
        }
        else if ( filename.startsWith('outputnode') ) {
            deviceDiv  = addDeviceToWorkspace(null, 'outputnode', true);
        }
        else {
            const response = await fetch(`wasm/${filename}.json`);
            const patcher = await response.json();
            const device = await RNBO.createDevice({ context, patcher });
            deviceDiv = addDeviceToWorkspace(device, filename, false);
            if ( filename == 'wave' || filename == 'granulator' || filename == 'play' ) {
                if (audioBuffer) {
                    await device.setDataBuffer('buf', audioBuffer.buffer);
                    audioBuffers[audioBuffer.name] = audioBuffer.buffer;
                    deviceDiv.dataset.audioFileName = audioBuffer.name;
                    const fileNameElement = document.createElement('p');
                    fileNameElement.className = 'audioFileName';
                    fileNameElement.textContent = `file: ${audioBuffer.name}`;
                    const form = deviceDiv.querySelector('form');
                    form.appendChild(fileNameElement);

                }
                createAudioLoader(device, context, deviceDiv);
            }
        }
        deviceDiv.onmousedown = removeSelectedNodeClass;
        if ( devicePosition ) {
            deviceDiv.style.left = devicePosition.left + 'px';
            deviceDiv.style.top = devicePosition.top + 'px';
        }
        if (filename == 'pattern') {
            deviceDiv.style.width = '32em';
        }
        return deviceDiv;
    }
    catch (error) {
        showGrowlNotification(`Error creating device. Does "${filename.replace('.json','')}" match an available device?`);
    }
}

async function createInputDeviceSelector(device, context, deviceDiv) {
    // create a new select element
    const select = document.createElement('select');
    select.className = 'audioInputDeviceSelect'

    // get the list of available input devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputDevices = devices.filter(device => device.kind === 'audioinput');

    // create an option for each device
    audioInputDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.deviceId;
        option.textContent = device.label;
        select.appendChild(option);
    });

    // listen for changes
    select.addEventListener('change', async (event) => {
        const deviceId = event.target.value;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { deviceId: deviceId } });
        // emit a custom event with the new stream
        const streamChangedEvent = new CustomEvent('streamChanged', { detail: stream });
        deviceDiv.dispatchEvent(streamChangedEvent);
    });

    // select the form inside the deviceDiv
    const form = deviceDiv.querySelector('form');
    // add the select to the form
    form.appendChild(select);
}

function showGrowlNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'growl-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

function createAudioLoader(device, context, deviceDiv) {
    // create a new file input element
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';

    // create a new p element for the file name
    const fileNameElement = document.createElement('p');
    fileNameElement.className = 'audioFileName';

    // listen for changes
    fileInput.addEventListener('change', async (event) => {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            const arrayBuf = await file.arrayBuffer();    
            const audioBuf = await context.decodeAudioData(arrayBuf);
            // store the audio buffer in the global object
            audioBuffers[file.name] = audioBuf;

            await device.setDataBuffer('buf', audioBuf);
            deviceDiv.dataset.audioFileName = file.name;

            // show the file name in the UI
            fileNameElement.textContent = `file: ${file.name}`;
        }
    });

    // create a new button
    const button = document.createElement('button');
    button.textContent = 'Load audio file';

    // when the button is clicked, simulate a click on the file input
    button.addEventListener('click', () => fileInput.click());

    // select the form inside the deviceDiv
    const form = deviceDiv.querySelector('form');
    // add the button to the form
    form.appendChild(button);
    form.appendChild(fileNameElement);
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
    const infoButton = document.createElement('button');

    if(isSpeakerChannelDevice){
        const button = document.createElement('button');
        button.innerText = 'signal in';
        const speakerChannelSelectorInput = document.createElement('input');
        speakerChannelSelectorInput.type = 'number';
        speakerChannelSelectorInput.className = 'speakerChannelSelectorInput';
        speakerChannelSelectorInput.id = 'output_channel';
        speakerChannelSelectorInput.value = 1;
        speakerChannelSelectorInput.min = 1;
        speakerChannelSelectorInput.max = context.destination.channelCount;
        speakerChannelSelectorInput.onchange = () => {
            let deviceConnectionData = [];
            for(let deviceKey in devices) {
                let device = devices[deviceKey];
                if (device.connections === undefined) continue;
                let matchingConnections = device.connections.filter(connection => connection.target === deviceDiv.id);
                if(matchingConnections.length > 0) {
                    deviceConnectionData.push({ deviceId: deviceKey, connectionData: matchingConnections });
                }
            }
            // delete the connections
            let sourceConnections = jsPlumb.getConnections({source: deviceDiv.id});
            let targetConnections = jsPlumb.getConnections({target: deviceDiv.id});
            sourceConnections.forEach(connection => jsPlumb.deleteConnection(connection));
            targetConnections.forEach(connection => jsPlumb.deleteConnection(connection));
            // reconnect the connections
            deviceConnectionData.forEach(connectedDevice => {
                connectedDevice.connectionData.forEach(connection => {
                    startConnection(connectedDevice.deviceId, connection.output);
                    finishConnection(connection.target, speakerChannelSelectorInput.value-1);
                });
            });
        };
        button.onclick = () => handleButtonClick(deviceDiv.id, Number(speakerChannelSelectorInput.value)-1, true);
        inputContainer.appendChild(button);
        inputContainer.appendChild(deleteButton);
        infoButton.innerText = 'i';
        infoButton.className = 'info-button';
        infoButton.addEventListener('click', function() {
            window.open(`https://github.com/nnirror/wax/blob/main/README.md#speaker`, '_blank');
        });
        inputContainer.appendChild(infoButton);
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
            outputButton.className = 'output-button';
            outputButton.onclick = () => handleButtonClick(deviceDiv.id, index, false);
            outputContainer.appendChild(outputButton);
        });
        if (deviceType !== 'microphone input') {
            device.it.T.inlets.forEach((input, index) => {
                const inputButton = document.createElement('button');
                inputButton.innerText = `${input.comment}`;
                inputButton.className = 'input-button';
                inputButton.onclick = () => {
                    if (input.comment == 'regen') {
                        const inputElements = deviceDiv.querySelectorAll('input, textarea');
                        inputElements.forEach((inputElement) => {
                            const event = new Event('change');
                            inputElement.dispatchEvent(event);
                        });
                    }
                    handleButtonClick(deviceDiv.id, index, true);
                };
                inputContainer.appendChild(inputButton);
                deviceWidth += input.comment.length;
            });
        }
        else {
            deviceWidth = 15;
        }
        inputContainer.appendChild(deleteButton);
        infoButton.innerText = 'i';
        infoButton.className = 'info-button';
        infoButton.addEventListener('click', function() {
            window.open(`https://github.com/nnirror/wax/blob/main/README.md#${deviceType}`, '_blank');
        });
        inputContainer.appendChild(infoButton);
        deviceDiv.style.width = `${(deviceWidth/2)+5}em`;
        if (inportForm.elements.length > 0) {
            deviceDiv.style.minWidth = '10em';
        }
        attachOutports(device,deviceDiv);
    }

    workspace.appendChild(deviceDiv);
    // Add a drag event listener to the deviceDiv
    jsPlumb.draggable(deviceDiv, {
        start: function(event) {
            // add the selectedNode class
            deviceDiv.classList.add('selectedNode');
        },
    });
    return deviceDiv;
}

function createDropdownofAllDevices () {
    const deviceDropdown = document.createElement('select');
    deviceDropdown.className = 'deviceDropdown';

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

function removeSelectedNodeClass(event) {
    // remove the selectedNode class from all nodes
    let nodes = document.querySelectorAll('.node');
    nodes.forEach((node) => {
        if (node === event.target) return;
        if (node.classList.contains('selectedNode')) {
            node.classList.remove('selectedNode');
        }
    });
}

function deselectAllNodes () {
    jsPlumb.clearDragSelection();
    let nodes = document.querySelectorAll('.node');
    nodes.forEach((node) => {
        if (node.classList.contains('selectedNode')) {
            node.classList.remove('selectedNode');
        }
    });
}

function deleteAllNodes() {
    var deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(function(button) {
        button.click();
    });
}

function createButtonForNavBar(text, className, clickHandler) {
    const button = document.createElement('button');
    button.innerText = text;
    button.className = className;
    button.onclick = clickHandler;
    navBar.appendChild(button);
}

async function getWorkspaceState(saveToFile = false) {
    let workspaceState = [];
    let zip = new JSZip();

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
            inputs: {},
            audioFileName: deviceElement.dataset.audioFileName
        };

        // save the values of the input elements
        let inputs = deviceElement.getElementsByTagName('input');
        for (let input of inputs) {
            deviceState.inputs[input.id] = input.value;
        }

        // save the values of the textarea elements
        let textareas = deviceElement.getElementsByTagName('textarea');
        for (let textarea of textareas) {
            deviceState.inputs[textarea.id] = textarea.value;
        }

        if (deviceElement.dataset.audioFileName) {
            let audioBuffer = audioBuffers[deviceElement.dataset.audioFileName];
            let wav = audioBufferToWav(audioBuffer);
            let blob = new Blob([wav], { type: 'audio/wav' });

            // Add the .wav file to the .zip file
            let reader = new FileReader();
            await new Promise(resolve => {
                reader.onload = event => {
                    zip.file(deviceElement.dataset.audioFileName, event.target.result, {binary: true});
                    resolve();
                };
                reader.readAsArrayBuffer(blob);
            });
        }

        workspaceState.push(deviceState);
    }

    if (saveToFile) {
        let fileName = prompt("Save system state as:", `wax_state_${Date.now()}.zip`);

        // if the user clicked "cancel", don't save the file
        if (fileName === null) {
            return workspaceState;
        }

        // Add the workspace state to the .zip file
        let jsonFileName = fileName.replace('.zip', '.json');
        if (!jsonFileName.endsWith('.json')) {
            jsonFileName += '.json';
        }
        zip.file(jsonFileName, JSON.stringify(workspaceState));

        // generate the .zip file and create a download link for it
        zip.generateAsync({type: "blob"}).then(function(content) {
            let url = URL.createObjectURL(content);
            let downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", url);
            downloadAnchorNode.setAttribute("download", fileName);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }

    return workspaceState;
}

async function getStateForDeviceIds(deviceIds) {
    let workspaceState = [];
    
    for (let id of deviceIds) {
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
            inputs: {},
            audioFileName: deviceElement.dataset.audioFileName
        };

        // save the values of the input elements
        let inputs = deviceElement.getElementsByTagName('input');
        for (let input of inputs) {
            deviceState.inputs[input.id] = input.value;
        }

        // save the values of the textarea elements
        let textareas = deviceElement.getElementsByTagName('textarea');
        for (let textarea of textareas) {
            deviceState.inputs[textarea.id] = textarea.value;
        }

        workspaceState.push(deviceState);
    }

    return workspaceState;
}

async function copySelectedNodes() {
    // get all the ids of elements with class "selectedNode"
    let deviceIds = Array.from(document.getElementsByClassName('selectedNode')).map(node => node.id);
    deselectAllNodes();
    // call reconstructDevicesAndConnections with the state for the selected devices
    reconstructDevicesAndConnections(await getStateForDeviceIds(deviceIds), null, true);
    selectionDiv = null;
}

async function recreateWorkSpaceState() {
    // get all the ids of elements with class "node", store their state, and delete them
    let deviceIds = Array.from(document.getElementsByClassName('node')).map(node => node.id);
    let deviceStates = await getStateForDeviceIds(deviceIds);
    deleteAllNodes();
    // call reconstructDevicesAndConnections with the state for all the devices
    context = new WAContext();
    // set channelCount to maximum amount of channels available
    context.destination.channelCount = context.destination.maxChannelCount;
    // set channelCountMode to "explicit"
    context.destination.channelCountMode = "explicit";
    // set channelInterpretation to "discrete"
    context.destination.channelInterpretation = "discrete";
    // create channel merger for speaker output
    channelMerger = context.createChannelMerger(context.destination.channelCount);
    channelMerger.connect(context.destination);
    reconstructDevicesAndConnections(deviceStates, null, false);
    selectionDiv = null;
}

async function reconstructWorkspaceState() {
    let deviceStates;

    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.zip';

    fileInput.onchange = async function(event) {
        deleteAllNodes();
        let file = event.target.files[0];
        let zip = await JSZip.loadAsync(file);
        let jsonFileName = Object.keys(zip.files).find(name => name.endsWith('.json'));
        let patcherState = await zip.file(jsonFileName).async('string');
        deviceStates = JSON.parse(patcherState);
        await reconstructDevicesAndConnections(deviceStates, zip, false);
    };

    fileInput.click();
}

async function loadExampleFile(filePath) {
    deleteAllNodes();
    let deviceStates;

    let response = await fetch(filePath);
    let file = await response.blob();

    let zip = await JSZip.loadAsync(file);
    let jsonFileName = Object.keys(zip.files).find(name => name.endsWith('.json'));
    let patcherState = await zip.file(jsonFileName).async('string');
    deviceStates = JSON.parse(patcherState);
    await reconstructDevicesAndConnections(deviceStates, zip, false);
}

async function reconstructDevicesAndConnections(deviceStates, zip, reconstructFromDuplicateCommand = false) {
    let connectionsToMake = [];
    let idMap = {};

    for (let deviceState of deviceStates) {
        let deviceName = deviceState.id.split('-')[0];            
        let deviceElement;
        let devicePosition = {};
        let l = parseInt(deviceState.left.split('px')[0]);
        let t = parseInt(deviceState.top.split('px')[0]);
        if ( reconstructFromDuplicateCommand ) {
            devicePosition = {left: l+100, top: t+100};
        }
        else {
            devicePosition = {left: l, top: t};
        }
        // load any stored audio files
        if (deviceState.audioFileName && zip ) {
            let wavFileData = await zip.file(deviceState.audioFileName).async('arraybuffer');
            let audioBuffer = await context.decodeAudioData(wavFileData);
            audioBuffers[deviceState.audioFileName] = audioBuffer;
            deviceElement = await createDeviceByName(deviceName,{name: deviceState.audioFileName,buffer: audioBuffer},devicePosition);
        }
        else if (deviceState.audioFileName && !zip ) {
            let audioBuffer = audioBuffers[deviceState.audioFileName];
            deviceElement = await createDeviceByName(deviceName,{name: deviceState.audioFileName,buffer: audioBuffer},devicePosition);
        }
        else {
            if ( deviceName == 'microphone input') {
                deviceElement = await createDeviceByName('mic', null, devicePosition);
            }
            else {
                deviceElement = await createDeviceByName(deviceName, null, devicePosition);
            }
        }

        deviceElement.classList.add('selectedNode');
        jsPlumb.addToDragSelection(deviceElement);
        
        // set the values of its input elements
        let inputs = deviceElement.getElementsByTagName('input');
        for (let input of inputs) {
            if (deviceState.inputs[input.id]) {
                input.value = deviceState.inputs[input.id];
                input.dispatchEvent(new Event('change'));
            }
        }

        // set the values of its textarea elements
        let textareas = deviceElement.getElementsByTagName('textarea');
        for (let textarea of textareas) {
            if (deviceState.inputs[textarea.id]) {
                textarea.value = deviceState.inputs[textarea.id];
                textarea.dispatchEvent(new Event('change'));
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
        // Check if the target node exists
        if (idMap[connection.target]) {
            startConnection(idMap[connection.source], connection.output);
            finishConnection(idMap[connection.target], connection.input);
        }
    }

    // repaint everything after all devices have been added
    jsPlumb.repaintEverything();
}

function displayAllDevices() {
    // get the dropdown select
    var dropdown = document.querySelector('.deviceDropdown');

    // get the options from the dropdown
    var options = dropdown.options;

    // create a div for the modal
    var modal = document.createElement('div');
    modal.className = 'deviceListModal';

    // create a close button for the modal
    var closeButton = document.createElement('button');
    closeButton.innerText = 'x';
    closeButton.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    modal.appendChild(closeButton);

    // create a ul for the list
    var ul = document.createElement('ul');
    ul.className = 'deviceList';

    // add each option in the dropdown to the list
    for (var i = 0; i < options.length; i++) {
        var li = document.createElement('li');
        var a = document.createElement('a');
        a.textContent = options[i].text;
        a.href = `https://github.com/nnirror/wax/blob/main/README.md#${options[i].text.toLowerCase()}`;
        a.target = '_blank';
        li.appendChild(a);
        li.className = 'deviceListItem';
        ul.appendChild(li);
    }

    // add the list to the modal
    modal.appendChild(ul);

    // add the modal to the body
    document.body.appendChild(modal);

    // add an event listener to the body to close the modal when clicked outside
    window.addEventListener('click', function(event) {
        if (!modal.contains(event.target)) {
            modal.style.display = 'none';
        }
    });
    return modal;
}

function connectionManagementClickHandler() {
    // listen for all clicks on the document
    document.addEventListener('click', function(event) {
        // get the parent elements that contain only the input and output buttons
        const parentElements = document.querySelectorAll('.input-container, .output-container');
        // if the clicked element is not a child of any of the parent elements, set lastClicked to null
        let isChildOfParentElement = Array.from(parentElements).some(parentElement => parentElement.contains(event.target));
        if (!isChildOfParentElement) {
            lastClicked = null;
        }
    });
}

function stopAudio () {
    const button = document.querySelector('.startAudioButton');
    setTimeout(() => {
        context.suspend().then(() => {
            button.textContent = 'start audio';
            button.style.background = 'linear-gradient(to right, #005925, #002e13)';
            isAudioPlaying = false;
        });
    }, 10);
}

function startAudio() {
    const button = document.querySelector('.startAudioButton');
    context.resume().then(() => {
        button.textContent = 'mute audio';
        button.style.background = 'linear-gradient(to right, #ab2222, #7b0000)';
        isAudioPlaying = true;
    });
}

function toggleNavbar() {
    const buttons = document.querySelectorAll('.navbarButton');
    buttons.forEach(button => {
        if (button.style.display === 'none') {
            button.style.display = 'block';
        } else {
            button.style.display = 'none';
        }
    });
    const exampleFiles = document.getElementById('exampleFiles');
    if (exampleFiles.style.display === 'none') {
        exampleFiles.style.display = 'block';
    } else {
        exampleFiles.style.display = 'none';
    }
}
/* END functions */