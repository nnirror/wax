/* BEGIN UI initialization */

// create audio context
const WAContext = window.AudioContext || window.webkitAudioContext;
const context = new WAContext();

// create workspace DOM elements
const workspace = document.getElementById('workspace');
const navBar = document.getElementById('ui-container');

// create dropdown of all WASM devices
const deviceDropdown = document.createElement('select');

// set of available WASM devices
const wasmDeviceURLs = [
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
    "wasm/scale~.json"
];

// load each WASM device into dropdown
wasmDeviceURLs.forEach((url) => {
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
deviceSelectButton.innerText = 'Add';
deviceSelectButton.onclick = async () => {
    // get selected WASM file
    const url = deviceDropdown.value;
    // fetch the patcher
    const response = await fetch(url);
    const patcher = await response.json();
    // create the WASM device
    const device = await RNBO.createDevice({ context, patcher });
    let filename = url.replace(/wasm\//, '').replace(/\.json$/, '');
    // add device to workspace
    addDeviceToWorkspace(device, filename);
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


/* BEGIN audio out device section */
// TODO: refactor this more, so the output node is a WASM device
const outputNodeDevice = {
    device: { node: context.destination },
    div: document.createElement('div')
};
outputNodeDevice.div.id = 'output-node';
outputNodeDevice.div.className = 'node';

// create an input button for the output node device
const inputButton = document.createElement('button');
inputButton.innerText = 'signal in';
inputButton.onclick = () => finishConnection('output-node');
inputButton.style.display = 'block';

// insert the input button at the beginning of the output node device
outputNodeDevice.div.insertBefore(inputButton, outputNodeDevice.div.firstChild);

// add the text to the output node device
outputNodeDevice.div.appendChild(document.createTextNode('speakers🔊'));

// add the output node device to the workspace
workspace.appendChild(outputNodeDevice.div);

// make the output node device draggable
jsPlumb.ready(function() {
    jsPlumb.draggable(outputNodeDevice.div);
});

// add the output node device to the devices array so it can be accessed like the WASM devices
devices['output-node'] = outputNodeDevice;
/* END audio out device section */


/* BEGIN event handlers */

jsPlumb.bind("connectionDetached", function(info) {
    let sourceDevice = devices[info.sourceId];
    let targetDevice = devices[info.targetId];

    if (sourceDevice && targetDevice) {
        sourceDevice.device.node.disconnect(targetDevice.device.node);
    }
});

document.addEventListener('keydown', function(event) {
    // delete the selected device when the Delete / Backspace key is pressed
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedDevice) {
        jsPlumb.removeAllEndpoints(selectedDevice);
        removeDeviceFromWorkspace(selectedDevice.id);
        selectedDevice.remove();
        selectedDevice = null;
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
        // get all connections of the device
        let deviceConnections = jsPlumb.getConnections({source: deviceDiv.id});
        // delete each connection which will trigger the 'connectionDetached' event
        deviceConnections.forEach(connection => jsPlumb.deleteConnection(connection));
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

    // create an input button for each input
    device.it.T.inlets.forEach((input, index) => {
        const inputButton = document.createElement('button');
        inputButton.innerText = `${input.comment}`;
        inputButton.onclick = () => finishConnection(deviceDiv.id, index);
        inputContainer.appendChild(inputButton);
    });

    // add the div to the workspace
    workspace.appendChild(deviceDiv);

    jsPlumb.draggable(deviceDiv);

    // select multiple devices when shift is held
    deviceDiv.addEventListener('mousedown', (event) => {
        if (shiftHeld) {
            jsPlumb.addToDragSelection(deviceDiv);
        }
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

    const messages = device.messages;
    const inports = messages.filter(message => message.type === RNBO.MessagePortType.Inport);

    if (inports.length > 0) {
        inports.forEach(inport => {
            const inportLabel = document.createElement("label");
            inportLabel.innerText = inport.tag;

            const inportText = document.createElement('input');
            inportText.type = 'text';
            inportText.style.width = '8em';
            inportText.addEventListener('change', function() {
                const values = this.value.split(/\s+/).map(s => parseFloat(s));
                let messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inport.tag, values);
                device.scheduleEvent(messageEvent);
            });

            inportLabel.appendChild(inportText);
            inportContainer.appendChild(inportLabel);
        });

        inportForm.appendChild(inportContainer);
    }
    return inportForm;
}

function startConnection(deviceId, outputIndex) {
    sourceDeviceId = deviceId;
    sourceOutputIndex = outputIndex;
}

function finishConnection(deviceId, inputIndex) {
    if (sourceDeviceId) {
        const sourceDevice = devices[sourceDeviceId].device;
        const targetDevice = devices[deviceId].device;

        // connect the source device to the target device in the web audio API
        sourceDevice.node.connect(targetDevice.node, sourceOutputIndex, inputIndex);

        // visualize the connection
        const connection = jsPlumb.connect({
            source: sourceDeviceId,
            target: deviceId,
            anchors: [
                ["Perimeter", { shape: "Rectangle", anchorCount: 50 }],
                ["Perimeter", { shape: "Rectangle", anchorCount: 50 }]
            ],
            endpoint: ["Dot", { radius: 20 }],
            paintStyle: { stroke: "lightgray", strokeWidth: 3, fill: "transparent" },
            endpointStyle: { fill: "lightgray", outlineStroke: "transparent", outlineWidth: 12 },
            connector: ["Flowchart", { cornerRadius: 5 }],
            overlays: [
                ["Arrow", { width: 12, length: 12, location: 1 }],
                ["Custom", {
                    create: function() {
                        return document.createElement("div");
                    },
                    location: 0.5,
                    id: "customOverlay"
                }]
            ],
        });
        sourceDeviceId = null;
        sourceOutputIndex = null;
    }
}

/* END functions */