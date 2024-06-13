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
    category = params.get('category');

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
            svgElement.prepend(circleGroup); // Add the group as the first child of the SVG


            // Process each line (assuming no header and x, y are in fields 2 and 3)
            let index = 0;
            const batchSize = 50; // Number of circles to add in each batch
            const intervalId = setInterval(() => {
                for (let i = 0; i < batchSize && index < lines.length; i++) {
                    const line = lines[index];
                    const fields = line.split(',');
                    if (fields.length >= 3) {
                        const x = parseFloat(fields[1]);
                        const y = parseFloat(fields[3]);



                        if (!isNaN(x) && !isNaN(y)) {
                            tx = ((x + 49985) * 83 / 4096)
                            ty = ((y + 24105) * 83 / 4096)


                            addCircleToSVG(circleGroup, tx, 2048 - ty);
                        }
                    }
                    index++;
                }
                if (index >= lines.length) {
                    clearInterval(intervalId); // Stop interval when all circles are added
                }
            }, 0); // Interval of 0ms (no delay)
        }
    } catch (error) {
        console.error('Error fetching coordinates:', error);
    }
}

function addCircleToSVG(svgElement, x, y) {
    const newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    newCircle.setAttribute('cx', x);
    newCircle.setAttribute('cy', y);
    newCircle.setAttribute('r', '2'); // radius of 5 units
    newCircle.setAttribute('fill', 'red');

    svgElement.appendChild(newCircle);
    console.log(`Added circle at (${x}, ${y})`);
}
