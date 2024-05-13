function init() {
    var metadatatabel = getMetaData()
    var input = document.getElementById("filter");
    input.addEventListener("input", function() {
        filterTable(this.value);
    });
}
init();

function getMetaData(){
    // return fetch('http://localhost:7071/api/func-smartcityalkmaar-metadata?l=all', {
    fetch('https://func-smartcityalkmaar-metadata.azurewebsites.net/api/func-smartcityalkmaar-metadata?l=all',{
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    }).then((r) => r.text())
    .then((jsonData) => {
        // console.log(jsonData)
    
        // Parse the string into a JavaScript object
        const parsedData = JSON.parse(jsonData);

        // Get a reference to the HTML table container
        const tableContainer = document.getElementById("metaTableBody");

        // Generate the HTML table code dynamically
        let tableHTML = '';
        
        for (const thema in parsedData) {
            // console.log(thema)
            if (parsedData.hasOwnProperty(thema)) {
                for (const item of parsedData[thema].items) {
                  if(item.dekking === null) {
                    item.dekking = '-'
                  }
                  if(item.omschrijving == '') {
                    item.omschrijving = '-'
                  }
                  let classes = 'source';
                  if(item.bron === 'niet aangeleverd') {
                    classes = ''
                  }
                  tableHTML += `<tr>
                      <td style="max-width: 7em;">${item.allThemes}</button></td>  <!-- thema -->
                      <td>${item.layerDisplayName}</td>                         <!-- Datalaag naam -->
                      <td style="max-width: 20em;">${item.omschrijving}</td>    <!-- Omschrijving -->
                      <td style="min-width: 5em;">${item.type}</td>             <!-- Type -->
                      <td class="${classes}" data-title="${item.bron}" onclick="copySource(this)" >
                        <div class="ellipsis">
                          ${item.bron} <!-- Bron -->
                        </div>
                      </td>
                      <td style="min-width: 11em;">${item.laatsteUpdateDatum}</td> <!-- Laatste update -->
                      <td>${item.dekking}</td>                                  <!-- dekking -->
                      <td>${item.bewerking}</td>                                <!-- databewerking -->
                  </tr>`;
                }
            }
        }

        // Set the generated HTML code inside the table container
        document.querySelector('#spinner-container').remove();
        tableContainer.insertAdjacentHTML('beforeend',tableHTML);
    });
}

// Convert tekst to link, if valid url:
// Get a reference to the table and its rows
var table = document.getElementById("metaDataTable");
var rows = table.rows;

// Loop over the rows of the table (excluding the header row)
for (var i = 1; i < rows.length; i++) {
  var cells = rows[i].cells;
  var cell = cells[4]; // Replace 2 with the index of the column you want to convert to a link

  // Check if the cell contains a valid URL
  var urlRegex = /(http(s)?:\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?)/g;
  var text = cell.textContent.trim();
  if (text.match(urlRegex)) {
    // Create a link tag and set its href to the URL
    var link = document.createElement("a");
    link.href = text;
    link.textContent = text;

    // Set the link tag as the contents of the table cell
    cell.innerHTML = link.outerHTML;
  }
}

function filterTable(query) {
  var table = document.getElementById("metaDataTable");
  var rows = table.getElementsByTagName("tr");
  for (var i = 1; i < rows.length; i++) {
    var shouldDisplayRow = false;
    var cells = rows[i].getElementsByTagName("td");
    for (var j = 0; j < cells.length; j++) {
      var cell = cells[j];
      if (cell) {
        var text = cell.textContent || cell.innerText;
        text = text.toLowerCase(); // Convert the text to lowercase
        query = query.toLowerCase(); // Convert the query to lowercase

        var queryKeywords = query.split(/\s+/); // Split the query into keywords based on whitespace
        for (var k = 0; k < queryKeywords.length; k++) {
          var keyword = queryKeywords[k].trim();
          if (text.indexOf(keyword) > -1) {
            shouldDisplayRow = true;
            break; // Stop checking the current keyword if a match is found
          }
        }
        if (shouldDisplayRow) {
          break; // Stop checking the remaining cells in the row if a match is found
        }
      }
    }
    if (shouldDisplayRow) {
      rows[i].style.display = "";
    } else {
      rows[i].style.display = "none";
    }
  }
}

function sortTable(n) {
  var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
  table = document.getElementById("metaDataTable");
  switching = true;
  dir = "asc";

  document.getElementById("sort"+n).innerText = String.fromCharCode(0x25BC); // uparrow

  while (switching) {
    switching = false;
    rows = table.rows;
    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("TD")[n];
      y = rows[i + 1].getElementsByTagName("TD")[n];
      if (dir == "asc") {
        if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
          shouldSwitch= true;
          break;
        }
      } else if (dir == "desc") {
        if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
          shouldSwitch= true;
          break;
        }
      }
    }
    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
      switchcount ++;
    } else {
      if (switchcount == 0 && dir == "asc") {
        dir = "desc";
        document.getElementById("sort"+n).innerText = String.fromCharCode(0x25B2); // downarrow
        switching = true;
      }
    }
  }
}

// sortTable(2)

function copySource(source) {
  navigator.clipboard.writeText(source.dataset.title);
  source.classList.add('source-copy');
  setTimeout(function(){
    source.classList.remove('source-copy');
  },2500);
}

