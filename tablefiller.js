

function toggleMaterials() {
    const columns = document.querySelectorAll('.materials');
    columns.forEach(column => {
        if (column.classList.contains('hidden')) {
            console.log('Column is hidden');
            column.classList.remove('hidden');
        } else {
            column.classList.add('hidden');
            console.log('Column is visible');
        }
    });
}


document.addEventListener('recordSelected', function (event) {
    console.log('Event Received: Selected Record:', selectedRecord);
    const apiUrl = 'https://us-central1-canonn-api-236217.cloudfunctions.net/query/codex/bodies'; // API endpoint
    let currentPage = 1;
    const rowsPerPage = 10;
    let lastPage = false;

    function fetchData(page) {
        const offset = (page - 1) * rowsPerPage;
        fetch(`${apiUrl}?english_name=${selectedRecord.english_name}&limit=${rowsPerPage}&offset=${offset}`)
            .then(response => response.json())
            .then(data => {
                const dataLength = Object.keys(data).length;
                if (dataLength < rowsPerPage) {
                    lastPage = true; // If fewer items are returned, this is the last page
                } else {
                    lastPage = false; // Otherwise, we assume there are more pages
                }
                populateTable(data);
                setupPagination(page);
            })
            .catch(error => console.error('Error fetching data:', error));
    }


    function populateTable(data) {
        const tableBody = document.getElementById('table-body');
        tableBody.innerHTML = ''; // Clear existing data

        data.forEach((system, index) => {


            const row = document.createElement('tr');

            checkmark = '<span class="red-cross">&#10006;</span>'
            if (system.complete = 'Y') {
                checkmark = '<span class="green-tick">&#10004;</span>'
            }

            //if (system.atmosphereComposition == null) {
            //    system.atmosphereComposition = {}
            //}

            //if (system.materials == null) {
            //    system.materials = {}
            //}
            //const antimonyMaterial = system.materials.find(material => material.key === 'Antimony');
            const AntimonyMaterial = system.materials?.["Antimony"] ?? 0;
            const ArsenicMaterial = system.materials?.["Arsenic"] ?? 0;
            const CadmiunMaterial = system.materials?.["Cadmiun"] ?? 0;
            const CarbonMaterial = system.materials?.["Carbon"] ?? 0;
            const ChromiumMaterial = system.materials?.["Chromium"] ?? 0;
            const GermaniumMaterial = system.materials?.["Germanium"] ?? 0;
            const IronMaterial = system.materials?.["Iron"] ?? 0;
            const ManganeseMaterial = system.materials?.["Manganese"] ?? 0;
            const MercuryMaterial = system.materials?.["Mercury"] ?? 0;
            const MolybdenumMaterial = system.materials?.["Molybdenum"] ?? 0;
            const NickelMaterial = system.materials?.["Nickel"] ?? 0;
            const NiobiumMaterial = system.materials?.["Niobium"] ?? 0;
            const PhospherousMaterial = system.materials?.["Phospherous"] ?? 0;
            const PoloniumMaterial = system.materials?.["Polonium"] ?? 0;
            const RutheniumMaterial = system.materials?.["Ruthenium"] ?? 0;
            const SeleniumMaterial = system.materials?.["Selenium"] ?? 0;
            const SulpherMaterial = system.materials?.["Sulpher"] ?? 0;
            const TechnetiumMaterial = system.materials?.["Technetium"] ?? 0;
            const TelluriumMaterial = system.materials?.["Tellurium"] ?? 0;
            const TinMaterial = system.materials?.["Tin"] ?? 0;
            const TungstenMaterial = system.materials?.["Tungsten"] ?? 0;
            const VanadiumMaterial = system.materials?.["Vanadium"] ?? 0;
            const ZincMaterial = system.materials?.["Zinc"] ?? 0;
            const ZirconiumMaterial = system.materials?.["Zirconium"] ?? 0;


            row.innerHTML = `
                <!--td>${(currentPage - 1) * rowsPerPage + index + 1}</td-->
                <td>${system.id}</td>
                <td>${checkmark}</td>   
                <td class="nowrap-cell"><a href="https://signals.canonn.tech?system=${system.systemName}">${system.systemName}</a> ${system.body}</td>
                <td>${system.star_class}</td>
                <td>${system.star_types}</td>
                <td>${system.bodyType}</td>
                <td>${system.atmosphereType}</td>
                <td>${JSON.stringify(system.atmosphereComposition)}</td>
                <td>${system.volcanismType}</td>
                <td>${system.distanceToArrival}</td>
                <td>${system.orbitalEccentricity}</td>
                <td>${system.temperature}</td>
                <td>${system.gravity}</td>
                
                <td class="materials hidden">${AntimonyMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${PoloniumMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${RutheniumMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${SeleniumMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${TechnetiumMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${TelluriumMaterial.toFixed(2)}%</td>


                <td class="materials hidden">${CadmiunMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${MercuryMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${MolybdenumMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${NiobiumMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${TinMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${VanadiumMaterial.toFixed(2)}%</td>

                <td class="materials hidden">${ArsenicMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${ChromiumMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${GermaniumMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${ManganeseMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${PhospherousMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${TungstenMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${ZincMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${ZirconiumMaterial.toFixed(2)}%</td>

                <td class="materials hidden">${CarbonMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${IronMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${NickelMaterial.toFixed(2)}%</td>
                <td class="materials hidden">${SulpherMaterial.toFixed(2)}%</td>
                
                
                
                <td>${system.cmdr}</td>
                <td>${system.reported_at}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    function setupPagination(currentPage) {
        const pagination = document.getElementById('pagination');
        pagination.innerHTML = ''; // Clear existing pagination

        // Previous Button
        const prevLi = document.createElement('li');
        prevLi.classList.add('page-item');
        if (currentPage === 1) {
            prevLi.classList.add('disabled');
        }
        prevLi.innerHTML = `<a class="page-link" href="#">Previous</a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                fetchData(currentPage);
            }
        });
        pagination.appendChild(prevLi);

        // Next Button
        const nextLi = document.createElement('li');
        nextLi.classList.add('page-item');
        if (lastPage) {
            nextLi.classList.add('disabled');
        }
        nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (!lastPage) {
                currentPage++;
                fetchData(currentPage);
            }
        });
        pagination.appendChild(nextLi);
    }

    // Initial data fetch
    fetchData(currentPage);
});
