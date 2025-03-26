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
const isMobileOrTablet = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
if (window.DeviceOrientationEvent && isMobileOrTablet) {
    addMotionDeviceToDropdown(deviceDropdown);
}

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
    updateLockButton();
}

function setLockState(desiredState) {
    isLocked = desiredState;
    toggleDragging();
    updateLockButton();
}

function updateLockButton() {
    if (isLocked) {
        document.getElementsByClassName('lockButton')[0].textContent = 'Unlock';
        document.getElementsByClassName('mobileMenuLockButton')[0].textContent = 'Unlock';
    } else {
        document.getElementsByClassName('lockButton')[0].textContent = 'Lock';
        document.getElementsByClassName('mobileMenuLockButton')[0].textContent = 'Lock';
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
    try {
        document.getElementById('infoDiv').style.display = 'block';
    } catch (error) {
        console.error('Failed to display info div:', error);
    }
    event.stopPropagation();
}

function handleMenuButtonClick(event) {
    try {
        document.getElementById('infoDiv').style.display = 'none';
    } catch (error) {}
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
createButtonForNavBar('Lock', 'mobileMenuLockButton navbarButton', handleLockButtonClick);


// prevent accidental refreshes which would lose unsaved changes
window.onbeforeunload = function() {
    return "Are you sure you want to leave? Unsaved changes will be lost.";
};

// add the initial speaker objects and getting started text
window.onload = async function() {
    await loadAllJsonFiles();
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

    infoDiv.innerHTML = "<b>Wax</b> is a browser-based audio synthesis environment inspired by Max and other data-flow programming systems. Double-click or press 'n' to add devices to the workspace. Connect to an 'output' device to play sound. For more information, see the full ";
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

    // set the value in localStorage to indicate that the user has seen the info div
    localStorage.setItem('infoDivSeen', 'true');

    // add event listener to document to hide infoDiv when clicked
    document.onclick = function() {
        infoDiv.style.display = 'none';
    };

    // add the close button to the info div and the info div to body
    infoDiv.appendChild(closeButton);
    document.body.appendChild(infoDiv);

    // check if the user has already seen the info div
    if (localStorage.getItem('infoDivSeen')) {
        infoDiv.style.display = 'none';
    }

    await checkForQueryStringParams();
    await startAudio();
};

document.addEventListener('input', function(event) {
    if (event.target.tagName.toLowerCase() === 'textarea') {
        resizeTextarea(event.target);
    }
});

// event listener for window resize when element exceeds edge
document.addEventListener('DOMContentLoaded', async function() {
    const workspace = document.getElementById('workspace');
    const edgeThreshold = 50; // distance from edge to trigger expansion
    const expansionRate = 10; // pixels to expand per interval
    const scrollRate = 10; // pixels to scroll per interval

    function getEventCoordinates(event) {
        if (event.touches && event.touches.length > 0) {
            return { x: event.touches[0].clientX, y: event.touches[0].clientY };
        } else {
            return { x: event.clientX, y: event.clientY };
        }
    }

    let expandInterval = null;
    let scrollInterval = null;
    
    function checkEdgeAndExpand(event) {
        if (!isDraggingDevice) {
            return;
        }
        const rect = workspace.getBoundingClientRect();
        const { x: mouseX, y: mouseY } = getEventCoordinates(event);
    
        let expandX = false;
        let expandY = false;
        let scrollX = false;
        let scrollY = false;
    
        const edgeThreshold = 50;
    
        // check if the device is near the edge of the visible window
        if (mouseX >= window.innerWidth - edgeThreshold) {
            scrollX = true;
        } else if (mouseX <= edgeThreshold) {
            scrollX = true;
        }
    
        if (mouseY >= window.innerHeight - edgeThreshold) {
            scrollY = true;
        } else if (mouseY <= edgeThreshold) {
            scrollY = true;
        }
    
        // check if the device is near the edge of the workspace
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
                    }
                    if (expandY) {
                        workspace.style.height = workspace.offsetHeight + expansionRate + 'px';
                    }
                }, 10);
            }
        } else {
            clearInterval(expandInterval);
            expandInterval = null;
        }
    
        // scroll the window if the device is near the edge of the visible window
        if (scrollX || scrollY) {
            if (!scrollInterval) {
                scrollInterval = setInterval(() => {
                    if (scrollX) {
                        if (mouseX >= window.innerWidth - edgeThreshold) {
                            window.scrollBy(scrollRate, 0);
                        } else if (mouseX <= edgeThreshold) {
                            window.scrollBy(-scrollRate, 0);
                        }
                    }
                    if (scrollY) {
                        if (mouseY >= window.innerHeight - edgeThreshold) {
                            window.scrollBy(0, scrollRate);
                        } else if (mouseY <= edgeThreshold) {
                            window.scrollBy(0, -scrollRate);
                        }
                    }
                }, 20);
            }
        } else {
            clearInterval(scrollInterval);
            scrollInterval = null;
        }
    }
    
    function stopExpand() {
        clearInterval(expandInterval);
        expandInterval = null;
        clearInterval(scrollInterval);
        scrollInterval = null;
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
let jsonFiles = {};
let mousePosition = { x: 0, y: 0 };
let sourceDeviceId = null;
let sourceButtonId = null;
let sourceOutputIndex = null;
let selectedDevice = null;
let workspaceElement = document.getElementById('workspace');
let zIndexCounter = 1;
let selectedConnections = [];
let inportsWithConnectedSignals = {};
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
            // Send update to WebSocket server if this is a local action
            if (!isLocalAction) {
                sendUpdate({
                    type: 'deleteConnection',
                    sourceDeviceId: info.sourceId,
                    targetDeviceId: info.targetId,
                    sourceOutputIndex: connection.output,
                    inputIndex: connection.input,
                    clientId: clientId
                });
            }
        }
    }
});


// event listener to detect when a connection is clicked
jsPlumb.bind("click", function(connection, originalEvent) {
    // reset styles for all connections
    jsPlumb.getAllConnections().forEach(conn => {
        resetConnectionStyle(conn);
    });

    // deselect all nodes
    deselectAllNodes();

    selectedConnections = [connection];

    // update the style for the clicked connection
    connection.setPaintStyle({ stroke: 'rgb(255,0,94)', strokeWidth: 12 });

    const connectorElement = connection.connector.canvas;
    if (connectorElement) {
        zIndexCounter += 1;
        connectorElement.style.zIndex = zIndexCounter;
    }

    connection.endpoints.forEach(endpoint => {
        endpoint.setPaintStyle({ fill: "rgba(127,127,127,0.5)", outlineStroke: "black", outlineWidth: 2, cssClass: "endpointClass" });
    });
});

connectionManagementClickHandler();

document.body.addEventListener('click', function(event) {
    if (event.target.matches('.output-button, .input-button, .output-button *, .input-button *, .inport-button, .regenButtonImage')) {
        showVisualConfirmationOfConnectionButtonClick(event);
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
    if (!event.target.closest('.jtk-connector')) {
        selectedConnections.forEach(connection => {
            resetConnectionStyle(connection);
        });
        selectedConnections = [];
    }
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

function isConnectionInSelection(connection, selRect) {
    const sourceEndpoint = connection.endpoints[0].canvas.getBoundingClientRect();
    const targetEndpoint = connection.endpoints[1].canvas.getBoundingClientRect();

    const numSamples = 250;
    for (let i = 0; i <= numSamples; i++) {
        const t = i / numSamples;
        const x = sourceEndpoint.left + t * (targetEndpoint.left - sourceEndpoint.left);
        const y = sourceEndpoint.top + t * (targetEndpoint.top - sourceEndpoint.top);

        if (
            x >= selRect.left &&
            x <= selRect.right &&
            y >= selRect.top &&
            y <= selRect.bottom
        ) {
            return true;
        }
    }

    return false;
}

// listen for mouseup events on the workspaceElement
workspaceElement.addEventListener('mouseup', (event) => {
    if (startPoint) {
        // clear the previous selection
        selectedConnections = [];
        jsPlumb.clearDragSelection();

        // check which elements are within the selection div
        let nodes = document.querySelectorAll('.node');
        nodes.forEach((node) => {
            let rect = node.getBoundingClientRect();
            if (selectionDiv) {
                let selRect = selectionDiv.getBoundingClientRect();
                if (rect.right > selRect.left && rect.left < selRect.right &&
                    rect.bottom > selRect.top && rect.top < selRect.bottom) {
                    jsPlumb.addToDragSelection(node);
                    // add a special CSS class to the selected node
                    node.classList.add('selectedNode');
                } else {
                    if (event.target.id == 'workspace') {
                        // remove the special class from the node if it's not selected
                        node.classList.remove('selectedNode'); 
                    }
                }
            }
        });

        // check which connections are within the selection div
        jsPlumb.getAllConnections().forEach((connection) => {
            let selRect = selectionDiv.getBoundingClientRect();
            if (isConnectionInSelection(connection, selRect)) {
                // add the connection to the selectedConnections array
                selectedConnections.push(connection);
                // add a special CSS class to the selected connection
                connection.canvas.classList.add('selectedConnection');
                connection.setPaintStyle({ stroke: 'rgb(255,0,94)', strokeWidth: 12 });
                const connectorElement = connection.connector.canvas;
                if (connectorElement) {
                    zIndexCounter += 1;
                    connectorElement.style.zIndex = zIndexCounter;
                }
            } else {
                if (event.target.id == 'workspace') {
                    // remove the special class from the connection if it's not selected
                    connection.canvas.classList.remove('selectedConnection');
                }
            }
        });

        // remove the selection div and reset the start point
        workspaceElement.removeChild(selectionDiv);
        setTimeout(() => {
            selectionDiv = null;
        }, 100);
        startPoint = null;
    }
});

document.addEventListener('mouseup', (event) => {
    // check if the event target is a child or instance of device .node
    let target = event.target;
    let isNode = false;

    while (target) {
        if (target.classList && target.classList.contains('node')) {
            isNode = true;
            break;
        }
        target = target.parentElement;
    }

    // check if there are any elements with the class 'selectedNode'
    const selectedNodes = document.getElementsByClassName('selectedNode');

    // clear the drag selection if the target is not a .node and there are no selected nodes
    if (!isNode && selectedNodes.length == 0) {
        jsPlumb.clearDragSelection();
    }
    else {
        if ( selectedNodes.length == 1 ) {
            jsPlumb.clearDragSelection();
        }
    }
    if (isNode && !isDraggingDevice && selectionDiv === null) {
        let nodeElement = event.target.closest('.node');
        let nodes = document.querySelectorAll('.node');
        nodes.forEach((node) => {
            if (node === nodeElement) return;
            if (node.classList.contains('selectedNode')) {
                node.classList.remove('selectedNode');
            }
        });
        jsPlumb.clearDragSelection();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const workspace = document.getElementById('workspace');
    let lastTap = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let touchTimeout;

    function handleDoubleClick(event) {
        if (isMobileOrTablet) {
            return;
        }
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
        if (isMobileOrTablet) {
            return;
        }
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            handleDoubleClick(event);
        }
        lastTap = currentTime;
    }

    function handleTouchStart(event) {
        let target = event.target;

        // traverse up the DOM tree to find the element with the 'jtk-connector' class
        while (target && !target.classList.contains('jtk-connector')) {
            target = target.parentElement;
        }

        if (target && target.classList.contains('jtk-connector')) {
            touchStartX = event.changedTouches[0].screenX;
            touchStartY = event.changedTouches[0].screenY;
            target.dataset.swipeTarget = true; // mark the target for swipe detection

            // prevent scrolling
            event.preventDefault();

            // find the connection associated with the target
            const connection = jsPlumb.getConnections().find(conn => conn.connector.canvas === target);
            if (connection) {
                // reset styles for all connections
                jsPlumb.getAllConnections().forEach(conn => {
                    resetConnectionStyle(conn);
                });

                // deselect all nodes
                deselectAllNodes();

                selectedConnections = [connection];

                // update the style for the touched connection
                connection.setPaintStyle({ stroke: 'rgb(255,0,94)', strokeWidth: 12 });
                const connectorElement = connection.connector.canvas;
                if (connectorElement) {
                    zIndexCounter += 1;
                    connectorElement.style.zIndex = zIndexCounter;
                }
                connection.endpoints.forEach(endpoint => {
                    endpoint.setPaintStyle({ fill: "rgba(127,127,127,0.5)", outlineStroke: "black", outlineWidth: 2, cssClass: "endpointClass" });
                });
            }
        }
    }

    function handleTouchMove(event) {
        let target = event.target;

        // traverse up the DOM tree to find the element with the 'jtk-connector' class
        while (target && !target.classList.contains('jtk-connector')) {
            target = target.parentElement;
        }

        if (target && target.classList.contains('jtk-connector') && target.dataset.swipeTarget) {
            // Prevent scrolling
            event.preventDefault();
        }
    }

    function handleTouchEnd(event) {
        let target = event.target;

        // traverse up the DOM tree to find the element with the 'jtk-connector' class
        while (target && !target.classList.contains('jtk-connector')) {
            target = target.parentElement;
        }

        if (target && target.classList.contains('jtk-connector') && target.dataset.swipeTarget) {
            touchEndX = event.changedTouches[0].screenX;
            touchEndY = event.changedTouches[0].screenY;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;

            // check for a vertical swipe
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
                const connection = jsPlumb.getConnections().find(conn => conn.connector.canvas === target);
                if (connection && !isLocked) {
                    jsPlumb.deleteConnection(connection);
                }
            }

            delete target.dataset.swipeTarget; // clean up the marker
        }
    }

    workspace.addEventListener('dblclick', handleDoubleClick);
    workspace.addEventListener('touchend', handleDoubleTap);
    workspace.addEventListener('touchstart', handleTouchStart);
    workspace.addEventListener('touchmove', handleTouchMove);
    workspace.addEventListener('touchend', handleTouchEnd);
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

        if (selectedConnections.length > 0) {
            if (!isLocked) {
                selectedConnections.forEach(connection => {
                    try {
                        jsPlumb.deleteConnection(connection);
                    } catch (error) {
                        // do nothing - connection already deleted
                    }
                });
                selectedConnections = [];
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

function addMotionDeviceToDropdown(deviceDropdown) {
    // check if the motion option already exists
    const existingMotionOption = Array.from(deviceDropdown.options).find(option => option.value === "motion");
    if (existingMotionOption) {
        return;
    }

    const motionInputOption = document.createElement('option');
    motionInputOption.value = "motion";
    motionInputOption.innerText = "motion";
    deviceDropdown.appendChild(motionInputOption);
}

function openAwesompleteUI(event) {
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
        // remove all elements with class name "awesompleteContainer"
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

    // check if the autocomplete UI is partially off the workspace
    const workspaceRect = document.getElementById('workspace').getBoundingClientRect();
    const divRect = div.getBoundingClientRect();

    if (divRect.right > workspaceRect.right) {
        // expand the workspace
        document.getElementById('workspace').style.width = (workspaceRect.width + (divRect.right - workspaceRect.right)) + 'px';
        // scroll rightwards
        window.scrollBy(divRect.right - workspaceRect.right, 0);
    }
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
    const device = createMockRNBODevice(context, source, source, [{ comment: 'output 1' },{ comment: 'output 2' }], [], 2, []);
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
                betaNode.offset.value = Math.sin(event.beta * (Math.PI / 180)); // pitch
                gammaNode.offset.value = Math.sin(event.gamma * (Math.PI / 90)); // roll
            });

            // create a ChannelMergerNode to combine the outputs of the two nodes
            const merger = context.createChannelMerger(3);
            betaNode.connect(merger, 0, 0);
            gammaNode.connect(merger, 0, 1);

            // create a wrapper object for the device
            const device = createMockRNBODevice(context, merger, merger, [{ comment: 'pitch' },{ comment: 'roll' }], [], 2);
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
        else if (outports[0].tag == 'drift') {
            if (deviceDiv.applyDrift) {
                deviceDiv.applyDrift();
            }
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
        else if (outports[0].tag == 'value to print') {
            let hr = deviceDiv.querySelector('.device-hr');
            let valueDiv = deviceDiv.querySelector('.printvalue');
            let canvas = deviceDiv.querySelector('.waterfallCanvas');
            let canvasCtx;
            let scopeMin = deviceDiv.querySelector('.scopeMin');
            let scopeMax = deviceDiv.querySelector('.scopeMax');

            if (!valueDiv) {
                valueDiv = document.createElement('div');
                valueDiv.className = 'printvalue';
                deviceDiv.insertBefore(valueDiv, hr);
            }

            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 150;
                canvas.className = 'waterfallCanvas';
                deviceDiv.insertBefore(canvas, hr);
            }

            canvasCtx = canvas.getContext('2d', { willReadFrequently: true });

            if (!scopeMin) {
                const scopeMinInput = createLabeledInput('scope min', 'scopeMin', 'scopeMin', -1, {
                    input: { width: '50px', marginLeft: '-20px', marginRight: '20px' }
                });
                scopeMin = scopeMinInput.input;
                deviceDiv.insertBefore(scopeMinInput.label, hr);
                deviceDiv.insertBefore(scopeMinInput.input, hr);

                // Add event listener to send updates to WebSocket server
                scopeMin.addEventListener('change', () => {
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: scopeMin.id,
                        value: scopeMin.value,
                        clientId: clientId
                    });
                });
            }

            if (!scopeMax) {
                const scopeMaxInput = createLabeledInput('scope max', 'scopeMax', 'scopeMax', 1, {
                    input: { width: '50px', marginLeft: '-20px', marginRight: '20px' }
                });
                scopeMax = scopeMaxInput.input;
                deviceDiv.insertBefore(scopeMaxInput.label, hr);
                deviceDiv.insertBefore(scopeMaxInput.input, hr);

                // Add event listener to send updates to WebSocket server
                scopeMax.addEventListener('change', () => {
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: scopeMax.id,
                        value: scopeMax.value,
                        clientId: clientId
                    });
                });
            }

            // update the print span's value
            if (typeof ev.payload === 'number' && ev.payload % 1 !== 0) {
                valueDiv.textContent = ev.payload.toFixed(2);
            } else {
                valueDiv.textContent = ev.payload;
            }

            // draw the waterfall display
            function drawWaterfall() {
                const scopeMinValue = parseFloat(scopeMin.value);
                const scopeMaxValue = parseFloat(scopeMax.value);
                const scopeRange = scopeMaxValue - scopeMinValue;

                // shift the existing image to the left
                const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
                canvasCtx.putImageData(imageData, -1, 0);

                // clear the rightmost column
                canvasCtx.fillStyle = 'rgb(203, 203, 203)';
                canvasCtx.fillRect(canvas.width - 1, 0, 1, canvas.height);

                // draw the new value as a line segment
                const normalizedValue = (ev.payload - scopeMinValue) / scopeRange;
                const y = canvas.height - (normalizedValue * canvas.height); // flip the y coordinate

                canvasCtx.strokeStyle = 'black';
                canvasCtx.beginPath();
                canvasCtx.moveTo(canvas.width - 1, y);
                canvasCtx.lineTo(canvas.width - 1, canvas.height);
                canvasCtx.stroke();
            }

            drawWaterfall();
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

    // Send update to WebSocket server if this is a local action
    if (!isLocalAction) {
        sendUpdate({
            type: 'deleteDevice',
            deviceId: deviceId,
            clientId: clientId
        });
    }
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
    else if (['cycle', 'rect', 'tri', 'saw', 'phasor', 'number', 'clock','granular','step_trig'].includes(deviceType) == false) {
        // devices with inports that start 1 button down
        inportContainer.style.paddingTop = '25px';
    }
    else if (['step_trig'].includes(deviceType) == true) {
        // devices with inports that start 1 button down
        inportContainer.style.padding = '0px';
        inportContainer.style.marginBottom = '0px';
        inportContainer.style.top = '25px';
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
            if (device.it.T.inports[0].tag == 'triggers' ) {
                inportText.style.width = '12em';
            }
            inportText.id = inport.tag;
            inportText.className = 'deviceInport'
            inportText.addEventListener('change', function(event) {
                if (document.activeElement !== event.target) {
                    if (!inportsWithConnectedSignals[deviceId] || !inportsWithConnectedSignals[deviceId][inport.tag]) {
                        scheduleDeviceEvent(device, inport, this.value, deviceId, false);
                        // Send update to WebSocket server if this is a local action
                        if (!isLocalAction) {
                            sendUpdate({
                                type: 'updateInput',
                                deviceId: deviceId,
                                inportTag: inport.tag,
                                value: this.value,
                                clientId: clientId
                            });
                        }
                    }
                }
            });
            
            inportText.addEventListener('regen', function(event) {
                if (document.activeElement !== event.target) {
                    if (!inportsWithConnectedSignals[deviceId] || !inportsWithConnectedSignals[deviceId][inport.tag]) {
                        scheduleDeviceEvent(device, inport, this.value, deviceId, true);

                        // Send update to WebSocket server if this is a local action
                        if (!isLocalAction) {
                            sendUpdate({
                                type: 'updateInput',
                                deviceId: deviceId,
                                inportTag: inport.tag,
                                value: this.value,
                                clientId: clientId
                            });
                        }
                    }
                }
            });
            
            inportText.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    if (!inportsWithConnectedSignals[deviceId] || !inportsWithConnectedSignals[deviceId][inport.tag]) {
                        scheduleDeviceEvent(device, inport, this.value, deviceId, false);

                        // Send update to WebSocket server if this is a local action
                        if (!isLocalAction) {
                            sendUpdate({
                                type: 'updateInput',
                                deviceId: deviceId,
                                inportTag: inport.tag,
                                value: this.value,
                                clientId: clientId
                            });
                        }
                    }
                }
            });

            if (inport.tag == 'length (seconds)') {
                inportText.addEventListener('keydown', function(event) {
                    // prevent saving audio files when pressing enter on the record device length input
                    if (event.key === 'Enter') {
                        event.preventDefault();
                    }
                });
            }
    
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

            if (deviceType == 'sequencer' || deviceType == 'quantizer' ) {
                inportContainer.style.display = 'none';
            }

            // the "trigger" inport for the stutter device gates the device when no signal is connected
            // it needs to exist as an inport, but the user doesn't enter anything into it - this just 
            // leverages the connection management logic that works with inports
            if (deviceType == 'stutter' && inport.tag == 'trigger') {
                inportText.style.visibility = 'hidden';
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
                if (deviceId.includes('step_trig')) {
                    // some special logic for the step trigger input which can transmits an array to the wasm device instead of a single number
                    let test = eval(value);
                    // check if it's a FacetPattern
                    if (typeof test.data !== 'undefined') {
                        values = test.data;
                    }
                    else if (typeof test.data === 'undefined') {
                        // if it's not a FacetPattern, check if it's a number
                        if (typeof test === 'number') {
                            values = [test];
                        }
                        else {
                            // if it's not a number or FacetPattern, assume the user defined an array
                            values = test;
                        }
                    }
                }
                else {
                    values = value.split(/\s+/).map(s => parseFloat(eval(s)));
                }
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

let isDragging = false;
let dragStartButton = null;
let tempLine = null;

document.addEventListener('mousedown', (event) => {
    // click-drag functionality is only available on non-touchscreen machines
    if (isMobileOrTablet) {
        return;
    }
    const button = event.target.closest('button');
    if (button && (button.closest('.input-container') || button.closest('.output-container'))) {
        isDragging = true;
        dragStartButton = button;

        // create temporary line element to indicate potential connection
        tempLine = document.createElement('div');
        tempLine.style.position = 'absolute';
        tempLine.style.backgroundColor = 'transparent';
        tempLine.style.border = '1px dashed gray';
        tempLine.style.width = '2px';
        document.body.appendChild(tempLine);

        updateTempLine(event.pageX, event.pageY);
    }
});

document.addEventListener('mousemove', (event) => {
    if (isDragging && tempLine) {
        updateTempLine(event.pageX, event.pageY);
    }
});

document.addEventListener('mouseup', (event) => {
    if (isDragging) {
        const button = event.target.closest('button');
        if (button && (button.closest('.input-container') || button.closest('.output-container'))) {
            const startDeviceId = dragStartButton.closest('.node').id;
            const startIsInputButton = dragStartButton.closest('.input-container') !== null;
            const startIndex = Array.from(dragStartButton.parentNode.children).indexOf(dragStartButton);
            const endDeviceId = button.closest('.node').id;
            const endIsInputButton = button.closest('.input-container') !== null;
            const endIndex = Array.from(button.parentNode.children).indexOf(button);
        
            if (endDeviceId.includes('output')) {
                // special handling for the output node
                const outputChannelInput = document.querySelector(`#${endDeviceId} #output_channel`);
                const outputChannel = outputChannelInput.value - 1;
                if (startIsInputButton !== endIsInputButton) {
                    if (startIsInputButton) {
                        startConnection(endDeviceId, endIndex);
                        finishConnection(startDeviceId, startIndex);
                    } else {
                        startConnection(startDeviceId, startIndex);
                        finishConnection(endDeviceId, outputChannel);
                    }
                }
            }
            else if (startDeviceId.includes('output')) {
                // special handling for the output node
                const outputChannelInput = document.querySelector(`#${startDeviceId} #output_channel`);
                const outputChannel = outputChannelInput.value - 1;
                if (startIsInputButton !== endIsInputButton) {
                    if (startIsInputButton) {
                        startConnection(endDeviceId, endIndex);
                        finishConnection(startDeviceId, outputChannel);
                    } else {
                        startConnection(startDeviceId, outputChannel);
                        finishConnection(endDeviceId, endIndex);
                    }
                }
            }
            else {
                if (startIsInputButton !== endIsInputButton) {
                    if (startIsInputButton) {
                        startConnection(endDeviceId, endIndex);
                        finishConnection(startDeviceId, startIndex);
                    } else {
                        startConnection(startDeviceId, startIndex);
                        finishConnection(endDeviceId, endIndex);
                    }
                }
            }
        }

        // remove temporary connection line
        if (tempLine) {
            document.body.removeChild(tempLine);
            tempLine = null;
        }

        isDragging = false;
        dragStartButton = null;
    }
});

function updateTempLine(mouseX, mouseY) {
    const rect = dragStartButton.getBoundingClientRect();
    const startX = rect.left + rect.width / 2 + window.scrollX;
    const startY = rect.top + rect.height / 2 + window.scrollY;

    const length = Math.sqrt((mouseX - startX) ** 2 + (mouseY - startY) ** 2);
    const angle = Math.atan2(mouseY - startY, mouseX - startX) * 180 / Math.PI;

    tempLine.style.height = `${length}px`;
    tempLine.style.transform = `rotate(${angle-90}deg)`;
    tempLine.style.transformOrigin = '0 0';
    tempLine.style.left = `${startX}px`;
    tempLine.style.top = `${startY}px`;
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

async function finishConnection(deviceId, inputIndex) {
    try {
        if (sourceDeviceId) {
            const sourceDevice = devices[sourceDeviceId].device;
            const targetDevice = devices[deviceId] ? devices[deviceId].device : null;
            const targetButtonId = document.querySelector(`#${deviceId} .input-container button:nth-child(${deviceId.includes('output') ? 1 : inputIndex + 1})`).id;
            const sourceButton = document.getElementById(sourceButtonId);
            const targetButton = document.getElementById(targetButtonId);
            const verticalOffset = 40;
            const horizontalOffset = 0;
            let sourcePosition, targetPosition;
            let initialSourceHeight, initialTargetHeight;
            
            if (sourceDeviceId.split('-')[0] === 'pattern') {
                initialSourceHeight = sourceButton.parentNode.parentNode.offsetHeight;
                const relativeSourcePosition = (sourceButton.offsetTop + verticalOffset) / initialSourceHeight;
            
                sourcePosition = [(1 + horizontalOffset / sourceButton.parentNode.parentNode.offsetWidth), relativeSourcePosition];
                targetPosition = [
                    (0 - horizontalOffset / targetButton.parentNode.parentNode.offsetWidth),
                    (targetButton.offsetTop + verticalOffset) / targetButton.parentNode.parentNode.offsetHeight
                ];
            } else if (deviceId.split('-')[0] === 'pattern') {
                initialTargetHeight = targetButton.parentNode.parentNode.offsetHeight;
                const relativeTargetPosition = (targetButton.offsetTop + verticalOffset) / initialTargetHeight;
            
                sourcePosition = [
                    (1 + horizontalOffset / sourceButton.parentNode.parentNode.offsetWidth),
                    (sourceButton.offsetTop + verticalOffset) / sourceButton.parentNode.parentNode.offsetHeight
                ];
                targetPosition = [(0 - horizontalOffset / targetButton.parentNode.parentNode.offsetWidth), relativeTargetPosition];
            } else {
                sourcePosition = [
                    (1 + horizontalOffset / sourceButton.parentNode.parentNode.offsetWidth),
                    (sourceButton.offsetTop + verticalOffset) / sourceButton.parentNode.parentNode.offsetHeight
                ];
                targetPosition = [
                    (0 - horizontalOffset / targetButton.parentNode.parentNode.offsetWidth),
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

            // visualize the connection
            const jsPlumbConnection = jsPlumb.connect({
                source: sourceDeviceId,
                target: deviceId,
                anchors: [sourcePosition, targetPosition],
                paintStyle: { stroke: 'rgba(112, 132, 145, 1)', strokeWidth: 12, fill: "transparent" },
                endpointStyle: { fill: "rgba(127,127,127,0.5)", outlineStroke: "black", outlineWidth: 2 },
                endpoints: [
                    ["Dot", { radius: 12, cssClass: "endpointCircle sourceEndpoint" }],
                    ["Dot", { radius: 12, cssClass: "endpointCircle targetEndpoint" }]
                ],
                connector: ["Straight"]
            });

            let jsPlumbConnectionId = jsPlumbConnection.getId();
            let connection = { id: jsPlumbConnectionId, splitter, target: deviceId, output: sourceOutputIndex, input: inputIndex };
            devices[sourceDeviceId].connections.push(connection);

            // listen for resizing of the pattern device so that connections can be redrawn
            if (sourceDeviceId.split('-')[0] === 'pattern' || sourceDeviceId.split('-')[0] === 'sequencer') {
                const patternDeviceDiv = document.getElementById(sourceDeviceId);
                const resizeObserver = new ResizeObserver(() => {
                    const newSourceHeight = sourceButton.parentNode.parentNode.offsetHeight;
                    const newRelativeSourcePosition = (sourceButton.offsetTop + verticalOffset) / newSourceHeight;

                    jsPlumbConnection.endpoints[0].anchor.y = newRelativeSourcePosition;
                    jsPlumb.repaintEverything();
                });
                resizeObserver.observe(patternDeviceDiv);
            }

            if (deviceId.split('-')[0] === 'pattern' || deviceId.split('-')[0] === 'sequencer' ) {
                const patternDeviceDiv = document.getElementById(deviceId);
                const resizeObserver = new ResizeObserver(() => {
                    const newTargetHeight = targetButton.parentNode.parentNode.offsetHeight;
                    const newRelativeTargetPosition = (targetButton.offsetTop + verticalOffset) / newTargetHeight;

                    jsPlumbConnection.endpoints[1].anchor.y = newRelativeTargetPosition;
                    jsPlumb.repaintEverything();
                });
                resizeObserver.observe(patternDeviceDiv);
            }

            // Send update to WebSocket server if this is a local action
            if (!isLocalAction) {
                sendUpdate({
                    type: 'makeConnection',
                    sourceDeviceId: sourceDeviceId,
                    targetDeviceId: deviceId,
                    sourceOutputIndex: sourceOutputIndex,
                    inputIndex: inputIndex,
                    clientId: clientId
                });
            }

            sourceDeviceId = null;
            sourceOutputIndex = null;
            setSignalConnectionState(deviceId, inputIndex);
        }
        jsPlumb.repaintEverything();
    } catch (error) {}
}

function setSignalConnectionState(deviceId, inputIndex) {
    const targetDevice = devices[deviceId].device;
    if (!inportsWithConnectedSignals[deviceId]) {
        inportsWithConnectedSignals[deviceId] = {};
    }
    const inletComment = targetDevice.it.T.inlets[inputIndex].comment;
    if (!inportsWithConnectedSignals[deviceId][inletComment]) {
        inportsWithConnectedSignals[deviceId][inletComment] = 0;
    }
    inportsWithConnectedSignals[deviceId][inletComment]++;

    let inport = null;
    if (typeof targetDevice.it.T.inports !== 'undefined') {
        for (let i = 0; i < targetDevice.it.T.inports.length; i++) {
            if (targetDevice.it.T.inports[i].tag === inletComment) {
                inport = targetDevice.it.T.inports[i];
                break;
            }
        }
    }
    if (inport) {
        scheduleDeviceEvent(targetDevice, inport, '-1123581321', deviceId, false);
    }
}

function unsetSignalConnectionState(deviceId, inputIndex) {
    const targetDevice = devices[deviceId].device;
    const inletComment = targetDevice.it.T.inlets[inputIndex].comment;
    if (inportsWithConnectedSignals[deviceId] && inportsWithConnectedSignals[deviceId][inletComment]) {
        inportsWithConnectedSignals[deviceId][inletComment]--;
        if (inportsWithConnectedSignals[deviceId][inletComment] === 0) {
            delete inportsWithConnectedSignals[deviceId][inletComment];
            if (Object.keys(inportsWithConnectedSignals[deviceId]).length === 0) {
                delete inportsWithConnectedSignals[deviceId];
            }
        }
    }
}

function triggerChangeOnTargetDeviceInputs(targetDeviceId) {
    const targetNode = document.getElementById(targetDeviceId);
    if (targetNode) {
        const inputs = targetNode.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            const event = new Event('change');
            input.dispatchEvent(event);
        });
    }
}

async function createCustomAudioWorkletDevice(workletfile, filename) {
    try {
        await context.audioWorklet.addModule(`js/customWorklets/${workletfile}.js`);

        // create a temporary node to get the number of inputs & number of ouputs
        const tempNode = new AudioWorkletNode(context, `${workletfile}`);

        return new Promise((resolve, reject) => {
            tempNode.port.onmessage = (event) => {
                if (event.data.type === 'config') {
                    const { inputs, outputs, inputNames, outputNames } = event.data;
                    // create the node with the correct inputs/outputs for this device
                    const customNode = new AudioWorkletNode(context, `${workletfile}`, {
                        numberOfInputs: inputs,
                        numberOfOutputs: outputs,
                        channelCount: Math.max(inputs, outputs),
                        channelCountMode: 'explicit',
                        channelInterpretation: 'speakers'
                    });

                    // name the inlets and outlets based on their names in the worklet
                    const inlets = inputNames.map((name, i) => ({ comment: name }));
                    const outlets = outputNames.map((name, i) => ({ comment: name }));

                    // create the device 
                    const device = createMockRNBODevice(context, customNode, [customNode], outlets, inlets, outputs);

                    const deviceDiv = addDeviceToWorkspace(device, filename, false);
                    applyDeviceStyles(deviceDiv, filename);

                    // resolve the promise with the created device element and remove tempNode
                    resolve(deviceDiv);
                    tempNode.disconnect();
                    tempNode.port.close();
                }
            };
        });

    } catch (error) {
        console.error('Error creating custom AudioWorklet device:', error);
        showGrowlNotification('Error creating custom AudioWorklet device.');
    }
}

async function createDeviceByName(filename, audioBuffer = null, devicePosition = null, isDuplicate = false) {
    try {
        let deviceDiv;
         // Find the device in wasmDeviceURLs that matches the supplied filename
        const customWorklet = wasmDeviceURLs.find(device => device.fileName === filename);

        // Check if the device has a worklet property
        if (customWorklet && customWorklet.worklet) {
            deviceDiv = await createCustomAudioWorkletDevice(customWorklet.worklet, filename);
        }
        else {
            if (filename === "motion") {
                await showMotionPermissionButton();
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
            else if (filename === "scope") {
                const analyser = context.createAnalyser();
                analyser.fftSize = 2048;
                let bufferLength = analyser.fftSize;
                let dataArray = new Uint8Array(bufferLength);
                const gainNode = context.createGain();
                const device = createMockRNBODevice(context, gainNode, [gainNode], [{ comment: 'output' }], [{ comment: 'input' }]);
                deviceDiv = addDeviceToWorkspace(device, "scope", false);
            
                // Create the canvas element for the oscilloscope
                const canvas = document.createElement('canvas');
                const canvasCtx = canvas.getContext('2d');
                canvas.width = 300;
                canvas.height = 150;
                canvas.style.height = '115px';
                canvas.style.width = '100%';
                canvas.className = 'oscilloscopeCanvas';
                deviceDiv.appendChild(canvas);
    
                 // create inputs
                 const scopeMin = createLabeledInput('scope min', 'scopeMin', 'scopeMin', -1, {
                    input: { width: '50px', marginLeft: '-20px', marginRight: '20px' }
                });
            
                const scopeMax = createLabeledInput('scope max', 'scopeMax', 'scopeMax', 1, {
                    input: { width: '50px', marginLeft: '-20px', marginRight: '20px' }
                });
            
                const blockSize = createLabeledInput('block size', 'blockSize', 'blockSize', 2048, {
                    input: { width: '50px', marginLeft: '-20px', marginRight: '20px' }
                });
            
                // Append the inputs to the device div
                deviceDiv.appendChild(scopeMin.label);
                deviceDiv.appendChild(scopeMin.input);
                deviceDiv.appendChild(scopeMax.label);
                deviceDiv.appendChild(scopeMax.input);
                deviceDiv.appendChild(blockSize.label);
                deviceDiv.appendChild(blockSize.input);
        
            
                // connect the nodes
                gainNode.connect(analyser);
            
                // function to check if a number is a power of 2
                function isPowerOf2(value) {
                    return (value & (value - 1)) === 0;
                }
            
                // function to update the block size
                function updateBlockSize() {
                    const newBlockSize = parseInt(blockSize.input.value, 10);
                    if (isPowerOf2(newBlockSize) && newBlockSize >= 32 && newBlockSize <= 32768) {
                        analyser.fftSize = newBlockSize;
                        bufferLength = analyser.fftSize;
                        dataArray = new Uint8Array(bufferLength);
                    } else {
                        showGrowlNotification('Error: Block size must be a power of 2 between 32 and 32768.');
                    }
                }
            
                // add event listener to update block size when the input changes
                blockSize.input.addEventListener('change', updateBlockSize);
            
                // draw the oscilloscope
                function draw() {
                    requestAnimationFrame(draw);
            
                    analyser.getByteTimeDomainData(dataArray);
            
                    const scopeMinValue = parseFloat(scopeMin.input.value);
                    const scopeMaxValue = parseFloat(scopeMax.input.value);
                    const scopeRange = scopeMaxValue - scopeMinValue;
            
                    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
                    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            
                    canvasCtx.lineWidth = 2;
                    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
            
                    canvasCtx.beginPath();
            
                    const sliceWidth = canvas.width * 1.0 / bufferLength;
                    let x = 0;
            
                    for (let i = 0; i < bufferLength; i++) {
                        const v = (dataArray[i] / 128.0) - 1; // normalize to range [-1, 1]
                        const y = canvas.height - ((v - scopeMinValue) / scopeRange) * canvas.height; // flip the y coordinate
            
                        if (i === 0) {
                            canvasCtx.moveTo(x, y);
                        } else {
                            canvasCtx.lineTo(x, y);
                        }
            
                        x += sliceWidth;
                    }
            
                    canvasCtx.lineTo(canvas.width, canvas.height / 2);
                    canvasCtx.stroke();
                }
            
                draw();
            }
            else if (filename === "spectrogram") {
                const analyser = context.createAnalyser();
                analyser.fftSize = 2048;
                let bufferLength = analyser.frequencyBinCount;
                let dataArray = new Uint8Array(bufferLength);
                const gainNode = context.createGain();
                const device = createMockRNBODevice(context, gainNode, [gainNode], [{ comment: 'output' }], [{ comment: 'input' }]);
                deviceDiv = addDeviceToWorkspace(device, "spectrogram", false);
            
                // create the canvas element for the spectrogram
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 150;
                canvas.style.height = '360px';
                canvas.style.width = '100%';
                canvas.className = 'spectrogramCanvas';
                deviceDiv.appendChild(canvas);
            
                const canvasCtx = canvas.getContext('2d');
            
                // create labeled input
                const blockSize = createLabeledInput('block size', 'blockSize', 'blockSize', 2048, {
                    input: { width: '50px', marginLeft: '-20px', marginRight: '20px' }
                });
            
                // append the labeled input to the device div
                deviceDiv.appendChild(blockSize.label);
                deviceDiv.appendChild(blockSize.input);
            
                // connect the nodes
                gainNode.connect(analyser);
            
                // function to check if a number is a power of 2
                function isPowerOf2(value) {
                    return (value & (value - 1)) === 0;
                }
            
                // function to update the block size
                function updateBlockSize() {
                    const newBlockSize = parseInt(blockSize.input.value, 10);
                    if (isPowerOf2(newBlockSize) && newBlockSize >= 32 && newBlockSize <= 32768) {
                        analyser.fftSize = newBlockSize;
                        bufferLength = analyser.frequencyBinCount;
                        dataArray = new Uint8Array(bufferLength);
                    } else {
                        showGrowlNotification('Error: Block size must be a power of 2 between 32 and 32768.');
                    }
                }
            
                // add event listener to update block size when the input changes
                blockSize.input.addEventListener('change', updateBlockSize);
            
                // function to get color based on value
                function getColor(value) {
                    const hue = (1.0 - value) * 240; // hue from blue (240) to red (0)
                    const lightness = value * 50; // lightness from 0% (black) to 50%
                    return `hsl(${hue}, 100%, ${lightness}%)`;
                }
            
                // draw the spectrogram
                function draw() {
                    requestAnimationFrame(draw);
            
                    analyser.getByteFrequencyData(dataArray);
            
                    // shift the existing image left
                    const imageData = canvasCtx.getImageData(0, 0, canvas.width, canvas.height);
                    canvasCtx.putImageData(imageData, -1, 0);
            
                    // draw the new frequency data on the right
                    for (let i = 0; i < bufferLength; i++) {
                        const value = dataArray[i] / 255; // normalize to range [0, 1]
                        const x = canvas.width - 1;
                        const y = canvas.height - (i / bufferLength) * canvas.height; // flip the y coordinate
                        const color = getColor(value);
                        canvasCtx.fillStyle = color;
                        canvasCtx.fillRect(x, y, 1, canvas.height / bufferLength);
                    }
                }
            
                draw();
            }
            else if (filename === "midipitchbend") {
                const pitchBendSource = context.createConstantSource();
                pitchBendSource.offset.value = 0;
                pitchBendSource.start();
                const device = createMockRNBODevice(context, pitchBendSource, [pitchBendSource], [{ comment: 'output' }], []);
                deviceDiv = addDeviceToWorkspace(device, "midipitchbend", false);
            
                // create labeled input
                const midiChannel = createLabeledInput('MIDI Channel', 'midiChannel', 'midiChannel', 1, {
                    input: { width: '40px' }
                });
            
                // append labels and inputs to the device div
                deviceDiv.appendChild(midiChannel.label);
                deviceDiv.appendChild(midiChannel.input);
            
                // request MIDI access
                if (navigator.requestMIDIAccess) {
                    navigator.requestMIDIAccess().then(midiAccess => {
                        midiAccess.inputs.forEach(input => {
                            input.addEventListener('midimessage', event => {
                                const [status, lsb, msb] = event.data;
                                const channel = (status & 0x0F) + 1; // extract channel number (1-16)
                                const selectedChannel = parseInt(midiChannel.input.value, 10);
            
                                // check if the message is a pitch bend message and matches the selected channel
                                if ((status & 0xF0) === 224 && channel === selectedChannel) { // pitch bend message
                                    const pitchBendValue = (msb << 7) | lsb; // combine MSB and LSB to create a 14-bit value
                                    const normalizedValue = (pitchBendValue - 8192) / 8192; // normalize value to range [-1, 1]
                                    // transmit the pitch bend value as a signal
                                    pitchBendSource.offset.setValueAtTime(normalizedValue, context.currentTime);
                                }
                            });
                        });
                    }).catch(err => {
                        console.error('Failed to get MIDI access', err);
                    });
                } else {
                    console.error('MIDI not supported in this browser.');
                }
            }
            else if (filename === "midicc") {
                const ccSource = context.createConstantSource();
                ccSource.offset.value = 0;
                ccSource.start();
                const device = createMockRNBODevice(context, ccSource, [ccSource], [{ comment: 'output' }], []);
                deviceDiv = addDeviceToWorkspace(device, "midicc", false);
            
                // create labeled input for the MIDI channel
                const midiChannel = createLabeledInput('MIDI Channel', 'midiChannel', 'midiChannel', 1, {
                    input: { width: '40px' }
                });
            
                // create labeled input for the CC number
                const ccNumber = createLabeledInput('CC #', 'ccNumber', 'ccNumber', 1, {
                    input: { width: '40px' }
                });
            
                // append the labels and inputs to the device div
                deviceDiv.appendChild(midiChannel.label);
                deviceDiv.appendChild(midiChannel.input);
                deviceDiv.appendChild(document.createElement('br'));
                deviceDiv.appendChild(ccNumber.label);
                deviceDiv.appendChild(ccNumber.input);
            
                // request MIDI access
                if (navigator.requestMIDIAccess) {
                    navigator.requestMIDIAccess().then(midiAccess => {
                        midiAccess.inputs.forEach(input => {
                            input.addEventListener('midimessage', event => {
                                const [status, ccNumberValue, value] = event.data;
                                const channel = (status & 0x0F) + 1; // channel number (1-16)
                                const selectedChannel = parseInt(midiChannel.input.value, 10);
            
                                // check if the message is a CC message and matches the selected channel
                                if ((status & 0xF0) === 176 && channel === selectedChannel) { // CC message
                                    const selectedCCNumber = parseInt(ccNumber.input.value, 10);
                                    if (ccNumberValue === selectedCCNumber) {
                                        const normalizedValue = value / 127; // normalize value to range [0, 1]
                                        // transmit the CC value as a signal
                                        ccSource.offset.setValueAtTime(normalizedValue, context.currentTime);
                                    }
                                }
                            });
                        });
                    }).catch(err => {
                        console.error('Failed to get MIDI access', err);
                    });
                } else {
                    console.error('MIDI not supported in this browser.');
                }
            }
            else if (filename === "midinote") {
                const voiceSources = [];
                const gateSources = [];
                for (let i = 0; i < 8; i++) {
                    const frequencySource = context.createConstantSource();
                    frequencySource.offset.value = 0; // start with no frequency
                    frequencySource.start();
                    voiceSources.push(frequencySource);
            
                    const gateSource = context.createConstantSource();
                    gateSource.offset.value = 0; // start with gate off
                    gateSource.start();
                    gateSources.push(gateSource);
                }
            
                const merger = context.createChannelMerger(16);
                voiceSources.forEach((source, index) => {
                    source.connect(merger, 0, index);
                });
                gateSources.forEach((source, index) => {
                    source.connect(merger, 0, index + 8);
                });
            
                // create the device
                const device = createMockRNBODevice(
                    context,
                    merger,
                    voiceSources,
                    [
                        { comment: 'voice 1' }, { comment: 'voice 2' }, { comment: 'voice 3' }, { comment: 'voice 4' },
                        { comment: 'voice 5' }, { comment: 'voice 6' }, { comment: 'voice 7' }, { comment: 'voice 8' },
                        { comment: 'gate 1' }, { comment: 'gate 2' }, { comment: 'gate 3' }, { comment: 'gate 4' },
                        { comment: 'gate 5' }, { comment: 'gate 6' }, { comment: 'gate 7' }, { comment: 'gate 8' }
                    ],
                    [],
                    16,
                    gateSources
                );
            
                deviceDiv = addDeviceToWorkspace(device, "midinote", false);
            
                // create labeled input for the MIDI channel
                const midiChannel = createLabeledInput('MIDI Channel', 'midiChannel', 'midiChannel', 1, {
                    input: { width: '40px' }
                });
            
                // append the label and input to the device div
                deviceDiv.appendChild(midiChannel.label);
                deviceDiv.appendChild(midiChannel.input);
            
                function midiToFrequency(midiNote) {
                    return 440 * Math.pow(2, (midiNote - 69) / 12);
                }
            
                let heldNotes = [];
                let voiceAssignments = new Array(8).fill(null); // track which notes are assigned to which voices
            
                // request MIDI access
                if (navigator.requestMIDIAccess) {
                    navigator.requestMIDIAccess().then(midiAccess => {
                        midiAccess.inputs.forEach(input => {
                            input.addEventListener('midimessage', event => {
                                const [status, note, velocity] = event.data;
                                const channel = (status & 0x0F) + 1; // extract channel number (1-16)
                                const selectedChannel = parseInt(midiChannel.input.value, 10);
            
                                // check if the message is a note on or note off and matches the selected channel
                                if (channel === selectedChannel) {
                                    if ((status & 0xF0) === 144 && velocity > 0) { // note on
                                        const frequency = midiToFrequency(note);
                                        let voiceIndex = voiceAssignments.indexOf(null); // find an unoccupied voice
            
                                        if (voiceIndex === -1) {
                                            // if no unoccupied voice, steal the first one
                                            voiceIndex = 0;
                                        }
            
                                        voiceAssignments[voiceIndex] = note;
                                        heldNotes.push(note);
                                        // transmit the frequency as a signal with linear ramping
                                        voiceSources[voiceIndex].offset.setTargetAtTime(frequency, context.currentTime, 0.01);
                                        // set the gate to 1
                                        gateSources[voiceIndex].offset.setTargetAtTime(1, context.currentTime, 0.01);
                                    } else if ((status & 0xF0) === 128 || ((status & 0xF0) === 144 && velocity === 0)) { // note off
                                        const noteIndex = heldNotes.indexOf(note);
                                        if (noteIndex !== -1) {
                                            heldNotes.splice(noteIndex, 1);
                                        }
            
                                        const voiceIndex = voiceAssignments.indexOf(note);
                                        if (voiceIndex !== -1) {
                                            voiceAssignments[voiceIndex] = null;
                                            // set the gate to 0
                                            gateSources[voiceIndex].offset.setTargetAtTime(0, context.currentTime, 0.01);
                                        }
                                    }
                                }
                            });
                        });
                    }).catch(err => {
                        console.error('Failed to get MIDI access', err);
                    });
                } else {
                    console.error('MIDI not supported in this browser.');
                }
            }
            else if (filename === "toggle") {
                const silenceGenerator = context.createConstantSource();
                silenceGenerator.offset.value = 0;
                silenceGenerator.start();
                // create the device
                const device = createMockRNBODevice(context, silenceGenerator, silenceGenerator, [{ comment: 'output' }], []);
                
                deviceDiv = addDeviceToWorkspace(device, "toggle", false);
                
                // Store reference to the silence generator
                devices[deviceDiv.id].silenceGenerator = silenceGenerator;
                
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
            
                    // Send update to WebSocket server
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: hiddenInput.id,
                        value: hiddenInput.value,
                        clientId: clientId
                    });
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
                const device = createMockRNBODevice(context, merger, [merger], [{ comment: 'frequency' }, { comment: 'trigger' }], [], 2);
                deviceDiv = addDeviceToWorkspace(device, "keyboard", false);
            
                // Store references to the silence generator and trigger source
                devices[deviceDiv.id].silenceGenerator = silenceGenerator;
                devices[deviceDiv.id].triggerSource = triggerSource;
            
                // create a div to hold the piano keyboard
                const keyboardDiv = document.createElement('div');
                keyboardDiv.className = 'pianoKeyboard';
                keyboardDiv.style.position = 'relative';
                keyboardDiv.style.marginBottom = '9px';
                keyboardDiv.style.marginRight = '50px';
                keyboardDiv.style.marginTop = '5px';
                keyboardDiv.style.height = '120px';
                keyboardDiv.style.border = '1px solid black';    
                let isMouseDown = false;
                let rootNote = 60; // default middle C
                let octaves = 1; // default 1 octave
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
                    triggerSource.offset.setValueAtTime(0, context.currentTime + 0.1); // briefly output 1
                    previousKeyDiv = keyDiv;
            
                    // Send update to WebSocket server
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: `id-${keyDiv.dataset.value}`,
                        value: '1',
                        clientId: clientId
                    });
                };
            
                const resetKey = (keyDiv) => {
                    keyDiv.style.backgroundColor = keyDiv.dataset.color === 'white' ? 'white' : 'black';
            
                    // Send update to WebSocket server
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: `id-${keyDiv.dataset.value}`,
                        value: '0',
                        clientId: clientId
                    });
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
            
                const createKeys = () => {
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
                        { note: 'B', color: 'white' }
                    ];
            
                    keyboardDiv.innerHTML = ''; // clear existing keys
                    for (let octave = 0; octave < octaves; octave++) {
                        keys.forEach((key, index) => {
                            const keyContainer = document.createElement('div');
                            keyContainer.style.position = 'absolute';
                            keyContainer.style.display = 'inline-block';
                            keyContainer.style.width = '30px';
                            keyContainer.style.left = `${(octave * 12 + index) * 30}px`;
            
                            const keyDiv = document.createElement('div');
                            keyDiv.className = `pianoKey ${key.color}`;
                            keyDiv.style.position = 'absolute';
                            keyDiv.style.width = '30px';
                            keyDiv.style.height = '120px';
                            keyDiv.style.left = '0';
                            keyDiv.style.backgroundColor = key.color === 'white' ? 'white' : 'black';
                            keyDiv.style.border = '1px solid black';
                            keyDiv.dataset.note = key.note;
                            keyDiv.dataset.value = rootNote + index + (octave * 12);
                            keyDiv.dataset.color = key.color;
            
                            keyDiv.addEventListener('mousedown', (event) => {
                                event.stopPropagation();
                                isMouseDown = true;
                                highlightKey(keyDiv);
                            });
            
                            keyDiv.addEventListener('mouseover', () => {
                                handleMouseOver(keyDiv);
                            });
            
                            keyDiv.addEventListener('mouseup', () => isMouseDown = false);
            
                            keyDiv.addEventListener('touchstart', (event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                highlightKey(keyDiv);
                            }, { passive: false });
            
                            keyDiv.addEventListener('touchmove', (event) => {
                                event.preventDefault();
                                handleTouchMove(event);
                            }, { passive: false });
            
                            keyContainer.appendChild(keyDiv);
                            keyboardDiv.appendChild(keyContainer);
                        });
                    }
                    keyboardDiv.style.width = `${30 * 12 * octaves}px`;
                };
            
                createKeys();
            
                // append the keyboard to the device div
                deviceDiv.appendChild(keyboardDiv);
            
                // create labeled input for the root note
                const rootNoteInput = createLabeledInput('Root Note', 'rootNote', 'rootNote', rootNote, {
                    input: { width: '3em' }
                });
            
                // append the label and input to the device div
                deviceDiv.appendChild(rootNoteInput.label);
                deviceDiv.appendChild(rootNoteInput.input);
            
                rootNoteInput.input.addEventListener('input', (event) => {
                    rootNote = parseInt(event.target.value, 10);
                    createKeys();
            
                    // Send update to WebSocket server
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: rootNoteInput.input.id,
                        value: rootNoteInput.input.value,
                        clientId: clientId
                    });
                });
            
                rootNoteInput.input.addEventListener('change', (event) => {
                    rootNote = parseInt(event.target.value, 10);
                    createKeys();
            
                    // Send update to WebSocket server
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: rootNoteInput.input.id,
                        value: rootNoteInput.input.value,
                        clientId: clientId
                    });
                });
            
                // create labeled input for the octaves
                const octavesInput = createLabeledInput('Octaves', 'octaves', 'octaves', octaves, {
                    input: { width: '3em' }
                }, {
                    min: '1',
                    max: '4'
                });
            
                // append the label and input to the device div
                deviceDiv.appendChild(octavesInput.label);
                deviceDiv.appendChild(octavesInput.input);
            
                octavesInput.input.addEventListener('input', (event) => {
                    octaves = parseInt(event.target.value, 10);
                    createKeys();
            
                    // Send update to WebSocket server
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: octavesInput.input.id,
                        value: octavesInput.input.value,
                        clientId: clientId
                    });
                });
            
                octavesInput.input.addEventListener('change', (event) => {
                    octaves = parseInt(event.target.value, 10);
                    createKeys();
            
                    // Send update to WebSocket server
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: octavesInput.input.id,
                        value: octavesInput.input.value,
                        clientId: clientId
                    });
                });
            }
            else if (filename === "slider") {
                const silenceGenerator = context.createConstantSource();
                silenceGenerator.offset.value = 0;
                silenceGenerator.start();
                // create the device
                const device = createMockRNBODevice(context, silenceGenerator, [silenceGenerator], [{ comment: 'output' }], []);
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
                const minInput = createLabeledInput('min', 'min', 'deviceInport sliderMin', slider.min, {
                    input: { float: 'none' },
                    label: { width: '20px' }
                });
            
                // create max input and its label
                const maxInput = createLabeledInput('max', 'max', 'deviceInport sliderMax', slider.max, {
                    input: { float: 'none' },
                    label: { width: '20px' }
                });
            
                // append the labels and inputs to the div
                div.appendChild(minInput.label);
                div.appendChild(minInput.input);
                div.appendChild(maxInput.label);
                div.appendChild(maxInput.input);
                div.appendChild(document.createElement('br'));
            
                // append the div to the form
                form.appendChild(div);
            
                // add event listeners to the min and max inputs
                minInput.input.addEventListener('change', () => {
                    slider.min = minInput.input.value;
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: minInput.input.id,
                        value: minInput.input.value,
                        clientId: clientId
                    });
                });
                
                maxInput.input.addEventListener('change', () => {
                    slider.max = maxInput.input.value;
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: maxInput.input.id,
                        value: maxInput.input.value,
                        clientId: clientId
                    });
                });
                
                // add event listeners to the slider
                slider.addEventListener('input', () => {
                    // update the silenceGenerator offset value
                    silenceGenerator.offset.value = slider.value;
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: slider.id,
                        value: slider.value,
                        clientId: clientId
                    });
                });
                
                slider.addEventListener('change', () => {
                    // update the silenceGenerator offset value
                    silenceGenerator.offset.value = slider.value;
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: slider.id,
                        value: slider.value,
                        clientId: clientId
                    });
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
                const device = createMockRNBODevice(context, mergerNode, mergerNode, [{ comment: 'output x' }, { comment: 'output y' }], [], 2);
                deviceDiv = addDeviceToWorkspace(device, "touchpad", false);
            
                // Store references to the silence generators
                devices[deviceDiv.id].silenceGeneratorX = silenceGeneratorX;
                devices[deviceDiv.id].silenceGeneratorY = silenceGeneratorY;
            
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
                            
                            // Send update to WebSocket server
                            sendUpdate({
                                type: 'updateInput',
                                deviceId: deviceDiv.id,
                                elementId: inputX.id,
                                value: inputX.value,
                                clientId: clientId
                            });
                            sendUpdate({
                                type: 'updateInput',
                                deviceId: deviceDiv.id,
                                elementId: inputY.id,
                                value: inputY.value,
                                clientId: clientId
                            });
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
                            // Send update to WebSocket server
                            sendUpdate({
                                type: 'updateInput',
                                deviceId: deviceDiv.id,
                                elementId: inputX.id,
                                value: inputX.value,
                                clientId: clientId
                            });
                            sendUpdate({
                                type: 'updateInput',
                                deviceId: deviceDiv.id,
                                elementId: inputY.id,
                                value: inputY.value,
                                clientId: clientId
                            });
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
                const device = createMockRNBODevice(context, silenceGenerator, silenceGenerator, [{ comment: 'output' }], []);
                deviceDiv = addDeviceToWorkspace(device, "button", false);
            
                // Store reference to the silence generator
                devices[deviceDiv.id].silenceGenerator = silenceGenerator;
            
                // create a button
                const button = document.createElement('button');
                button.textContent = '⬤';
                button.className = 'button-ui';
                button.style.color = 'black';
            
                // create a hidden input
                const hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.value = '0';
                hiddenInput.id = 'buttonHiddenInput';
            
                // find the existing form in the device
                const form = deviceDiv.querySelector('form');
            
                // create a div to hold the labels and inputs
                const div = document.createElement('div');
                div.className = 'labelAndInputContainer';
                div.style.left = '9px';
                div.style.top = '0px';
            
                // append the button and hidden input to the div
                div.appendChild(button);
                div.appendChild(hiddenInput);
            
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
                    hiddenInput.value = '1';
            
                    // Send update to WebSocket server
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: hiddenInput.id,
                        value: hiddenInput.value,
                        clientId: clientId
                    });
                }
            
                function handleButtonUp(event) {
                    if (event.type === 'touchend') {
                        isTouchEvent = true;
                    } else if (isTouchEvent) {
                        return;
                    }
                    silenceGenerator.offset.value = 0;
                    button.style.color = 'black';
                    hiddenInput.value = '0';
            
                    // Send update to WebSocket server
                    sendUpdate({
                        type: 'updateInput',
                        deviceId: deviceDiv.id,
                        elementId: hiddenInput.id,
                        value: hiddenInput.value,
                        clientId: clientId
                    });
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
                // is a RNBO-generated device
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
                const patcher = jsonFiles[`${filename}`];
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
        }
        // attach the same event handlers to every device div
        deviceDiv.onmousedown = handleDeviceMouseDown;
        deviceDiv.ontouchstart = handleDeviceMouseDown;
        if ( devicePosition ) {
            deviceDiv.style.left = devicePosition.left + 'px';
            deviceDiv.style.top = devicePosition.top + 'px';
        }
        // apply device-specific styles to the div
        applyDeviceStyles(deviceDiv, filename);

        // send update to WebSocket server if this is a local action
        if (!isLocalAction && !isDuplicate) {
            sendUpdate({
                type: 'addDevice',
                filename: filename,
                devicePosition: devicePosition,
                clientId: clientId
            });
        }

        return deviceDiv;
    }
    catch (error) {
        if ( filename === 'motion' ) {
            showGrowlNotification(`Error creating device: motion is not supported in this machine.`);
        }
        else {
            showGrowlNotification(`Error creating device. Does "${filename.replace('.json','')}" match an available device?`);
        }
    }
}

function applyDeviceStyles(deviceDiv, filename) {
    const styles = {
        pattern: { width: '32em', height: '120px' },
        number: { height: '80px' },
        play: { height: '216px' },
        wave: { width: '14em' },
        granular: { height: '160px' },
        comment: { width: '10em', height: '80px' },
        buffer: { width: '12em' },
        print: { width: '333px', paddingBottom: '10px', height: '236px' },
        record: { width: '104px', minWidth: '104px' },
        slider: { width: '200px', height: '110px' },
        touchpad: { width: '260px', height: '250px' },
        button: { height: '138px' },
        toggle: { height: '138px' },
        output: { width: '140px' },
        abs: { width: '7em' },
        and: { width: '7em' },
        hztosamps: { width: '9em' },
        mstosamps: { width: '9em' },
        sampstohz: { width: '9em' },
        sampstoms: { width: '9em' },
        sqrt: { width: '9em' },
        downsamp: { width: '10em' },
        motion: { width: '7em' },
        keyboard: { width: '410px', height: '186px' },
        midinote: { width: '202px' },
        midicc: { width: '202px', height: '78px' },
        sequencer: { width: '331px', paddingBottom: '14px' },
        scope: { width: '308px', paddingBottom: '10px' },
        spectrogram: { width: '250px', paddingBottom: '10px' },
        step_trig: {width: '14em'},
        quantizer: { width: '549px' },
        complexity: { width: '150px' }
    };

    const style = styles[filename];
    if (style) {
        Object.assign(deviceDiv.style, style);
    }
}

function createLabeledInput(labelText, inputId, inputClass, defaultValue, additionalStyles = {}, additionalAttributes = {}) {
    // create label element
    const label = document.createElement('label');
    label.for = inputId;
    label.textContent = labelText;
    label.className = 'deviceInportLabel';
    label.style.display = 'inline-block';

    // apply additional styles to the label
    for (const [key, value] of Object.entries(additionalStyles.label || {})) {
        label.style[key] = value;
    }

    // create input element
    const input = document.createElement('input');
    input.type = 'number';
    input.id = inputId;
    input.className = inputClass;
    input.value = defaultValue;

    // apply additional styles to the input
    for (const [key, value] of Object.entries(additionalStyles.input || {})) {
        input.style[key] = value;
    }

    // apply additional attributes to the input
    for (const [key, value] of Object.entries(additionalAttributes)) {
        input.setAttribute(key, value);
    }

    return { label, input };
}

function createMockRNBODevice(context, node, sources, outlets, inlets, numOutputChannels = 1, gates = []) {
    const device = {
        node: node,
        sources: sources || [],
        gates: gates,
        numOutputChannels: numOutputChannels,
        it: {
            T: {
                outlets: outlets,
                inlets: inlets || []
            }
        }
    };

    return device;
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
                            const event = new Event('regen');
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
                        startStopCheckbox.id = 'inport-checkbox';
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

        if (deviceType === 'sequencer') {
            // sequencer has a somewhat complex interaction between its UI and the underlying RNBO device
            // which has been abstracted into its own function
            createSequencerUI(deviceDiv);
        }
        if (deviceType === 'quantizer') {
            createQuantizerUI(deviceDiv);
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
        drag: function(event) {
            if (isLocked) return false;
    
            // Send update to WebSocket server if this is a local action
            if (!isLocalAction) {
                const deviceId = deviceDiv.id;
                const devicePosition = {
                    left: parseInt(deviceDiv.style.left, 10),
                    top: parseInt(deviceDiv.style.top, 10)
                };
                sendUpdate({
                    type: 'moveDevice',
                    deviceId: deviceId,
                    devicePosition: devicePosition,
                    clientId: clientId
                });
            }
        },
        stop: function(event) {
            if (isLocked) return false;
            isDraggingDevice = false;
    
            // Send update to WebSocket server if this is a local action
            if (!isLocalAction) {
                const selectedNodes = document.querySelectorAll('.selectedNode');
                selectedNodes.forEach(node => {
                    const deviceId = node.id;
                    const devicePosition = {
                        left: parseInt(node.style.left, 10),
                        top: parseInt(node.style.top, 10)
                    };
                    sendUpdate({
                        type: 'moveDevice',
                        deviceId: deviceId,
                        devicePosition: devicePosition,
                        clientId: clientId
                    });
                });
            }
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
                inputStyle: 'textarea',
                lineWrapping: true,
                matchBrackets: true,
                lint: {options: {esversion: 2021, asi: true}},
                extraKeys: {
                    "Cmd-D": false, // disable Cmd-D to prevent interference with wax device duplication key combo
                    "Ctrl-D": false // disable Ctrl-D to prevent interference with wax device duplication key combo
                }
            });
            adjustCodeMirrorHeight(editor);
            
            // update the hidden textarea's value
            editor.on('change', function(instance) {
                textarea.value = instance.getValue();
                adjustCodeMirrorHeight(editor);
            });
    
            // add touchstart event listener to focus the editor and the underlying textarea
            editor.getWrapperElement().addEventListener('touchstart', function(event) {
                event.stopPropagation();
                event.preventDefault();
                editor.focus();
            });

            // prevent dragging when focused on editor
            editor.getWrapperElement().addEventListener('touchmove', function(event) {
                event.stopPropagation();
                event.preventDefault();
            });
    
            editor.on('keydown', function(instance, event) {
                if (event.ctrlKey && (event.keyCode === 13 || event.keyCode === 82)) {
                    // evaluate facet pattern
                    let cursor = editor.getCursor();
                    let line = cursor.line;
                    let first_line_of_block = getFirstLineOfBlock(line, editor);
                    let last_line_of_block = getLastLineOfBlock(line, editor);
                    // highlight the text that will run for 100ms
                    editor.setSelection({line: first_line_of_block, ch: 0 }, {line: last_line_of_block, ch: 10000 });
                    // de-highlight, set back to initial cursor position
                    setTimeout(function(){ editor.setCursor({line: line, ch: cursor.ch }); }, 100);
                    executedTextPatterns[deviceDiv.id] = instance.getValue();
                    textarea.dispatchEvent(new Event('change'));
                }
    
                if (event.ctrlKey && event.keyCode === 70) {
                    var cursor = editor.getCursor();
                    var currentLine = cursor.line;
                    let scroll_info = editor.getScrollInfo();
                    editor.setValue(js_beautify(editor.getValue(), {
                        indent_size: 2,
                        break_chained_methods: true
                    }));
                    editor.focus();
                    editor.setCursor({
                        line: currentLine - 1
                    });
                    editor.scrollTo(scroll_info.left, scroll_info.top);
                }
            });
        }
    }


    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.style.display = 'none';
    return deviceDiv;
}

function adjustCodeMirrorHeight(editor) {
    const lineHeight = 17;
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

  function createDropdownofAllDevices() {
    // check if the dropdown already exists and remove it
    const existingDropdown = document.querySelector('.deviceDropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }

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

    // add dropdown to nav
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
    // if the device was not selected before, remove all selected node classes
    let nodeElement = event.target.closest('.node');
    if (nodeElement) {
        if (!nodeElement.classList.contains('selectedNode')) {
            removeSelectedNodeClass(event);
            jsPlumb.clearDragSelection();
        }
        nodeElement.classList.add('selectedNode');
    }
    selectedConnections.forEach(connection => {
        resetConnectionStyle(connection);
    });
    selectedConnections = [];
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
            if (input.type === 'checkbox') {
                deviceState.inputs[input.id] = input.checked;
            } else {
                deviceState.inputs[input.id] = input.value;
            }
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

    // include locked status in the workspace state
    workspaceState.push({ isLocked: isLocked });

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
            if (input.type === 'checkbox') {
                deviceState.inputs[input.id] = input.checked;
            } else {
                deviceState.inputs[input.id] = input.value;
            }
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
    const deviceStates = await getStateForDeviceIds(deviceIds);
    reconstructDevicesAndConnections(deviceStates, null, true, true);

    // Send update to WebSocket server
    sendUpdate({
        type: 'duplicateDevices',
        deviceStates: deviceStates,
        clientId: clientId
    });

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
    deleteAllNodes();
    try {
        document.getElementById('infoDiv').style.display = 'none';
    } catch (error) {}
    // check if any device has a deviceName of 'motion'
    let hasMotionDevice = false;
    if (deviceStates) {
        for (let deviceState of deviceStates) {
            if (deviceState.isLocked !== undefined) {
                setLockState(!deviceState.isLocked);
                continue;
            }
            else {
                let deviceName = deviceState.id.split('-')[0];
                if (deviceName === 'motion') {
                    hasMotionDevice = true;
                }
            }
        }
    }

    if (hasMotionDevice || deviceStates == null) {
        if ( hasMotionDevice ) {
            // first, hide the "main" permission button
            hidePermissionButton();
            // when a shared state has a motion device in it, we need to initiate the permission request via user input
            const permissionDiv = document.createElement('div');
            permissionDiv.className = 'permissionDiv';
            permissionDiv.innerHTML = '<b>Welcome to Wax!</b>';
            const permissionButton = document.createElement('button');
            permissionButton.className = 'permissionButton';
            permissionButton.innerText = 'Please tap this button to select whether to allow motion sensing or not.';
            permissionButton.addEventListener('click', async () => {
                try {
                    if (typeof DeviceMotionEvent.requestPermission === 'function') {
                        const response = await DeviceMotionEvent.requestPermission();
                        if (response === 'granted') {
                            // device motion event permission granted
                            let deviceDropdown = createDropdownofAllDevices();
                            addMotionDeviceToDropdown(deviceDropdown);
                        } else {
                            showGrowlNotification('Permission for DeviceMotionEvent was not granted.');
                        }
                        // remove the div after handling interaction
                        document.body.removeChild(permissionDiv);

                        // proceed with reconstructing the workspace state
                        await loadWorkspaceState(deviceStates);
                        await startAudio();
                    }
                } catch (error) {
                    showGrowlNotification(`Error requesting DeviceMotionEvent permission: ${error}`);
                }
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

async function showMotionPermissionButton() {
    const isMobileOrTablet = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
    if (window.DeviceOrientationEvent && isMobileOrTablet) {
        try {
            // request DeviceMotionEvent permission
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const motionResponse = await DeviceMotionEvent.requestPermission();
                if (motionResponse !== 'granted') {
                    showGrowlNotification('Permission for DeviceMotionEvent was not granted.');
                }            }
        } catch (error) {
            showGrowlNotification(`Error requesting permissions: ${error}`);
        }
    }
}

function hidePermissionButton() {
    const permissionDiv = document.querySelector('.permissionDiv');
    if (permissionDiv) {
        document.body.removeChild(permissionDiv);
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
        if (deviceState.isLocked !== undefined) {
            continue;
        }
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
            deviceElement = await createDeviceByName(deviceName, {name: deviceState.audioFileName, buffer: audioBuffer}, devicePosition, reconstructFromDuplicateCommand);
        } else if (deviceState.audioFileName && !zip) {
            if (audioBuffers[deviceState.audioFileName]) {
                let audioBuffer = audioBuffers[deviceState.audioFileName];
                deviceElement = await createDeviceByName(deviceName, {name: deviceState.audioFileName, buffer: audioBuffer}, devicePosition, reconstructFromDuplicateCommand);
            } else {
                deviceElement = await createDeviceByName(deviceName, null, devicePosition, reconstructFromDuplicateCommand);
                showGrowlNotification(`Make sure to load the missing audio file: "${deviceState.audioFileName}", since audio files are not stored with shared state URLs`);
            }
        } else {
            if (deviceName == 'microphone input') {
                deviceElement = await createDeviceByName('mic', null, devicePosition, reconstructFromDuplicateCommand);
            } else {
                deviceElement = await createDeviceByName(deviceName, null, devicePosition, reconstructFromDuplicateCommand);
                if (deviceName == 'print') {
                    // special handling needed because print UI elements are created after the device is created.
                    // the device needs to send data via outports to the UI elements, so that any number can be 
                    // visualized. this fix is needed when loading a saved state.
                    setTimeout(() => {
                        deviceElement.querySelector('#scopeMin').value = deviceState.inputs['scopeMin'];
                        deviceElement.querySelector('#scopeMax').value = deviceState.inputs['scopeMax'];
                    }, 100)
                }
            }
        }

        deviceElement.classList.add('selectedNode');
        jsPlumb.addToDragSelection(deviceElement);

        // set the values of its input elements
        let inputs = deviceElement.getElementsByTagName('input');
        for (let input of inputs) {
            if (typeof deviceState.inputs[input.id] != 'undefined') {
                if (input.type == 'checkbox') {
                    input.checked = deviceState.inputs[input.id];
                }
                else {
                    input.value = deviceState.inputs[input.id];
                }
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
        if (deviceName === 'touchpad') {
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
    var options = Array.from(dropdown.options);

    // sort the options alphabetically
    options = options.sort((a, b) => a.text.localeCompare(b.text));

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

    // create an arrow indicator
    var arrowIndicator = document.createElement('div');
    arrowIndicator.className = 'scrollArrowIndicator';
    arrowIndicator.innerHTML = '▼'; // or use an arrow icon
    modal.appendChild(arrowIndicator);

    // check scroll position in menu and toggle arrow visibility if there's more to see
    function checkScrollPosition() {
        if (content.scrollHeight > content.clientHeight) {
            if (content.scrollTop + content.clientHeight >= content.scrollHeight - 1) {
                arrowIndicator.style.display = 'none';
            } else {
                arrowIndicator.style.display = 'block';
            }
        } else {
            arrowIndicator.style.display = 'none';
        }
    }
    
    content.addEventListener('scroll', checkScrollPosition);
    // call the function initially to set the correct state
    setTimeout(checkScrollPosition, 0);

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
        connection.setPaintStyle({ stroke: 'rgba(112, 132, 145, 1)', strokeWidth: 12, fill: "transparent" });
        connection.endpoints.forEach(endpoint => {
            endpoint.setPaintStyle({ fill: "rgba(127,127,127,0.5)", outlineStroke: "black", outlineWidth: 2, cssClass: "endpointClass" });
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
    if ( displayName == 'motion' ) {
        return displayName;
    }
    if (device) {
        return device.fileName;
    } else {
        console.error('Device not found for display name:', displayName);
        return null;
    }
}

function getDisplayNameByFileName(fileName) {
    if ( fileName == 'motion' ) {
        return fileName;
    }
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

async function loadAllJsonFiles() {
    const cacheName = 'json-files-cache';
    const fileUrl = CONFIG.FILE_URL;
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    let response;

    try {
        if ('caches' in window) {
            // open the cache
            const cache = await caches.open(cacheName);

            // check if the file is already in the cache
            const cachedResponse = await cache.match(fileUrl);
            if (cachedResponse) {
                response = cachedResponse;
            } else {
                // fetch the file and store it in the cache
                response = await fetch(fileUrl);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                cache.put(fileUrl, response.clone());
            }

            // delete old files from the cache that do not match the current file name
            const cacheKeys = await cache.keys();
            for (const request of cacheKeys) {
                if (request.url !== new URL(fileUrl, location.href).href) {
                    await cache.delete(request);
                }
            }
        } else {
            // fetch the file directly if caches API is not available
            response = await fetch(fileUrl);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
        }

        // this is the number of bytes of the wax_devices file - hard-coded for now
        // while i figure out how to configure the content-length header on the server
        const contentLength = 12712710;
        const total = parseInt(contentLength, 10);
        let loaded = 0;

        const reader = response.body.getReader();
        const stream = new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            progressContainer.style.display = 'none'; // hide the progress container
                            return;
                        }
                        loaded += value.byteLength;
                        progressBar.value = (loaded / total) * 100;
                        controller.enqueue(value);
                        push();
                    }).catch(error => {
                        console.error('Error reading stream:', error);
                        controller.error(error);
                    });
                }
                push();
            }
        });

        const newResponse = new Response(stream);
        const arrayBuffer = await newResponse.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        for (const fileName of Object.keys(zip.files)) {
            if (fileName.endsWith('.json')) {
                const fileData = await zip.file(fileName).async('string');
                const key = fileName.replace('.json', '');
                jsonFiles[key] = JSON.parse(fileData);
            }
        }
    } catch (error) {
        console.error('Error loading JSON files:', error);
    }
}

function createSequencerUI(deviceDiv) {
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'sequencer-container';

    const sliderCountInputLabel = document.createElement('label');
    sliderCountInputLabel.textContent = '   steps';
    sliderCountInputLabel.htmlFor = 'slider-count';

    const sliderCountInput = document.createElement('input');
    sliderCountInput.type = 'number';
    sliderCountInput.id = 'slider-count';
    sliderCountInput.min = 2;
    sliderCountInput.max = 32;
    sliderCountInput.value = 8;
    sliderCountInput.style.marginBottom = '6px';
    sliderCountInput.style.width = '3em';
    sliderContainer.appendChild(sliderCountInput);
    sliderContainer.appendChild(sliderCountInputLabel);
    sliderContainer.appendChild(document.createElement('br'));

    const driftPercentageLabel = document.createElement('label');
    driftPercentageLabel.textContent = '   % drift';
    driftPercentageLabel.htmlFor = 'drift-percentage';

    const driftPercentageInput = document.createElement('input');
    driftPercentageInput.type = 'number';
    driftPercentageInput.id = 'drift-percentage';
    driftPercentageInput.min = 0;
    driftPercentageInput.max = 100;
    driftPercentageInput.value = 50;
    driftPercentageInput.style.marginBottom = '6px';
    sliderContainer.appendChild(driftPercentageInput);
    sliderContainer.appendChild(driftPercentageLabel);
    sliderContainer.appendChild(document.createElement('br'));

    const driftIntensityLabel = document.createElement('label');
    driftIntensityLabel.textContent = '   % intensity';
    driftIntensityLabel.htmlFor = 'drift-intensity';

    const driftIntensityInput = document.createElement('input');
    driftIntensityInput.type = 'number';
    driftIntensityInput.id = 'drift-intensity';
    driftIntensityInput.min = 0;
    driftIntensityInput.max = 100;
    driftIntensityInput.value = 50;
    driftIntensityInput.style.marginBottom = '6px';
    sliderContainer.appendChild(driftIntensityInput);
    sliderContainer.appendChild(driftIntensityLabel);
    sliderContainer.appendChild(document.createElement('br'));

    const driftButton = document.createElement('button');
    driftButton.textContent = 'drift';
    driftButton.style.position = 'absolute';
    driftButton.style.right = '22px';
    driftButton.style.top = '1px';
    driftButton.style.width = '87px';
    driftButton.style.height = '69px';
    driftButton.style.background = 'grey';

    sliderContainer.appendChild(driftButton);

    const slidersDiv = document.createElement('div');
    slidersDiv.className = 'sliders-div';
    sliderContainer.appendChild(slidersDiv);

    const sequencerDataInput = document.createElement('input');
    sequencerDataInput.type = 'hidden';
    sequencerDataInput.id = 'sequencer_data';
    sliderContainer.appendChild(sequencerDataInput);

    const skipDataInput = document.createElement('input');
    skipDataInput.type = 'hidden';
    skipDataInput.id = 'skip_data';
    sliderContainer.appendChild(skipDataInput);

    let previousSliderCount = parseInt(sliderCountInput.value, 10);

    const createSliders = (count) => {
        const existingValues = Array.from(slidersDiv.querySelectorAll('.sequencer-slider')).map(slider => slider.value);
        const existingCheckboxes = Array.from(slidersDiv.querySelectorAll('.sequencer-checkbox')).map(checkbox => checkbox.checked);
        slidersDiv.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const sliderLabel = document.createElement('label');
            sliderLabel.textContent = ``;
            sliderLabel.htmlFor = `slider-${i}`;
            slidersDiv.appendChild(sliderLabel);

            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `slider-${i}`;
            slider.className = 'sequencer-slider';
            slider.min = 0;
            slider.max = 1;
            slider.step = 0.01;
            slider.value = existingValues[i] !== undefined ? existingValues[i] : 0.5;
            slidersDiv.appendChild(slider);

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox-${i}`;
            checkbox.className = 'sequencer-checkbox';
            checkbox.checked = existingCheckboxes[i] !== undefined ? existingCheckboxes[i] : true;
            slidersDiv.appendChild(checkbox);

            const updateSequencerData = () => {
                const nodeParent = slider.closest('.node');
                const sequencerDataInput = nodeParent.querySelector('#sequencer_data');
                const skipDataInput = nodeParent.querySelector('#skip_data');
                const sliders = Array.from(nodeParent.querySelectorAll('.sequencer-slider'));
                const checkboxes = Array.from(nodeParent.querySelectorAll('.sequencer-checkbox'));
                let lastCheckedValue = sliders[0].value;
                const sliderValues = sliders.map((slider, index) => {
                    const checkbox = checkboxes[index];
                    if (checkbox.checked) {
                        lastCheckedValue = slider.value;
                        return slider.value;
                    } else {
                        return lastCheckedValue;
                    }
                });
                sequencerDataInput.value = sliderValues.join(' ');
                sequencerDataInput.dispatchEvent(new Event('change'));

                const checkboxValues = checkboxes.map(checkbox => checkbox.checked ? 1 : 0);
                skipDataInput.value = checkboxValues.join(' ');
                skipDataInput.dispatchEvent(new Event('change'));

                // Send update to WebSocket server
                sendUpdate({
                    type: 'updateInput',
                    deviceId: deviceDiv.id,
                    elementId: slider.id,
                    value: slider.value,
                    clientId: clientId
                });

                sendUpdate({
                    type: 'updateInput',
                    deviceId: deviceDiv.id,
                    elementId: checkbox.id,
                    value: checkbox.checked ? '1' : '0',
                    clientId: clientId
                });
            };

            slider.addEventListener('input', updateSequencerData);
            checkbox.addEventListener('change', updateSequencerData);
        }
    };

    const applyDrift = () => {
        const driftPercentage = parseInt(driftPercentageInput.value, 10) / 100;
        const driftIntensity = parseInt(driftIntensityInput.value, 10) / 100;
        const sliders = Array.from(slidersDiv.querySelectorAll('.sequencer-slider'));
    
        sliders.forEach((slider, index) => {
            if (Math.random() < driftPercentage) {
                const currentValue = parseFloat(slider.value);
                const randomValue = (Math.random() * 2 - 1) * driftIntensity; // generate a random value between -1 and 1, scaled by driftIntensity
                const newValue = currentValue + randomValue;
                slider.value = Math.max(0, Math.min(1, newValue)); // ensure the value stays within [0, 1]
                slider.dispatchEvent(new Event('input'));
            }
        });

        // Send update to WebSocket server
        sendUpdate({
            type: 'updateInput',
            deviceId: deviceDiv.id,
            elementId: driftButton.id,
            value: 'drift',
            clientId: clientId
        });
    };

    driftButton.addEventListener('click', applyDrift);

    sliderCountInput.addEventListener('change', (event) => {
        const count = parseInt(event.target.value, 10);
        if (isNaN(count) || count < 2) {
            sliderCountInput.value = previousSliderCount; // preserve the previous number of sliders
        } else {
            previousSliderCount = count;
            createSliders(count);
            // trigger change event on each slider to ensure sequencerDataInput is updated
            Array.from(slidersDiv.querySelectorAll('.sequencer-slider')).forEach(slider => {
                slider.dispatchEvent(new Event('input'));
            });

            // Send update to WebSocket server
            sendUpdate({
                type: 'updateInput',
                deviceId: deviceDiv.id,
                elementId: sliderCountInput.id,
                value: sliderCountInput.value,
                clientId: clientId
            });
        }
    });

    driftPercentageInput.addEventListener('change', (event) => {
        // Send update to WebSocket server
        sendUpdate({
            type: 'updateInput',
            deviceId: deviceDiv.id,
            elementId: driftPercentageInput.id,
            value: driftPercentageInput.value,
            clientId: clientId
        });
    });

    driftIntensityInput.addEventListener('change', (event) => {
        // Send update to WebSocket server
        sendUpdate({
            type: 'updateInput',
            deviceId: deviceDiv.id,
            elementId: driftIntensityInput.id,
            value: driftIntensityInput.value,
            clientId: clientId
        });
    });

    createSliders(previousSliderCount);
    deviceDiv.appendChild(sliderContainer);

    // expose the applyDrift function for external use
    deviceDiv.applyDrift = applyDrift;
}

function createQuantizerUI(deviceDiv) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const noteValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const quantizerContainer = document.createElement('div');
    quantizerContainer.className = 'quantizer-container';
    quantizerContainer.style.paddingLeft = '49px';
    quantizerContainer.style.paddingBottom = '10px';

    noteNames.forEach((note, index) => {
        const noteContainer = document.createElement('div');
        noteContainer.style.display = 'inline-block';
        noteContainer.style.textAlign = 'center';
        noteContainer.style.margin = '0 5px';

        const noteRectangle = document.createElement('div');
        noteRectangle.style.width = '20px';
        noteRectangle.style.height = '40px';
        noteRectangle.style.backgroundColor = note.includes('#') ? 'black' : 'white';
        noteRectangle.style.border = '1px solid black';
        noteRectangle.style.marginBottom = '5px';
        noteRectangle.style.color = 'grey';
        noteRectangle.style.display = 'flex';
        noteRectangle.style.alignItems = 'center';
        noteRectangle.style.justifyContent = 'center';
        noteRectangle.textContent = note;
        noteContainer.appendChild(noteRectangle);

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `checkbox-${note.replace('#', 'sharp')}`;
        checkbox.className = 'quantizer-checkbox';
        checkbox.style.width = '20px';
        checkbox.style.height = '20px';
        checkbox.style.position = 'relative';
        checkbox.style.left = '-3px';
        checkbox.checked = false;
        noteContainer.appendChild(checkbox);

        const updateQuantizerData = () => {
            const nodeParent = checkbox.closest('.node');
            const scaleDataInput = nodeParent.querySelector('#scale_data');
            const selectedNotes = Array.from(nodeParent.querySelectorAll('.quantizer-checkbox'))
                .map((checkbox, index) => checkbox.checked ? noteValues[index] : null)
                .filter(value => value !== null);

            const fullScale = noteValues.map((note, index) => {
                if (selectedNotes.length === 0) {
                    return noteValues[0]; // Default to the first note if no notes are selected
                } else if (selectedNotes.includes(note)) {
                    return note;
                } else {
                    let closestNote = selectedNotes.reduce((prev, curr) => {
                        const distancePrev = Math.min(Math.abs(prev - note), 12 - Math.abs(prev - note));
                        const distanceCurr = Math.min(Math.abs(curr - note), 12 - Math.abs(curr - note));
                        return distanceCurr < distancePrev ? curr : prev;
                    });
                    return closestNote;
                }
            });

            scaleDataInput.value = fullScale.join(' ');
            scaleDataInput.dispatchEvent(new Event('change'));

            // Send update to WebSocket server
            sendUpdate({
                type: 'updateInput',
                deviceId: deviceDiv.id,
                elementId: checkbox.id,
                value: checkbox.checked ? '1' : '0',
                clientId: clientId
            });
        };

        checkbox.addEventListener('change', updateQuantizerData);

        quantizerContainer.appendChild(noteContainer);
    });

    deviceDiv.appendChild(quantizerContainer);
}
/* END functions */

let isLocalAction = false;

const ws = new WebSocket('ws://nnirror.xyz:9314');

ws.onopen = () => {
    console.log('Connected to WebSocket server');
};

ws.onmessage = async (event) => {
    const blob = event.data;
    const update = await blob.text();
    const parsedUpdate = JSON.parse(update);

    // Ignore updates sent by this client
    if (parsedUpdate.clientId === clientId) {
        return;
    }

    // Apply the update based on its type
    switch (parsedUpdate.type) {
        case 'addDevice':
            isLocalAction = true;
            await createDeviceByName(parsedUpdate.filename, null, parsedUpdate.devicePosition);
            isLocalAction = false;
            break;
        case 'makeConnection':
            isLocalAction = true;
            startConnection(parsedUpdate.sourceDeviceId, parsedUpdate.sourceOutputIndex);
            finishConnection(parsedUpdate.targetDeviceId, parsedUpdate.inputIndex);
            isLocalAction = false;
            break;
        case 'deleteConnection':
            isLocalAction = true;
            deleteConnection(parsedUpdate.sourceDeviceId, parsedUpdate.targetDeviceId, parsedUpdate.sourceOutputIndex, parsedUpdate.inputIndex);
            isLocalAction = false;
            break;
        case 'moveDevice':
            isLocalAction = true;
            moveDevice(parsedUpdate.deviceId, parsedUpdate.devicePosition);
            isLocalAction = false;
            break;
        case 'updateInput':
            isLocalAction = true;
            updateInput(parsedUpdate.deviceId, parsedUpdate.inportTag ? parsedUpdate.inportTag : parsedUpdate.elementId, parsedUpdate.value);
            isLocalAction = false;
            break;
        case 'deleteDevice':
            isLocalAction = true;
            removeDeviceFromWorkspace(parsedUpdate.deviceId);
            isLocalAction = false;
            break;
        case 'duplicateDevices':
            isLocalAction = true;
            await reconstructDevicesAndConnections(parsedUpdate.deviceStates, null, true, true);
            isLocalAction = false;
            break;
        // Add more cases as needed
    }
};

async function sendUpdate(update) {
    if (!isLocalAction) {
        update.clientId = clientId;
        ws.send(JSON.stringify(update));
    }
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const clientId = generateUUID();

function deleteConnection(sourceDeviceId, targetDeviceId, sourceOutputIndex, inputIndex) {
    let sourceDevice = devices[sourceDeviceId];
    if (sourceDevice && sourceDevice.connections) {
        // find the connection in the source device's connections list
        let connection = sourceDevice.connections.find(conn => conn.target === targetDeviceId && conn.output === sourceOutputIndex && conn.input === inputIndex);
        if (connection) {
            try {
                // disconnect the connection
                connection.splitter.disconnect(devices[connection.target].device.node, connection.output, connection.input);
                // unset the signal connection state
                unsetSignalConnectionState(connection.target, connection.input);
                triggerChangeOnTargetDeviceInputs(connection.target);
            } catch (error) {}
            // remove the connection from the list
            sourceDevice.connections = sourceDevice.connections.filter(conn => conn !== connection);

            // remove the visual connection
            let jsPlumbConnection = jsPlumb.getConnections({ source: sourceDeviceId, target: targetDeviceId }).find(conn => conn.getId() === connection.id);
            if (jsPlumbConnection) {
                jsPlumb.deleteConnection(jsPlumbConnection);
            }
        }
    }
}

function moveDevice(deviceId, devicePosition) {
    const deviceDiv = document.getElementById(deviceId);
    if (deviceDiv) {
        deviceDiv.style.left = `${devicePosition.left}px`;
        deviceDiv.style.top = `${devicePosition.top}px`;
        jsPlumb.repaintEverything();
    }
}

function updateInput(deviceId, inportTag, value) {
    const deviceDiv = document.getElementById(deviceId);
    if (deviceDiv) {
        // find the input element based on its label text or position within the device container
        let inputElement = Array.from(deviceDiv.querySelectorAll('input, textarea')).find(input => {
            const label = deviceDiv.querySelector(`label[for="${input.id}"]`);
            return label && label.textContent.trim() === inportTag;
        });

        // fallback to look for an element inside the device with the ID equal to inportTag
        if (!inputElement) {
            inputElement = deviceDiv.querySelector(`#${inportTag}`);
        }

        if (inputElement) {
            inputElement.value = value;
            const event = new Event('change');
            inputElement.dispatchEvent(event);
        }

        // special handling for CodeMirror instances
        const codeMirrorElement = deviceDiv.querySelector('.CodeMirror');
        if (codeMirrorElement) {
            const codeMirrorInstance = codeMirrorElement.CodeMirror;
            if (codeMirrorInstance) {
                codeMirrorInstance.setValue(value);

                // briefly highlight the code after the value has been set
                let cursor = codeMirrorInstance.getCursor();
                let line = cursor.line;
                let first_line_of_block = getFirstLineOfBlock(line, codeMirrorInstance);
                let last_line_of_block = getLastLineOfBlock(line, codeMirrorInstance);
                codeMirrorInstance.setSelection({line: first_line_of_block, ch: 0 }, {line: last_line_of_block, ch: 10000 });
                setTimeout(function(){ codeMirrorInstance.setCursor({line: line, ch: cursor.ch }); }, 100);

                // dispatch a "change" event to the corresponding textarea
                const textarea = codeMirrorElement.previousElementSibling;
                if (textarea && textarea.tagName.toLowerCase() === 'textarea' && textarea.id === 'pattern') {
                    textarea.value = codeMirrorInstance.getValue();
                    textarea.dispatchEvent(new Event('change'));
                }
            }
        }

        // special handling for touchpad
        if (inportTag === 'touchpadX' || inportTag === 'touchpadY') {
            const touchpad = deviceDiv.querySelector('.touchpad');
            const indicator = deviceDiv.querySelector('.touchpadIndicator');
            const inputX = deviceDiv.querySelector('#touchpadX');
            const inputY = deviceDiv.querySelector('#touchpadY');

            if (touchpad && indicator && inputX && inputY) {
                const x = parseFloat(inputX.value);
                const y = parseFloat(inputY.value);
                const rect = touchpad.getBoundingClientRect();
                indicator.style.left = `${x * rect.width}px`;
                indicator.style.top = `${(1 - y) * rect.height}px`;

                // Update the silenceGeneratorX and silenceGeneratorY values
                const silenceGeneratorX = devices[deviceId].silenceGeneratorX;
                const silenceGeneratorY = devices[deviceId].silenceGeneratorY;
                silenceGeneratorX.offset.value = x;
                silenceGeneratorY.offset.value = y;
            }
        }

        // special handling for toggle button
        if (inportTag === 'toggleHiddenInput') {
            const toggleButton = deviceDiv.querySelector('.toggle-button');
            const hiddenInput = deviceDiv.querySelector('#toggleHiddenInput');

            if (toggleButton && hiddenInput) {
                hiddenInput.value = value;
                const newValue = parseFloat(value);
                const silenceGenerator = devices[deviceId].silenceGenerator;
                silenceGenerator.offset.value = newValue;

                if (newValue === 1) {
                    toggleButton.className = 'toggle-button toggle-on';
                    toggleButton.textContent = 'on';
                } else {
                    toggleButton.className = 'toggle-button toggle-off';
                    toggleButton.textContent = 'off';
                }
            }
        }

        // special handling for button
        if (inportTag === 'buttonHiddenInput') {
            const button = deviceDiv.querySelector('.button-ui');
            const hiddenInput = deviceDiv.querySelector('#buttonHiddenInput');

            if (button && hiddenInput) {
                hiddenInput.value = value;
                const newValue = parseFloat(value);
                const silenceGenerator = devices[deviceId].silenceGenerator;
                silenceGenerator.offset.value = newValue;

                if (newValue === 1) {
                    button.style.color = 'white';
                } else {
                    button.style.color = 'black';
                }
            }
        }

        // special handling for keyboard keys
        if (inportTag.startsWith('id-')) {
            const keyDiv = deviceDiv.querySelector(`.pianoKey[data-value="${inportTag.slice(3)}"]`);
            if (keyDiv) {
                const newValue = parseFloat(value);
                const silenceGenerator = devices[deviceId].silenceGenerator;
                const triggerSource = devices[deviceId].triggerSource;

                if (newValue === 1) {
                    keyDiv.style.backgroundColor = 'yellow';
                    function midiToFrequency(midiNote) {
                        return 440 * Math.pow(2, (midiNote - 69) / 12);
                    }
                    const freq = midiToFrequency(parseInt(inportTag.slice(3)));
                    silenceGenerator.offset.value = freq;
                    triggerSource.offset.setValueAtTime(1, context.currentTime);
                    triggerSource.offset.setValueAtTime(0, context.currentTime + 0.1); // briefly output 1
                } else {
                    keyDiv.style.backgroundColor = keyDiv.dataset.color === 'white' ? 'white' : 'black';
                }
            }
        }

        // special handling for quantizer checkboxes
        if (inportTag.startsWith('checkbox-')) {
            const checkbox = document.getElementById(inportTag);
            if (checkbox) {
                checkbox.checked = value === '1';
                const event = new Event('change');
                checkbox.dispatchEvent(event);
            }
        }

        // special handling for sequencer sliders, number of steps, % drift, % intensity, and drift button
        if (inportTag.startsWith('slider-') || inportTag.startsWith('checkbox-') || inportTag === 'slider-count' || inportTag === 'drift-percentage' || inportTag === 'drift-intensity' || inportTag === 'drift-button') {
            const element = document.getElementById(inportTag);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value === '1';
                } else {
                    element.value = value;
                }
                const event = new Event('change');
                element.dispatchEvent(event);
            }
        }

        // special handling for scopeMin and scopeMax inputs
        if (inportTag === 'scopeMin' || inportTag === 'scopeMax') {
            const element = document.getElementById(inportTag);
            if (element) {
                element.value = value;
                const event = new Event('change');
                element.dispatchEvent(event);
            }
        }
    }
}