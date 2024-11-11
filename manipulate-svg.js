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
        })
        .catch(error => console.error('Error fetching the SVG:', error));
});

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
            var regionText = svgElement.getElementById("Region_text_01");
            svgElement.append(circleGroup); // Add the group as the first child of the SVG


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
                        // Check if the element exists
                        if (regionElement) {
                            // Set the fill-opacity to 50%
                            regionElement.style.fillOpacity = "0.5";
                        }

                        if (!isNaN(x) && !isNaN(y)) {
                            tx = ((x + 49985) * 83 / 4096)
                            ty = ((y + 24105) * 83 / 4096)


                            addCircleToSVG(svgElement, circleGroup, tx, 2048 - ty, title);
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
    newCircle.setAttribute('r', '8'); // Adjust radius as needed
    newCircle.setAttribute('fill', 'red');
    newCircle.setAttribute('fill-opacity', '0.5'); // 50% transparency

    // Add click event listener to copy the title to the clipboard
    newCircle.addEventListener('click', () => {
        navigator.clipboard.writeText(hoverText).then(() => {
            console.log(`Copied to clipboard: ${systemName}`);
        }).catch(err => {
            console.error('Could not copy text: ', err);
        });
    });

    // Append circle element to SVG
    svgElement.appendChild(newCircle);

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

    //console.log(`Added circle at (${x}, ${y}) with hover text "${hoverText}"`);
}
