document.addEventListener('DOMContentLoaded', () => {
    const svgContainer = document.getElementById('svg-container');
    const svgElement = svgContainer.querySelector('svg');

    fetchCSVAndDrawCircles('https://storage.googleapis.com/canonn-downloads/dumpr/Biology/2420703.csv', svgElement);
});

async function fetchCSVAndDrawCircles(url, svgElement) {
    const response = await fetch(url);
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop(); // Save the last incomplete line for the next iteration

        for (const line of lines) {
            const [systemname, x, y, z, id64] = line.split(',');
            if (x && y) {
                addCircleToSVG(svgElement, parseFloat(x), parseFloat(y));
            }
        }
    }

    // Process any remaining data in the buffer
    if (buffer) {
        const [systemname, x, y, z, id64] = buffer.split(',');
        if (x && y) {
            addCircleToSVG(svgElement, parseFloat(x), parseFloat(y));
        }
    }
}

function addCircleToSVG(svgElement, x, y) {
    const newCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    newCircle.setAttribute('cx', x);
    newCircle.setAttribute('cy', y);
    newCircle.setAttribute('r', '5'); // radius of 5 units
    newCircle.setAttribute('fill', 'red');

    svgElement.appendChild(newCircle);
    console.log(`Added circle at (${x}, ${y})`);
}
