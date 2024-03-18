//////////////////////////////////////////////////
// Map
//////////////////////////////////////////////////
// Create a new map instance based on the 'template' defined in CreateMap.js
function GetMapMyFirstDT() {
    new GetMap(center=[4.3729677,52.0890383],zoom=14).then((map) => {
        //////////////////////////////////////////////////
        // Geoserver setup
        //////////////////////////////////////////////////
        // Set up 'connection' to the geoserver to use the data as WFS --  algemene geoserver endpoint
        url = 'https://app-geoserver.azurewebsites.net/geoserver/ows?service=wfs&version=1.0.0&request=GetCapabilities'

        client_geoserver = new atlas.io.ogc.WfsClient({
            url: url,
        });

        //////////////////////////////////////////////////
        // add layers, events, etc. 
        //////////////////////////////////////////////////

        const menuContainer = document.getElementById("sidebar-menu-generatedlist");
        const legendContainer = document.getElementById("sidebar-legend-generated");
        createMenuLegendFromMetadata(menuContainer,legendContainer)
    })
}

/////////////////////////////////////////////////////////
// Functionality / Implementations specific to this tab
//     General functionality: shared/blueprints/*/static/js/
//     Customer specific, but not tab specific: [name]/static/js/functionality.js
/////////////////////////////////////////////////////////