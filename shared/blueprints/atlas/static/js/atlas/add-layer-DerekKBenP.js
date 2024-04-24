//////////////////////////////////////////////////
// Geoserver setup
//////////////////////////////////////////////////

// TODO: needs to be done differently to support any geoserver
// should add geoserver url in db. make new client if not yet defined

// Function to convert strings to a variable name
function str2var(
    str,
    value
    ){
    // console.log('str: ', str)
    // console.log('value: ', value)
    // Use the client name as variable name for specific wfs service
    window[str] = value;
    // console.log('new val: ', str)

    return console.debug(`variablename: ${str} is created with value: ${value}`)
}


/////////////////////////////////////

/**
* Create dynamic wfs clients e.g. geoserver or other services
* @param {String} nameclient - name of the client. After execution used as variable name
* @param {String} urlclient - url of the client
*/
function createWFSClient(
    nameclient,
    urlclient
    ){

    // Use the client name as variable name for specific wfs service
    //   Overwrite the value in the dataService_clients from string to a wfs client
    dataService_clients[nameclient]['wfs'] = new atlas.io.ogc.WfsClient({
        url: urlclient,
        transformRequest: function (url, resourceType) {
            // implement proxy by changing URL, if needed
            u=url

            // implement authorization
            if(dataService_clients[nameclient].hasOwnProperty('headers')) {
                h=dataService_clients[nameclient]['headers']
            } else {
                h={}
            }

            return  {
                url: u,
                headers: h
            };
        }
    });
    console.log(dataService_clients[nameclient]['wfs'])

    return console.log(`geoserver client: ${nameclient} created`)
}

// Define json with wfs name and corresponding url
dataService_clients = {
    "client_geoserver" : {
        "wfs" : 'https://app-geoserver.azurewebsites.net/geoserver/ows?service=wfs&version=1.0.0&request=GetCapabilities',
        "vt" : "https://app-geoserver.azurewebsites.net"
    },
    "client_geoserver_dtp" : {
        "wfs" : 'https://app-dtp-geoserver-001.azurewebsites.net/geoserver/ows?service=wfs&version=1.0.0&request=GetCapabilities',
        "vt" : "https://app-dtp-geoserver-001.azurewebsites.net",
        "headers": {
            Authorization: GeoserverAuth //value read from Flask backend
        }
    },
    "client_geoserver_alkmaar" : {
        "wfs" : 'https://datalab.alkmaar.nl/geoserver/ows?service=WFS&version=1.0.0&request=GetCapabilities'
    },
    "client_liander" : {
        "wfs" : 'https://service.pdok.nl/liander/elektriciteitsnetten/wfs/v1_0?request=getCapabilities&service=WFS'
    },
    "client_rioned" : {
        "wfs" : 'https://geodata.nationaalgeoregister.nl/rioned/gwsw/wfs/v1_0?&request=GetCapabilities&service=WFS'
    }
}

// // Loop over all wfs clients 
// Object.keys(dataService_clients).forEach(
//     (wfsclient) => {
//         // Create wfs client
//         createWFSClient(
//             nameclient= wfsclient,
//             urlclient= dataService_clients[wfsclient]["wfs"]
//         )
//         // if a vectortile url is define initialize this url as variable: 'serverclientname'_vt
//         if (typeof dataService_clients[wfsclient]["vt"] != 'undefined'){
//             str2var(
//                 str=`${wfsclient}_vt`,
//                 value=dataService_clients[wfsclient]["vt"]
//             )
//         }
//     }
// );

// Set up 'connection' to the geoserver to use the data as WFS --  algemene geoserver endpoint
// url = 'https://app-geoserver.azurewebsites.net/geoserver/ows?service=wfs&version=1.0.0&request=GetCapabilities'
// client_geoserver = new atlas.io.ogc.WfsClient({
//     url: url
// });

// Set up 'connection' to the geoserver to use the data as WFS --  algemene geoserver endpoint
// url_alkmaar_geoserver = 'https://datalab.alkmaar.nl/geoserver/wfs'
// url_alkmaar_geoserver = 'https://datalab.alkmaar.nl/geoserver/ows?service=WFS&version=1.0.0&request=GetCapabilities'
// client_geoserver_alkmaar = new atlas.io.ogc.WfsClient({
//     url: url_alkmaar_geoserver
// });
// console.log(client_geoserver_alkmaar)

// pdok_liander
// https://www.pdok.nl/ogc-webservices/-/article/liander-elektriciteitsnetten-1#9727da54e14749f440a186de135bf024
// url_liander_elektriciteitsnet = 'https://service.pdok.nl/liander/elektriciteitsnetten/wfs/v1_0?request=getCapabilities&service=WFS'

// client_liander = new atlas.io.ogc.WfsClient({
//     url: url_liander_elektriciteitsnet
// });

// // rioned
// url_rioned_riolering = 'https://geodata.nationaalgeoregister.nl/rioned/gwsw/wfs/v1_0?&request=GetCapabilities&service=WFS'

// client_rioned = new atlas.io.ogc.WfsClient({
//     url: url_rioned_riolering
// });

/////////////////////////////////////

// Dictionary with unique icon name with url to the icon
//  First key is the dataset id, followed by other keys which are the unique names of the datasets.
//   If the name of the symbol is already processed the the symbol is NOT overwritten.
layericons = {
    "mbg_deelautos": {
        "MyWheels" : "https://alkmaarsmartcity001.blob.core.windows.net/icons/MyWheelsLogoTrans.png",
        "GreenWheels" : "https://alkmaarsmartcity001.blob.core.windows.net/icons/GreenWheelsLogoTrans.png",
        "ConnectCar": "https://alkmaarsmartcity001.blob.core.windows.net/icons/ConnectCarLogoTrans.png"
    }
}


/**
* The symbols specified for a specific layer (in the layericons dict) are added to a map if the layer is requested.
*   The symbols are only added ones to the map.
* @param {Object} map - variable of the map where the icons should be added to
* @param {Object} ds - datasetid that makes the layer unique
*/
function addIcons2Map(
    map_var=map,
    ds)
    {
        console.debug(map_var)
        // Check in the symbol dictionary if the symbol are already processed (defualt is dict)
        if (typeof(layericons[`${ds}`]) == 'object') {
            // Loop over all symbols for a specific table
            Object.keys(layericons[`${ds}`]).forEach(
                (icon) => {
                    // Check if symbol is already loaded
                    if (map_var.imageSprite.hasImage(layericons[`${ds}`][`${icon}`]) == false){
                        // add each icon to the specified map
                        map_var.imageSprite.add(icon, layericons[`${ds}`][`${icon}`])
                    }
                }
            );
            
            // Overwrite dictionary value when the images are processed.
            //  Next call the symbols are not processed again.
            layericons[`${ds}`] = 'processed'
        }
}

/////////////////////////////////////




/////////////////////////////////////

// Define json with wfs name and corresponding url
userInteractionFunctions = {
    "featureClicked" : function featureClicked() {
                            alert('click function geactiveerd')
                        },
    "pand_informatie" : function pand_informatie() {
        console.log("TODO: replace wfs onclick function in db")
    },
    "tomtomHistory" : function triggertomtom_history_data(e){
        tomtom_history_data(e)
    },
    // "CreateMeetsensorGraph" : 
    "featureClickedBuurt" : "buurtinformation",
    "featureClickedLeefBaro" : "leefbarometer",
    "featureClickedTomTom" : "tomtomfunctie",
    "featureClickedPand" : "pandinformatie",
    "featureClickedJunior" : "JuniorIOT"
}

function pand_informatie() {
    console.log("TODO: replace wfs onclick function in db")
}

/////////////////////////////////////

/**
* Function to convert the 'optional json' from App Function to a valid Json.
*  Subsequently the stylingparameters are determined for the layer
*  The interactive function is define for the specific layer
* @param {String} options - json as string with custom information for the layer of interest
*/
function processOptionalJson(options){
    // Convert string to valid json
    optionjson = getValidJson(options)
    console.debug('Styling JSON: %o',optionjson)
   
    // Define all possible style parameters, if assigned
    CheckStyleJson(optionjson.style)

   // Find the interactive function in the javascript
   checkInteractionFunction(optionjson.ClickFunction)
}

/**
* Function to convert the 'optional json' from App Function to a valid json.
*  The app function inserted encoded characters which are removed.
* @param {String} options - json as string with encoded variables
* @returns {Object} validjson - json with all custom key:value pairs
*/
function getValidJson(optionJson){
    console.debug(optionJson)
    try{
        // Convert the string to json and remove encoded variables
        var validjson = (
            JSON.parse(
                optionJson.replace(/@/g, '"').replace(/%/g, "'")
            )
        );
    } catch (error){
        showLayerLoadingError();
        console.debug(error);
        validjson = {}
    }
    // console.debug(validjson)
    return validjson
}

/**
* Function to convert undefined style options into null/undefined
*  This enables the ability to add a layer with or without any styling options
*  The parametes are converted to global variables. Subsequently used to style the layer
* @param {Object} stylejson - josn with value for each parameter used to style the layer
*/
function CheckStyleJson(stylejson){            
    // Check the a style was defined
    if (typeof(stylejson) != 'undefined'){
        asjson = stylejson
    }
    // If style json is invalid an empty json will be defined
    else{
        console.debug('invalid or empty json')
        asjson = {}
    }
    console.debug(asjson)

    // define list of all posible style options
    allObjects = ['fillColor', 'fillOpacity', 
                    'strokeColor', 'strokeWidth', 'strokeOpacity', 'offset',
                    'color', 'opacity', 'radius', 'blur',
                    'iconOptions', 'textOptions',
                    'contrast', 'fadeDuration', 'hueRotation', 'maxBrightness', 'saturation',
                    'minZoom', 'maxZoom', 'filter', 'visible']


    // Loop over all options if not defined then set to 'undefined'
    for (s = 0; s < allObjects.length; s++){
        key = allObjects[s]
        console.debug(asjson[key])

        // Check if style is defined otherwise set to undefined
        try{
            // Check if for the parameter a was defined 
            if (typeof(asjson[key]) != 'undefined'){
                // If the value is a string, single quotes to double quotes to create a valid json
                if (typeof(asjson[key]) == 'string'){
                    value = asjson[key].replace(/'/g, '"');
                    value = JSON.parse(value)
                }
                else{
                    value = asjson[key]
                }
                // convert the key (string) to variable name
                window[key] = value
            }
            else{
                // set the key (string) to variable with value undefined
                window[key] = undefined
            }
        }
        catch(err) {
            console.debug(err.message);
            asjson[key] = undefined
        }
    }
    console.debug(asjson)
    return asjson
}

/**
* Function to assing an (custom) interaction function to the layer (e.g. clickFeatures)
* @param {String} IAfunction - name of interactive function
* @return {function} interactiveFunction - global variable with the function of interest
*/
function checkInteractionFunction(IAfunction){
    console.debug('interactive function: ', IAfunction);
    
    // Check if a function is assigned for the layer otherwise empty value
    if (typeof(IAfunction) !== 'undefined'){
        // Loop over all posible interactive functions
        Object.keys(userInteractionFunctions).forEach(
            (func) => {
                // If the ia function of interest is found
                if (IAfunction == func){
                    // Save the function as return variable
                    funcOI = userInteractionFunctions[`${func}`]
                    console.debug(`${func}`)

                    // Set the interaction function as a global variable
                    window['interactiveFunction'] = funcOI
                }
            }
        )
    }
    else {
        funcOI = 'Function not assigned or does not exsists'
    }

    return
}

/////////////////////////////////////

/**
* Function to request data from WFS source (e.g. geoserver)
* @param {String} wfs_client - Name of a PRE-DEFINED client. If invalid the Analyze geoserver is used
* @param {String} environment - Environment of the data 
* @param {String} layerName - Layername of the data of interest
* @return {Promise} promise - Promise of the requested data
*/
function getWFSData(
    wfs_client,
    environment,
    layerName
    ){
    console.debug(wfs_client, environment, layerName)

    // If the wfs client not is initialized (still string) create client object
    if (typeof dataService_clients[`${wfs_client}`]['wfs'] === 'string'){
        console.log(`dataclient: ${wfs_client} not initialize`)

        createWFSClient(
            nameclient= wfs_client,
            urlclient=dataService_clients[`${wfs_client}`]['wfs']
        )
    }

    client = dataService_clients[`${wfs_client}`]['wfs']
    // If the client does not exsist the analyze geoserver is used
    if (typeof(client) === 'undefined'){
        client = dataService_clients['client_geoserver']['wfs']
    }

    // Create promise to get the data from WFS client
    let promise = new Promise(function (resolve, reject) {
        resolve(
            client.getFeatures({
                typeNames: `${environment}:${layerName}`,  
            })
        ),
        reject(
            console.debug('Data could not be derived')
        )
    });

    checkPromiseState(promise);

    return promise;
}



/**
* Function to request data from external source, API of blobstorage 
* @param {String} RequestURL - URL to the data of interest
* @param {String} RequestType - Type of that data that is requested
* @return {Promise} promise - Promise of the requested data
*/
function getWFSDataRequest(
    RequestURL,
    RequestType
    ){
    // Create promise to get the data from HTTP request
    // Return except as a Geojson
    let promise = new Promise(function (resolve, reject) {
        resolve(
                fetch(`${RequestURL}`, {
                    method: `${RequestType}`
            }).then(response => {
                if(response.ok){
                    return response.json();
                } else {
                    showLayerLoadingError();
                }
            })
        ),
        reject(
            console.debug('Data could not be derived')
        )
    });

    checkPromiseState(promise);

    return promise;
}

function doWPScall(xmlURL,baseURL,body,auth) {
    return fetch(xmlURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: body
    }).then((response) => {
        if (response.ok) {
            try {
                r = response.text()
                return r
            } catch {
                console.log('Raw reponse: %o',response)
                throw new Error('Did not obtain a valid response while calling '+ url +'.')
            }
        }
    }).then((xmlContent) => {
        let r;
        // WPS request
        return fetch(baseURL+'/wps',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/xml',
                'authorization': auth
            },
            body: xmlContent
        }).then((response) => {
            if (response.ok) {
                return response.text()
            }
            throw new Error('Did not obtain a valid response while calling '+ baseURL +'.')
        }).then((res) => {
            r=res
            return JSON.parse(res)
        }).catch((err) => {
            // Parse the XML string
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(r, 'application/xml');
            const parseErrors = xmlDoc.getElementsByTagName('parsererror');
            if (parseErrors.length > 0) {
                console.log("Raw reponse text: %o",r)
                throw new Error('WPS call did not produce a valid JSON and responseText could not be parsed');
            }
            
            // Access the parsed XML document
            const owsNamespaceURI = 'http://www.opengis.net/ows/1.1';
            const exceptionText = xmlDoc.getElementsByTagNameNS(owsNamespaceURI,'ExceptionText')[0]?.textContent;
            console.error('WPS call failed with the error: \n"'+exceptionText+'".\nFull XML reponse: %o',xmlDoc)
            throw new Error('WPS call did not produce a valid JSON')
        })
    })
}

// --------------------------------------------
// Data sources
// --------------------------------------------

/**
* Create a vectortile datasource. Contains the data of a specific source/layer
    Note that the data has to be serviced as vector tiles 
* @param {String} VTSid - Name which is unique for this datasource (prefered to start with ds_..)
* @param {String} geoserverURL - Url to the geoserver where the data is serviced
* @param {String} environment - Name of the environment in the geoserver
* @param {String} layerName - Name of the layer as defined in the geoserver
* @return {Object} dataSource - Azure maps datasource, Contains the data of the specified layer
*/
function createVectorDataSource(
    VTSid,
    geoserverURL,
    environment,
    layerName
    ){
    console.debug(geoserverURL)
    console.debug(environment)
    console.debug(layerName)
    // Create new vector tile source with provided ID and add to the map
    dataSource = new atlas.source.VectorTileSource(
        VTSid,
        {
            tiles: [`${geoserverURL}/geoserver/wms?
                    service=WMS
                    &version=1.1.0
                    &request=GetMap
                    &layers=${environment}%3A${layerName}
                    &bbox={bbox-epsg-3857}
                    &width=768
                    &height=768
                    &srs=EPSG%3A3857
                    &styles=
                    &format=application%2Fvnd.mapbox-vector-tile`]
        }
    );
    map.sources.add(dataSource);
    console.debug('Created vectordatasource %o', dataSource)

    return dataSource
}

/**
* Create a vectortile datasource. Contains the data of a specific source/layer
    Note that it can only be used for vectortiles serviced by Microsoft in Azure Maps. 
* @param {String} VTSid - Name which is unique for this datasource (prefered to start with ds_..)
* @param {String} url - Url to the azure maps vectortile source
* @return {Object} dataSource - Azure maps datasource, Contains the data of the specified layer
*/
function createAnyVectorDataSource(
    VTSid,
    url
    ){
    
    // Define url to the microsoft vectortile
    url = url.replace('{azMapsDomain}', atlas.getDomain());
    // Create datasource from the specific url
    dataSource = new atlas.source.VectorTileSource(VTSid, {
        tiles: [`'${url}'`],
        maxZoom: 22
    });

    // Add datasource to the map (no data yet)
    map.sources.add(dataSource);

    return dataSource
}

/**
* Create a general datasource. Contains the data of a specific source/layer
    Note that it can only be used for vectortiles serviced by Microsoft in Azure Maps. 
* @param {String} DSid - Name which is unique for this datasource (prefered to start with ds_..)
* @return {Object} dataSource - Azure maps datasource, Contains the data of the specified layer
*/
function createDataSource(
    DSid
    ) {  
    // Create Datasource with specified ID
    DataSource = new atlas.source.DataSource(
        DSid
    );
    // Add datasource to the map
    map.sources.add(DataSource);
    console.debug('Created datasource %o',DataSource)
                
    return DataSource
}

// --------------------------------------------
// Create Data Layers
// --------------------------------------------

/**
* Create a Web Feature layer. Contains the data from a WFS source (geoserver of API)
    Interactivities on the features of these layers are possible. 
* @param {String} DSid - Name of the datasource where the data is saved in, needs to be unique (prefered to start with ds_..)
* @param {String} layerType - Type of vector layer geometry type; Point, Line or Polygon
* @param {String} dataOrigin - Source of the data; geoserver ('geoserver') or an API request ('') 
* @param {String} wfs_client - Name wfs client (e.g. client_geoserver to the geoserver of Analyze)
* @param {String} environment - Name environment in the geoserver
* @param {String} layername - Name of the layer in the wfs client
* @param {String} RequestURL - URL where the data can be requested
* @param {String} RequestType - Type of response of the request (e.g. json)
* @param {String} referenceLayer - Name of dummy layer, at which level the layer has to been shown; LayerLevelLow, LayerLevelMid, LayerLevelHigh
* @param {Object} optional - Custom settings for the layer; styling and interactive function
*/
function loadWFSData(
    DSid,
    layerType,
    dataOrigin,
    wfs_client,
    environment,
    layerName,
    RequestURL,
    RequestType,
    referenceLayer,
    optional,
    visibility=true,
    map_var=map
){
    loading_gif(true)
    // Create and add datasource
    Datasource = createDataSource(DSid=DSid)

    // Create promise with the WFS data derived from geoserver or a request
    // TODO: geoserver veranderen naar algemene WFS client
    if (dataOrigin == 'geoserver'){
        WFSData = getWFSData(
            wfs_client=wfs_client,
            environment=environment,
            layerName=layerName
            ) 
    }
    else {
        WFSData = getWFSDataRequest(
            RequestURL=RequestURL,
            RequestType=RequestType
            ) 
    }

    // Create layer in Azure Maps - As a WFS
    //  Only possible if the data is loaded (from service e.g. Geoserver or API)
    return WFSData.then(
        (fc) => {
            console.debug('create layer: ', layerType)
            console.debug('create layer DSid: ', DSid)
            // Add data to the created datasource
            DataSource.add(fc);

            // Use the layerType to define which layer to create
            // vectortile layer is set to false
            CreateLayer(
                map=map_var,
                layerType=layerType,
                DSid=DSid,
                DataSource=DataSource, 
                TileLayer=false,
                layerName=layerName, 
                referenceLayer=referenceLayer,
                optional=optional,
                visibility=visibility
            )
            loading_gif(false)
        }
    );
}

/**
* Create a Web Map Layer. Contains the data from a WMS source 
    Interactivities with the features in these layers are not possible. 
* @param {String} DSid - Name of the datasource where the data is saved in, needs to be unique (prefered to start with ds_..)
* @param {String} sourceURL - the BASE url to the source of the data.
* @param {String} layerName - Layername of the data 
* @param {String} formatLayer - Type of data to visualize (image/jpeg ; image/png etc.)
* @param {String} transparent - Transparancy of the layer
* @param {String} version - Version of the wms service
* @param {String} projection - CRS of the data
* @param {String} servicekey - Key to the data if required
* @param {String} referenceLayer - Name of dummy layer, at which level the layer has to been shown; LayerLevelLow, LayerLevelMid, LayerLevelHigh
*/
function loadWMSLayer(
    dsId,
    sourceURL,
    layerName,
    formatLayer,
    transparent,
    version,
    projection,
    servicekey,
    referenceLayer,
    map_var=map
){

    options = {}

    // Create array with all possible styles
    style = CheckStyleJson(options)

    // &servicekey=${servicekey}
    //'https://demo.lizard.net/wms/raster_22b1d93d-0720-44bb-9cea-80607026d88e/?request=GetCapabilities&FORMAT=image/png&HEIGHT=1024&LAYERS=intern:hhnk:heat-1801c:heatstress&REQUEST=GetMap&TILED=true&TRANSPARENT=true&WIDTH=1024&VERSION=1.1.1&SERVICE=WMS&CRS=EPSG:3857&BBOX={bbox-epsg-3857}',
    //', //CRS=EPSG:28992&BBOX=102347.10876962998,494043.46003678004,135469.85470923255,536202.058888699',
    // tileSize: 1024,
    layer = new atlas.layer.TileLayer({
            tileUrl: `${sourceURL}?SERVICE=WMS&VERSION=${version}&REQUEST=GetMap&HEIGHT=1024&WIDTH=1024&LAYERS=${layerName}&FORMAT=${formatLayer}&transparent=${transparent}&CRS=${projection}&BBOX={bbox-epsg-3857}&servicekey=${servicekey}`,
            contrast : style.contrast,
            fadeDuration : style.fadeDuration,
            hueRotation : style.hueRotation,
            maxBrightness : style.maxBrightness,
            saturation : style.saturation,
            opacity: style.opacity
        }, 
        `${dsId}_id`
    );

    console.debug('Created WMS layer %o',layer)

    try{
        map_var.layers.add(layer, referenceLayer);
    } catch(error) {
        console.error(error);
        showLayerLoadingError();
    }
}

function loadWMSLayerWeather(
    sourceURL,
    layerName,
    formatLayer,
    version,
    referenceLayer,
    optional
){
    // console.log('create wms layer')
    // console.log(optional)

    // Convert options string to json
    try{
        options = JSON.parse(optional)
    }
    catch{
        console.debug('invalid or empty json')
        options = {}
    }

    // Create array with all possible styles
    style = CheckStyleJson(options)

    layer = new atlas.layer.TileLayer({
        tileUrl: `${sourceURL}`,
        //'https://demo.lizard.net/wms/raster_22b1d93d-0720-44bb-9cea-80607026d88e/?request=GetCapabilities&FORMAT=image/png&HEIGHT=1024&LAYERS=intern:hhnk:heat-1801c:heatstress&REQUEST=GetMap&TILED=true&TRANSPARENT=true&WIDTH=1024&VERSION=1.1.1&SERVICE=WMS&CRS=EPSG:3857&BBOX={bbox-epsg-3857}',
        tileSize: 256,
        contrast : style.contrast,
        fadeDuration : style.fadeDuration,
        hueRotation : style.hueRotation,
        maxBrightness : style.maxBrightness,
        saturation : style.saturation,
        visible : style.visible,
        opacity: 0.9,
        maxSourceZoom: 15
    }, 
    `${layerName}_id`
    );
    console.debug('Created WMS layer %o with options %o', layer, options)

    map.layers.add(layer, referenceLayer);
}

/**
* Create a WFS vector tile layer. Contains the data from a WFS-VT source (e.g. geoserver)
    Interactivities on the features of these layers are possible. Very usefull for large amount of data
* @param {String} DSid - Name of the datasource where the data is saved in, needs to be unique (prefered to start with ds_..)
* @param {String} layerType - Type of vector layer geometry type; Point, Line or Polygon
* @param {String} geoserverURL - URL to the data service (e.g. geoserver
* @param {String} environment - Name environment in the geoserver
* @param {String} layername - Name of the layer in the wfs client
* @param {String} referenceLayer - Name of dummy layer, at which level the layer has to been shown; LayerLevelLow, LayerLevelMid, LayerLevelHigh
* @param {Object} optional - Custom settings for the layer; styling and interactive function
*/
// name changed to load -> inline with new naming convention old: createVectorTileLayer new: loadVectorTileLayer
function loadVectorTileData(
    DSid,
    layerType,
    geoserverURL,
    environment,
    layerName,
    referenceLayer,
    optional,
    visibility=true,
    map_var=map
){ 
    // Create vector tile datasource with specified ID which is added to the map
    DataSource = createVectorDataSource(
        VTSid=DSid,
        geoserverURL=dataService_clients[`${geoserverURL}`]['vt'],
        environment=environment,
        layerName=layerName
        )

    console.debug('Created vecotr datasource %o', DataSource)

    // Create layer: polygon, point or line layer as VectorTile
    CreateLayer(
        map_var=map_var,
        layerType=layerType,
        DSid=DSid,
        DataSource=DataSource, 
        TileLayer=true,
        layerName=layerName, 
        referenceLayer=referenceLayer,
        optional=optional,
        visibility=visibility
    )
}

function loadGeoJsonData(
    layerName,
    url,
    layerType,
    referenceLayer,
    optional
){ 
    dataSource = createDataSource(layerName)
    // map.sources.add(dataSource);
    console.debug('Created GeoJsonDatasource %o',dataSource)

    // try 
    // {
        // var datasource_geoJson = new atlas.source.DataSource('geoJson');
        // map.sources.add(datasource_geoJson);
        // dataSource.importDataFromUrl(url);
    // }
    // catch {
        // datasource_geoJson = null
        // console.log('Kan datasource geoJson niet aanmaken, datasource bestaat mogelijk al.')
    // }   

    // Convert options string to json
    try{
        options = JSON.parse(optional)
    }
    catch{
        console.debug('invalid or empty json')
        options = {}
    }


    // // Create layer: polygon, point or line layer as VectorTile
    // CreateLayer(
    //     map_var=map_var,
    //     layerType=layerType,
    //     DSid=DSid,
    //     DataSource=DataSource, 
    //     TileLayer=true,
    //     layerName=layerName, 
    //     referenceLayer=referenceLayer,
    //     optional=optional,
    //     visibility=visibility
    // )

    TileLayer = false

    if (layerType == 'Polygon'){
        CreatePolygonLayer(layerName, dataSource, TileLayer, layerName, referenceLayer, options)
    }
    if (layerType == 'Line'){
        console.debug(options)
        CreateLineLayer(layerName, dataSource, TileLayer, layerName, referenceLayer, options)
    }
    if (layerType == 'Point'){
        CreatePointLayer(layerName, dataSource, TileLayer, layerName, referenceLayer, options)
    }

    return dataSource.importDataFromUrl(url);
}


// --------------------------------------------
// Create layer - Polygon, Point, Line, Symbol
// --------------------------------------------

/**
* Create a specific layer
    Polygon, Point, Line, Symbol layer
    Interactivities on the features of these layers are possible.
* @param {String} layerType - Type of layer - polygon, Point, Line or Symbol
* @param {String} DSid - Name of the datasource where the data is saved in, needs to be unique (prefered to start with ds_..)
* @param {String} DataSource - Name of data datasource (where the data is stored in)
* @param {String} TileLayer - True or False if the vector layer is a tile layer
* @param {String} layerName - Name of the layer of interest, Required if the layer is a tile layer
* @param {String} referenceLayer - Name of dummy layer, at which level the layer has to been shown; LayerLevelLow, LayerLevelMid, LayerLevelHigh
* @param {Object} optional - Custom settings for the layer; styling and interactive function
* @param {Object} visibility - OPTIONAL alter the default visibility of the layer
*/
function CreateLayer(
    map_var=map,
    layerType,
    DSid,
    DataSource, 
    TileLayer,
    layerName, 
    referenceLayer,
    optional,
    visibility=true    
    ){
        console.log(referenceLayer)
        console.log(optional)

    // Create polygon layer
    if (layerType == 'Polygon'){
        CreatePolygonLayer(map_var, DSid, DataSource, TileLayer, layerName, referenceLayer, optional, visibility)
    }
    // Create line layer
    else if (layerType == 'Line'){
        CreateLineLayer(map_var, DSid, DataSource, TileLayer, layerName, referenceLayer, optional, visibility)
    }
    // Create symbol layer
    else if (layerType == 'Point'){
        CreatePointLayer(map_var, DSid, DataSource, TileLayer, layerName, referenceLayer, optional, visibility)
    }
    // Create symbol layer
    else if (layerType == 'Symbol'){
        CreateSymbolLayer(map_var, DSid, DataSource, TileLayer, layerName, referenceLayer, optional, visibility)
    }
    else if (layerType == 'Cluster'){
        CreateClusterLayer(map_var, DSid, DataSource, TileLayer, layerName, referenceLayer, optional, visibility)
    }
    // Missing layer types
    else if (layerType == 'None'){
        // Skip layer creation
        createNone()
    }
    else {
        console.warn('No function defined for type: ' + layerType)
    }

}

/**
* Create a WFS Polygon Layer - areas
    Interactivities on the features of these layers are possible.
* @param {Object} map_var - parameter which refers to the map where the layer will be added. Default is 'map'
* @param {String} DSid - Name of the datasource where the data is saved in, needs to be unique (prefered to start with ds_..)
* @param {String} DataSource - Name of data datasource (where the data is stored in)
* @param {String} TileLayer - True or False if the vector layer is a tile layer
* @param {String} layerName - Name of the layer of interest, Required if the layer is a tile layer
* @param {String} referenceLayer - Name of dummy layer, at which level the layer has to been shown; LayerLevelLow, LayerLevelMid, LayerLevelHigh
* @param {Object} optional - Custom settings for the layer; styling and interactive function
*/
function CreatePolygonLayer(
    map_var=map,
    DSid,
    DataSource, 
    TileLayer,
    layerName, 
    referenceLayer,
    options,
    visibility
    ){
    
    // Use the option json from the metadata table to customize the layer style and interactive function
    processOptionalJson(options= options)

    // overrule the default visible parameter
    // IF visible not assigned in the stylejson, set visible to the default visibility (true) or false if assigned
    if (visible == undefined |
        visibility == 'false'){
        visible = JSON.parse(String(visibility).toLowerCase())
    }

    // Define a Polygon layer, with (was layername ->) dsId as ID
    layer = new atlas.layer.PolygonLayer(
        DataSource,
        `${DSid}_id`, 
        {
            // Set all posible styles for a polygon layer
            fillColor : fillColor,
            fillOpacity : fillOpacity,

            minZoom: minZoom,
            maxZoom: maxZoom,

            filter: filter,
            visible: visible
        },
    );
    // If CreatePolygonLayer was called from WFTS the sources layer has to be set
    if (TileLayer == true){
        console.debug('vector layer')
        layer.setOptions({
            sourceLayer : `${layerName}`
        })
    }

    // Add interactive function if assigned
    if (typeof(interactiveFunction) == 'function'){
        map_var.events.add('click', layer, interactiveFunction);
    }

    // Define at which level the layer has to be shown.
    try{
        map_var.layers.add(layer, referenceLayer);
    } catch(error) {
        console.error(error);
        showLayerLoadingError();
    }
    
}

/**
* Create a WFS Line Layer - lines
    Interactivities on the features of these layers are possible.
* @param {Object} map_var - parameter which refers to the map where the layer will be added. Default is 'map'
* @param {String} DSid - Name of the datasource where the data is saved in, needs to be unique (prefered to start with ds_..)
* @param {String} DataSource - Name of data datasource (where the data is stored in)
* @param {String} TileLayer - True or False if the vector layer is a tile layer
* @param {String} layerName - Name of the layer of interest, Required if the layer is a tile layer
* @param {String} referenceLayer - Name of dummy layer, at which level the layer has to been shown; LayerLevelLow, LayerLevelMid, LayerLevelHigh
* @param {Object} optional - Custom settings for the layer; styling and interactive function
*/
function CreateLineLayer(
    map_var=map,
    dsId,
    DataSource, 
    TileLayer,
    layerName, 
    referenceLayer,
    options,
    visibility
    ){
    console.debug(options)
    // options = {}
    // Use the option json from the metadata table to customize the layer style and interactive function
    processOptionalJson(options= options)
    console.debug(options)
    // Define a Polygon layer, with (was layername ->) dsId as ID
    layer = new atlas.layer.LineLayer(
        DataSource,
        `${dsId}_id`, 
        {
            // Set all posible styles for a polygon layer
            strokeColor : strokeColor,
            strokeOpacity : strokeOpacity,
            strokeWidth : strokeWidth,

            minZoom: minZoom,
            maxZoom: maxZoom,

            filter: filter,
            visible: visible
        }
    );

    // If CreatePolygonLayer was called from WFTS the sources layer has to be set
    if (TileLayer == true){
        console.debug('vector layer')
        layer.setOptions({
            sourceLayer : `${layerName}`
        })
    }

    // Add interactive function if assigned
    if (typeof(interactiveFunction) == 'function'){
        map.events.add('click', layer, interactiveFunction);
    }

    // Define at which level the layer has to be shown.
    map.layers.add(layer, referenceLayer);
}

/**
* Create a WFS Point Layer - lines
    Interactivities on the features of these layers are possible.
* @param {Object} map_var - parameter which refers to the map where the layer will be added. Default is 'map'
* @param {String} DSid - Name of the datasource where the data is saved in, needs to be unique (prefered to start with ds_..)
* @param {String} DataSource - Name of data datasource (where the data is stored in)
* @param {String} TileLayer - True or False if the vector layer is a tile layer
* @param {String} layerName - Name of the layer of interest, Required if the layer is a tile layer
* @param {String} referenceLayer - Name of dummy layer, at which level the layer has to been shown; LayerLevelLow, LayerLevelMid, LayerLevelHigh
* @param {Object} optional - Custom settings for the layer; styling and interactive function
*/
function CreatePointLayer(
    map_var=map,
    dsId,
    DataSource, 
    TileLayer,
    layerName, 
    referenceLayer,
    options,
    visibility
    ){
     
    // Use the option json from the metadata table to customize the layer style and interactive function
    processOptionalJson(options= options)

    // Define a Polygon layer, with (was layername ->) dsId as ID
    layer = new atlas.layer.BubbleLayer(
        DataSource,
        `${dsId}_id`, 
        {
            // Set all posible styles for a polygon layer
            color : color,
            opacity : opacity,
            radius : radius,
            blur : blur,

            minZoom: minZoom,
            maxZoom: maxZoom,

            filter: filter,
            visible: visible
        }
    );

    // If CreatePolygonLayer was called from WFTS the sources layer has to be set
    if (TileLayer == true){
        console.debug('vector layer')
        layer.setOptions({
            sourceLayer : `${layerName}`
        })
    }

    // Add interactive function if assigned
    if (typeof(interactiveFunction) == 'function'){
        map.events.add('click', layer, interactiveFunction);
    }

    // Define at which level the layer has to be shown.
    map.layers.add(layer, referenceLayer);
}

/**
* Create a WFS Symbol Layer - Icons
    Interactivities on the features of these layers are possible.
* @param {Object} map_var - parameter which refers to the map where the layer will be added. Default is 'map'
* @param {String} DSid - Name of the datasource where the data is saved in, needs to be unique (prefered to start with ds_..)
* @param {String} DataSource - Name of data datasource (where the data is stored in)
* @param {String} TileLayer - True or False if the vector layer is a tile layer
* @param {String} layerName - Name of the layer of interest, Required if the layer is a tile layer
* @param {String} referenceLayer - Name of dummy layer, at which level the layer has to been shown; LayerLevelLow, LayerLevelMid, LayerLevelHigh
* @param {Object} optional - Custom settings for the layer; styling and interactive function
*/
function CreateSymbolLayer(
    map_var=map,
    dsId,
    DataSource, 
    TileLayer,
    layerName, 
    referenceLayer,
    options,
    visibility
    ){
    console.debug(map_var)
    // Add icons to the specified map
    addIcons2Map(map_var=map_var, dsId)


    // Use the option json from the metadata table to customize the layer style and interactive function
    processOptionalJson(options= options)



    // Define a Polygon layer, with (was layername ->) dsId as ID
    layer = new atlas.layer.SymbolLayer(
        DataSource,
        `${dsId}_id`, 
        {
            // Set all posible styles for a polygon layer
            iconOptions : iconOptions,
            textOptions : textOptions,

            minZoom: minZoom,
            maxZoom: maxZoom,

            filter: filter,
            visible: visible
        }
    );

    // If CreatePolygonLayer was called from WFTS the sources layer has to be set
    if (TileLayer == true){
        console.debug('vector layer')
        layer.setOptions({
            sourceLayer : `${layerName}`
        })
    }

    // Add interactive function if assigned
    if (typeof(interactiveFunction) == 'function'){
        map.events.add('click', layer, interactiveFunction);
    }

    // Define at which level the layer has to be shown.
    map.layers.add(layer, referenceLayer);
}

/**
* Create a WFS cluster Layer
    feature are grouped based on the zoom level
    Interactivities on the features of these layers are possible.
* @param {Object} map_var - parameter which refers to the map where the layer will be added. Default is 'map'
* @param {String} DSid - Name of the datasource where the data is saved in, needs to be unique (prefered to start with ds_..)
* @param {String} DataSource - Name of data datasource (where the data is stored in)
* @param {String} TileLayer - True or False if the vector layer is a tile layer
* @param {String} layerName - Name of the layer of interest, Required if the layer is a tile layer
* @param {String} referenceLayer - Name of dummy layer, at which level the layer has to been shown; LayerLevelLow, LayerLevelMid, LayerLevelHigh
* @param {Object} optional - Custom settings for the layer; styling and interactive function
*/
function CreateClusterLayer(
    map_var=map,
    DSid,
    datasource_ref, 
    TileLayer,
    layerName, 
    referenceLayer,
    options,
    visibility=true
    ){

    console.debug('maak een cluster')

    // Use the option json from the metadata table to customize the layer style and interactive function
    processOptionalJson(options= options)

    console.debug(options)
    // overrule the default visible parameter
    // IF visible not assigned in the stylejson, set visible to the default visibility (true) or false if assigned
    if (visible == undefined |
        visibility == 'false'){
        visible = JSON.parse(String(visibility).toLowerCase())
    }

    console.debug(options)
    console.debug(options.clusterStyle)

    // Create unique names for the different layers required for the clsuter layer
    clusterLayerName = `${layerName}_cluster`
    symbolLayerName = `${layerName}_symbol`
    bubbleLayerName = `${layerName}_bubble`

    // Define the style for each sublayer
    clusteroptions = options.clusterStyle
    bubbleoptions = options.bubbleStyle
    symboloptions = options.symbolStyle

    // Create the different sublayers for the cluster layer
    clusterlayer = CreatePointLayer(datasource_ref, TileLayer, clusterLayerName, referenceLayer, clusteroptions)
    bubblelayer = CreatePointLayer(datasource_ref, TileLayer, bubbleLayerName, referenceLayer, bubbleoptions)
    symbollayer = CreateSymbolLayer(datasource_ref, TileLayer, symbolLayerName, referenceLayer, symboloptions)

    // create an instance of the spider manager.
    spiderManager = new atlas.SpiderClusterManager(map, clusterlayer, bubblelayer);
}

function createNone() {
    console.debug("Skip layer creation")
}

// EXAMPLE OF BUILDING A LAYERS BY CALLING THE FUNCTIONS

// createVectorTileLayer(
//     'alk_panden',
//     'ds_alkmaar_panden',
//     'Polygon',
//     'https://app-geoserver.azurewebsites.net',
//     'Smartcity_Alkmaar',
//     'pandinformatie_prs',
//     'LayerLevelMid',
//     `{"style" : {
//         "fillColor": "['match',['get', 'meest_voorkomend'],'A', '#1a9641','B', '#77c35c','C', '#c4e687', 'D', '#ffffc0','E', '#fec981','F', '#f07c4a','G', '#d7191c','gray']",
//         "fillOpacity": 1,
        
//         "minZoom": 10,
//         "maxZoom": 23
//         },
//     "ClickFunction" : "pand_informatie"
//     }`
// )

// AddVectorTileLayerBubble(
//     'alk_bomen',
//     'ds_alkmaar_bomen',
//     'Point',
//     'https://datalab.alkmaar.nl',
//     'Alkmaar',
//     'Bomen',
//     'LayerLevelMid',
//     `{"style" : {
//         "color": "['case', ['all', ['has', 'monboom'], ['==', ['get', 'monboom'], 'Nee']], 'green', '#cccc00']"
//         },
//     "ClickFunction" : "featureClicked"
//     }`
// )

// single color->    color": "['to-color', 'blue']"



////////////////////
/// 3D gebouwen ///
///////////////////

function createMapsBimLayer(layerName, url, type, scale, lon, lat, height, rot_x, rot_y, rot_z) {
    Promise.all([loadScript('threebox'),loadScript('mapbox3dtiles'),loadScript('deck.gl')]).then(()=>{
        Promise.all([loadScript('gltf-loader'),initialize_threebox_windows()]).then((d)=> {
            // threebox windows are returned by the promise
            // tb_3d_objecten = d[1][0]
            let tb_3d_objecten;
            if (Array.isArray(d[1])) {
                tb_3d_objecten = d[1][0];
            } else {
                tb_3d_objecten = d[1];
            }

            // Add the area to the newly defined threebox
            var building = map.map.addLayer({
                id: layerName,
                type: 'custom',
                renderingMode: '3d',
            
                onAdd: function (map, mbxContext) {
                    let building_options = { 
                        obj: url, 
                        type: type,
                        scale: scale, 
                        units: 'meters', 
                        rotation: {x:rot_x, y:rot_y, z:rot_z}, 
                        anchor: 'center',
                        enableTooltips: true,
                    }
                    // console.debug(building_options)
                    tb_3d_objecten.loadObj(building_options, function (model) {
                        let building = model.setCoords([lon, lat, height]);
                        // building.castShadow = true;
                        building.addTooltip(layerName, true);
                        tb_3d_objecten.add(building);
                        tb_3d_objecten.scene.visible = true;
                    })    
                },
                render: function (gl, matrix) {
                    tb_3d_objecten.update();
                }
            }); 

            // uncomment to move camera slightly to force drawing event
            // render_func
        })
    })
}

async function checkPromiseState(promise) { 
    try { 
        const result = await promise; 
        // console.log("Promise is pending or fulfilled. 222222222222222222222222222222222222222222222"); 
        // Handle the fulfilled state here 
    } catch (error) { 
        showLayerLoadingError();
        console.log(error); 
    } 
} 
  

// function createGeoJsonDataSource(
//     layerName,
//     url,
//     ){
//         try 
//         {
//             var datasource_geoJson = new atlas.source.DataSource('geoJson');
//             map.sources.add(datasource_geoJson);
//             datasource_geoJson.importDataFromUrl(url);
//         }
//         catch {
//             console.log('Kan datasource geoJson niet aanmaken, datasource bestaat mogelijk al.')
//         }   

//         map.sources.add(dataSource);
//         console.log('Created vectordatasource %o',dataSource)
        
//         return dataSource
// }

// function createGeoJsonSource(layerName, dataSource) 
// {


//     geo_point_layer = new atlas.layer.SymbolLayer(layerName, datasource_geoJson, 
//     {
//         // filter: ['all', ['has','visible'], ['==', ['get', 'visible'], 'on']],
//         textOptions: 
//         {
//             // size: 22,
//             // allowOverlap: true, // If true, the text will be visible even if it collides with other previously drawn symbols.
//             // ignorePlacement: true, //If true, other symbols can be visible even if they collide with the text.
//             // optional: false, // If true, icons will display without their corresponding text when the text collides wit other symbols and the icon does not. 
//             // textField: ["get", "visible"]
//         },
//         iconOptions: 
//         {
//             // image: ['get', 'theme'],
//             size: 0.8,
//             allowOverlap: true,
//             optional: false,
//             ignorePlacement: true,
//             visible: true
//         },
//         // strokeColor: ['case', ['has', 'visible'], ['==', ['get', 'visible'], "1"], "#1E90FF", "#1E9000"],
//         visible: true
//     });

//     // map.events.add('click', geo_point_layer, function(e) {
//     // console.log("e: " + e)
//     // load_dashboard(e)
//     // Get the coordinates of the clicked point
//     // var coordinates = e.lngLat.toArray();

//     // // Use the map.queryFeatures method to get the feature that was clicked on
//     // var features = map.queryFeatures({
//     //     layers: ['geo_point_layer'],
//     //     filter: ['==', ['geometry'], coordinates]
//     // });

//     // // If a feature was found, access its properties
//     // if (features.length > 0) {
//     //     var projectID = features[0].properties.projectID;
//     //     console.log('Project ID:', projectID);
//     // }
//     // });
    
//     map.layers.add(geo_point_layer); //, 'labels'

// };