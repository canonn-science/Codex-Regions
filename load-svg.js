document.addEventListener('DOMContentLoaded', () => {
    const svgContainer = document.getElementById('svg-container');
    console.log("load-svg.js: DOMContentLoaded event fired");

    fetch('RegionMap.svg')
        .then(response => response.text())
        .then(svgText => {
            svgContainer.innerHTML = svgText;

            // Dispatch a custom event to notify that the SVG is loaded
            const event = new Event('svgLoaded');
            console.log("load-svg.js: SVG loaded, dispatching svgLoaded event");
            document.dispatchEvent(event);
        })
        .catch(error => console.error('Error fetching the SVG:', error));
});
