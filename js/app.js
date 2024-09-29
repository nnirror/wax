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

createButtonForNavBar(
    'WAX',
    'waxButton',
    (event) => {}
);

// create a button for starting audio
createButtonForNavBar(
    'ON',
    'startAudioButton navbarButton',
    async () => {
        if (isAudioPlaying) {
            await stopAudio();
        } else {
            await startAudio();
        }
    }
);

// create a button for saving workspace state
createButtonForNavBar('Save', 'saveStateButton navbarButton', ()=>{getWorkspaceState(true)});

createButtonForNavBar('Share', 'shareStateButton navbarButton', ()=>{getWorkspaceState(false,true)});

// create a button for reloading workspace state
createButtonForNavBar('Load', 'reloadStateButton navbarButton', async () => {
    await reconstructWorkspaceState();
    await startAudio();
});

// create button for viewing all devices
createButtonForNavBar(
    'Devices',
    'viewAllDevices navbarButton',
    (event) => {
        event.stopPropagation(); // stop the click event from propagating to the window
        var modal = displayAllDevices();
        modal.style.display = 'block';
    }
);

// create a button for example files
createButtonForNavBar(
    'Examples',
    'exampleFilesButton navbarButton',
    (event) => {
        event.stopPropagation();

        var modal = document.getElementById('deviceListModal');
        if (modal) {
            modal.style.display = 'none';
        }

        // create a div for the example files
        var exampleFilesDiv = document.createElement('div');
        exampleFilesDiv.className = 'exampleFilesDiv';
        exampleFilesDiv.id = 'exampleFiles';

        // add a link for each file
        ['amplitude_modulation.zip', 'audio_file_playback.zip', 'frequency_modulation.zip', 'hello_world.zip', 'patterns_with_facet.zip', 'regenerating_parameters.zip', 'microphone.zip'].forEach(function(file) {
            var link = document.createElement('a');
            link.href = '#';
            link.textContent = file.replace(/_/g, ' ').replace('.zip', '');
            link.addEventListener('click', async function(event) {
                event.preventDefault();
                // replace spaces with underscores and add '.zip' back
                var selectedFile = file;
                await loadExampleFile('examples/' + selectedFile);
                await startAudio();
            });
            exampleFilesDiv.appendChild(link);
        });

        // add the div to the body
        document.body.appendChild(exampleFilesDiv);

        // add an event listener to the document to close the div when anything outside of it is clicked
        document.addEventListener('click', function(event) {
            if (event.target.id !== 'exampleFiles' && !exampleFilesDiv.contains(event.target)) {
                exampleFilesDiv.style.display = 'none';
            }
        });
    }
);

createButtonForNavBar(
    'About',
    'helpButton navbarButton',
    (event) => {
        document.getElementById('infoDiv').style.display = 'block';
        event.stopPropagation();
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
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 10);
    mousePosition.x = (document.documentElement.clientWidth / 2) - 210;
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
    link.textContent = "documentation";
    link.target = "_blank"; // to open the link in a new tab

    infoDiv.innerHTML = "<b>Wax</b> is a browser-based audio synthesis environment inspired by Max and other data-flow programming systems. Double-click or press 'n' to add devices to the workspace. Connect to a 'speaker' object to hear the output. For more information, see the full ";
    infoDiv.appendChild(link);

    var period = document.createTextNode(".");
    infoDiv.appendChild(period);
    infoDiv.style.display = 'block';

    // stop propagation of click event in infoDiv
    infoDiv.onclick = function(event) {
        event.stopPropagation();
    };

    // create the button to close the info div
    let closeButton = document.createElement('button');
    closeButton.textContent = 'x';
    closeButton.id = 'closeInfoButton';

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

    checkForQueryStringParams();
};

/* END UI initialization */

/* BEGIN globally acessible objects */
let chunks = [];
let destination;
let lastClicked = null;
let deviceCounts = {};
let isAudioPlaying = false;
let devices = {};
let audioBuffers = {};
let mousePosition = { x: 0, y: 0 };
let sourceDeviceId = null;
let sourceButtonId = null;
let sourceOutputIndex = null;
let selectedDevice = null;
let workspaceElement = document.getElementById('workspace');
let selectionDiv = null;
let startPoint = null;
const evalWorker = new Worker('js/evalWorker.js');
let handleWorkerMessage = null;
evalWorker.onmessage = (event) => {
    if (handleWorkerMessage) {
        handleWorkerMessage(event);
    }
};
/* END globally acessible objects */

/* BEGIN event handlers */
jsPlumb.bind("connectionDetached", function(info) {
    let sourceDevice = devices[info.sourceId];
    if (sourceDevice && sourceDevice.connections) {
        // find the connection in the source device's connections list
        let jsPlumbConnectionId = info.connection.getId();  
        let connection = sourceDevice.connections.find(conn => conn.id === jsPlumbConnectionId);
        if (connection) {
            try {
                // disconnect the connection
                connection.splitter.disconnect(devices[connection.target].device.node, connection.output, connection.input);
            } catch (error) {
                console.error('Failed to disconnect:', error);
            }
            // remove the connection from the list
            sourceDevice.connections = sourceDevice.connections.filter(conn => conn.id !== jsPlumbConnectionId);
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
    // 'c' creates a comment
    else if (event.key === 'c' && document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
        event.preventDefault();
        createDeviceByName('comment');
    }
    // 'b' creates a button
    else if (event.key === 'b' && document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
        event.preventDefault();
        createDeviceByName('button');
    }
    // 's' creates a slider
    else if (event.key === 's' && document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
        event.preventDefault();
        createDeviceByName('slider');
    }
    // 't' creates a toggle
    else if (event.key === 't' && document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
        event.preventDefault();
        createDeviceByName('toggle');
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

function addMotionDeviceToDropdown (deviceDropdown) {
    const motionInputOption = document.createElement('option');
    motionInputOption.value = "motion";
    motionInputOption.innerText = "motion";
    deviceDropdown.appendChild(motionInputOption);
}

function openAwesompleteUI() {
    deselectAllNodes();
    // get the dropdown element
    var dropdown = document.querySelector('.deviceDropdown');
    
    // get the options from the dropdown
    var list = Array.from(dropdown.options).map(function(option) {
        return option.text;
    });

    var deviceSelectTextDiv = document.createElement('div');
    deviceSelectTextDiv.textContent = "type to select a device...";
    deviceSelectTextDiv.className = 'deviceSelectText';
    deviceSelectTextDiv.style.fontSize = '0.9em';

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

    let selectCompleteTriggered = false;
    // add event listener for awesomplete-selectcomplete event
    awesomplete.input.addEventListener('awesomplete-selectcomplete', async function() {
        selectCompleteTriggered = true;
        var selectedOption = awesomplete.input.value;
        if (selectedOption == 'microphone input') {
            await createDeviceByName('mic');
        }
        else if (selectedOption == 'speaker') {
            await createDeviceByName('outputnode');
        }
        else {
            await createDeviceByName(selectedOption);
        }
        hideAwesomplete();
    });

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


    // add event listener for keydown event on the input
    input.addEventListener('keydown', async function(event) {
        // if enter key is pressed, call the createDeviceByName function
        if (event.key === 'Enter') {
            if (!selectCompleteTriggered) {
                event.preventDefault();
                await handleCreateDeviceByName();
                hideAwesomplete();
            }
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
    // get the list of available input devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputDevices = devices.filter(device => device.kind === 'audioinput');

    let defaultDevice;

    // check if deviceIds are available
    if (audioInputDevices[0] && audioInputDevices[0].deviceId) {
        // identify the default device
        defaultDevice = audioInputDevices.find(device => device.deviceId === 'default');
    }

    // if there is no device with id 'default', or deviceIds are not available, use the first device
    if (!defaultDevice) {
        defaultDevice = audioInputDevices[0];
    }

    const constraints = {
        audio: {
            autoGainControl: false,
            noiseSuppression: false,
            echoCancellation: false,
            sampleRate: 44100,
            deviceId: defaultDevice.deviceId
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
                outlets: [{ comment: 'signal out 1' },{ comment: 'signal out 2' }], // these need to exist so they work like the other WASM modules built with RNBO
                inlets: [{ comment: 'microphone input' }]
            }
        }
    };
    return device;
}

async function createMotionDevice(context) {
    // check if DeviceOrientationEvent is supported
    if (window.DeviceOrientationEvent) {
        // request permission for DeviceMotionEvent
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
            // create a ConstantSourceNode for each axis
            const betaNode = context.createConstantSource();
            const gammaNode = context.createConstantSource();
            betaNode.start();
            gammaNode.start();
            // add event listener for deviceorientation
            window.addEventListener('deviceorientation', function(event) {
                // normalize each axis to the range of -1 to 1
                betaNode.offset.value = event.beta / 90; // pitch
                gammaNode.offset.value = event.gamma / 90; // roll
            });

            // create a ChannelMergerNode to combine the outputs of the two nodes
            const merger = context.createChannelMerger(3);
            betaNode.connect(merger, 0, 0);
            gammaNode.connect(merger, 0, 1);

            // create a wrapper object for the device
            const device = {
                node: merger,
                source: merger,
                it: {
                    T: {
                        outlets: [
                            { comment: 'pitch' },
                            { comment: 'roll' }
                        ], 
                        inlets: []
                    }
                }
            };
            return device;
        } else {
            showGrowlNotification(`Permission for DeviceMotionEvent was not granted`);
        }
    } else {
        showGrowlNotification(`Sorry, your device does not support DeviceOrientationEvent`);
    }
}

async function attachOutports(device,deviceDiv) {
    const outports = device.outports;
    if (typeof outports =='undefined' || outports.length < 1) {
        return;
    }
    // listen on outports for any "regen" events to regenerate its parameters
    device.messageEvent.subscribe(async (ev) => {
        // ignore message events that don't belong to an outport
        if (outports.findIndex(elt => elt.tag === ev.tag) < 0) return;
        // handle regen outport events
        if ( outports[0].tag == 'regen' ) {
            const inputElements = deviceDiv.querySelectorAll('input, textarea');
            inputElements.forEach((inputElement) => {
                // create/trigger a change event
                const event = new Event('change');
                inputElement.dispatchEvent(event);
            });
        }
        else if ( outports[0].tag == 'save_recording' ) {
            const dataBuffer = await device.releaseDataBuffer('buf');
            let audioBuffer = dataBuffer.getAsAudioBuffer(context);
            const wavArrayBuffer = audioBufferToWav(audioBuffer);
            const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
            const audioURL = URL.createObjectURL(wavBlob);
            // create a download link
            let downloadLink = document.createElement('a');
            downloadLink.href = audioURL;
            let fileName = `recording_${Date.now()}.wav`;
            downloadLink.download = fileName;
            downloadLink.textContent = 'Download recording';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            // triggers a change to the inlets of the recorder the after the wav has been saved
            // which resets the audio buffer. needed to record more than one recording in a given session
            const inputElements = deviceDiv.querySelectorAll('input, textarea');
            inputElements.forEach((inputElement) => {
                // create/trigger a change event
                const event = new Event('change');
                inputElement.dispatchEvent(event);
            });
            await stopAudio();
            await startAudio(); 
        }
        else if ( outports[0].tag == 'value to print' ) {
            let hr = deviceDiv.querySelector('.device-hr');
            let span = deviceDiv.querySelector('.printvalue');

            // if the span for printing values doesn't exist yet, create it
            if (!span) {
                span = document.createElement('span');
                span.className = 'printvalue';
                deviceDiv.insertBefore(span, hr);
            }

            // update the print span's value
            if (typeof ev.payload === 'number' && ev.payload % 1 !== 0) {
                span.textContent = ev.payload.toFixed(2);
            } else {
                span.textContent = ev.payload;
            }
        }
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
                inportText.style.width = '38em';
                inportText.style.height = '6em';
            }
            else if (device.it.T.inports[0].tag == 'comment') {
                inportText = document.createElement('textarea');
                inportText.style.width = '13em';
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

            // create a line break
            const lineBreak = document.createElement('br');
    
            // append the label and input to the inportContainer
            inportContainer.appendChild(inportLabel);
            inportContainer.appendChild(inportText);
            inportContainer.appendChild(lineBreak);
        });
    
        inportForm.appendChild(inportContainer);
    }
    return inportForm;
}

async function scheduleDeviceEvent(device, inport, value) {
    try {
        let values;
        value = value.replace(/_\./g, '$().')

        if (device.dataBufferIds == 'pattern') {
            // send the data to be evaluated to the worker
            let audioBuffersCopy = {};

            for (let name in audioBuffers) {
                let audioBuffer = audioBuffers[name];
                let float32Array = audioBuffer.getChannelData(0);
                audioBuffersCopy[name] = Array.from(float32Array);
            }

            evalWorker.postMessage({ code: value, audioBuffers: audioBuffersCopy });
            handleWorkerMessage = async (event) => {
                if (event.data.error) {
                    showGrowlNotification(`${event.data.error}`);
                }
                values = event.data;
                if (Array.isArray(values.data) && values.data.length > 0) {
                    const float32Array = new Float32Array(values.data);
                    // create a new AudioBuffer
                    const audioBuffer = context.createBuffer(1, float32Array.length, context.sampleRate);
                    // copy the Float32Array to the AudioBuffer
                    audioBuffer.copyToChannel(float32Array, 0);
                    // set the AudioBuffer as the data buffer for the device
                    await device.setDataBuffer('pattern', audioBuffer);
                }
                if (typeof values === 'number' || (Array.isArray(values) && !isNaN(values[0]))) {
                    let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inport.tag, values);
                    device.scheduleEvent(messageEvent);
                }
            };
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
        else {
            messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inport.tag, -60101123);
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
    sourceButtonId = document.querySelector(`#${deviceId} .output-container button:nth-child(${outputIndex + 1})`).id;
}

function finishConnection(deviceId, inputIndex) {
    if (sourceDeviceId) {
        const sourceDevice = devices[sourceDeviceId].device;
        const targetDevice = devices[deviceId] ? devices[deviceId].device : null;
        const targetButtonId = document.querySelector(`#${deviceId} .input-container button:nth-child(${deviceId.includes('outputnode') ? 1 : inputIndex + 1})`).id;
        const sourceButton = document.getElementById(sourceButtonId);
        const targetButton = document.getElementById(targetButtonId);
        const sourcePosition = [
            (sourceButton.offsetLeft + sourceButton.offsetWidth / 2) / sourceButton.parentNode.offsetWidth,
           1
        ];
        const targetPosition = [
            (targetButton.offsetLeft + targetButton.offsetWidth / 2) / targetButton.parentNode.offsetWidth,
            0
        ];
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

        devices[sourceDeviceId].connections = devices[sourceDeviceId].connections || [];
        devices[sourceDeviceId].splitter = splitter;

        let targetDeviceInputName;
        if (deviceId.startsWith('outputnode')) {
            targetDeviceInputName = `speaker channel`;
        }
        else {
            targetDeviceInputName = devices[deviceId].device.it.T.inlets[inputIndex].comment;
        }
        // visualize the connection
        const jsPlumbConnection = jsPlumb.connect({
            source: sourceDeviceId,
            target: deviceId,
            anchors: [sourcePosition, targetPosition],
            endpoint: ["Dot", { radius: 8 }],
            paintStyle: { stroke: "white", strokeWidth: 2, fill: "transparent" },
            endpointStyle: { fill: "white", outlineStroke: "transparent", outlineWidth: 12, cssClass: "endpointClass" },
            connector: ["Straight"]
        });

        let jsPlumbConnectionId = jsPlumbConnection.getId();
        let connection = { id: jsPlumbConnectionId, splitter, target: deviceId, output: sourceOutputIndex, input: inputIndex };
        devices[sourceDeviceId].connections.push(connection);
    
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
    }
}
async function createDeviceByName(filename, audioBuffer = null, devicePosition = null) {
    try {
        let deviceDiv;
        if (filename === "motion") {
            const device = await createMotionDevice(context);
            deviceDiv = addDeviceToWorkspace(device, "motion", false);
        }
        else if (filename === "mic") {
            if ( !isAudioPlaying ) {
                await startAudio();
            }
            const device = await createMicrophoneDevice();
            deviceDiv = addDeviceToWorkspace(device, "microphone-input", false);
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
        else if (filename === "toggle") {
            const silenceGenerator = context.createConstantSource();
            silenceGenerator.offset.value = 0;
            silenceGenerator.start();
        
            // create the device
            const device = {
                node: silenceGenerator,
                source: silenceGenerator,
                it: {
                    T: {
                        outlets: [{ comment: 'signal out' }],
                        inlets: []
                    }
                }
            };
        
            deviceDiv = addDeviceToWorkspace(device, "toggle", false);
        
            // create a toggle button
            const toggleButton = document.createElement('button');
            toggleButton.textContent = 'Toggle';
            const inputContainer = deviceDiv.querySelector('.input-container');
            inputContainer.insertAdjacentElement('afterend', toggleButton);

             // create a hidden input
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.value = '0'; 
            hiddenInput.id = 'toggleHiddenInput';
            deviceDiv.appendChild(hiddenInput);
        
            // add initial class and text
            toggleButton.className = 'toggle-button toggle-off';
            toggleButton.textContent = 'off';

            // add event listener to the toggle button
            toggleButton.addEventListener('click', () => {
                // toggle the value between 1 and 0
                silenceGenerator.offset.value = 1 - silenceGenerator.offset.value;
                
                // update the hidden input value
                hiddenInput.value = silenceGenerator.offset.value;

                // toggle the class and text
                if (toggleButton.className === 'toggle-button toggle-off') {
                    toggleButton.className = 'toggle-button toggle-on';
                    toggleButton.textContent = 'on';
                } else {
                    toggleButton.className = 'toggle-button toggle-off';
                    toggleButton.textContent = 'off';
                }
            });
        }
        else if (filename === "slider") {
            const silenceGenerator = context.createConstantSource();
            silenceGenerator.offset.value = 0;
            silenceGenerator.start();
        
            // create the device
            const device = {
                node: silenceGenerator,
                source: silenceGenerator,
                it: {
                    T: {
                        outlets: [{ comment: 'signal out' }],
                        inlets: []
                    }
                }
            };
        
            deviceDiv = addDeviceToWorkspace(device, "slider", false);
        
            // create a slider
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.min = '0';
            slider.max = '1';
            slider.step = '0.001';
            slider.value = '0';
            const inputContainer = deviceDiv.querySelector('.input-container');
            inputContainer.insertAdjacentElement('afterend', slider);
        
            // add event listeners to the slider
            slider.addEventListener('input', () => {
                // update the silenceGenerator offset value
                silenceGenerator.offset.value = slider.value;
            });
            slider.addEventListener('change', () => {
                // update the silenceGenerator offset value
                silenceGenerator.offset.value = slider.value;
            });
        }
        else if (filename === "button") {
            const silenceGenerator = context.createConstantSource();
            silenceGenerator.offset.value = 0;
            silenceGenerator.start();
        
            // create the device
            const device = {
                node: silenceGenerator,
                source: silenceGenerator,
                it: {
                    T: {
                        outlets: [{ comment: 'signal out' }],
                        inlets: []
                    }
                }
            };
        
            deviceDiv = addDeviceToWorkspace(device, "button", false);
        
            // create a button
            const button = document.createElement('button');
            button.textContent = '⬤';
            const inputContainer = deviceDiv.querySelector('.input-container');
            inputContainer.insertAdjacentElement('afterend', button);
            button.className = 'button-ui';

            // define the event handler functions
            function handleButtonDown() {
                event.preventDefault();
                silenceGenerator.offset.value = 1;
                button.style.color = 'white';
            }

            function handleButtonUp() {
                event.preventDefault();
                silenceGenerator.offset.value = 0;
                button.style.color = 'black';
            }            
        
            // add event listeners to the button
            button.addEventListener('mousedown', handleButtonDown);
            button.addEventListener('mouseup', handleButtonUp);
            button.addEventListener('touchstart', handleButtonDown);
            button.addEventListener('touchend', handleButtonUp);
        }
        else if ( filename.startsWith('outputnode') ) {
            deviceDiv  = addDeviceToWorkspace(null, 'outputnode', true);
        }
        else {
            const response = await fetch(`wasm/${filename}.json`);
            const patcher = await response.json();
            const device = await RNBO.createDevice({ context, patcher });
            deviceDiv = addDeviceToWorkspace(device, filename, false);
            if ( filename == 'wave' ||  filename == 'play' || filename == 'buffer' ) {
                createAudioLoader(device, context, deviceDiv);
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
        if (filename == 'comment') {
            deviceDiv.style.width = '12em';
        }
        if (filename == 'buffer') {
            deviceDiv.style.width = '12em';
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
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                autoGainControl: false,
                noiseSuppression: false,
                echoCancellation: false,
                sampleRate: 44100,
                deviceId: deviceId
            }
        });
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
    fileInput.accept = 'audio/wav,audio/mp3,audio/mpeg,audio/*';

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

            // remove any preexisting elements with class name "audioFileName"
            const existingElements = deviceDiv.querySelectorAll('.audioFileName');
            existingElements.forEach(element => element.remove());

            // create a new p element to display the audio file name
            const fileNameElement = document.createElement('p');
            fileNameElement.className = 'audioFileName';
            fileNameElement.textContent = `file: ${file.name}`;
            const form = deviceDiv.querySelector('form');
            form.appendChild(fileNameElement);
        }
    });

    // create a new button
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'load file';
    button.style.marginTop = '10px';
    button.style.position = 'relative';
    button.style.display = 'inline';
    button.style.left = '-5px';

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
    deviceDiv.innerHTML = isSpeakerChannelDevice ? `speaker channel🔊` : deviceType == 'toggle' || deviceType == 'button'  ? '' : `<b style="font-size: 1.25em;">${deviceType.replace(/[_-]/g, ' ')}</b>`;
    
    // place the object at the mouse's last position
    deviceDiv.style.left = mousePosition.x + 'px';
    deviceDiv.style.top = mousePosition.y + 'px';

    if (!isSpeakerChannelDevice) {
        // create silence generator node
        const silenceGenerator = context.createConstantSource();
        silenceGenerator.offset.value = 0;
        silenceGenerator.start();
        // connect the silence generator to the device
        for (let i = 0; i < device.node.numberOfInputs; i++) {
            silenceGenerator.connect(device.node, 0, i);
        }
        // this is necessary so the device's inputs beyond the first are accessible with nothing patched into any other inlets
    }

    devices[deviceDiv.id] = { device: isSpeakerChannelDevice ? { node: channelMerger } : device , div: deviceDiv };
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';

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
        button.className = 'input-button'
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
        button.id = `${deviceDiv.id}-inlet-${0}`;
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
            outputButton.id = `${deviceDiv.id.replace(' ', '-')}-outlet-${index}`;
            outputButton.onclick = () => handleButtonClick(deviceDiv.id, index, false);
            outputContainer.appendChild(outputButton);
        });
        if (deviceType !== 'microphone input') {
            device.it.T.inlets.forEach((input, index) => {
                const inputButton = document.createElement('button');
                inputButton.innerText = `${input.comment}`;
                inputButton.id = `${deviceDiv.id}-inlet-${index}`;
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
        deviceDiv.style.width = `${(deviceWidth/2)+6}em`;
        if (inportForm.elements.length > 0) {
            deviceDiv.style.minWidth = '10em';
        }
        attachOutports(device,deviceDiv);
    }

    deviceDiv.insertBefore(inputContainer, deviceDiv.firstChild);
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
     // create motion input device, if available and working
     if (window.DeviceOrientationEvent) {
        let deviceOrientationWorks = false;
        const testDeviceOrientation = function(event) {
            if (event.alpha !== null || event.beta !== null || event.gamma !== null) {
                deviceOrientationWorks = true;
            }
            window.removeEventListener('deviceorientation', testDeviceOrientation);
        };
        window.addEventListener('deviceorientation', testDeviceOrientation);
        setTimeout(function() {
            if (deviceOrientationWorks) {
                addMotionDeviceToDropdown(deviceDropdown);
            }
        }, 1000);
    }
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

async function getWorkspaceState(saveToFile = false, createShareLink = false) {
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

    if ( createShareLink == true ) {
        let encodedState = LZString.compressToEncodedURIComponent(JSON.stringify(workspaceState));
        // format as a query string
        let queryString = `state=${encodedState}`;
        
        // get the current URL without query parameters
        let currentUrl = window.location.origin + window.location.pathname;
        
        // combine the current URL with the query string
        let fullUrl = `${currentUrl}?${queryString}`;
        
        // copy to clipboard
        navigator.clipboard.writeText(fullUrl).then(function() {
            alert('successfully copied to clipboard!');
        }, function(err) {});
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

async function reconstructWorkspaceState(deviceStates = null) {
    if (deviceStates === null) {
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
            deselectAllNodes();
        };

        fileInput.click();
    } else {
        deleteAllNodes();
        await reconstructDevicesAndConnections(deviceStates, null, false);
        deselectAllNodes();
    }
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
    deselectAllNodes();
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
            if ( audioBuffers[deviceState.audioFileName] ) {
                let audioBuffer = audioBuffers[deviceState.audioFileName];
                deviceElement = await createDeviceByName(deviceName,{name: deviceState.audioFileName,buffer: audioBuffer},devicePosition);
            }
            else {
                deviceElement = await createDeviceByName(deviceName, null, devicePosition);
                showGrowlNotification(`Make sure to load the missing audio file: "${deviceState.audioFileName}", since audio files are not stored with shared state URLs`);
            }
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

            // set any toggles "on" that were saved that way
            if ( deviceElement.id.includes('toggle') && deviceState.inputs[input.id] == 1 ) {
                const button = deviceElement.querySelector('button.toggle-button');
                if (button) {
                    button.click();
                }
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
    var elements = document.getElementsByClassName('exampleFilesDiv');
while(elements.length > 0){
    elements[0].parentNode.removeChild(elements[0]);
}

    // remove any existing .deviceListModal elements
    var existingModals = document.querySelectorAll('.deviceListModal');
    existingModals.forEach(function(modal) {
        modal.parentNode.removeChild(modal);
    });

    // get the dropdown select
    var dropdown = document.querySelector('.deviceDropdown');

    // get the options from the dropdown
    var options = dropdown.options;

    // create a div for the modal
    var modal = document.createElement('div');
    modal.className = 'deviceListModal';
    modal.id = 'deviceListModal';   

    // create a div for the content
    var content = document.createElement('div');
    content.className = 'deviceListModalContent';
    modal.appendChild(content);

    // create a ul for the list
    var ul = document.createElement('ul');
    ul.className = 'deviceList';

    // add each option in the dropdown to the list
    for (let i = 0; i < options.length; i++) {
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.textContent = options[i].text;
        a.addEventListener('click', async function(event) {
            event.preventDefault();
            await createDeviceByName(options[i].text.toLowerCase());
            modal.style.display = 'none';
        });
        li.appendChild(a);
        li.className = 'deviceListItem';
        ul.appendChild(li);
    }

    // add the list to the content div
    content.appendChild(ul);

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

async function stopAudio() {
    const button = document.querySelector('.startAudioButton');
    await new Promise(resolve => setTimeout(resolve, 10));
    await context.suspend();
    button.textContent = 'ON';
    button.style.border = '3px solid rgb(101,255,229)';
    button.style.background = 'rgb(101,255,229)';
    button.style.color = 'rgb(8,56,78)';
    isAudioPlaying = false;
}

async function startAudio() {
    const button = document.querySelector('.startAudioButton');
    await context.resume();
    button.textContent = 'OFF';
    button.style.border = '3px solid rgb(255,0,94)';
    button.style.background = 'rgb(255,0,94)';
    button.style.color = 'rgb(255,255,255)';
    isAudioPlaying = true;
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