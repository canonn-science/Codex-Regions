let codexData = {};

async function fetchData() {
    const response = await fetch('https://us-central1-canonn-api-236217.cloudfunctions.net/query/codex/ref');
    codexData = await response.json();
    checkURLParameters();
}

function searchCodex() {
    const query = document.getElementById('search-box').value.toLowerCase();
    const results = Object.values(codexData)
        .filter(item => item.english_name.toLowerCase().includes(query))
        .sort((a, b) => a.english_name.localeCompare(b.english_name))
        .slice(0, 10);

    displayResults(results);
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results-container');
    resultsDiv.innerHTML = '';
    if (results.length === 0) {
        resultsDiv.style.display = 'none';
        return;
    }
    results.forEach(item => {
        const div = document.createElement('div');
        div.classList.add('result-item');
        div.textContent = item.english_name;
        div.onclick = () => selectItem(item);
        resultsDiv.appendChild(div);
    });
    resultsDiv.style.display = 'block';
}

function selectItem(item) {
    document.getElementById('search-box').value = item.english_name;
    displaySelectedRecord(item);
    document.getElementById('results-container').style.display = 'none';
}

function displaySelectedRecord(item) {
    const recordDiv = document.getElementById('selected-record');
    recordDiv.innerHTML = `
    <h3>${item.english_name}</h3>
    <p><strong>Category:</strong> ${item.category}</p>
    <p><strong>Sub Category:</strong> ${item.sub_category}</p>
    <p><strong>Sub Class:</strong> ${item.sub_class}</p>
    <p><strong>Entry ID:</strong> ${item.entryid}</p>
    <p><strong>HUD Category:</strong> ${item.hud_category}</p>
    <p><strong>Platform:</strong> ${item.platform}</p>
    <p><strong>Reward:</strong> ${item.reward}</p>
    <p><a href="${item.dump}" target="_blank">Download Dump</a></p>
  `;
    recordDiv.style.display = 'block';
}

function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        entryid: params.get('entryid'),
        hud_category: params.get('hud_category')
    };
}

function checkURLParameters() {
    const { entryid, hud_category } = getQueryParams();
    if (entryid && hud_category) {
        const selectedItem = Object.values(codexData).find(item => item.entryid == entryid && item.hud_category === hud_category);
        if (selectedItem) {
            selectItem(selectedItem);
        }
    }
}

function submitSearch() {
    const searchBox = document.getElementById('search-box');
    const selectedItem = Object.values(codexData).find(item => item.english_name.toLowerCase() === searchBox.value.toLowerCase());
    if (selectedItem) {
        window.location.href = `?entryid=${selectedItem.entryid}&hud_category=${selectedItem.hud_category}`;
    } else {
        alert('Please select a valid item from the list.');
    }
}

window.onload = fetchData;
