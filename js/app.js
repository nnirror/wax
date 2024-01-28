/* BEGIN UI initialization */

// create audio context
const WAContext = window.AudioContext || window.webkitAudioContext;
const context = new WAContext();

// set channelCount to maximum amount of channels available
context.destination.channelCount = context.destination.maxChannelCount;
// set channelCountMode to "explicit"
context.destination.channelCountMode = "explicit";
// set channelInterpretation to "discrete"
context.destination.channelInterpretation = "discrete";

const channelMerger = context.createChannelMerger(context.destination.channelCount);
channelMerger.connect(context.destination);

// create workspace DOM elements
const workspace = document.getElementById('workspace');
const navBar = document.getElementById('ui-container');

// create dropdown of all WASM devices
const deviceDropdown = document.createElement('select');

// set of available WASM devices
const wasmDeviceURLs = [
    "wasm/allpass~.json",
    "wasm/cycle~.json",
    "wasm/tri~.json",
    "wasm/phasor~.json",
    "wasm/noise~.json",
    "wasm/sah~.json",
    "wasm/*~.json",
    "wasm/delay~.json",
    "wasm/speedlim~.json",
    "wasm/slide~.json",
    "wasm/number~.json",
    "wasm/scale~.json",
    "wasm/clock_divider~.json",
    "wasm/lpf~.json",
    "wasm/hpf~.json",
    "wasm/bpf~.json",
    "wasm/line~.json",
    "wasm/skipper~.json",
    "wasm/pattern~.json"

];

// load each WASM device into dropdown
wasmDeviceURLs.sort().forEach((url) => {
    const option = document.createElement('option');
    option.value = url;
    let filename = url.replace(/wasm\//, '').replace(/\.json$/, '');
    option.innerText = filename;
    deviceDropdown.appendChild(option);
});

// add dropdown to navBar
navBar.appendChild(deviceDropdown);

// create button to select WASM device
const deviceSelectButton = document.createElement('button');
deviceSelectButton.innerText = 'Add device';
deviceSelectButton.onclick = async () => {
    await context.resume();
    // get selected WASM file
    const url = deviceDropdown.value;
    if ( url === "mic" ) {
        // special handling for mic input as it's not a WASM / RNBO device
        const device = await createMicrophoneDevice();
        // add device to workspace
        addDeviceToWorkspace(device, "microphone input");
    } else {
        // fetch the patcher
        const response = await fetch(url);
        const patcher = await response.json();
        // create the WASM device
        const device = await RNBO.createDevice({ context, patcher });
        let filename = url.replace(/wasm\//, '').replace(/\.json$/, '');
        // add device to workspace
        addDeviceToWorkspace(device, filename);
    }
};

// add button next to dropdown in navBar
navBar.appendChild(deviceSelectButton);

/* END UI initialization */

let deviceCounts = {};
let devices = {};
let sourceDeviceId = null;
let sourceOutputIndex = null;
let selectedDevice = null;
let shiftHeld = false;

// create a button that adds an output channel node instance to the DOM
const addButton = document.createElement('button');
addButton.innerText = 'Add output channel';
addButton.id = 'add-output';
addButton.onclick = () => {
    // create a new div for the node
    const div = document.createElement('div');
    div.id = `output-node-${Date.now()}`;
    div.className = 'node';
    div.style.bottom = '50%';

    // create a new button for the output channel node
    const button = document.createElement('button');
    button.innerText = 'signal in';
    button.style.display = 'block';

    // create a new number input for the node
    const numberInput = document.createElement('input');
    numberInput.type = 'number';
    numberInput.min = 0;
    numberInput.max = context.destination.channelCount;
    button.onclick = () => finishConnection(div.id, Number(numberInput.value)-1);

    // add the button and the number input to the div
    div.insertBefore(button, div.firstChild);
    div.appendChild(numberInput);
    div.appendChild(document.createTextNode(`speakers🔊`));

    // create a delete button for the device
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'x';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() {
        // get all connections where the device is the source
        let sourceConnections = jsPlumb.getConnections({source: div.id});
        // get all connections where the device is the target
        let targetConnections = jsPlumb.getConnections({target: div.id});
        // delete each source connection
        sourceConnections.forEach(connection => jsPlumb.deleteConnection(connection));
        // delete each target connection
        targetConnections.forEach(connection => jsPlumb.deleteConnection(connection));
        // remove the device div
        div.remove();
    });
    div.appendChild(deleteButton);

    // add the div to the workspace
    workspace.appendChild(div);

    // make the div draggable using jsPlumb
    jsPlumb.draggable(div);

    // add an entry for the node to the devices object
    devices[div.id] = {
        device: {
            node: channelMerger
        },
        connections: []
    };
};


// add the new button to the DOM
document.body.appendChild(addButton);

/* BEGIN audio i/o devices section */
// TODO: refactor this more, so the output node is a WASM device
// create microphone input module
addMicrophoneInputDeviceToDropdown(deviceDropdown);
/* END audio out device section */


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

/* END event handlers */

/* BEGIN functions */

function addMicrophoneInputDeviceToDropdown (deviceDropdown) {
    const micInputOption = document.createElement('option');
    micInputOption.value = "mic";
    micInputOption.innerText = "Microphone Input";
    deviceDropdown.appendChild(micInputOption);
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

function addDeviceToWorkspace(device, deviceType) {
    // get count for this device type and increment it
    const count = deviceCounts[deviceType] || 0;
    deviceCounts[deviceType] = count + 1;

    // create a new div for the device
    const deviceDiv = document.createElement('div');
    deviceDiv.id = `${deviceType}-${count}`;
    deviceDiv.className = 'node';
    deviceDiv.innerText = `${deviceType}`;
    deviceDiv.style.backgroundColor = 'lightgray';

    // store the device and its div
    devices[deviceDiv.id] = { device, div: deviceDiv };

    const hrElement = document.createElement('hr');
    // append the <hr> element to deviceDiv
    deviceDiv.appendChild(hrElement);

    // create an inport form for the device
    const inportForm = addInputsForDevice(device);

    inportForm.addEventListener('submit', function(event) {
        event.preventDefault();
    });

    deviceDiv.appendChild(inportForm);

    // create a container for the output buttons
    const outputContainer = document.createElement('div');
    outputContainer.className = 'output-container';
    deviceDiv.appendChild(outputContainer);

    // create a delete button for the device
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'x';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() {
    // get all connections where the device is the source
    let sourceConnections = jsPlumb.getConnections({source: deviceDiv.id});
    // get all connections where the device is the target
    let targetConnections = jsPlumb.getConnections({target: deviceDiv.id});
    // delete each source connection
    sourceConnections.forEach(connection => jsPlumb.deleteConnection(connection));
    // delete each target connection
    targetConnections.forEach(connection => jsPlumb.deleteConnection(connection));
    // remove the device div
    deviceDiv.remove();
});
    deviceDiv.appendChild(deleteButton);

    // create an output button for the device
    device.it.T.outlets.forEach((output, index) => {
        const outputButton = document.createElement('button');
        outputButton.innerText = `${output.comment}`;
        outputButton.onclick = () => startConnection(deviceDiv.id, index);
        outputContainer.appendChild(outputButton);
    });

    // create a container for the input buttons
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    deviceDiv.appendChild(inputContainer);

    // initialize totalLength to 0
    let deviceWidth = 0;

    device.it.T.inlets.forEach((input, index) => {
        const inputButton = document.createElement('button');
        inputButton.innerText = `${input.comment}`;
        inputButton.onclick = () => finishConnection(deviceDiv.id, index);
        inputContainer.appendChild(inputButton);
        deviceWidth += input.comment.length;
    });

    // set the width of the deviceDiv to be based on the width of the input buttons
    deviceDiv.style.width = `${deviceWidth/2}em`;
    // add the div to the workspace
    workspace.appendChild(deviceDiv);

    jsPlumb.draggable(deviceDiv);

    // select multiple devices when shift is held
    deviceDiv.addEventListener('mousedown', (event) => {
        if (shiftHeld) {
            jsPlumb.addToDragSelection(deviceDiv);
        }
    });

    attachOutports(device,deviceDiv);
}

function attachOutports(device,deviceDiv) {
    const outports = device.outports;
    if (outports.length < 1) {
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

    // disconnect the device from the web audio graph
    device.node.disconnect();

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
            const inportLabel = document.createElement("label");
            inportLabel.innerText = inport.tag;

            const inportText = document.createElement('input');
            inportText.type = 'text';
            inportText.style.width = '8em';
            inportText.addEventListener('change', function() {
                scheduleDeviceEvent(device, inport, this.value);
            });

            inportText.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    scheduleDeviceEvent(device, inport, this.value);
                }
            });
            inportLabel.appendChild(inportText);
            inportContainer.appendChild(inportLabel);
        });

        inportForm.appendChild(inportContainer);
    }
    return inportForm;
}

function scheduleDeviceEvent(device, inport, value) {
    try {
        let values;
        // TODO: pretty hacky but functioning - evaluation of the inport of a pattern~ device should 
        // produces an array of data for a wavetable. the array going into the inport needs to be 
        // prepended with the length of the array so the buffer can be reallocated in RNBO
        if (device.dataBufferIds == 'pattern') {
            values = eval(value);
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
        if (deviceId.startsWith('output-node')) {
            targetDeviceInputName = `output channel🔊 ${parseInt(deviceId.split('-')[2]) + 1}`;
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
            paintStyle: { stroke: "black", strokeWidth: 3, fill: "transparent" },
            endpointStyle: { fill: "black", outlineStroke: "transparent", outlineWidth: 12 },
            connector: ["StateMachine"],
            overlays: [
                ["Arrow", { width: 12, length: 12, location: 1 }],
                ["Custom", {
                    create: function() {
                        return document.createElement("div");
                    },
                    location: 0.5,
                    id: "customOverlay"
                }],
                ["Label", {
                    label: `${sourceDeviceOutputName} -> ${targetDeviceInputName}`,
                    cssClass: "aLabelClass"
                }]
            ],
        });
        sourceDeviceId = null;
        sourceOutputIndex = null;
    }
}

/* END functions */