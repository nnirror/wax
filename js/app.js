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

async function handleOnButtonClick() {
    if (isAudioPlaying) {
        await stopAudio();
    } else {
        await startAudio();
    }
}

function handleSaveButtonClick() {
    getWorkspaceState(true);
}

function handleShareButtonClick() {
    getWorkspaceState(false, true);
}

async function handleLoadButtonClick() {
    await reconstructWorkspaceState();
    await startAudio();
}

function handleLockButtonClick() {
    toggleDragging();
    if (isLocked) {
        document.getElementsByClassName('lockButton')[0].textContent = 'Unlock';
        document.getElementById('mobileLockButton').textContent = 'Unlock';
    }
    else {
        document.getElementsByClassName('lockButton')[0].textContent = 'Lock';
        document.getElementById('mobileLockButton').textContent = 'Lock';
    }
}

function handleDevicesButtonClick(event) {
    event.stopPropagation();
    hideMobileMenu();
    var modal = displayAllDevices();
    modal.style.display = 'block';
}

async function handleExamplesButtonClick(event) {
    event.stopPropagation();

    var modal = document.getElementById('deviceListModal');
    if (modal) {
        modal.style.display = 'none';
    }

    hideMobileMenu();

    var exampleFilesDiv = document.createElement('div');
    exampleFilesDiv.className = 'exampleFilesDiv';
    exampleFilesDiv.id = 'exampleFiles';

    // create a header for the list - visible on mobile
    var header = document.createElement('div');
    header.id = 'exampleListHeader';
    header.textContent = ' Examples';
    var triangle = document.createElement('span');
    triangle.className = 'mobileButtonTriangle';
    triangle.textContent = '◂';
    header.prepend(triangle);

    // add onclick event listener to the header
    header.onclick = function() {
        exampleFilesDiv.style.display = 'none';
        showMobileMenu();
    };

    exampleFilesDiv.appendChild(header);

    ['amplitude_modulation.zip', 'audio_file_playback.zip', 'frequency_modulation.zip', 'hello_world.zip', 'microphone.zip', 'mono_synth.zip', 'patterns_with_facet.zip', 'regenerating_parameters.zip'].forEach(function(file) {
        var link = document.createElement('a');
        link.href = '#';
        link.textContent = file.replace(/_/g, ' ').replace('.zip', '');
        link.addEventListener('click', async function(event) {
            event.preventDefault();
            var selectedFile = file;
            await stopAudio();
            await loadExampleFile('examples/' + selectedFile);
            await startAudio();
        });
        exampleFilesDiv.appendChild(link);
    });

    document.body.appendChild(exampleFilesDiv);

    document.addEventListener('click', function(event) {
        if (event.target.id !== 'exampleFiles' && !exampleFilesDiv.contains(event.target)) {
            exampleFilesDiv.style.display = 'none';
        }
    });
}

function handleAboutButtonClick(event) {
    document.getElementById('infoDiv').style.display = 'block';
    event.stopPropagation();
}

function handleMenuButtonClick(event) {
    document.getElementById('infoDiv').style.display = 'none';
    var mobileMenu = document.getElementById('mobileMenu');
    var deviceListModal = document.getElementById('deviceListModal');
    var exampleFiles = document.getElementById('exampleFiles');

    var isMobileMenuVisible = mobileMenu && window.getComputedStyle(mobileMenu).display !== 'none';
    var isDeviceListModalVisible = deviceListModal && window.getComputedStyle(deviceListModal).display !== 'none';
    var isExampleFilesVisible = exampleFiles && window.getComputedStyle(exampleFiles).display !== 'none';

if (isDeviceListModalVisible || isExampleFilesVisible || isMobileMenuVisible) {
    hideMobileMenu();
} else {
        showMobileMenu(event);
    }
}

function hideMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.style.display = 'none';
}

function showMobileMenu(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.style.display = 'block';
    if (event) {
        event.stopPropagation();
    }
}

createButtonForNavBar('WAX', 'waxButton navbarButton', ()=>{});
createButtonForNavBar('OFF', 'startAudioButton navbarButton', handleOnButtonClick);
createButtonForNavBar('Save', 'saveStateButton navbarButton', handleSaveButtonClick);
createButtonForNavBar('Share', 'shareStateButton navbarButton', handleShareButtonClick);
createButtonForNavBar('Load', 'reloadStateButton navbarButton', handleLoadButtonClick);
createButtonForNavBar('Lock', 'lockButton navbarButton', handleLockButtonClick);
createButtonForNavBar('Devices', 'viewAllDevices navbarButton', handleDevicesButtonClick);
createButtonForNavBar('Examples', 'exampleFilesButton navbarButton', handleExamplesButtonClick);
createButtonForNavBar('About', 'helpButton navbarButton', handleAboutButtonClick);
createButtonForNavBar('Menu', 'mobileMenuToggleButton navbarButton', handleMenuButtonClick);

// prevent accidental refreshes which would lose unsaved changes
window.onbeforeunload = function() {
    return "Are you sure you want to leave? Unsaved changes will be lost.";
};

// add the initial speaker objects and getting started text
window.onload = async function() {
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 10);
    
    mousePosition.x = document.documentElement.clientWidth - 200;
    mousePosition.y = document.documentElement.clientHeight / 2 - 50;
    let speaker1Div = await createDeviceByName('output');
    let inputElement = speaker1Div.querySelector('input');
    if (inputElement) {
        inputElement.value = 1;
    }
    
    mousePosition.x = document.documentElement.clientWidth - 200;
    mousePosition.y = (document.documentElement.clientHeight / 2) + 50;
    let speaker2Div = await createDeviceByName('output');
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
    closeButton.id = 'closeInfoButton';
    closeButton.className = 'delete-button';

    // create the image element for the close icon
    const closeIcon = document.createElement('img');
    closeIcon.src = 'img/delete.png';
    closeIcon.alt = 'Delete';

    // append the image to the button
    closeButton.appendChild(closeIcon);

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

    await checkForQueryStringParams();
    await startAudio();
};

document.addEventListener('input', function(event) {
    if (event.target.tagName.toLowerCase() === 'textarea') {
        resizeTextarea(event.target);
    }
});

// event listener for window resize when element exceeds edge
document.addEventListener('DOMContentLoaded', function() {
    const workspace = document.getElementById('workspace');
    const edgeThreshold = 50; // distance from edge to trigger expansion
    const expansionRate = 10; // pixels to expand per interval
    const scrollRate = 10; // pixels to scroll per interval
    let expandInterval;

    function getEventCoordinates(event) {
        if (event.touches && event.touches.length > 0) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        } else {
            return { x: event.clientX, y: event.clientY };
        }
    }

    function checkEdgeAndExpand(event) {
        if (!isDraggingDevice) {
            return;
        }
        const rect = workspace.getBoundingClientRect();
        const { x: mouseX, y: mouseY } = getEventCoordinates(event);

        let expandX = false;
        let expandY = false;

        if (mouseX >= rect.right - edgeThreshold) {
            expandX = true;
        } else if (mouseX <= rect.left + edgeThreshold) {
            expandX = true;
        }

        if (mouseY >= rect.bottom - edgeThreshold) {
            expandY = true;
        } else if (mouseY <= rect.top + edgeThreshold) {
            expandY = true;
        }

        if (expandX || expandY) {
            if (!expandInterval) {
                expandInterval = setInterval(() => {
                    if (expandX) {
                        workspace.style.width = workspace.offsetWidth + expansionRate + 'px';
                        window.scrollBy(scrollRate, 0);
                    }
                    if (expandY) {
                        workspace.style.height = workspace.offsetHeight + expansionRate + 'px';
                        window.scrollBy(0, scrollRate);
                    }
                }, 20);
            }
        } else {
            clearInterval(expandInterval);
            expandInterval = null;
        }
    }

    function stopExpand() {
        clearInterval(expandInterval);
        expandInterval = null;
    }

    document.addEventListener('mousemove', checkEdgeAndExpand);
    document.addEventListener('mouseup', stopExpand);
    document.addEventListener('touchmove', checkEdgeAndExpand);
    document.addEventListener('touchend', stopExpand);

    // prevent automatic scrolling back to the original position
    window.addEventListener('scroll', (event) => {
        if (expandInterval) {
            event.preventDefault();
        }
    }, { passive: false });
});

// event listener for paste event
document.addEventListener('paste', (event) => {
    if (event.target.tagName.toLowerCase() === 'textarea' || event.target.tagName.toLowerCase() === 'input') {
        return;
    }
    pasteNodesFromClipboard();
});

// event listeners for copy / paste shortcuts
document.addEventListener('keydown', (event) => {
    if (event.target.tagName.toLowerCase() === 'textarea' || event.target.tagName.toLowerCase() === 'input') {
        return;
    }
    if (event.metaKey && event.key === 'c') {
        copySelectedNodesToClipboard();
    }
});

/* END UI initialization */

/* BEGIN globally acessible objects */
let chunks = [];
let destination;
let lastClicked = null;
let deviceCounts = {};
let isAudioPlaying = false;
let devices = {};
let isDraggingDevice = false;
let isLocked = false;
let audioBuffers = {};
let mousePosition = { x: 0, y: 0 };
let sourceDeviceId = null;
let sourceButtonId = null;
let sourceOutputIndex = null;
let selectedDevice = null;
let workspaceElement = document.getElementById('workspace');
let selectedConnection = null;
let executedTextPatterns = {};
let selectionDiv = null;
let startPoint = null;
const evalWorker = new Worker('js/evalWorker.js');
let defaultValues = null;
getDefaultValues().then(data => {
    defaultValues = data;
});
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


// Event listener to detect when a connection is clicked
jsPlumb.bind("click", function(connection, originalEvent) {
    jsPlumb.getAllConnections().forEach(conn => {
        resetConnectionStyle(conn);
    });
    deselectAllNodes();
    selectedConnection = connection;
    connection.setPaintStyle({ stroke: 'rgb(255,0,94)', strokeWidth: 4 });
    connection.endpoints.forEach(endpoint => {
        endpoint.setPaintStyle({ fill: 'transparent', outlineStroke: "transparent", outlineWidth: 12, cssClass: "endpointClass" });
    });
});

connectionManagementClickHandler();

document.body.addEventListener('click', function(event) {
    if (event.target.matches('.output-button, .input-button, .output-button *, .input-button *, .inport-button, .regenButtonImage')) {
        showVisualConfirmationOfConnectionButtonClick(event);
    }
    if (selectedConnection && !event.target.closest('.jtk-connector')) {
        resetConnectionStyle(selectedConnection);
        selectedConnection = null;
    }
    var mobileMenu = document.getElementById('mobileMenu');
    var style = window.getComputedStyle(mobileMenu);
    var isMobileMenuVisible = style.display !== 'none';

    if (isMobileMenuVisible && !event.target.closest('#mobileMenu') && event.target.id !== 'deviceListHeader' && event.target.id !== 'exampleListHeader') {
        hideMobileMenu();
    }
});

// listen for mousedown events on the workspaceElement
workspaceElement.addEventListener('mousedown', (event) => {
    if (isLocked) return;
    // only start the selection if the target is the workspaceElement itself
    if (event.target === workspaceElement) {
        let rect = workspaceElement.getBoundingClientRect();
        startPoint = { 
            x: event.clientX - rect.left + workspaceElement.scrollLeft, 
            y: event.clientY - rect.top + workspaceElement.scrollTop 
        };
        // create the selection div and add it to the workspaceElement
        if (!selectionDiv) {
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
        let x = event.clientX - rect.left + workspaceElement.scrollLeft;
        let y = event.clientY - rect.top + workspaceElement.scrollTop;

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

document.addEventListener('DOMContentLoaded', function() {
    const workspace = document.getElementById('workspace');
    let lastTap = 0;

    function handleDoubleClick(event) {
        let target = event.target;

        // traverse up the DOM tree to find the element with the 'jtk-connector' class
        while (target && !target.classList.contains('jtk-connector')) {
            target = target.parentElement;
        }

        if (target && target.classList.contains('jtk-connector')) {
            const connection = jsPlumb.getConnections().find(conn => conn.connector.canvas === target);
            if (connection) {
                if (!isLocked) {
                    jsPlumb.deleteConnection(connection);
                }
            }
        }
    }

    function handleDoubleTap(event) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            handleDoubleClick(event);
        }
        lastTap = currentTime;
    }

    workspace.addEventListener('dblclick', handleDoubleClick);
    workspace.addEventListener('touchend', handleDoubleTap);
});

// listen for keydown events on the document
document.addEventListener('keydown', (event) => {
    // check if Delete or Backspace key was pressed
    if (event.target.tagName.toLowerCase() === 'textarea' || event.target.tagName.toLowerCase() === 'input' || event.target.closest('.CodeMirror')) {
        return;
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
        // get all selected nodes
        let nodes = document.querySelectorAll('.node');
        nodes.forEach((node) => {
            // check if the node is selected
            if (node.classList.contains('selectedNode')) {
                if ( !isLocked ) {
                    // remove the node from the workspace
                    let sourceConnections = jsPlumb.getConnections({source: node.id});
                    let targetConnections = jsPlumb.getConnections({target: node.id});
                    sourceConnections.forEach(connection => jsPlumb.deleteConnection(connection));
                    targetConnections.forEach(connection => jsPlumb.deleteConnection(connection));
                    removeDeviceFromWorkspace(node.id);
                    node.remove();
                }
            }
        });

        if (selectedConnection) {
            if ( !isLocked )  {
                jsPlumb.deleteConnection(selectedConnection);
                selectedConnection = null;
            }
        }

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
    else if (event.key === 'c' && !event.metaKey && document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
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

// duplicate functionality
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

function addMotionDeviceToDropdown (deviceDropdown) {
    const motionInputOption = document.createElement('option');
    motionInputOption.value = "motion";
    motionInputOption.innerText = "motion";
    deviceDropdown.appendChild(motionInputOption);
}

function openAwesompleteUI() {
    if (isLocked) return;
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
        selectedOption = getFileNameByDisplayName(selectedOption);
        if (selectedOption == 'microphone input') {
            await createDeviceByName('mic',null,{left:mousePosition.x+document.getElementById('workspace').scrollLeft,top:mousePosition.y+document.getElementById('workspace').scrollTop});
        }
        else if (selectedOption == 'speaker') {
            await createDeviceByName('output',null,{left:mousePosition.x+document.getElementById('workspace').scrollLeft,top:mousePosition.y+document.getElementById('workspace').scrollTop});
        }
        else {
            await createDeviceByName(selectedOption,null,{left:mousePosition.x+document.getElementById('workspace').scrollLeft,top:mousePosition.y+document.getElementById('workspace').scrollTop});
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
                await createDeviceByName('mic',null,{left:mousePosition.x+document.getElementById('workspace').scrollLeft,top:mousePosition.y+document.getElementById('workspace').scrollTop});
            }
            else if ( awesomplete.ul.childNodes[0].textContent == 'speaker' ) {
                await createDeviceByName('output',null,{left:mousePosition.x+document.getElementById('workspace').scrollLeft,top:mousePosition.y+document.getElementById('workspace').scrollTop});
            }
            else {
                const displayName = awesomplete.ul.childNodes[0].textContent;
                const fileName = getFileNameByDisplayName(displayName);
                if (fileName) {
                    await createDeviceByName(fileName,null,{left:mousePosition.x+document.getElementById('workspace').scrollLeft,top:mousePosition.y+document.getElementById('workspace').scrollTop});
                }
            }
        } else {
            // use exactly what the user typed
            if ( input.value == 'speaker' ) {
                await createDeviceByName('output',null,{left:mousePosition.x+document.getElementById('workspace').scrollLeft,top:mousePosition.y+document.getElementById('workspace').scrollTop});
            }
            else {
                await createDeviceByName(input.value,null,{left:mousePosition.x+document.getElementById('workspace').scrollLeft,top:mousePosition.y+document.getElementById('workspace').scrollTop});
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
        if (event.target.tagName.toLowerCase() === 'textarea' || event.target.tagName.toLowerCase() === 'input' || event.target.closest('.CodeMirror')) {
            return;
        }
        // check if 'n' key is pressed and no input is focused
        if ((event.key === 'n' || event.key === 'N') && document.activeElement.tagName.toLowerCase() !== 'input' && document.activeElement.tagName.toLowerCase() !== 'textarea') {
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
                outlets: [{ comment: 'output 1' },{ comment: 'output 2' }], // these need to exist so they work like the other WASM modules built with RNBO
                inlets: []
            }
        }
    };
    return device;
}

async function createMotionDevice(context) {
    // check if DeviceOrientationEvent is supported
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
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

    if (!deviceId.startsWith('output')) {
        // disconnect the device from the web audio graph
        device.node.disconnect();
    }

    // remove the device from storage
    delete devices[deviceId];
}

function addInputsForDevice(device, deviceType, deviceId) {
    const inportForm = document.createElement('form');
    inportForm.autocomplete = 'off';
    const inportContainer = document.createElement('div');
    inportContainer.className = 'labelAndInputContainer';
    if ( ['mix','sah','record'].includes(deviceType) ) {
        // devices with inports that start 2 buttons down
        inportContainer.style.paddingTop = '52px';
    }
    else if (['cycle', 'rect', 'tri', 'saw', 'phasor', 'number', 'clock','granular'].includes(deviceType) == false) {
        // devices with inports that start 1 button down
        inportContainer.style.paddingTop = '25px';
    }
    else {
        // devices with inports that start at top
        inportContainer.style.marginTop = '-2px';
    }
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
                inportContainer.style.width = '78%';
                inportContainer.style.padding = '0px 10px 0px 10px';
            }
            else if (device.it.T.inports[0].tag == 'comment') {
                inportText = document.createElement('textarea');
                inportText.style.width = '13em';
                inportText.style.height = 'auto';
                inportText.style.height =  '35px';
            }
            else {
                inportText = document.createElement('input');
            }
            inportText.id = inport.tag;
            inportText.className = 'deviceInport'
            inportText.addEventListener('change', function(event) {
                if (document.activeElement !== event.target) {
                    scheduleDeviceEvent(device, inport, this.value, deviceId, false);
                }
            });

            inportText.addEventListener('regen', function(event) {
                if (document.activeElement !== event.target) {
                    scheduleDeviceEvent(device, inport, this.value, deviceId, true);
                }
            });
            
            inportText.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    scheduleDeviceEvent(device, inport, this.value, deviceId, false);
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
            if ( deviceType !== 'pattern' ) {
                inportContainer.appendChild(lineBreak);
            }

             // set the default value for this device's parameter
            if (defaultValues.hasOwnProperty(deviceType)) {
                if (defaultValues[deviceType].hasOwnProperty(inport.tag)) {
                    inportText.value = defaultValues[deviceType][inport.tag];
                    inportText.dispatchEvent(new Event('change'));
                }
            }
        });
    
        inportForm.appendChild(inportContainer);
    }
    return inportForm;
}

async function scheduleDeviceEvent(device, inport, value, deviceId, fromRegenButton) {
    try {
        let values;
        if (value == undefined) {
            return;
        }
        value = value.replace(/_\./g, '$().');
        if (device.dataBufferIds == 'pattern') {
            if ( executedTextPatterns[deviceId] && fromRegenButton === false) {
                value = executedTextPatterns[deviceId];
            }
            value = value.replace(/_\./g, '$().');
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
                    executedTextPatterns[deviceId] = value;
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
            messageEvent = new RNBO.MessageEvent(RNBO.TimeNow, inport.tag, 0);
            device.scheduleEvent(messageEvent);
        }
    } catch (error) {
        showGrowlNotification(`Error in device parameter: ${value}, ${error}`);
    }
}

function handleButtonClick(deviceId, index, isInputButton) {
    if (isLocked) return;
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
    try {
        if (sourceDeviceId) {
            const sourceDevice = devices[sourceDeviceId].device;
            const targetDevice = devices[deviceId] ? devices[deviceId].device : null;
            const targetButtonId = document.querySelector(`#${deviceId} .input-container button:nth-child(${deviceId.includes('output') ? 1 : inputIndex + 1})`).id;
            const sourceButton = document.getElementById(sourceButtonId);
            const targetButton = document.getElementById(targetButtonId);
            const verticalOffset = 40;
            let sourcePosition, targetPosition;
            let initialSourceHeight, initialTargetHeight;

            if (sourceDeviceId.split('-')[0] === 'pattern') {
                initialSourceHeight = sourceButton.parentNode.parentNode.offsetHeight;
                const relativeSourcePosition = (sourceButton.offsetTop + verticalOffset) / initialSourceHeight;

                sourcePosition = [1, relativeSourcePosition];
                targetPosition = [
                    0,
                    (targetButton.offsetTop + verticalOffset) / targetButton.parentNode.parentNode.offsetHeight
                ];
            } else if (deviceId.split('-')[0] === 'pattern') {
                initialTargetHeight = targetButton.parentNode.parentNode.offsetHeight;
                const relativeTargetPosition = (targetButton.offsetTop + verticalOffset) / initialTargetHeight;

                sourcePosition = [
                    1,
                    (sourceButton.offsetTop + verticalOffset) / sourceButton.parentNode.parentNode.offsetHeight
                ];
                targetPosition = [0, relativeTargetPosition];
            } else {
                sourcePosition = [
                    1,
                    (sourceButton.offsetTop + verticalOffset) / sourceButton.parentNode.parentNode.offsetHeight
                ];
                targetPosition = [
                    0,
                    (targetButton.offsetTop + verticalOffset) / targetButton.parentNode.parentNode.offsetHeight
                ];
            }

            // create channel splitter
            let splitter = context.createChannelSplitter(sourceDevice.numOutputChannels);

            sourceDevice.node.connect(splitter);

            if (targetDevice) {
                // if the target device is a regular device, connect it as usual
                splitter.connect(targetDevice.node, sourceOutputIndex, inputIndex);
            } else {
                // if the target device is one of the special divs, connect it to the channelMerger
                splitter.connect(channelMerger, sourceOutputIndex, inputIndex);
            }

            devices[sourceDeviceId].connections = devices[sourceDeviceId].connections || [];
            devices[sourceDeviceId].splitter = splitter;

            let targetDeviceInputName;
            if (deviceId.startsWith('output')) {
                targetDeviceInputName = `speaker channel`;
            } else {
                targetDeviceInputName = devices[deviceId].device.it.T.inlets[inputIndex].comment;
            }

            // visualize the connection
            const jsPlumbConnection = jsPlumb.connect({
                source: sourceDeviceId,
                target: deviceId,
                anchors: [sourcePosition, targetPosition],
                paintStyle: { stroke: "white", strokeWidth: 4, fill: "transparent" },
                endpointStyle: { fill: "transparent", outlineStroke: "transparent", outlineWidth: 12, cssClass: "endpointClass" },
                endpoint: ["Dot", { radius: 0 }],
                connector: ["Straight"]
            });

            let jsPlumbConnectionId = jsPlumbConnection.getId();
            let connection = { id: jsPlumbConnectionId, splitter, target: deviceId, output: sourceOutputIndex, input: inputIndex };
            devices[sourceDeviceId].connections.push(connection);

            // listen for resizing of the pattern device so that connections can be redrawn
            if (sourceDeviceId.split('-')[0] === 'pattern') {
                const patternDeviceDiv = document.getElementById(sourceDeviceId);
                const resizeObserver = new ResizeObserver(() => {
                    const newSourceHeight = sourceButton.parentNode.parentNode.offsetHeight;
                    const newRelativeSourcePosition = (sourceButton.offsetTop + verticalOffset) / newSourceHeight;

                    jsPlumbConnection.endpoints[0].anchor.y = newRelativeSourcePosition;
                    jsPlumb.repaintEverything();
                });
                resizeObserver.observe(patternDeviceDiv);
            }

            if (deviceId.split('-')[0] === 'pattern') {
                const patternDeviceDiv = document.getElementById(deviceId);
                const resizeObserver = new ResizeObserver(() => {
                    const newTargetHeight = targetButton.parentNode.parentNode.offsetHeight;
                    const newRelativeTargetPosition = (targetButton.offsetTop + verticalOffset) / newTargetHeight;

                    jsPlumbConnection.endpoints[1].anchor.y = newRelativeTargetPosition;
                    jsPlumb.repaintEverything();
                });
                resizeObserver.observe(patternDeviceDiv);
            }

            sourceDeviceId = null;
            sourceOutputIndex = null;
        }
        jsPlumb.repaintEverything();
    } catch (error) {
        console.log('error making connection:' + error);
    }
}

async function createDeviceByName(filename, audioBuffer = null, devicePosition = null) {
    try {
        let deviceDiv;
        if (filename === "motion") {
            const device = await createMotionDevice(context);
            deviceDiv = addDeviceToWorkspace(device, "motion", false);
        }
        else if (filename === "mic" || filename === "microphone" || filename === "microphone-input") {
            filename = "mic";
            if ( !isAudioPlaying ) {
                await startAudio();
            }
            const device = await createMicrophoneDevice();
            deviceDiv = addDeviceToWorkspace(device, "microphone-input", false);
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
                        outlets: [{ comment: 'output' }],
                        inlets: []
                    }
                }
            };
        
            deviceDiv = addDeviceToWorkspace(device, "toggle", false);
        
            // create a toggle button
            const toggleButton = document.createElement('button');
            toggleButton.textContent = 'off';
            toggleButton.className = 'toggle-button toggle-off';
        
            // create a hidden input
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.value = '0'; 
            hiddenInput.id = 'toggleHiddenInput';
        
            // find the existing form in the device
            const form = deviceDiv.querySelector('form');
        
            // create a div to hold the labels and inputs
            const div = document.createElement('div');
            div.className = 'labelAndInputContainer';
            div.style.left = '9px';
            div.style.top = '0px';
        
            // append the toggle button and hidden input to the div
            div.appendChild(toggleButton);
            div.appendChild(hiddenInput);
        
            // append the div to the form
            form.appendChild(div);
        
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
        else if (filename === "keyboard") {
            const silenceGenerator = context.createConstantSource();
            silenceGenerator.offset.value = 0;
            silenceGenerator.start();
        
            const triggerSource = context.createConstantSource();
            triggerSource.offset.value = 0;
            triggerSource.start();
        
            const merger = context.createChannelMerger(2);
        
            // connect the generators to the merger
            silenceGenerator.connect(merger, 0, 0);
            triggerSource.connect(merger, 0, 1);
        
            // create the device
            const device = {
                node: merger,
                source: merger,
                it: {
                    T: {
                        outlets: [{ comment: 'frequency' }, { comment: 'trigger' }],
                        inlets: []
                    }
                }
            };
        
            deviceDiv = addDeviceToWorkspace(device, "keyboard", false);
        
            // create a div to hold the piano keyboard
            const keyboardDiv = document.createElement('div');
            keyboardDiv.className = 'pianoKeyboard';
            keyboardDiv.style.position = 'relative';
            keyboardDiv.style.width = '392px';
            keyboardDiv.style.marginBottom = '9px';
            keyboardDiv.style.height = '100px';
            keyboardDiv.style.border = '1px solid black';
        
            // create keys
            const keys = [
                { note: 'C', color: 'white' },
                { note: 'C#', color: 'black' },
                { note: 'D', color: 'white' },
                { note: 'D#', color: 'black' },
                { note: 'E', color: 'white' },
                { note: 'F', color: 'white' },
                { note: 'F#', color: 'black' },
                { note: 'G', color: 'white' },
                { note: 'G#', color: 'black' },
                { note: 'A', color: 'white' },
                { note: 'A#', color: 'black' },
                { note: 'B', color: 'white' },
                { note: 'C', color: 'white' }
            ];
        
            let isMouseDown = false;
            let rootNote = 60; // default middle C
            let previousKeyDiv = null;
        
            const midiToFrequency = (midiNote) => {
                return 440 * Math.pow(2, (midiNote - 69) / 12);
            };
        
            const highlightKey = (keyDiv) => {
                if (previousKeyDiv && previousKeyDiv !== keyDiv) {
                    resetKey(previousKeyDiv);
                }
                keyDiv.style.backgroundColor = 'yellow';
                const freq = midiToFrequency(parseInt(keyDiv.dataset.value));
                silenceGenerator.offset.value = freq;
                triggerSource.offset.setValueAtTime(1, context.currentTime);
                triggerSource.offset.setValueAtTime(0, context.currentTime + 0.1); // Briefly output 1
                previousKeyDiv = keyDiv;
            };
        
            const resetKey = (keyDiv) => {
                keyDiv.style.backgroundColor = keyDiv.dataset.color === 'white' ? 'white' : 'black';
            };
        
            const handleMouseOver = (keyDiv) => {
                if (isMouseDown) {
                    highlightKey(keyDiv);
                }
            };
        
            const handleTouchMove = (event) => {
                const touch = event.touches[0];
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                const keyDiv = element && element.classList.contains('pianoKey') ? element : null;
                if (keyDiv) {
                    highlightKey(keyDiv);
                }
            };
        
            document.addEventListener('mouseup', () => {
                isMouseDown = false;
                if (previousKeyDiv) {
                    resetKey(previousKeyDiv);
                    previousKeyDiv = null;
                }
            });
        
            document.addEventListener('touchend', () => {
                if (previousKeyDiv) {
                    resetKey(previousKeyDiv);
                    previousKeyDiv = null;
                }
            });
        
            document.addEventListener('touchcancel', () => {
                if (previousKeyDiv) {
                    resetKey(previousKeyDiv);
                    previousKeyDiv = null;
                }
            });
        
            keys.forEach((key, index) => {
                const keyDiv = document.createElement('div');
                keyDiv.className = `pianoKey ${key.color}`;
                keyDiv.style.position = 'absolute';
                keyDiv.style.width = '30px';
                keyDiv.style.height = '100px';
                keyDiv.style.left = `${index * 30}px`;
                keyDiv.style.backgroundColor = key.color === 'white' ? 'white' : 'black';
                keyDiv.style.border = '1px solid black';
                keyDiv.dataset.note = key.note;
                keyDiv.dataset.value = rootNote + index;
                keyDiv.dataset.color = key.color;
        
                keyDiv.addEventListener('mousedown', () => {
                    isMouseDown = true;
                    highlightKey(keyDiv);
                });
        
                keyDiv.addEventListener('mouseover', () => handleMouseOver(keyDiv));
        
                keyDiv.addEventListener('mouseup', () => isMouseDown = false);
        
                keyDiv.addEventListener('touchstart', (event) => {
                    event.preventDefault();
                    highlightKey(keyDiv);
                }, { passive: false });
        
                keyDiv.addEventListener('touchmove', (event) => {
                    event.preventDefault();
                    handleTouchMove(event);
                }, { passive: false });
        
                keyboardDiv.appendChild(keyDiv);
            });
        
            // append the keyboard to the device div
            deviceDiv.appendChild(keyboardDiv);
        
            // create label for the root note input
            const rootNoteLabel = document.createElement('label');
            rootNoteLabel.for = 'rootNote';
            rootNoteLabel.textContent = 'Root Note';
            rootNoteLabel.className = 'deviceInportLabel';
            rootNoteLabel.style.display = 'inline-block';
            rootNoteLabel.style.width = '70px';
            
            // create input for the root note
            const rootNoteInput = document.createElement('input');
            rootNoteInput.type = 'text';
            rootNoteInput.value = rootNote;
            rootNoteInput.id = 'rootNote';
            rootNoteInput.className = 'rootNote';
            rootNoteInput.addEventListener('input', (event) => {
                rootNote = parseInt(event.target.value, 10);
                keys.forEach((key, index) => {
                    const keyDiv = keyboardDiv.children[index];
                    keyDiv.dataset.value = rootNote + index;
                });
            });
        
            rootNoteInput.addEventListener('change', (event) => {
                rootNote = parseInt(event.target.value, 10);
                keys.forEach((key, index) => {
                    const keyDiv = keyboardDiv.children[index];
                    keyDiv.dataset.value = rootNote + index;
                });
            });
        
            // append the root note label and input to the device div
            deviceDiv.appendChild(rootNoteLabel);
            deviceDiv.appendChild(rootNoteInput);
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
                        outlets: [{ comment: 'output' }],
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
            slider.id = 'slider';

            // find the existing form in the device
            const form = deviceDiv.querySelector('form');

            // create a div to hold the labels and inputs
            const div = document.createElement('div');
            div.className = 'labelAndInputContainer';
            div.style.left = '16px';
            div.style.top = '34px';

            div.appendChild(slider);

            // create min input and its label
            const minInput = document.createElement('input');
            minInput.type = 'text';
            minInput.value = slider.min;
            minInput.id = 'min';
            minInput.className = 'deviceInport sliderMin';
            minInput.style.float = 'none';

            const minInputLabel = document.createElement('label');
            minInputLabel.for = 'min';
            minInputLabel.textContent = 'min';
            minInputLabel.className = 'deviceInportLabel';
            minInputLabel.style.display = 'inline-block';
            minInputLabel.style.width = '22px';

            // create max input and its label
            const maxInput = document.createElement('input');
            maxInput.type = 'text';
            maxInput.value = slider.max;
            maxInput.id = 'max';
            maxInput.className = 'deviceInport sliderMax';
            maxInput.style.float = 'none';

            const maxInputLabel = document.createElement('label');
            maxInputLabel.for = 'max';
            maxInputLabel.textContent = 'max';
            maxInputLabel.className = 'deviceInportLabel';
            maxInputLabel.style.display = 'inline-block';
            maxInputLabel.style.width = '22px';

            // append labels and inputs to the div
            div.appendChild(minInputLabel);
            div.appendChild(minInput);
            div.appendChild(maxInputLabel);
            div.appendChild(maxInput);
            div.appendChild(document.createElement('br'));

            // append the div to the form
            form.appendChild(div);

            // add event listeners to the min and max inputs
            minInput.addEventListener('change', () => {
                slider.min = minInput.value;
            });

            maxInput.addEventListener('change', () => {
                slider.max = maxInput.value;
            });

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
        else if (filename === "touchpad") {
            const silenceGeneratorX = context.createConstantSource();
            const silenceGeneratorY = context.createConstantSource();
            silenceGeneratorX.offset.value = 0;
            silenceGeneratorY.offset.value = 0;
            silenceGeneratorX.start();
            silenceGeneratorY.start();
        
            // create a channel merger node with two inputs
            const mergerNode = context.createChannelMerger(2);
        
            // connect the silence generators to the merger node's inputs
            silenceGeneratorX.connect(mergerNode, 0, 0); // Connect to input 0
            silenceGeneratorY.connect(mergerNode, 0, 1); // Connect to input 1
        
            // create the device
            const device = {
                node: mergerNode,
                stream: mergerNode,
                source: mergerNode,
                it: {
                    T: {
                        outlets: [{ comment: 'output x' }, { comment: 'output y' }],
                        inlets: []
                    }
                }
            };
        
            deviceDiv = addDeviceToWorkspace(device, "touchpad", false);
        
            // create a touchpad
            const touchpad = document.createElement('div');
            touchpad.className = 'touchpad';
        
            // create an indicator
            const indicator = document.createElement('div');
            indicator.className = 'touchpadIndicator';
            touchpad.appendChild(indicator);
        
            // create hidden inputs to store x and y values in state
            const inputX = document.createElement('input');
            inputX.type = 'hidden';
            inputX.name = 'touchpadX';
            inputX.id = 'touchpadX';
            inputX.value = '0';
        
            const inputY = document.createElement('input');
            inputY.type = 'hidden';
            inputY.name = 'touchpadY';
            inputY.id = 'touchpadY';
            inputY.value = '0';
        
            // find the existing form in the device
            const form = deviceDiv.querySelector('form');
        
            // create a div to hold the touchpad
            const div = document.createElement('div');
            div.className = 'labelAndInputContainer';
            div.style.left = '16px';
            div.style.top = '34px';
        
            div.appendChild(touchpad);
        
            // append the div and hidden inputs to the form
            form.appendChild(div);
            div.appendChild(inputX);
            div.appendChild(inputY);
        
            let isDragging = false;
        
            // add event listeners to the touchpad
            touchpad.addEventListener('mousedown', (event) => {
                isDragging = true;
                event.stopPropagation();
                event.preventDefault();
            });
        
            touchpad.addEventListener('mousemove', (event) => {
                if (isDragging) {
                    const rect = touchpad.getBoundingClientRect();
                    if (event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom) {
                        const x = (event.clientX - rect.left) / rect.width;
                        const y = 1 - (event.clientY - rect.top) / rect.height;
                        silenceGeneratorX.offset.value = x;
                        silenceGeneratorY.offset.value = y;
                        indicator.style.left = `${event.clientX - rect.left}px`;
                        indicator.style.top = `${event.clientY - rect.top}px`;
                        inputX.value = x;
                        inputY.value = y;
                    }
                    event.stopPropagation();
                    event.preventDefault();
                }
            });
        
            document.addEventListener('mouseup', (event) => {
                isDragging = false;
            });
        
            touchpad.addEventListener('touchstart', (event) => {
                isDragging = true;
                event.stopPropagation();
                event.preventDefault();
            });
        
            touchpad.addEventListener('touchstart', (event) => {
                isDragging = true;
                const rect = touchpad.getBoundingClientRect();
                const touch = event.touches[0];
                if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                    const x = (touch.clientX - rect.left) / rect.width;
                    const y = 1 - (touch.clientY - rect.top) / rect.height;
                    silenceGeneratorX.offset.value = x;
                    silenceGeneratorY.offset.value = y;
                    indicator.style.left = `${touch.clientX - rect.left}px`;
                    indicator.style.top = `${touch.clientY - rect.top}px`;
                    inputX.value = x;
                    inputY.value = y;
                }
                event.stopPropagation();
                event.preventDefault();
            });
            
            touchpad.addEventListener('touchmove', (event) => {
                if (isDragging) {
                    const rect = touchpad.getBoundingClientRect();
                    const touch = event.touches[0];
                    if (touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
                        const x = (touch.clientX - rect.left) / rect.width;
                        const y = 1 - (touch.clientY - rect.top) / rect.height;
                        silenceGeneratorX.offset.value = x;
                        silenceGeneratorY.offset.value = y;
                        indicator.style.left = `${touch.clientX - rect.left}px`;
                        indicator.style.top = `${touch.clientY - rect.top}px`;
                        inputX.value = x;
                        inputY.value = y;
                    }
                    event.stopPropagation();
                    event.preventDefault();
                }
            });
        
            document.addEventListener('touchend', (event) => {
                isDragging = false;
            });
        
            document.addEventListener('touchcancel', (event) => {
                isDragging = false;
            });
        
            document.addEventListener('touchpadStateRecall', (event) => {
                const x = parseFloat(inputX.value);
                const y = parseFloat(inputY.value);
                const rect = touchpad.getBoundingClientRect();
                indicator.style.left = `${x * rect.width}px`;
                indicator.style.top = `${(1 - y) * rect.height}px`;
                silenceGeneratorX.offset.value = x;
                silenceGeneratorY.offset.value = y;
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
                        outlets: [{ comment: 'output' }],
                        inlets: []
                    }
                }
            };
        
            deviceDiv = addDeviceToWorkspace(device, "button", false);
        
            // create a button
            const button = document.createElement('button');
            button.textContent = '⬤';
            button.className = 'button-ui';
            button.style.color = 'black';
        
            // find the existing form in the device
            const form = deviceDiv.querySelector('form');
        
            // create a div to hold the labels and inputs
            const div = document.createElement('div');
            div.className = 'labelAndInputContainer';
            div.style.left = '9px';
            div.style.top = '0px';
        
            // append the button to the div
            div.appendChild(button);
        
            // append the div to the form
            form.appendChild(div);
        
            let isTouchEvent = false;
            function handleButtonDown(event) {
                if (event.type === 'touchstart') {
                    isTouchEvent = true;
                } else if (isTouchEvent) {
                    return;
                }
                silenceGenerator.offset.value = 1;
                button.style.color = 'white';
            }

            function handleButtonUp(event) {
                if (event.type === 'touchend') {
                    isTouchEvent = true;
                } else if (isTouchEvent) {
                    return;
                }
                silenceGenerator.offset.value = 0;
                button.style.color = 'black';
            }
        
            // add event listeners to the button
            button.addEventListener('mousedown', handleButtonDown);
            button.addEventListener('touchstart', handleButtonDown);
        
            button.addEventListener('mouseup', handleButtonUp);
            button.addEventListener('touchend', handleButtonUp);
        }
        else if ( filename.startsWith('output') ) {
            deviceDiv  = addDeviceToWorkspace(null, 'output', true);
        }
        else {
            if (filename == "*" ) {
                filename = "times";
            }
            else if (filename == "+" ) {
                filename = "add";
            }
            else if (filename == "-" ) {
                filename = "subtract";
            }
            else if (filename == "/" ) {
                filename = "divide";
            }
            else if (filename == "==" ) {
                filename = "equals";
            }
            else if (filename == ">" ) {
                filename = "greater";
            }
            else if (filename == "<" ) {
                filename = "less";
            }
            else if (filename == "&&" ) {
                filename = "and";
            }
            else if (filename == "||" ) {
                filename = "or";
            }
            else if (filename == "!" ) {
                filename = "not";
            }
            const response = await fetch(`wasm/${filename}.json`);
            const patcher = await response.json();
            const device = await RNBO.createDevice({ context, patcher });
            deviceDiv = addDeviceToWorkspace(device, filename, false);
            if ( filename == 'wave' ||  filename == 'play' || filename == 'buffer' || filename == 'granular' ) {
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
        deviceDiv.onmousedown = handleDeviceMouseDown;
        deviceDiv.ontouchstart = handleDeviceMouseDown;
        if ( devicePosition ) {
            deviceDiv.style.left = devicePosition.left + 'px';
            deviceDiv.style.top = devicePosition.top + 'px';
        }
        if (filename == 'pattern') {
            deviceDiv.style.width = '32em';
            deviceDiv.style.height = '120px';
        }
        if (filename == 'number') {
            deviceDiv.style.height = '80px';
        }
        if ( filename == 'play' ) {
            deviceDiv.style.height = '216px';
        }
        if ( filename == 'wave' ) {
            deviceDiv.style.width = '14em';
        }
        if ( filename == 'granular' ) {
            deviceDiv.style.height = '160px';
        }
        if (filename == 'comment') {
            deviceDiv.style.width = '10em';
            deviceDiv.style.height = '80px';
        }
        if (filename == 'buffer') {
            deviceDiv.style.width = '12em';
        }
        if (filename == 'declick') {
            deviceDiv.style.width = '9em';
        }
        if (filename == 'print') {
            deviceDiv.style.width = '8em';
        }
        if (filename == 'record') {
            deviceDiv.style.width = '104px';
            deviceDiv.style.minWidth = '104px';
        }
        if (filename == 'slider') {
            deviceDiv.style.width = '200px';
            deviceDiv.style.height = '110px';
        }
        if (filename == 'touchpad') {
            deviceDiv.style.width = '260px';
            deviceDiv.style.height = '250px';
        }
        if (filename == 'button' || filename == 'toggle') {
            deviceDiv.style.height = '138px';
        }
        if (filename == 'output' ) {
            deviceDiv.style.width = '140px';
        }
        if (filename == 'abs') {
            deviceDiv.style.width = '7em';
        }
        if (filename == 'and') {
            deviceDiv.style.width = '7em';
        }
        if (filename == 'hztosamps' || filename == 'mstosamps' || filename == 'sampstohz' || filename == 'sampstoms' || filename == 'sqrt') {
            deviceDiv.style.width = '9em';
        }
        if (filename == 'downsamp') {
            deviceDiv.style.width = '10em';
        }
        if (filename == 'keyboard') {
            deviceDiv.style.width = '450px';
            deviceDiv.style.height = '170px';
        }
        return deviceDiv;
    }
    catch (error) {
        showGrowlNotification(`Error creating device. Does "${filename.replace('.json','')}" match an available device?`);
    }
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
    button.className = 'audioFileLoaderButton';

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
    deviceDiv.innerHTML = isSpeakerChannelDevice ? `<b class="deviceLabel">output</b>` : `<b class="deviceLabel">${getDisplayNameByFileName(deviceType)}</b>`;
    
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
    deleteButton.className = 'delete-button';
    const deleteIcon = document.createElement('img');
    deleteIcon.src = 'img/delete.png';
    deleteIcon.alt = 'Delete';
    deleteButton.appendChild(deleteIcon);
    deleteButton.addEventListener('click', () => handleDeleteEvent(deviceDiv, isLocked)());
    deleteButton.addEventListener('touchstart', () => handleDeleteEvent(deviceDiv, isLocked)());

    const infoButton = document.createElement('button');

    if(isSpeakerChannelDevice){
        const button = document.createElement('button');
        button.innerText = 'input';
        button.className = 'input-button'
        const speakerChannelSelectorLabel = document.createElement('label');
        speakerChannelSelectorLabel.innerText = 'channel';
        speakerChannelSelectorLabel.htmlFor = 'output_channel';
        speakerChannelSelectorLabel.className = 'speakerChannelSelectorLabel';
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
            if ( !isLocked ) {
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
            }
        };
        button.id = `${deviceDiv.id}-inlet-${0}`;
        button.onclick = () => handleButtonClick(deviceDiv.id, Number(speakerChannelSelectorInput.value)-1, true);
        inputContainer.appendChild(button);
        deviceDiv.appendChild(deleteButton);
        infoButton.className = 'info-button';

        // Create an img element and set its src attribute
        const infoIcon = document.createElement('img');
        infoIcon.src = 'img/info.png';
        infoIcon.alt = 'additional info';
        infoButton.appendChild(infoIcon);
        infoButton.addEventListener('click', () => handleInfoButtonClick('output'));
        infoButton.addEventListener('touchstart', () => handleInfoButtonClick('output'));
        deviceDiv.appendChild(infoButton);
        deviceDiv.append(inputContainer);
        deviceDiv.appendChild(speakerChannelSelectorLabel);
        deviceDiv.appendChild(speakerChannelSelectorInput);
    } else {
        const inportForm = addInputsForDevice(device,deviceType,deviceDiv.id);
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
                if (input.comment == 'regen') {
                    let deviceForm = deviceDiv.querySelector('.labelAndInputContainer');
                    const regenButton = document.createElement('button');
                    const regenImage = document.createElement('img');
                    regenImage.src = 'img/regen.png';
                    regenImage.alt = 'Regen';
                    regenImage.className  = 'regenButtonImage';
                    regenButton.appendChild(regenImage);
                    regenButton.style.display = 'block';
                    regenButton.style.width = '40px';
                    regenButton.style.height = '30px'; 
                    regenButton.style.zIndex = '1000';
                    regenButton.className = 'inport-button';
                    if (deviceType == 'pattern') {
                        regenButton.style.top = '2px';
                        regenButton.style.left = '-9px';
                    }
                    deviceForm.appendChild(regenButton);
                    regenButton.addEventListener('click', () => {
                        const inputElements = deviceDiv.querySelectorAll('input, textarea');
                        inputElements.forEach((inputElement) => {
                            const event = new Event('regen');
                            inputElement.dispatchEvent(event);
                        });
                    });
                    regenButton.addEventListener('touchstart', () => {
                        const inputElements = deviceDiv.querySelectorAll('input, textarea');
                        inputElements.forEach((inputElement) => {
                            const event = new Event('change');
                            inputElement.dispatchEvent(event);
                        });
                    });
                }
                if ( deviceType == 'record' ) {
                    if (input.comment == 'start/stop') {
                        let deviceForm = deviceDiv.querySelector('.labelAndInputContainer');
                        const startStopCheckbox = document.createElement('input');
                        startStopCheckbox.type = 'checkbox';
                        startStopCheckbox.className = 'inport-checkbox';
                        deviceForm.appendChild(startStopCheckbox);
                        const offsetNode = context.createConstantSource();
                        offsetNode.start();
                        offsetNode.connect(device.node, 0, 3);
                        startStopCheckbox.addEventListener('change', () => {
                            if (startStopCheckbox.checked) {
                                offsetNode.offset.value = 1;
                            } else {
                                offsetNode.offset.value = 0;
                            }
                        });
                    }
                    if (input.comment == 'save') {
                        const saveButton = document.createElement('button');
                        const saveImage = document.createElement('img');
                        saveImage.src = 'img/regen.png';
                        saveImage.alt = 'Regen';
                        saveImage.className  = 'regenButtonImage';
                        saveButton.appendChild(saveImage);
                        saveButton.className = 'inport-button';
                        let deviceForm = deviceDiv.querySelector('.labelAndInputContainer');
                        deviceForm.appendChild(saveButton);
                        const offsetNode = context.createConstantSource();
                        offsetNode.offset.value = 0;
                        offsetNode.start();
                        offsetNode.connect(device.node, 0, 4);
                        saveButton.addEventListener('click', () => {
                            offsetNode.offset.value = 1;
                            setTimeout(() => {
                                offsetNode.offset.value = 0;
                            }, 100);
                        });
                    }
                }
                const inputButton = document.createElement('button');
                inputButton.innerText = `${input.comment}`;
                inputButton.id = `${deviceDiv.id}-inlet-${index}`;
                inputButton.className = 'input-button';
                inputButton.onclick = () => {
                    handleButtonClick(deviceDiv.id, index, true);
                };
                inputContainer.appendChild(inputButton);
                deviceWidth += input.comment.length;
            });
        }
        else {
            deviceWidth = 15;
        }

        deviceDiv.style.height = `${Math.max(device.it.T.inlets.length+1,device.it.T.outlets.length+1) * 28}px`;
        deviceDiv.appendChild(deleteButton);
        // Create an img element and set its src attribute
        const infoIcon = document.createElement('img');
        infoIcon.src = 'img/info.png';
        infoIcon.alt = 'additional info';
        infoButton.appendChild(infoIcon);
        
        infoButton.className = 'info-button';
        infoButton.addEventListener('click', () => handleInfoButtonClick(deviceType));
        infoButton.addEventListener('touchstart', () => handleInfoButtonClick(deviceType));
        deviceDiv.appendChild(infoButton);
        if (inportForm.elements.length > 0) {
            deviceDiv.style.minWidth = '142px';
        }
        attachOutports(device,deviceDiv);
    }

    deviceDiv.insertBefore(inputContainer, deviceDiv.firstChild);
    workspace.appendChild(deviceDiv);
    // Add a drag event listener to the deviceDiv
    jsPlumb.draggable(deviceDiv, {
        start: function(event) {
            if (isLocked) return false;
            isDraggingDevice = true;
            deviceDiv.classList.add('selectedNode');
        },
        stop: function(event) {
            if (isLocked) return false;
            isDraggingDevice = false;
        }
    });

    if (deviceType === 'pattern') {
        var textarea = deviceDiv.querySelector('textarea');
        if (textarea) {
            var editor = CodeMirror.fromTextArea(textarea, {
                lineNumbers: false,
                mode: "javascript",
                value: ``,
                theme: "mbo",
                lineWrapping: true,
                matchBrackets: true,
                lint: {options: {esversion: 2021, asi: true}}
            });
            adjustCodeMirrorHeight(editor);
            // update the hidden textarea's value
            editor.on('change', function(instance) {
                textarea.value = instance.getValue();
                adjustCodeMirrorHeight(editor);
            });
            
            editor.on('keydown', function(instance, event) {
                if (event.ctrlKey && (event.keyCode === 13 || event.keyCode === 82)) {
                    // evaluate facet pattern
                    let cursor = editor.getCursor();
                    let line = cursor.line;
                    let first_line_of_block = getFirstLineOfBlock(line,editor);
                    let last_line_of_block = getLastLineOfBlock(line,editor);
                    // highlight the text that will run for 100ms
                    editor.setSelection({line: first_line_of_block, ch: 0 }, {line: last_line_of_block, ch: 10000 });
                    // de-highlight, set back to initial cursor position
                    setTimeout(function(){ editor.setCursor({line: line, ch: cursor.ch }); }, 100);
                    executedTextPatterns[deviceDiv.id] = instance.getValue();
                    textarea.dispatchEvent(new Event('change'));
                }

                if ( event.ctrlKey && event.keyCode === 70 ) {
                    var cursor = editor.getCursor();
                    var currentLine = cursor.line;
                    let scroll_info = editor.getScrollInfo();
                    editor.setValue(js_beautify(editor.getValue(), {
                      indent_size: 2,
                      break_chained_methods: true
                    }))
                    editor.focus();
                    editor.setCursor({
                      line: currentLine-1
                    });
                    editor.scrollTo(scroll_info.left,scroll_info.top);
                  }
            });
        }
    }


    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.style.display = 'none';
    return deviceDiv;
}

function adjustCodeMirrorHeight(editor) {
    const lineHeight = 16;
    const lines = editor.lineCount();
    const newHeight = Math.max(lines * lineHeight, 3 * lineHeight);
    editor.getWrapperElement().style.height = `${newHeight}px`;

    // find the containining node
    let nodeElement = editor.getWrapperElement();
    while (nodeElement && !nodeElement.classList.contains('node')) {
        nodeElement = nodeElement.parentElement;
    }

    if (nodeElement) {
        nodeElement.style.height = 'auto';
        const nodeHeight = nodeElement.scrollHeight;
        nodeElement.style.height = `${nodeHeight+10}px`;
    }
}

function getFirstLineOfBlock(initial_line,cm) {
    // true if line above is empty or the line number gets to 0
    let above_line_is_empty = false;
    let current_line_number = initial_line;
    let first_line;
    while ( above_line_is_empty == false && current_line_number >= 0 ) {
      // check previous line for conditions that would indicate first line
      // of block; otherwise continue decrementing line number
      if ( (current_line_number ) == 0 ) {
        first_line = 0;
        break;
      }
      let line_above = cm.getLine(current_line_number - 1);
      if ( line_above.trim() == '' ) {
        above_line_is_empty = true;
        first_line = current_line_number;
      }
      current_line_number--;
    }
    return first_line;
  }
  
  function getLastLineOfBlock(initial_line,cm) {
    // true if line below is empty or the line number gets to cm.lineCount()
    let below_line_is_empty = false;
    let current_line_number = initial_line;
    let last_line;
    while ( below_line_is_empty == false ) {
      if ( (current_line_number + 1) == cm.lineCount() ) {
        last_line = current_line_number;
        break;
      }
      // check below line for conditions that would indicate last line
      // of block; otherwise continue incrementing line number
      let line_below = cm.getLine(current_line_number + 1);
      if ( line_below.trim() == '' ) {
        below_line_is_empty = true;
        last_line = current_line_number;
      }
      current_line_number++;
    }
    return last_line;
  }

function createDropdownofAllDevices () {
    const deviceDropdown = document.createElement('select');
    deviceDropdown.className = 'deviceDropdown';
    // load each WASM device into dropdown
    wasmDeviceURLs.sort().forEach((wasmDevice) => {
        const displayName = wasmDevice.displayName;
        const option = document.createElement('option');
        option.value = displayName;
        option.innerText = displayName;
        deviceDropdown.appendChild(option);
    });

    // add dropdown to navBar
    navBar.appendChild(deviceDropdown);
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

function handleDeviceMouseDown (event) {
    removeSelectedNodeClass(event);
    let nodeElement = event.target.closest('.node');
    if (nodeElement) {
        nodeElement.classList.add('selectedNode');
    }
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

    if (createShareLink == true) {
        let encodedState = LZString.compressToEncodedURIComponent(JSON.stringify(workspaceState));
        // format as a query string
        let queryString = `state=${encodedState}`;
        // get the current URL without query parameters
        let currentUrl = window.location.origin + window.location.pathname;
        // combine the current URL with the query string
        let fullUrl = `${currentUrl}?${queryString}`;
        copyToClipboard(fullUrl);
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


function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(function() {
            alert(`Wax state successfully copied to clipboard!

Note: audio files are not included in the URL and need to be shared separately. To share the entire patch including audio files, use the "Save" button to download a .zip file.`);
        }, function(err) {});
    } else {
        // fallback method for older browsers or unsupported mobile devices
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try {
            document.execCommand('copy');
            alert(`Wax state successfully copied to clipboard!

Note: audio files are not included in the URL and need to be shared separately. To share the entire patch including audio files, use the "Save" button to download a .zip file.`);
        } catch (err) {}
        document.body.removeChild(textarea);
    }
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

async function checkDeviceMotionPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const response = await DeviceMotionEvent.requestPermission();
            return response === 'granted';
        } catch (error) {
            showGrowlNotification(`Error requesting DeviceMotionEvent permission: ${error}`);
            return false;
        }
    } else {
        return true;
    }
}

async function reconstructWorkspaceState(deviceStates = null) {
    document.getElementById('infoDiv').style.display = 'none';
    // check if any device has a deviceName of 'motion'
    let hasMotionDevice = false;
    if (deviceStates) {
        for (let deviceState of deviceStates) {
            let deviceName = deviceState.id.split('-')[0];
            if (deviceName === 'motion') {
                hasMotionDevice = true;
                break;
            }
        }
    }

    if (hasMotionDevice || deviceStates == null) {
        const motionPermissionStatus = localStorage.getItem('motionPermissionStatus');
        if (motionPermissionStatus === 'granted') {
            // permission granted, proceed with reconstructing the workspace state
            await loadWorkspaceState(deviceStates);
            return;
        }
        if ( hasMotionDevice ) {
            // when a shared state has a motion device in it, we need to initiate the permission request via user input
            const permissionDiv = document.createElement('div');
            permissionDiv.className = 'permissionDiv';
            permissionDiv.innerHTML = '<b>Before loading this state</b>:';

            const permissionButton = document.createElement('button');
            permissionButton.className = 'permissionButton';
            permissionButton.innerText = 'Please tap this button to enable motion sensing. You will only have to do this once.';
            permissionButton.addEventListener('click', async () => {
                try {
                    if (typeof DeviceMotionEvent.requestPermission === 'function') {
                        const response = await DeviceMotionEvent.requestPermission();
                        if (response === 'granted') {
                            localStorage.setItem('motionPermissionStatus', 'granted');
                            // device motion event permission granted
                        } else {
                            showGrowlNotification('Permission for DeviceMotionEvent was not granted.');
                        }
                    }
                } catch (error) {
                    showGrowlNotification(`Error requesting DeviceMotionEvent permission: ${error}`);
                }

                // remove the div after handling interaction
                document.body.removeChild(permissionDiv);
                document.getElementsByClassName('permissionDiv')[0].remove();

                // proceed with reconstructing the workspace state
                await loadWorkspaceState(deviceStates);
                await startAudio();
            });

            // attach the permission request button to the div
            permissionDiv.appendChild(permissionButton);

            // attach the div to the body
            document.body.appendChild(permissionDiv);
        }
        else {
            // proceed with reconstructing the workspace state directly
            await loadWorkspaceState(deviceStates);
            await startAudio();
        }
    } else {
        // proceed with reconstructing the workspace state directly
        await loadWorkspaceState(deviceStates);
        await startAudio();
    }
}

async function loadWorkspaceState(deviceStates) {
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

document.addEventListener('DOMContentLoaded', async () => {
    const isMobileOrTablet = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    if (window.DeviceOrientationEvent && isMobileOrTablet) {
        const motionPermissionStatus = localStorage.getItem('motionPermissionStatus');
        if (motionPermissionStatus !== 'granted') {
            showPermissionButton();
        }
    }
});

function showPermissionButton() {
    const permissionDiv = document.createElement('div');
    permissionDiv.className = 'permissionDiv';
    permissionDiv.innerHTML = '<b>Have fun!</b> One last thing:';

    const permissionButton = document.createElement('button');
    permissionButton.className = 'permissionButton';
    permissionButton.innerText = 'Please tap this button to enable motion sensing. You will only have to do this once.';
    permissionButton.addEventListener('click', async () => {
        document.body.removeChild(permissionDiv);
        try {
            // request DeviceMotionEvent permission
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const motionResponse = await DeviceMotionEvent.requestPermission();
                if (motionResponse === 'granted') {
                    localStorage.setItem('motionPermissionStatus', 'granted');
                    // device motion event permission granted
                } else {
                    showGrowlNotification('Permission for DeviceMotionEvent was not granted.');
                }
            }
            await startAudio();
        } catch (error) {
            showGrowlNotification(`Error requesting permissions: ${error}`);
        }
    });

    // attach the permission request button to the div
    permissionDiv.appendChild(permissionButton);

    // attach the div to the body
    document.body.appendChild(permissionDiv);
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

function loadAllTextareaPatterns() {
    let textareas = document.querySelectorAll('textarea');
    textareas.forEach((textarea, index) => {
        setTimeout(() => {
            textarea.dispatchEvent(new Event('change'));
        }, index * 1000); // each pattern is spaced 1000ms apart when added to prevent overload when added all at once
    });
}

async function reconstructDevicesAndConnections(deviceStates, zip, reconstructFromDuplicateCommand = false, newIds = false) {    
    let connectionsToMake = [];
    let idMap = {};

    for (let deviceState of deviceStates) {
        // generate a unique ID for the new device
        let originalId = deviceState.id;
        deviceState.id = newIds ? `${deviceState.id}${Date.now()}` : deviceState.id;
        let deviceName = deviceState.id.split('-')[0];            
        let deviceElement;
        let devicePosition = {};
        let l = parseInt(deviceState.left.split('px')[0]);
        let t = parseInt(deviceState.top.split('px')[0]);
        
        // offset the position to avoid overlap
        devicePosition = {left: l + 20, top: t + 20};

        // load any stored audio files
        if (deviceState.audioFileName && zip) {
            let wavFileData = await zip.file(deviceState.audioFileName).async('arraybuffer');
            let audioBuffer = await context.decodeAudioData(wavFileData);
            audioBuffers[deviceState.audioFileName] = audioBuffer;
            deviceElement = await createDeviceByName(deviceName, {name: deviceState.audioFileName, buffer: audioBuffer}, devicePosition);
        } else if (deviceState.audioFileName && !zip) {
            if (audioBuffers[deviceState.audioFileName]) {
                let audioBuffer = audioBuffers[deviceState.audioFileName];
                deviceElement = await createDeviceByName(deviceName, {name: deviceState.audioFileName, buffer: audioBuffer}, devicePosition);
            } else {
                deviceElement = await createDeviceByName(deviceName, null, devicePosition);
                showGrowlNotification(`Make sure to load the missing audio file: "${deviceState.audioFileName}", since audio files are not stored with shared state URLs`);
            }
        } else {
            if (deviceName == 'microphone input') {
                deviceElement = await createDeviceByName('mic', null, devicePosition);
            } else {
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
            if (deviceElement.id.includes('toggle') && deviceState.inputs[input.id] == 1) {
                const button = deviceElement.querySelector('button.toggle-button');
                if (button) {
                    button.click();
                }
            }
        }
        if ( deviceName === 'touchpad' ) {
            const event = new Event('touchpadStateRecall');
            document.dispatchEvent(event);
        }

        // if the device is a slider, re-trigger a change on the range slider element after the state has been recalled,
        // because the min and max need to be set before the correct range is recalled
        if (deviceName === 'slider') {
            inputs[0].value = deviceState.inputs['slider'];
            inputs[0].dispatchEvent(new Event('change'));
        }

        if (deviceName === 'keyboard') {
            console.log(`dispatching second keyboard event for ${inputs[0].value}`);
            inputs[0].dispatchEvent(new Event('change'));
        }

        // set the values of its textarea elements
        let textareas = deviceElement.getElementsByTagName('textarea');
        for (let textarea of textareas) {
            if (deviceState.inputs[textarea.id]) {
                textarea.value = deviceState.inputs[textarea.id];
                // find the associated CodeMirror instance and set its value
                let codeMirrorElement = textarea.nextElementSibling;
                if (codeMirrorElement && codeMirrorElement.classList.contains('CodeMirror')) {
                    let codeMirrorInstance = codeMirrorElement.CodeMirror;
                    if (codeMirrorInstance) {
                        codeMirrorInstance.setValue(textarea.value);
                        executedTextPatterns[deviceElement.id] = textarea.value;
                    }
                }
            }
        }

        // map the old id to the new id
        idMap[originalId] = deviceElement.id;

        // if deviceState has connection data, store it for later
        if (deviceState.connections) {
            for (let connection of deviceState.connections) {
                connectionsToMake.push({
                    source: originalId,
                    target: connection.target,
                    output: connection.output,
                    input: connection.input
                });
            }
        }
    }

    // make the connections
    for (let connection of connectionsToMake) {
        // check if the target node exists
        if (idMap[connection.target]) {
            startConnection(idMap[connection.source], connection.output);
            finishConnection(idMap[connection.target], connection.input);
        }
    }

    // repaint everything after all devices have been added
    jsPlumb.repaintEverything();    
    loadAllTextareaPatterns();
    resizeAllTextareas();
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
            await createDeviceByName(getFileNameByDisplayName(options[i].text.toLowerCase()));
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

    // create a header for the list - visible on mobile
    var header = document.createElement('div');
    header.id = 'deviceListHeader';
    header.textContent = ' Devices';
    var triangle = document.createElement('span');
    triangle.className = 'mobileButtonTriangle';
    triangle.textContent = '◂';
    header.prepend(triangle);
    // add onclick event listener to the header
    header.onclick = function() {
        document.getElementById('deviceListModal').style.display = 'none';
        setTimeout(()=>{showMobileMenu()},5);
    };

    content.insertBefore(header, ul);

    // prevent scrolling in the background when scrolling inside the modal
    modal.addEventListener('wheel', function(event) {
        event.stopPropagation();
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
    button.textContent = 'OFF';
    button.style.border = '3px solid rgb(255,0,94)';
    button.style.background = 'rgb(255,0,94)';
    button.style.color = 'rgb(255,255,255)';
    isAudioPlaying = false;
}

async function startAudio() {
    const button = document.querySelector('.startAudioButton');
    await context.resume();
    button.textContent = 'ON';
    button.style.border = '3px solid rgb(101,255,229)';
    button.style.background = 'rgb(101,255,229)';
    button.style.color = 'rgb(8,56,78)';
    isAudioPlaying = true;
}

async function checkForQueryStringParams() {
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
        await reconstructWorkspaceState(workspaceState);
        await startAudio();
    }
}

function showVisualConfirmationOfConnectionButtonClick(event) {
    const clickedElement = event.target;
    const originalBackground = clickedElement.style.background;
    const originalColor = clickedElement.style.color;
    if (clickedElement.classList.contains('regenButtonImage')) {
        clickedElement.src = 'img/regen-onclick.png';
        setTimeout(() => {
            clickedElement.src = 'img/regen.png';
        }, 100);
    } else {
        // change the background and text color
        clickedElement.style.background = 'rgb(8,56,78)';
        clickedElement.style.color = 'white';
        setTimeout(() => {
            clickedElement.style.background = originalBackground;
            clickedElement.style.color = originalColor;
        }, 100);
    }
}

async function getDefaultValues() {
    try {
        const response = await fetch('js/defaultValues.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
}

function resetConnectionStyle(connection) {
    try {
        connection.setPaintStyle({ stroke: "white", strokeWidth: 4, fill: "transparent" });
        connection.endpoints.forEach(endpoint => {
            endpoint.setPaintStyle({ fill: "transparent", outlineStroke: "transparent", outlineWidth: 12 });
        });
    }
    catch (error) {}
}

function resizeTextarea(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
    // find the parent node and update its size too
    let parentNode = textarea.closest('.node');
    if (parentNode) {
        parentNode.style.height = 'auto';
        parentNode.style.height = parentNode.scrollHeight + 10 + 'px';
    }
}

function resizeAllTextareas() {
    const textareas = document.querySelectorAll('textarea:not([hidden])');
    textareas.forEach(textarea => {
        resizeTextarea(textarea);
    });
}


async function copySelectedNodesToClipboard() {
    // get all the ids of elements with class "selectedNode"
    let deviceIds = Array.from(document.getElementsByClassName('selectedNode')).map(node => node.id);
    // Get the state for the selected devices
    const state = await getStateForDeviceIds(deviceIds);
    
    // Copy the state to the clipboard
    navigator.clipboard.writeText(JSON.stringify(state)).then(() => {
    }).catch(err => {});
}

async function pasteNodesFromClipboard() {
    deselectAllNodes();
    try {
        // read the clipboard content
        const clipboardText = await navigator.clipboard.readText();
        const state = JSON.parse(clipboardText);
        reconstructDevicesAndConnections(state, null, true, true);
    } catch (err) {
        console.error('Failed to read from clipboard', err);
    }
}

function getFileNameByDisplayName(displayName) {
    const device = wasmDeviceURLs.find(device => device.displayName === displayName);
    if (device) {
        return device.fileName;
    } else {
        console.error('Device not found for display name:', displayName);
        return null;
    }
}

function getDisplayNameByFileName(fileName) {
    const device = wasmDeviceURLs.find(device => device.fileName === fileName);
    if (device) {
        return device.displayName;
    } else {
        console.error('Device not found for file name:', fileName);
        return null;
    }
}

function handleDeleteEvent(deviceDiv, isLocked) {
    return function() {
        if ( !isLocked ) {
            let sourceConnections = jsPlumb.getConnections({source: deviceDiv.id});
            let targetConnections = jsPlumb.getConnections({target: deviceDiv.id});
            sourceConnections.forEach(connection => jsPlumb.deleteConnection(connection));
            targetConnections.forEach(connection => jsPlumb.deleteConnection(connection));
            removeDeviceFromWorkspace(deviceDiv.id);
            deviceDiv.remove();
        }
    };
}

function handleInfoButtonClick(deviceType) {
    if (isLocked) return;
    const deviceTypesWithSpecialCharacterNames = ['add', 'and', 'divide', 'add', 'greater', 'less', 'modulo', 'not', 'or', 'subtract'];
    if (deviceTypesWithSpecialCharacterNames.includes(deviceType)) {
        window.open(`https://github.com/nnirror/wax/blob/main/README.md#${deviceType}`, '_blank');
    }
    else if (deviceType == 'times') {
        window.open(`https://github.com/nnirror/wax/blob/main/README.md#multiply`, '_blank');
    }
    else {
        window.open(`https://github.com/nnirror/wax/blob/main/README.md#${getDisplayNameByFileName(deviceType)}`, '_blank');
    }
}

function toggleDragging() {
    isLocked = !isLocked;
    const status = isLocked ? 'frozen' : 'unfrozen';
}
/* END functions */