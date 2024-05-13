function constructorToToggle(id, newFunc) {
    // Change behavior of the button from constructing (a layer) to toggling
    document.getElementById(id).style.fontWeight = "bold";
    document.getElementById(id).setAttribute('onclick', newFunc);
}

function flattenArray(arr) {
    return arr.reduce((flat, current) => {
        if (Array.isArray(current)) {
            return flat.concat(flattenArray(current));
        } else {
            return flat.concat(current);
        }
    }, []);
}

// changed from the layername as var to map.layers.getLayerById by string
/**
* Function to adjust the visibility of the layer. Can handel a list of layer ids ofjust one
* @param {String/Object} targetLayerId - String or an object of strings with the layer ids
*/
function show_layer(targetLayerId) {
    // Convert layerid to object if it is a string. Allows to loop over it
    if (typeof targetLayerId == 'string') {
        targetLayers = Array(targetLayerId)
    }
    else {
        targetLayers = targetLayerId
    }

    // Loop over the object with objectids
    for (l = 0; l < targetLayers.length; l++) {
        // Select the layer of interest
        const layer = map.layers.getLayerById(targetLayers[l]);
        // Try to set the visibility to false if the was true and vice versa
        try {
            // adjust the visibility of the layer, makes it visible or hidden
            if (layer.options.visible == false) {
                layer.setOptions({
                    visible: true
                })
                // Every time a layer is shown the legend becomes active
                // show_legenda() >> replaced by activate_legend()
                activate_legend()
            } else {
                layer.setOptions({
                    visible: false
                })
            }
        } catch (error) {
            console.error(error);
            showLayerLoadingError();
        }
    }
}

function legend_content(layer) {
    // Needs to be set to lowercase to match ID's 
    if (document.getElementById(layer)) {
        layer_status = document.getElementById(layer).style.display
        if (layer_status === "block") {
            document.getElementById(layer).style.display = "none"
            document.getElementById(layer).classList.remove('readspeaker_content');
        } else {
            document.getElementById(layer).style.display = "block"
            document.getElementById(layer).classList.add('readspeaker_content');
        }
    }

    let legendActive = false;
    document.querySelectorAll('#sidebar-legend-generated > div').forEach(function (legend) {
        if (legend.style.display === "block") {
            legendActive = true;
        }
    });

    if (legendActive === true) {
        activate_legend()
    } else {
        activate_legend('block')
    }
}

function activate_legend(display = 'none') {
    // When the layer is initialized. The legend side panel is shown. 
    if (document.getElementById('legenda_sidepanel')) {
        document.getElementById('legenda_sidepanel').style.display = display;
        if (display === 'none') {
            document.getElementById('legenda_sidepanel').classList.remove('readspeaker_content');
        } else {
            document.getElementById('legenda_sidepanel').classList.add('readspeaker_content');
        }
    }
}

function loading_gif(loading) {
    if (loading == true) {
        document.getElementById('loading_panel_id').style.display = "block";
        document.getElementById('active-layers').dataset.loading = 'true';
        document.getElementById('active-layers-list').classList.add('opacity-30');
        document.querySelector('#active-layers .loader-container').classList.remove('!hidden');
    } else {
        showLayerLoadingError(false);
        document.getElementById('active-layers').dataset.loading = 'false'
        document.getElementById('active-layers-list').classList.remove('opacity-30');
        document.querySelector('#active-layers .loader-container').classList.add('!hidden');
        document.querySelectorAll('#sidebar-menu-generatedlist input[disabled="true"]').forEach(function (input) {
            input.parentElement.classList.remove('opacity-30');
            input.removeAttribute('disabled');
        });
    }
}

function hide_loading_gif() {
    document.getElementById('loading_panel_id').style.display = 'none';
}

function loading_gif_small(loading) {
    if (loading == true) {
        document.getElementById('loading_panel_small_id').style.display = "block"
    } else {
        document.getElementById('loading_panel_small_id').style.display = "none"
    }
}

function trafficBumpSwitch(input) {
    const label = document.getElementById(input.id).parentElement;
    const toggler = label.parentElement.querySelector('.toggler');
    const textWhite = label.parentElement.querySelector('.text-white');
    if (!label.classList.contains('text-white')) {
        textWhite.classList.remove('text-white');
        label.classList.add('text-white');
        toggler.classList.toggle('translate-x-100p');
        toggler.classList.toggle('-translate-x-0');
    }
}

// Function to facilitate on-demand loading of JavaScript (or CSS)
// Returns a promise. The promise is resolved when the script is loaded & ready for use
function loadScript(scriptname, type = 'script') {
    // console.debug(scriptname)
    // console.debug(optionalScripts)
    // get src for current scriptname
    // The variable optionalScripts is defined in atlas.html
    // The variable optionalScriptsMOW is defined in mow.html
    src = ''
    if (typeof optionalScripts !== 'undefined') {
        if (optionalScripts.hasOwnProperty(scriptname)) {
            src = optionalScripts[scriptname]
        }
    }
    if (typeof optionalScriptsMOW !== 'undefined') {
        if (optionalScriptsMOW.hasOwnProperty(scriptname)) {
            src = optionalScriptsMOW[scriptname]
        }
    }
    if (src === '') {
        console.error('Attempting to load script not defined in the object(s) optionalScripts: %o', { optionalScripts, optionalScriptsMOW })
    }

    if (typeof src !== 'object') {
        src = [src]
    }

    var promises = []
    for (var i = 0; i < src.length; i++) {
        promises.push(new Promise(function (resolve, reject) {
            if (src[i] == "loaded") {
                // script exist and is loaded
                // console.log(`Script ${scriptname} already loaded`)
                resolve()
            } else if (document.querySelectorAll(type + "[src='" + src[i] + "']").length === 0) {
                // load script if it hasn't been loaded yet
                var script = document.createElement('script');
                script.onload = function () {
                    // console.log(`Script ${scriptname} loaded`)
                    if (typeof optionalScripts !== 'undefined') {
                        if (optionalScripts.hasOwnProperty(scriptname)) {
                            optionalScripts[scriptname] = "loaded"
                        }
                    }
                    if (typeof optionalScriptsMOW !== 'undefined') {
                        if (optionalScriptsMOW.hasOwnProperty(scriptname)) {
                            optionalScriptsMOW[scriptname] = "loaded"
                        }
                    }
                    resolve();
                };
                script.onerror = function (err) {
                    console.log('loadScript error: %o', err)
                    reject(`LoadScript failed for script with name ${scriptname}`);
                };
                script.src = src[i];
                document.body.appendChild(script);
            } else {
                // console.log(`Script ${scriptname} already being loaded`)
                document.querySelector(type + "[src='" + src[i] + "']").addEventListener("load", () => {
                    // console.log(`Script ${scriptname} queue resolving`)
                    resolve();
                });
            }
        }))
    }
    return Promise.all(promises)
}

function get_sas_by_url(url, sub_id = "") {
    // get storage account name from URL
    body = { "staccname": url.split('.blob.core.windows.net')[0].split('https://')[1] }
    if (sub_id !== "") { body['sub_id'] = sub_id } //optionally add subscription_id (defaults to env var setting of webapp)

    return fetch('/api/get_sas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    }).then((response) => {
        if (response.ok) {
            return response.text();
        } else {
            throw new Error('Response status not ok');
        }
    }).then((sas) => {
        return sas
    })
}

function showLayerLoadingError(status = true) {
    if (status) {
        document.getElementById('loading_panel_content_id').style.display = 'none';
        document.getElementById('loading_panel_content_error').style.display = 'flex';
        document.getElementById('loading_panel_id').style.display = 'block';
    } else {
        document.getElementById('loading_panel_id').style.display = "none";
        document.getElementById('loading_panel_content_id').style.display = 'flex';
        document.getElementById('loading_panel_content_error').style.display = 'none';
    }
}

function errorDataId(targetLayerBtnId) {
    document.getElementById('loading_panel_error_click').dataset.checkboxId = targetLayerBtnId;
}

function errorDataClick(button) {
    if (button.dataset.checkboxId) {
        document.getElementById(button.dataset.checkboxId).checked = false;
    }
}

// ----------------------------------------------------------------------------------
//      OTHER FUNCTIONALITIES
// ----------------------------------------------------------------------------------

function show_3d_view() {

    // display azure maps
    var display_map1 = document.getElementById('map').style.width === '0%' ? '100%' : '0%';
    document.getElementById('map').style.width = display_map1

    // display cesium
    var display_cesiumMap = document.getElementById('cesiumMap').style.display === 'block' ? 'none' : 'block';
    document.getElementById('cesiumMap').style.display = display_cesiumMap

    if (display_cesiumMap == 'block') {
        show_view('fotorealistisch')
        remove_controls();

        // Alters the social facilities legend when the map is changed to cesium (only if layer is active)
    }
    else {
        add_controls();
        show_view('maps') // anything else than 'fotorealistisch' will work here

        // Alters the social facilities legend when the map is changed to azure maps (only if layer is active)

        // Get camera reprojected position of the camera in the azure maps (center of the map) 
        centerMapLoc = changeView2AzureMaps()

        // Define the specific variables, location, zoomlevel etc
        centerMap = centerMapLoc.cart
        zoomlevel = centerMapLoc.zoomlevel
        headingview = centerMapLoc.headingview
        pitch = centerMapLoc.degrees

        // Change the azure maps camera position to the same location as the cesium map
        map.setCamera({
            center: [Cesium.Math.toDegrees(centerMap.longitude),
            Cesium.Math.toDegrees(centerMap.latitude)],
            zoom: zoomlevel,
            pitch: pitch,
            bearing: headingview
        });
    }
    // Get camera reprojected position of the camera in the cesium map (position of the camera) 
    CameraPointLoc = changeView2Cesium()

    // Define specific variables; location, heading and pitch
    cameraPoint = CameraPointLoc.CameraPoint
    headingview = CameraPointLoc.heading
    pitch = CameraPointLoc.degrees

    // Zoom to the location of the camera in the cesium map
    if (viewer !== undefined) {
        viewer.camera.flyTo({
            destination: cameraPoint,
            duration: 0,
            orientation: {
                heading: Cesium.Math.toRadians(headingview),
                pitch: -Cesium.Math.toRadians(pitch),
                roll: 0.0
            }
        });
    }
}

function show_full_3d(elm) {

    var display_btn_value = document.getElementById('show_full_3d_view_btn').value === 'Fullscreen 3D' ? 'Hide 3D View' : 'Fullscreen 3D';
    document.getElementById('show_full_3d_view_btn').value = display_btn_value

}

function show_view(view_layers) {
    // input_a = all (alle type weergaves, maps en cesium)
    // create list of elements in class "expert"
    var elements_maps_btn = document.getElementsByClassName("checkbox-button__input_maps");
    var elements_maps_txt = document.getElementsByClassName("checkbox-button__label_maps");
    var elements_maps_foto_btn = document.getElementsByClassName("checkbox-button__input_maps_foto");
    var elements_maps_foto_txt = document.getElementsByClassName("checkbox-button__label_maps_foto");
    var elements_fotorealistisch_btn = document.getElementsByClassName("checkbox-button__input_foto");
    var elements_fotorealistisch_txt = document.getElementsByClassName("checkbox-button__label_foto");

    // BASIS/UITGEBREID er uit slopen, zonder fotorealistisch kwijt te raken
    if (view_layers == "maps") {
        for (var i = 0; i < elements_maps_btn.length; i++) {
            document.getElementById(`${elements_maps_btn[i].id}`).disabled = false;
            document.getElementById(`${elements_maps_txt[i].id}`).style.color = 'black';
        }
        for (var i = 0; i < elements_maps_foto_btn.length; i++) {
            document.getElementById(`${elements_maps_foto_btn[i].id}`).disabled = false;
            document.getElementById(`${elements_maps_foto_txt[i].id}`).style.color = 'black';
        }
        for (var i = 0; i < elements_fotorealistisch_btn.length; i++) {
            document.getElementById(`${elements_fotorealistisch_btn[i].id}`).disabled = true;
            document.getElementById(`${elements_fotorealistisch_txt[i].id}`).style.color = 'lightgray';
        }
    }
    else
    // (view_layers == 'fotorealistisch')
    {
        for (var i = 0; i < elements_maps_btn.length; i++) {
            document.getElementById(`${elements_maps_btn[i].id}`).disabled = true;
            document.getElementById(`${elements_maps_txt[i].id}`).style.color = 'lightgray';
        }
        for (var i = 0; i < elements_maps_foto_btn.length; i++) {
            document.getElementById(`${elements_maps_foto_btn[i].id}`).disabled = false;
            document.getElementById(`${elements_maps_foto_txt[i].id}`).style.color = 'black';
        }
        for (var i = 0; i < elements_fotorealistisch_btn.length; i++) {
            document.getElementById(`${elements_fotorealistisch_btn[i].id}`).disabled = false;
            document.getElementById(`${elements_fotorealistisch_txt[i].id}`).style.color = 'black';
        }
    }
}