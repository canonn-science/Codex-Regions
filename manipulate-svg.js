document.addEventListener('DOMContentLoaded', () => {
    const svgContainer = document.getElementById('svg-container');

    // Load the SVG file
    fetch('RegionMap.svg')
        .then(response => response.text())
        .then(svgText => {
            // Insert the SVG into the container
            svgContainer.innerHTML = svgText;

            // After loading SVG, fetch coordinates and add circles
            fetchCoordinatesAndAddCircles(svgContainer); // Pass svgContainer as an argument

            // Add region zoom event listeners
            const svgElement = svgContainer.querySelector('svg');
            if (svgElement) {
                setupRegionZoom(svgElement);
            }
        })
        .catch(error => console.error('Error fetching the SVG:', error));
});

// Store zoom state
let isZoomed = false;
let originalViewBox = null;
let currentZoomRegion = null;

// Helper for dot scaling (must be defined before use)
function getCurrentZoomScale(svgElement) {
    // Returns the scale factor between the original and current viewBox
    if (!originalViewBox) return 1;
    const orig = originalViewBox.split(' ').map(Number);
    const currViewBox = svgElement.getAttribute('viewBox');
    if (!currViewBox) return 1;
    const curr = currViewBox.split(' ').map(Number);
    // Assume square SVG
    return orig[2] / curr[2];
}

function setupRegionZoom(svgElement) {
    // Save the original viewBox
    originalViewBox = svgElement.getAttribute('viewBox');
    // Add click listeners to all region paths
    const regions = svgElement.querySelectorAll('path.region');
    regions.forEach(region => {
        region.style.cursor = 'pointer';
        region.addEventListener('click', function (evt) {
            if (!isZoomed) {
                evt.stopPropagation(); // Only stop propagation when zooming in
                zoomToRegion(svgElement, region);
            }
            // If already zoomed, allow event to bubble to SVG for zoom out
        });
    });
    // Click anywhere else to zoom out
    svgElement.addEventListener('click', function () {
        if (isZoomed) {
            zoomOut(svgElement);
        }
    });
}

function zoomToRegion(svgElement, region) {
    // Get bounding box of the region
    const bbox = region.getBBox();
    // Find the longest axis
    const maxDim = Math.max(bbox.width, bbox.height);
    // Center the viewBox on the region
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    // Set new viewBox so the region fills the SVG
    let newViewBox;
    if (bbox.width > bbox.height) {
        // Fill horizontally
        newViewBox = `${bbox.x} ${cy - maxDim / 2} ${maxDim} ${maxDim}`;
    } else {
        // Fill vertically
        newViewBox = `${cx - maxDim / 2} ${bbox.y} ${maxDim} ${maxDim}`;
    }
    svgElement.setAttribute('viewBox', newViewBox);
    isZoomed = true;
    currentZoomRegion = region;
    // Rescale dots
    rescaleAllDots(svgElement);
}

function zoomOut(svgElement) {
    if (originalViewBox) {
        svgElement.setAttribute('viewBox', originalViewBox);
    }
    isZoomed = false;
    currentZoomRegion = null;
    // Rescale dots
    rescaleAllDots(svgElement);
}



function rescaleAllDots(svgElement) {
    // Find all circles with class 'location-dot'
    const circles = svgElement.querySelectorAll('circle.location-dot');
    const scale = getCurrentZoomScale(svgElement);
    circles.forEach(circle => {
        circle.setAttribute('r', (4 / scale).toString()); // Always same size
    });
}

async function fetchCoordinatesAndAddCircles(svgContainer) {
    //const coordinatesUrl = 'https://storage.googleapis.com/canonn-downloads/dumpr/Biology/2420703.csv';
    //const coordinatesUrl = 'https://storage.googleapis.com/canonn-downloads/dumpr/Biology/2310313.csv';

    url = new URL(window.location.href);
    // Extract the query parameters
    params = new URLSearchParams(url.search);
    // Get the value of the 'entryid' parameter
    entryid = params.get('entryid');
    category = params.get('hud_category') || params.get('category');

    console.log(url);
    console.log(params);
    console.log(entryid);


    if (entryid == null) {
        return;
    }

    coordinatesUrl = 'https://storage.googleapis.com/canonn-downloads/dumpr/' + category + '/' + entryid + '.csv';

    try {
        const response = await fetch(coordinatesUrl);
        const csvText = await response.text();
        const svgElement = svgContainer.querySelector('svg');

        if (svgElement) {
            // Split CSV text into lines
            const lines = csvText.trim().split('\n');
            const circleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            circleGroup.setAttribute('id', 'dot-group');
            svgElement.appendChild(circleGroup); // Add the group as the last child of the SVG

            // Process each line (assuming no header and x, y are in fields 2 and 3)
            let index = 0;
            const batchSize = 1000; // Number of circles to add in each batch
            const intervalId = setInterval(() => {
                for (let i = 0; i < batchSize && index < lines.length; i++) {
                    const line = lines[index];
                    const fields = line.split(',');
                    if (fields.length >= 3) {
                        const x = parseFloat(fields[1]);
                        const y = parseFloat(fields[3]);
                        const title = fields[0]
                        const cRegion = fields[6]
                        const bRegion = fields[7]

                        var regionElement = svgElement.getElementById("Region_" + cRegion.padStart(2, '0'));
                        // Highlight region in orange if it has a dot
                        if (regionElement) {
                            regionElement.classList.add('highlighted');
                        }

                        if (!isNaN(x) && !isNaN(y)) {
                            tx = ((x + 49985) * 83 / 4096)
                            ty = ((y + 24105) * 83 / 4096)

                            addCircleToSVG(circleGroup, svgElement, tx, 2048 - ty, title);
                        }
                    }
                    index++;
                }
                if (index >= lines.length) {
                    clearInterval(intervalId); // Stop interval when all circles are added
                }
            }, 0); // Interval of 0ms (no delay)
            var paths = svgElement.querySelectorAll('.borderlines');
            paths.forEach(function (path) {
                svgElement.appendChild(path); // Move each text element to the end of the SVG
                path.style.pointerEvents = "none";
            });

            var texts = svgElement.querySelectorAll('text');

            texts.forEach(function (text) {
                svgElement.appendChild(text); // Move each text element to the end of the SVG
                text.style.pointerEvents = "none";
            });
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
    }
}

function showTooltip(evt, text) {
    let tooltip = document.getElementById("tooltip");
    tooltip.innerHTML = text;
    tooltip.style.display = "block";
    tooltip.style.left = evt.pageX + 10 + 'px';
    tooltip.style.top = evt.pageY + 10 + 'px';
}

function hideTooltip() {
    var tooltip = document.getElementById("tooltip");
    tooltip.style.display = "none";
}


function addCircleToSVG(parent, svgElement, x, y, hoverText) {
    const svgns = 'http://www.w3.org/2000/svg';
    // Create circle element
    const newCircle = document.createElementNS(svgns, 'circle');
    newCircle.setAttribute('cx', x);
    newCircle.setAttribute('cy', y);
    // Scale radius based on zoom
    let scale = getCurrentZoomScale(svgElement);
    if (!scale || isNaN(scale)) scale = 1;
    newCircle.setAttribute('r', (4 / scale).toString()); // Always appear same size, half previous
    newCircle.setAttribute('fill', '#b30000'); // Less bright red
    newCircle.setAttribute('fill-opacity', '0.5'); // 50% transparency
    newCircle.classList.add('location-dot');
    // Append circle element to group
    parent.appendChild(newCircle);
    // Event listener on SVG element to handle mouseover and mouseout events
    parent.addEventListener('mouseover', function (event) {
        if (event.target === newCircle) {
            showTooltip(event, hoverText);
        }
    });
    parent.addEventListener('mouseout', function (event) {
        if (event.target === newCircle) {
            hideTooltip();
        }
    });

    // Add click handlers for zoom, right click, and middle click
    newCircle.addEventListener('click', function (event) {
        console.log('Dot click event:', event, 'isZoomed:', isZoomed, 'hoverText:', hoverText);
        event.stopPropagation();
        // Always use the root SVG for region logic
        const svgRoot = svgElement.ownerSVGElement || svgElement;
        // Find the region under this dot
        let regionElem = null;
        const pt = svgRoot.createSVGPoint();
        pt.x = x;
        pt.y = y;
        const regions = svgRoot.querySelectorAll('path.region');
        for (const region of regions) {
            if (region.isPointInFill ? region.isPointInFill(pt) : region.getBBox().x <= x && region.getBBox().y <= y && region.getBBox().x + region.getBBox().width >= x && region.getBBox().y + region.getBBox().height >= y) {
                regionElem = region;
                break;
            }
        }
        if (!isZoomed && regionElem) {
            console.log('Zooming in to region:', regionElem);
            zoomToRegion(svgRoot, regionElem);
        } else if (isZoomed) {
            console.log('Zooming out');
            zoomOut(svgRoot);
        }
    });
    newCircle.addEventListener('contextmenu', function (event) {
        console.log('Dot right click event:', event, 'hoverText:', hoverText);
        event.preventDefault();
        // Right click: open signals.canonn.tech
        window.open(`https://signals.canonn.tech/?system=${encodeURIComponent(hoverText)}`);
    });
    newCircle.addEventListener('mousedown', function (event) {
        if (event.button === 1) {
            console.log('Dot middle click event:', event, 'hoverText:', hoverText);
            event.preventDefault();
            if (navigator.clipboard) {
                navigator.clipboard.writeText(hoverText);
            } else {
                // fallback for older browsers
                const tempInput = document.createElement('input');
                tempInput.value = hoverText;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
            }
        }
    });
}
