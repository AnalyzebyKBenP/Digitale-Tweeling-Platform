// Do _NOT_ call GetMap()
// Instead, instanciating a new map happens by:
    // new GetMap().then((map) => {
    //     // add layers, events, etc. 
    // })
function GetMap(center=[4.72,52.45],zoom=10,bearing=0,pitch=0,startingMap=1,AzureMapsClientId='d7c4f1bc-92ff-45de-8265-43ea84713a96') {
    if (sessionStorage.getItem('camera') !== null) {
        var c = JSON.parse(sessionStorage.getItem('camera'))[0]
        var z = JSON.parse(sessionStorage.getItem('camera'))[1]
        var b = JSON.parse(sessionStorage.getItem('camera'))[2]
        var p = JSON.parse(sessionStorage.getItem('camera'))[3]
        // console.log('Map initialization location read from session storage, center: %o, zoom: %o',c,z)
    } else {
        var c=center
        var z=zoom
        var b=bearing
        var p=pitch
        // console.log('Map initialization location standard values used, center: %o, zoom: %o',c,z)
    }

    return new Promise(function(resolve) {
        // Init
        var authOptions = {
            authType: "anonymous",
            clientId: AzureMapsClientId, // azure map account client id
            getToken: function(resolve, reject, map) {
                fetch(window.location.origin+'/api/maptoken').then(function(response) {
                    return response.text();
                }).then(function(token) {
                    resolve(token);
                });
            }
        }
        
        map = new atlas.Map('map', 
        {
            view: 'Auto',
            center: c,
            zoom: z,
            bearing: b,
            pitch: p,
            language: 'nl-NL',
            authOptions: authOptions,
            style: 'blank_accessible' // don't show default azure maps map
            
        });
    
        //Wait until the map resources are ready.
        map.events.add('ready', function () {
            basicMapStyling(startingMap)
            follow2Dmapview() 

            ///---------------------------------------------------------------------------------------------------------
            ///    DUMMY LAYERS TO SET Z-INDEX   ///
            ///---------------------------------------------------------------------------------------------------------
            // Layers, by default, are added as the top layer
            // Alternatively, they can be inserted below an existing layer
            // This section defines dummy (empty) layers, that allow some control over z-index
            
            dummy_dataSource = new atlas.source.DataSource();
            map.sources.add(dummy_dataSource);

            LayerLevelLow = new atlas.layer.LineLayer(dummy_dataSource,'LayerLevelLow')
            map.layers.add(LayerLevelLow);

            LayerLevelMid = new atlas.layer.LineLayer(dummy_dataSource,'LayerLevelMid')
            map.layers.add(LayerLevelMid);

            LayerLevelHigh = new atlas.layer.LineLayer(dummy_dataSource,'LayerLevelHigh')
            map.layers.add(LayerLevelHigh);

            resolve(map)

        });  
    })
}

//////////////////////////////////////////////////
// Base map styling
//////////////////////////////////////////////////

function basicMapStyling(startingMap) {

    // console.log('voor add controls')
    // Basic controls, but no mapPicker
    add_controls();
    // console.log('na add controls')

    // Add pdok map types URLs
    mapTypes=['https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/grijs/EPSG:3857/{z}/{x}/{y}.png',
    'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png',
    'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/pastel/EPSG:3857/{z}/{x}/{y}.png',
    'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/water/EPSG:3857/{z}/{x}/{y}.png',
    'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{z}/{x}/{y}.png'];
    
    // Starting map
    currentMap=startingMap;

    // Add pdok map layer
    bg_layer=new atlas.layer.TileLayer({
        tileUrl: mapTypes[currentMap],
        tileSize: 256,
        bounds: atlas.data.BoundingBox.fromEdges(-1.65729160235431, 48.0405018704265, 11.2902578747914,55.9136415748388),
        maxSourceZoom: 21
    },'background')
    map.layers.add(bg_layer,'labels');

    popup = new atlas.Popup();
}

function add_controls()
{
    map.controls.add([new atlas.control.ZoomControl(),
        new atlas.control.CompassControl(),
        new atlas.control.PitchControl()
    ],{position: 'bottom-right'});

    maptype_div=document.getElementById('map_controls_maptype');
    if(maptype_div===null) {
        // create a mappicker element
        el=document.getElementById('leftSideWrapper');
        var newEl=document.createElement('div');
        newEl.id='map_controls_maptype';
        newEl.innerHTML=
        '<div id="map_controls_maptype_panel" class="invisible opacity-100 h-auto rounded-md md:absolute md:right-32 md:bottom-6 pr-3">'+
            '<div id="map_controls_maptype_panel_inner" class="inline-flex flex-col bg-white rounded-md gap-5 p-5 md:flex-row">'+
                '<button class="azure-maps-control-button h-56 w-56" title="Grijs" alt="Select Style" type="button" onclick="change_bg_map(0)">'+
                    '<img class="h-56 w-56" src="https://analyzestmow001.blob.core.windows.net/public/BRT-grijs.png" alt="Grijs">'+
                '</button>'+
                '<button class="azure-maps-control-button h-56 w-56" title="Standaard" alt="Select Style" type="button" onclick="change_bg_map(1)">'+
                    '<img class="h-56 w-56" src="https://analyzestmow001.blob.core.windows.net/public/BRT-standaard.png" alt="Standaard">'+
                '</button>'+
                '<button class="azure-maps-control-button h-56 w-56" title="Pastel" alt="Select Style" type="button" onclick="change_bg_map(2)">'+
                    '<img class="h-56 w-56" src="https://analyzestmow001.blob.core.windows.net/public/BRT-pastel.png" alt="Pastel">'+
                '</button>'+
                '<button class="azure-maps-control-button h-56 w-56" title="Water" alt="Select Style" type="button" onclick="change_bg_map(3)">'+
                    '<img class="h-56 w-56" src="https://analyzestmow001.blob.core.windows.net/public/BRT-water.png" alt="Water">'+
                '</button>'+
                '<button class="azure-maps-control-button h-56 w-56" title="Satelliet" alt="Select Style" type="button" onclick="change_bg_map(4)">'+
                    '<img class="h-56 w-56" src="https://analyzestmow001.blob.core.windows.net/public/BRT-lucht.png" alt="Satelliet">'+
                '</button>'+
            '</div>'+
        '</div>'+
        '<button class="azure-maps-control-button curr-style absolute right-0 bottom-0" title="Selecteer kaarttype" alt="Selecteer kaarttype" type="button" onclick="change_bg_map()">'+
            '<img src="https://analyzestmow001.blob.core.windows.net/public/BRT-grijs.png" alt="Grijs">'+
            '<div class="icon -rotate-90 md:rotate-180"></div>'+
        '</button>';

        // // Background behing existing azure maps elements
        // var bgEl=document.createElement('div');
        // bgEl.id='map_controls_azure_bg';

        // // add div after leftSideWrapper
        // el.parentNode.insertBefore(bgEl, el.nextSibling);
        // el.parentNode.insertBefore(newEl, el.nextSibling);
        document.getElementById('map').appendChild(newEl)
    } else {
        // set visible
        document.getElementById('map_controls_maptype').style.display='block';
    }
}

function remove_controls()
{
    map.controls.remove(map.controls.getControls());
    document.getElementById('map_controls_maptype').style.display='none';
}

function change_bg_map(mapnum) {
    if(mapnum === undefined) {
        currentMap=(currentMap + 1) % mapTypes.length;
    } else {
        currentMap=mapnum;
    }
    bg_layer.setOptions({tileUrl:mapTypes[currentMap]})
}

// ----------------------------------------------------------------------------------
// Map location interaction
// ----------------------------------------------------------------------------------

// Save map location to sessionstorage => keep map view between tabs
function follow2Dmapview() {
    map.events.add('moveend', follow2Dmap);

    function follow2Dmap(e) {
        c=map.getCamera().center
        z=map.getCamera().zoom
        b=map.getCamera().bearing
        p=map.getCamera().pitch
        sessionStorage.setItem('camera',JSON.stringify([c,z,b,p]))
    }
}

// cesium flyto function
function view_to_coords(lon, lat, height, heading, pitch){
    if(typeof viewer !== 'undefined') {
        // Set the camera position
        viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
            duration: 4,
            orientation: {
                heading: Cesium.Math.toRadians(heading),
                pitch: Cesium.Math.toRadians(pitch),
                roll: 0
            }
        })
    }
}

// azure maps flyto function
function view_to_coords_maps(lon, lat, zoom, heading, pitch, checboxID = null){
    if (checboxID === null)
    {
        map.map.flyTo({
            center: [lon, lat],
            zoom: zoom,
            bearing: heading,
            pitch: pitch
        });
    }
    else{
        if (document.getElementById(checboxID).checked) {
            map.map.flyTo({
                center: [lon, lat],
                zoom: zoom,
                bearing: heading,
                pitch: pitch
            });
        }
        else{
            // redraw screen, because building has been removed
            render_func()
        }
    }
}

// ----------------------------------------------------------------------------------
// Map searchbox
// ----------------------------------------------------------------------------------

function cnstr_searchBox() {
    //Search box that allows the user to search for addresses
    //Contains autocomplete functionality
    //Creates a map layer with 1 symbol, indicating the address

    //Create a data source to store the data in.
    search_datasource = new atlas.source.DataSource('ds_search');
    map.sources.add(search_datasource);

    //Add a layer for rendering point data.
    map.layers.add(new atlas.layer.SymbolLayer(search_datasource),LayerLevelMid);

    var geocodeServiceUrlTemplate = 'https://{azMapsDomain}/search/{searchType}/json?typeahead=true&api-version=1&query={query}&language={language}&lon={lon}&lat={lat}&radius={radius}&countrySet={countrySet}&view=Auto';

    document.getElementById('queryTbx').onkeyup = function(e) {
        //Don't ask for suggestions until atleast 3 characters have been typed. This will reduce costs by not making requests that will likely not have much relevance.
        
        if(this.value.length > 0) {
            document.getElementById('queryTbxReset').classList.remove('hidden');
        } else {
            document.getElementById('queryTbxReset').classList.add('hidden');
        }

        if(this.value.length < 4) {
            return
        }

        // do geolookup
        var center = map.getCamera().center;
        var requestUrl = geocodeServiceUrlTemplate.replace('{query}', encodeURIComponent(this.value))
            .replace('{searchType}', 'address')
            .replace('{language}', 'nl-NL')
            .replace('{lon}', center[0])    //Use a lat and lon value of the center the map to bais the results to the current map view.
            .replace('{lat}', center[1])
            .replace('{radius}', 10000) //The radius in meters to for the results to be constrained to the defined area
            .replace('{countrySet}', 'NL'); //A comma seperated string of country codes to limit the suggestions to.
        processRequest(requestUrl).then(data => {
            // parse results
            results_array=[];
            for(var i = 0; i < data.results.length; i++) {
                item=data.results[i]

                var suggestionLabel = item.address.freeformAddress;

                if (item.poi && item.poi.name) {
                    suggestionLabel = item.poi.name + ' (' + suggestionLabel + ')';
                }
                results_array.push(`<li onclick="searchbox_select(this.value,${item.position.lon},${item.position.lat})">${suggestionLabel}</li>`)
            }

            if(results_array.length > 0) {
                document.getElementById('search-results').classList.add('show-results');
                
            } else {
                document.getElementById('search-results').classList.remove('show-results');
            }

            // show results
            document.getElementById('search-results').innerHTML=results_array.join("")
        });
    }
}

function processRequest(url) {
    //This function processes the request to the GeoCodeService
    //A required functionality for the search box to work

    //This is a reusable function that sets the Azure Maps platform domain, sings the request, and makes use of any transformRequest set on the map.
    return new Promise((resolve, reject) => {
        //Replace the domain placeholder to ensure the same Azure Maps cloud is used throughout the app.
        url = url.replace('{azMapsDomain}', atlas.getDomain());

        //Get the authentication details from the map for use in the request.
        var requestParams = map.authentication.signRequest({ url: url });

        //Transform the request.
        var transform = map.getServiceOptions().tranformRequest;
        if (transform) {
            requestParams = transform(url);
        }

        fetch(requestParams.url, {
            method: 'GET',
            mode: 'cors',
            headers: new Headers(requestParams.headers)
        })
            .then(r => r.json(), e => reject(e))
            .then(r => {
                resolve(r);
            }, e => reject(e));
    });
}

function searchbox_select(value,lon,lat) {
    search_datasource=map.sources.getById('ds_search')
    search_datasource.clear();
    document.getElementById('search-results').innerHTML=""

    //Create a point feature to mark the selected location.
    search_datasource.add(new atlas.data.Feature(new atlas.data.Point([lon, lat]), value));

    map.setCamera({
        center: [lon, lat],
        duration: 2000,
        type: "fly"
    });
    view_to_coords(lon, lat-0.003, 300, 0, -35)
}