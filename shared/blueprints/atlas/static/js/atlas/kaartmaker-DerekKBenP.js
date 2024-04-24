// Function to find the icon for specific theme
function getThemeIcon(theme) {
    themeIcons = {
        "3D":"fa-cube",
        "BAG":"fa-city",
        "BaseMap":"fa-map-location-dot",
        "BGT":"fa-map",
        "BOR":"fa-sliders",
        "Beleid":"fa-hands-holding-circle",
        "Ondergrond":"fa-person-digging",
        "Cultuur":"fa-solid fa-people-group",
        "Economie":"fa-coins",
        "Energie":"fa-bolt",
        "Gebiedsontwikkeling":"fa-chart-area",
        "Geschiedenis":"fa-landmark",
        "Kadaster":"fa-house-circle-check",
        "Klimaat":"fa-cloud-sun-rain",
        "Luchtfoto":"fa-camera",
        "Milieusensoren":"fa-temperature-high",
        "Mobiliteit":"fa-car-side", 
        "Natuur":"fa-leaf",
        "Parkeren":"fa-square-parking",
        "Planologie":"fa-building-columns",
        "RO":"fa-arrow-right-to-city",
        "Sociaal":"fa-people-roof",
        "Sport":"fa-futbol",
        "Veiligheid":"fa-layer-group",
        "WMO":"fa-hands-holding-child",
        "Wonen":"fa-house",
        "Woningbouw":"fa-trowel-bricks",
        "Overig":"fa-layer-group",
        "Vrachtverkeer":"fa-solid fa-truck"
    }

    // console.log(theme)
    // console.log(themeIcons[theme])

    // return icon or default icon if theme not in dict
    return themeIcons[theme] || "fa-layer-group"
}

function createMenuItems(jsonData) {
    let menuItems = "";

    for (const theme in jsonData) {
        if (jsonData.hasOwnProperty(theme)) 
        {
            let menuThemeItems=""
            const groupHeader = `
            <div class="group-header overflow-x-hidden ml-0 after:h-1 px-10">
                <button class="dropdown-btn text-17 border-0 bg-transparent w-full cursor-pointer relative py-10 flex items-center text-text-sidebar after:!right-10">
                    <i class="inline-block pr-7 fa-solid ${getThemeIcon(theme)}"></i>${theme}
                </button>
                <div class="rs_skip block dropdown-container overflow-hidden box-content">
                    <div class="dropdown-elements pl-0 pr-8 mr-8 px-2">
            `;
            
            // Loop over the sub-items within the theme
            for (const item of jsonData[theme].items) {
                if(!item.details) {
                    continue
                }
                // console.log(item)
                var createLayer = ""
                var constructorContent = prepareConstructorLayer(item)
                var view = ""

                var cbClass = 'checkbox-button';

                if(item.type == "wms")
                {
                    createLayer = prepareWMS(item)
                }
                else if (item.type == "wfs")
                {
                    createLayer = prepareWFS(item)
                }
                else if (item.type == "json")
                {
                    createLayer = prepareGeoJson(item)
                }
                else if (item.type == "bim")
                {
                    createLayer = prepareBIM(item)
                    constructorContent = prepareConstructorBim(item)
                    view = `, view_to_coords_maps(${item.details.lon_m}, ${item.details.lat_m}, 18, 34, 60, '${item.layerName}_btn_id')`
                }
                else if (item.type == "vt")
                {
                    createLayer = prepareVectorTile(item)
                }
                else if (item.type == "func")
                {
                    createLayer = item.functions
                }
                else {
                    console.log("TODO: need to add more data types: " + item.type)
                }

                let legendId = `leg_${item.layerName}`;
                if(item.details.wfsClient && item.details.layerName) {
                    legendId = `${item.details.wfsClient}_${item.details.layerName}`;
                }
                
                let global = '';
                if(item.zichtbaarheid === 'publiek') {
                    global = `<i class="public-icon fa-solid fa-earth-americas text-intern-light text-14 ml-7 mt-7 hide"></i>`;
                }

                const menuItem = `
                    <div class="label-container relative">
                        <label class="checkbox-button checkbox-container flex items-start relative ${item.type}" onclick="errorDataId('${item.layerName}_btn_id')">
                            <input type="checkbox"
                                class="opacity-0 absolute left-4 top-7"
                                id="${item.layerName}_btn_id"
                                name="${item.layerName}"
                                onclick="map.ready && (${createLayer}, 
                                    constructorToToggle(this.id, '${constructorContent}') ${view}, 
                                    activate_legend()), 
                                    legend_content('${legendId}'),
                                    layerClick('${item.layerDisplayName}','${item.layerName}'),
                                    layerDisable(this),
                                    openTab(this)
                            ">
                            <span class="checkbox-button-control top-4"></span>
                            <span class="checkbox-label text-16 ml-7 font-light cursor-pointer" id="${item.layerName}_txt_id">${item.layerDisplayName}</span>
                            ${global}
                        </label>
                    </div>`;
                    menuThemeItems += menuItem;
            }
            // legend_content('leg_${item.layerName}'), activate_legend()
            //constructorToToggle(this.id, ${constructorContent}), legend_content('leg_${item.layerName}'), activate_legend() ${view})">
            // ${item.functions} removed because can be empty, resulting in ", )" error

            if(menuThemeItems=='') {
                continue
            }
            menuItems+=groupHeader + menuThemeItems + `</div></div></div>`
        }
    }
    return menuItems;
}

// adds a filter icon, to be called by functionality_{module}.js if {layer} has settings which can be adjusted
function addMenuFilterButton(layerId,onclickfunctionality=() => {}) {
    // insert filter symbol before or after button
    el = document.getElementById(layerId+'_txt_id')
    const filtericon = document.createElement("i");
    filtericon.id=layerId+"_filterbtn"
    filtericon.className="fa-solid fa-filter cursor-pointer absolute -left-8 top-5 hover:text-primary z-10 bg-[#f9f9f9]"
    filtericon.setAttribute("onclick",onclickfunctionality)

    el.closest('.label-container').prepend(filtericon);

}

// --------------------------------------------
//      HELPER - Constructor functions to dynamic create functions 
// --------------------------------------------

/**
* Function which constructs a function to initialize bim layers. This function add the bim model to the threebox model, zooms to the location and add attribute to the legend.
*  As dafault the return is the function in string format. However in expections the return require a function (as promise) which is directly executed.  
* @param {Object} item - Dictionary with all information from the metadata table to create a map
* @param {String} t - if equals 'func_as_string' the response function is in a string format otherwise as a function
* @return {String} prepareConstructorBim(params) as string or as function
*/
function prepareConstructorBim(
    item=item,
    t='func_as_string'
    ){
        // Check if the response of the function has to be a string or a function
        if (t == 'func_as_string'){
            return `toggle_visibility_threebox_model(\\'${item.details.url_m}\\', \\'${item.layerName}_btn_id\\'), view_to_coords_maps(${item.details.lon_m}, ${item.details.lat_m}, 18, 34, 60, \\'${item.layerName}_btn_id\\'), legend_content(\\'leg_${item.layerName}\\'), layerClick(\\'${item.layerDisplayName}\\',\\'${item.layerName}\\')`
        }
        // Return as a function which is executed directly
        else{
            return toggle_visibility_threebox_model(`${item.details.url_m}`, `${item.layerName}_btn_id`), view_to_coords_maps(`${item.details.lon_m}`, `${item.details.lat_m}`, 18, 34, 60, `${item.layerName}_btn_id`), legend_content(`leg_${item.layerName}`), layerClick(`${item.layerDisplayName},${item.layerName}`)
        }
}

/**
* Function which constructs a function to show and hide layers which are already initialized. This function adjust the visibility of the layer and adjust the legend content.
*  As dafault the return is the function in string format. However in expections the return require a function (as promise) which is directly executed.  
* @param {Object} item - Dictionary with all information from the metadata table to create a map
* @param {String} t - if equals 'func_as_string' the response function is in a string format otherwise as a function
* @return {String} prepareConstructorLayer(params) as string or as function
*/
function prepareConstructorLayer(
    item=item,
    t='func_as_string'
    ){
        let legendId = `leg_${item.layerName}`;
        if(item.details.wfsClient && item.details.layerName) {
            legendId = `${item.details.wfsClient}_${item.details.layerName}`;
        }
        // Check if the response of the function has to be a string or a function
        if (t == 'func_as_string'){
            return `show_layer(\\'${item.layerName}_id\\'), legend_content(\\'${legendId}\\'), layerClick(\\'${item.layerDisplayName}\\',\\'${item.layerName}\\')`
        }
        // Return as a function which is executed directly
        else{
            return show_layer(`${item.layerName}_id`), legend_content(`${legendId}`), layerClick(`${item.layerDisplayName},${item.layerName}`)
        }
}

/**
* Function which constructs a function to initialize the layer (as wms). This function is only executed ones in the initial build of the layer
*  As dafault the return is the function in string format. However in expections the return require a function (as promise) which is directly executed.  
* @param {Object} item - Dictionary with all information from the metadata table to create a map
* @param {String} t - if equals 'func_as_string' the response function is in a string format otherwise as a function
* @return {String} loadWMSLayer(params) as string or as function
*/
function prepareWMS(
    item,
    t='func_as_string'
    ){
        // Check if the response of the function has to be a string or a function
        if (t == 'func_as_string'){
            return `loadWMSLayer(
                dsId='${item.layerName}',
                sourceURL='${item.details && item.details.url ? item.details.url : ""}',
                layerName='${item.details && item.details.layer ? item.details.layer : ""}',
                formatLayer='${item.details && item.details.format ? item.details.format : "image%2Fpng"}',
                transparent='${item.details && item.details.transparent ? item.details.transparent : "false"}',
                version='${item.details && item.details.version ? item.details.version : "1.1.0"}',
                projection='${item.details && item.details.projection ? item.details.projection : "EPSG%3A3857"}',
                servicekey='${item.details && item.details.servicekey ? item.details.servicekey : ""}',
                referenceLayer=LayerLevelLow)`
        }
        else{            
            return loadWFSData(
                dsId=item.layerName,
                sourceURL=item.details && item.details.url ? item.details.url : "",
                layerName=item.details && item.details.layer ? item.details.layer : "",
                formatLayer=item.details && item.details.format ? item.details.format : "image%2Fpng",
                transparent=item.details && item.details.transparent ? item.details.transparent : "false",
                version=item.details && item.details.version ? item.details.version : "1.1.0",
                projection=item.details && item.details.projection ? item.details.projection : "EPSG%3A3857",
                servicekey=item.details && item.details.servicekey ? item.details.servicekey : "",
                referenceLayer=LayerLevelLow
            )
        }
}

/**
* Function which constructs a function to initialize the layer. This function is only executed ones in the initial build of the layer
*  As dafault the return is the function in string format. However in expections the return require a function (as promise) which is directly executed.  
* @param {Object} item - Dictionary with all information from the metadata table to create a map
* @param {String} t - if equals 'func_as_string' the response function is in a string format otherwise as a function
* @return {String} - loadWFSData(params) as string or as function
*/
function prepareWFS(
    item,
    t='func_as_string'
    ){
        // Check if the response of the function has to be a string or a function
        if (t == 'func_as_string'){
            return `loadWFSData(
                DSid='${item.layerName}',
                layerType='${item.details && item.details.layerType ? item.details.layerType : ""}',
                dataOrigin='${item.details && item.details.dataOrigin ? item.details.dataOrigin : ""}',
                wfs_client='${item.details && item.details.wfsClient ? item.details.wfsClient : ""}',
                environment='${item.details && item.details.environment ? item.details.environment : ""}',
                layerName='${item.details && item.details.layerName ? item.details.layerName : ""}',
                RequestURL='${item.details && item.details.RequestURL ? item.details.RequestURL : ""}${item.details && item.details.RequestFilter ? "&FILTER="+item.details.RequestFilter : ""}',
                RequestType='${item.details && item.details.RequestType ? item.details.RequestType : ""}',
                referenceLayer=${item.details && item.details.referenceLayer ? item.details.referenceLayer : ""},
                optional='${item.details && item.details.optional ? item.details.optional.replace(/"/g, "@").replace(/'/g, "%") : ""}')`
            }
        else{         
            // return the loadwfsData function as a which can be executed directly
            return loadWFSData(
                DSid=item.layerName,
                layerType=item.details && item.details.layerType ? item.details.layerType : "",
                dataOrigin=item.details && item.details.dataOrigin ? item.details.dataOrigin : "",
                wfs_client=item.details && item.details.wfsClient ? item.details.wfsClient : "",
                environment=item.details && item.details.environment ? item.details.environment : "",
                layerName=item.details && item.details.layerName ? item.details.layerName : "",
                RequestURL=(item.details && item.details.RequestURL ? item.details.RequestURL : "")+(item.details && item.details.RequestFilter ? "&FILTER="+item.details.RequestFilter : ""),
                RequestType=item.details && item.details.RequestType ? item.details.RequestType : "",
                referenceLayer=item.details && item.details.referenceLayer ? item.details.referenceLayer : "",
                optional=item.details && item.details.optional ? item.details.optional.replace(/"/g, "@").replace(/'/g, "%") : ""
            )
        }
}

/**
* Function which constructs a function to initialize the layer (from geojson). This function is only executed ones in the initial build of the layer
*  As dafault the return is the function in string format. However in expections the return require a function (as promise) which is directly executed.  
* @param {Object} item - Dictionary with all information from the metadata table to create a map
* @param {String} t - if equals 'func_as_string' the response function is in a string format otherwise as a function
* @return {String} - loadGeoJsonData(params) as string or as function
*/
function prepareGeoJson(
    item=item,
    t='func_as_string'
    ){
        // Check if the response of the function has to be a string or a function
        if (t == 'func_as_string'){
            return `loadGeoJsonData(
                '${item.layerName}',
                '${item.details && item.details.url ? item.details.url : ""}',
                '${item.details && item.details.layerType ? item.details.layerType : ""}',
                '${item.details && item.details.referenceLayer ? item.details.referenceLayer : ""}',
                '${item.details && item.details.optional ? item.details.optional.replace(/"/g, "@").replace(/'/g, "%") : ""}')`
            }
        else{
            // return the loadGeoJsonData function as a which can be executed directly 
            return loadGeoJsonData(
                layerName=item.layerName,
                url=item.details && item.details.url ? item.details.url : "",
                layerType=item.details && item.details.layerType ? item.details.layerType : "",
                referenceLayer=item.details && item.details.referenceLayer ? item.details.referenceLayer : "",
                optional=item.details && item.details.optional ? item.details.optional.replace(/"/g, "@").replace(/'/g, "%") : ""
                )
        }
}

/**
* Function which constructs a function to initialize the layer/object (bim). This function is only executed ones in the initial build of the object
*  As dafault the return is the function in string format. However in expections the return require a function (as promise) which is directly executed.  
* @param {Object} item - Dictionary with all information from the metadata table to create a map
* @param {String} t - if equals 'func_as_string' the response function is in a string format otherwise as a function
* @return {String} - createMapsBimLayer(params) as string or as function
*/
function prepareBIM(
    item=item,
    t='func_as_string'
    ){
        // Check if the response of the function has to be a string or a function
        if (t == 'func_as_string'){
            return `createMapsBimLayer(
                '${item.layerName}',
                '${item.details && item.details.url_m ? item.details.url_m : ""}',
                '${item.details && item.details.type_m ? item.details.type_m : ""}',
                '${item.details && item.details.scale_m ? item.details.scale_m : ""}',
                '${item.details && item.details.lon_m ? item.details.lon_m : ""}',
                '${item.details && item.details.lat_m ? item.details.lat_m : ""}',
                '${item.details && item.details.height_m ? item.details.height_m : ""}',
                '${item.details && item.details.rotation_x_m ? item.details.rotation_x_m : ""}',
                '${item.details && item.details.rotation_y_m ? item.details.rotation_y_m : ""}',
                '${item.details && item.details.rotation_z_m ? item.details.rotation_z_m : ""}'
            )`
        }
        // return the createMapsBimLayer function as a which can be executed directly
        else {
            createMapsBimLayer(
                layerName=item.layerName,
                url=item.details && item.details.url_m ? item.details.url_m : "",
                type=item.details && item.details.type_m ? item.details.type_m : "",
                scale=item.details && item.details.scale_m ? item.details.scale_m : "",
                lon=item.details && item.details.lon_m ? item.details.lon_m : "",
                lat=item.details && item.details.lat_m ? item.details.lat_m : "",
                height=item.details && item.details.height_m ? item.details.height_m : "",
                rot_x=item.details && item.details.rotation_x_m ? item.details.rotation_x_m : "",
                rot_y=item.details && item.details.rotation_y_m ? item.details.rotation_y_m : "",
                rot_z=item.details && item.details.rotation_z_m ? item.details.rotation_z_m : ""
            )
        }
}

/**
* Function which constructs a function to initialize the layer (as vector tile). This function is only executed ones in the initial build the layer
*  As default the return is the function in string format. However in expections the return require a function (as promise) which is directly executed.  
* @param {Object} item - Dictionary with all information from the metadata table to create a map
* @param {String} t - if equals 'func_as_string' the response function is in a string format otherwise as a function
* @return {String} - loadVectorTileData(params) as string or as function
*/
function prepareVectorTile(
    item=item,
    t='func_as_string'
    ){
        // Check if the response of the function has to be a string or a function
        if (t == 'func_as_string'){ 
            return `loadVectorTileData(
                DSid='${item.layerName}',
                layerType='${item.details && item.details.layerType ? item.details.layerType : ""}',
                geoserverURL='${item.details && item.details.wfsClient ? item.details.wfsClient : ""}',
                environment='${item.details && item.details.environment ? item.details.environment : ""}',
                layerName='${item.details && item.details.layerName ? item.details.layerName : ""}',
                referenceLayer='${item.details && item.details.referenceLayer ? item.details.referenceLayer : ""}',
                optional='${item.details && item.details.optional ? item.details.optional.replace(/"/g, "@").replace(/'/g, "%") : ""}'
            )`
        }
        // return the loadVectorTileData function as a which can be executed directly
        else {
            loadVectorTileData(
                DSid=item.layerName,
                layerType=item.details && item.details.layerType ? item.details.layerType : "",
                geoserverURL=item.details && item.details.wfsClient ? item.details.wfsClient : "",
                environment=item.details && item.details.environment ? item.details.environment : "",
                layerName=item.details && item.details.layerName ? item.details.layerName : "",
                referenceLayer=item.details && item.details.referenceLayer ? item.details.referenceLayer : "",
                optional=item.details && item.details.optional ? item.details.optional.replace(/"/g, "@").replace(/'/g, "%") : ""
            )
        }
}

// function prepareFunction(item) 
// {
//     return `${item.function}`
// }

// --------------------------------------------
//      Constructor functions to dynamic create functions 
// --------------------------------------------

function constructLayer(
    jsonData,
    layerNames,
    visible=false
    ){
        if(!Array.isArray(layerNames)) {
            layerNames=[layerNames]
        }

        // make a single, filtered, flat array of item/layer objects
        thisLayerJSON=flattenArray(
            Object.values(jsonData).map(
                x => x.items.filter(item => layerNames.includes(item.layerName))
            )
        )
        // check if all layers are present
        console.assert(thisLayerJSON.length===layerNames.length,'constructLayer: mismatch between metadatajson: %o and requested layers: %o',thisLayerJSON,layerNames)
        // make array of promises
        
        p=[]
        // Create a promise as return which loads the data & create the layers
        return loadLayerData(
            jsonData=jsonData,
            layerNames=layerNames,
            dataonly=false,
            visible=visible).then(
                // change menu button cnstr to toggle
                thisLayerJSON.forEach(item => {
                    constructorContent = prepareConstructorLayer(item)
                    if (item.type == "bim") {
                        constructorContent = prepareConstructorBim(item)
                    }
                    // console.log(constructorContent)
                    constructorToToggle(item.layerName+"_btn_id",constructorContent.replace(/\\/g, ""))
                    if(visible) {
                        document.getElementById(item.layerName+"_btn_id").checked=true
                        // legend_content('leg_'+item.layerName)
                        activate_legend()
                    }
                })
            )
}

function loadLayerData(
    jsonData,
    layerNames,
    dataonly=true,
    visible=false
    ) {
    console.debug(jsonData)
    if(!Array.isArray(layerNames)) {
        layerNames=[layerNames]
    }

    // make a single, filtered, flat array of item/layer objects
    thisLayerJSON=flattenArray(Object.values(jsonData).map(x => x.items.filter(item => layerNames.includes(item.layerName))))
    // check if all layers are present
    console.assert(thisLayerJSON.length===layerNames.length,'loadLayerData: mismatch between metadatajson: %o and requested layers: %o',thisLayerJSON,layerNames)
    // make array of promises
    p=[]
    thisLayerJSON.forEach(item => {
        console.debug(item.type)
        // TODO Update item.details.optional to use the 'visible' parameter of this function
        // TODO: use the prepare(...) style functions instead of the load(...) functions, as soon as the prepare(...) functions are promise-based
        switch (item.type) {
            case 'wfs':
                console.debug('Not tested yet!')
                // p.push(loadWFSData(
                //     item.layerName,
                //     item.details.layerType && !dataonly ? item.details.layerType : 'None',
                //     item.details.dataOrigin ? item.details.dataOrigin : "",
                //     item.details.wfsClient ? item.details.wfsClient : "",
                //     item.details.environment ? item.details.environment : "",
                //     item.details.layerName ? item.details.layerName : "",
                //     item.details.RequestURL ? item.details.RequestURL : "",
                //     item.details.RequestType ? item.details.RequestType : "",
                //     item.details.referenceLayer ? item.details.referenceLayer : "",
                //     item.details.optional ? item.details.optional.replace(/"/g, "@").replace(/'/g, "%") : ""
                // ))
                p.push(
                    prepareWFS(
                        item,
                        t='func_as_function'
                        )
                )
                break;
            case 'vt':
                console.debug('Not tested yet!')
                // p.push(loadVectorTileData(
                //     item.layerName,
                //     item.details.layerType && !dataonly ? item.details.layerType : 'None',
                //     item.details.dataOrigin ? item.details.dataOrigin : "",
                //     item.details.environment ? item.details.environment : "",
                //     item.details.layerName ? item.details.layerName : "",
                //     item.details.referenceLayer ? item.details.referenceLayer : "",
                //     item.details.optional ? item.details.optional.replace(/"/g, "@").replace(/'/g, "%") : ""
                // ))
                p.push(
                    prepareVectorTile(
                        item,
                        t='func_as_function'
                        )
                )
                break;
            case 'json':
                console.debug('Not tested yet!')
                // p.push(loadGeoJsonData(
                //     item.layerName,
                //     item.details.url ? item.details.url : "",
                //     item.details.layerType && !dataonly ? item.details.layerType : 'None',
                //     item.details.referenceLayer ? item.details.referenceLayer : "",
                //     item.details.optional ? item.details.optional.replace(/"/g, "@").replace(/'/g, "%") : ""
                //     ))
                p.push(
                    prepareGeoJson(
                        item,
                        t='func_as_function'
                        )
                )
                break;
            case 'wms':
                console.debug('Not tested yet!')
                // p.push(loadWFSData(
                //     dsId=item.layerName,
                //     sourceURL=item.details && item.details.url ? item.details.url : "",
                //     layerName=item.details && item.details.layer ? item.details.layer : "",
                //     formatLayer=item.details && item.details.format ? item.details.format : "image%2Fpng",
                //     transparent=item.details && item.details.transparent ? item.details.transparent : "false",
                //     version=item.details && item.details.version ? item.details.version : "1.1.0",
                //     projection=item.details && item.details.projection ? item.details.projection : "EPSG%3A3857",
                //     servicekey=item.details && item.details.servicekey ? item.details.servicekey : "",
                //     referenceLayer=LayerLevelMid
                // ))
                p.push(
                    prepareWMS(
                        item,
                        t='func_as_function'
                        )
                )
                break;
            case 'bim':
                console.debug('Not tested yet!')
                // p.push(createMapsBimLayer(
                //     layerName=item.layerName,
                //     url=item.details && item.details.url_m ? item.details.url_m : "",
                //     type=item.details && item.details.type_m ? item.details.type_m : "",
                //     scale=item.details && item.details.scale_m ? item.details.scale_m : "",
                //     lon=item.details && item.details.lon_m ? item.details.lon_m : "",
                //     lat=item.details && item.details.lat_m ? item.details.lat_m : "",
                //     height=item.details && item.details.height_m ? item.details.height_m : "",
                //     rot_x=item.details && item.details.rotation_x_m ? item.details.rotation_x_m : "",
                //     rot_y=item.details && item.details.rotation_y_m ? item.details.rotation_y_m : "",
                //     rot_z=item.details && item.details.rotation_z_m ? item.details.rotation_z_m : ""
                // ))
                p.push(
                    prepareBIM(
                        item,
                        t='func_as_function'
                        )
                )
                break;
            default:
                console.warn('Unimplemented type for loadLayerData. Type: %o',item.type)
        }
    })
    // return a promise that completes when all data for layers in 'layerNames' has loaded
    return Promise.all(p)
}

function loadMetadata(defaultLayers=[]) {
    // Create combined list of layer_ids based on URL+defaults
    const urlParams = new URLSearchParams(window.location.search);
    const def_m = new Set(defaultLayers);
    if(urlParams.has('m') && urlParams.get('m')!='') {
        url_m = new Set(urlParams.get('m').split(',').map((x) => parseInt(x)));
    } else {
        url_m = new Set([]);
    }
    const joinedSet = new Set([...url_m, ...def_m]); //combine sets
    const m = "m=" + Array.from(joinedSet).join(','); // Convert the joined set back to an array and then to a string
    const g = "&g=" + customer

    return fetch('https://func-smartcityalkmaar-metadata.azurewebsites.net/api/func-smartcityalkmaar-metadata?'+m,{
    // return fetch('http://localhost:7071/api/func-smartcityalkmaar-metadata?'+m+g,{
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    }).then((r) => r.text()).then((jsonData) => {
        const parsedData = JSON.parse(jsonData);

        // Create a list (layerNameList) 
        const layerNameList = [];
        for (const group in parsedData) {
            if (parsedData.hasOwnProperty(group)) {
                for (const item of parsedData[group].items) {
                    layerNameList.push(item.layerName);
                }
            }
        }
        console.debug(parsedData)
        return [parsedData, layerNameList]
    }).catch((err) => {
        console.error('Error during fetching of layers: %o',err)
    })
}

function createMenuFromMetadata(menuContainer,parsedMetaData) {
    // const container = document.getElementById("sidebar-menu-generatedlist");
    if (menuContainer) {
        menuContainer.innerHTML = createMenuItems(parsedMetaData);
    } else { 
        console.warn("warning: sidebar menu container is missing.")
    }
}

function createLegendFromMetadata(legendContainer,parsedMetaData) {
    return fetch('/makelegend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedMetaData)
    }).then((resp) => {
        return resp.text();
    }).then((legendHTML) => {
        if (legendContainer) {
            legendContainer.innerHTML = legendHTML;
        } else { 
            console.warn("warning: legend container is missing.")
        }
    })
}

function createMenuLegendFromMetadata(menuContainer,legendContainer,defaultLayers=[]) {
    data_promise=loadMetadata(defaultLayers)

    menu_promise = data_promise.then(([parsedMetaData,_layerNameList]) => {
        createMenuFromMetadata(menuContainer,parsedMetaData)
    })
    legend_promise = data_promise.then(([parsedMetaData,_layerNameList]) => {
        createLegendFromMetadata(legendContainer,parsedMetaData)
    })

    return [data_promise,menu_promise,legend_promise]
}

function layerClick(layerDisplayName,layerName) {
    let activeLayers = document.getElementById('active-layers');
    if(document.getElementById(layerName + '_tag') === null) {
        let tag = document.createElement('li');

        tag.setAttribute('id',layerName + '_tag');
        tag.setAttribute('class','relative group flex items-center gap-3 pb-0 pt-1 px-6 leading-[21px] rounded cursor-pointer overflow-hidden max-h-0 transition-all duration-500 text-nowrap border border-primary hover:-ml-5 hover:pl-17');
        tag.setAttribute('title','Actieve kaartlaag \'' + layerDisplayName + '\' uitschakelen');
        tag.setAttribute('data-tag',layerName);       
        tag.setAttribute('onclick','tagClick(this)');
        
        tag.innerHTML = `
            <i class="fa-solid fa-xmark max-w-0 overflow-hidden absolute left-5 transition-all duration-500 group-hover:max-w-10 group-hover:text-primary"></i>
            <span>
                ${layerDisplayName}
            </span>`;
        document.querySelector('#active-layers ul').append(tag);

        setTimeout(function(){
            document.querySelector('li[data-tag="' + layerName + '"]').classList.add('!max-h-30');
        },10);
    } else {
        document.querySelector(`[data-tag="${layerName}"]`).remove();
    }
    if(activeLayers.querySelector('ul').childElementCount > 0) {
        activeLayers.classList.add('!translate-y-0','!max-h-[165px]');
    } else {
        activeLayers.classList.remove('!translate-y-0','!max-h-[165px]');
    }
}

function layerDisable(input) {
    if(input.checked == true && document.getElementById('loading_panel_id').style.display === 'block') {
        input.parentElement.classList.add('opacity-30');
        input.setAttribute('disabled',true);        
    }
}

function tagClick(tag) {
    if(document.getElementById('active-layers').dataset.loading === 'false'){
        if(document.getElementById(tag.dataset.tag + '_btn_id').checked = 'false') {
            document.getElementById(tag.dataset.tag + '_btn_id').click();
            tag.remove();
        }
        let activeLayers = document.getElementById('active-layers');
        if(activeLayers.querySelector('ul').childElementCount === 0) {
            activeLayers.classList.remove('!translate-y-0','!max-h-[165px]');
        }
    }
}

function openTab(checkbox) {
    if(checkbox.checked && document.querySelector(`[data-btn="${checkbox.id}"]`)) {
        const tab = document.querySelector(`[data-btn="${checkbox.id}"]`)
        if(!tab.classList.contains('active')) {
            tab.classList.remove('hidden')
            tab.click();
        }
    }
}