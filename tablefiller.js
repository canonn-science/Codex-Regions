

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

        const keys = Object.keys(data);
        data.forEach((system, index) => {


            const row = document.createElement('tr');

            checkmark = '<span class="red-cross">&#10006;</span>'
            if (system.complete = 'Y') {
                checkmark = '<span class="green-tick">&#10004;</span>'
            }

            row.innerHTML = `
                <!--td>${(currentPage - 1) * rowsPerPage + index + 1}</td-->
                <td>${system.id}</td>
                <td>${checkmark}</td>   
                <td class="nowrap-cell"><a href="https://signals.canonn.tech?system=${system.systemName}">${system.systemName}</a> ${system.body}</td>
                <td>${system.star_class}</td>
                <td>${system.star_types}</td>
                <td>${system.bodyType}</td>
                <td>${system.atmosphereType}</td>
                <td>${system.atmosphereComposition}</td>
                <td>${system.volcanismType}</td>
                <td>${system.distanceToArrival}</td>
                <td>${system.orbitalEccentricity}</td>
                <td>${system.temperature}</td>
                <td>${system.gravity}</td>
                <td>${system.materials}</td>
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
