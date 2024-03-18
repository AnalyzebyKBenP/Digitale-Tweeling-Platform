// ----------------------------------------------------------------------------------
// Constructor functions (TU delft and/or individual models)
// ----------------------------------------------------------------------------------

function cnstr_tudelft_3d(b3dm_color = '#fcebd4',buildingColor='#C2B280',tilesets=[]) {
    // Tileset structure: tilesets=[{"id": '',"url": ""}]
    Promise.all([loadScript('threebox'),loadScript('mapbox3dtiles'),loadScript('deck.gl')]).then(()=>{
        initialize_threebox_windows().then(() => {
            for(var i=0;i<tilesets.length;i++) {
                var tileslayer = new Mapbox3DTiles.Layer({ 
                    id: 'tu_delft_'+tilesets[i].id, 
                    url : tilesets[i].url,
                    lighting: 'directional', //'ambient',
                    color: b3dm_color,
                    opacity: 1
                });
                map.map.addLayer(tileslayer);   
                tileslayer.scene.scale.z = 1.73
            }
            
            render_func()  
        })
        
        document.getElementById('25d_btn').onclick=function() {change_3D_map('2DGebouwen',0)}
    })
}

function cnstr_tudelft_extruded(color='#fcebd4',opacity=0.7,minZoom=14,lod='lod13',height=['get', 'b3_h_70p']) {
    // lod = ['lod12','lod13','lod22']
    // height = ['b3_h_min', 'b3_h_50p', 'b3_h_70p', 'b3_h_max']
    // b3_dak_type

    tileURL=`https://data.3dbag.nl/api/BAG3D/wms?service=WMS&version=1.3.0&request=GetMap&layers=${lod}&bbox={bbox-epsg-3857}&width=512&height=512&crs=EPSG%3A3857&styles=&format=application%2Fvnd.mapbox-vector-tile`
    datasource_tudelft = new atlas.source.VectorTileSource('ds_tudelft',{
        tiles: [tileURL]
    });
    map.sources.add(datasource_tudelft);


    tudelft_extruded_layer = new atlas.layer.PolygonExtrusionLayer(datasource_tudelft, 'tudelft_extruded_layer', {
        sourceLayer: lod,
        fillColor: color,
        fillOpacity: opacity,
        minZoom: minZoom,
        height: height
    });

    map.layers.add(tudelft_extruded_layer,LayerLevelHigh);
    document.getElementById('25d_btn').onclick=function() {change_3D_map('2DGebouwen',45)}
    document.querySelector('.azure-map-copyright').innerHTML+='<a href="https://docs.3dbag.nl/en/copyright/">© 3DBAG by tudelft3d and 3DGI</a>'
}


//////// deze is vervangen door createMapsBimLayer in add-layer.js
// function cnstr_maps_building(abd_encoded) {
//     abd=JSON.parse(decodeURI(abd_encoded))
//     Promise.all([loadScript('threebox'),loadScript('mapbox3dtiles'),loadScript('deck.gl')]).then(()=>{
//         Promise.all([loadScript('gltf-loader'),initialize_threebox_windows()]).then(()=> {
//             // Azure building data

//             // Add the area to the newly defined threebox
//             var building = map.map.addLayer({
//                 id: abd.name,
//                 type: 'custom',
//                 renderingMode: '3d',
            
//                 onAdd: function (map, mbxContext) {
//                     let building_options = { 
//                         obj: abd.url, 
//                         type: abd.type,
//                         scale: abd.scale, 
//                         units: 'meters', 
//                         rotation: abd.rotation, 
//                         anchor: 'center',
//                         enableTooltips: true,
//                     }
//                     tb_3d_objecten.loadObj(building_options, function (model) {
//                         let building = model.setCoords(abd.coords);
//                         // building.castShadow = true;
//                         building.addTooltip(abd.name, true);
//                         tb_3d_objecten.add(building);
//                         tb_3d_objecten.scene.visible = true;
//                     })    
//                 },
//                 render: function (gl, matrix) {
//                     tb_3d_objecten.update();
//                 }
//             }); 

//             // uncomment to move camera slightly to force drawing event
//             render_func()

//             document.getElementById(abd.name+'_btn_id').onclick=function() {toggle_visibility_threebox_model(abd.url, abd.name+'_btn_id')}
//         })
//     })
// }

// ----------------------------------------------------------------------------------
// Visiblity toggle
// ----------------------------------------------------------------------------------

function visibility_tudelft(set_visibility='toggle'){
    // set_visibility can also be set to true or false

    // get all tu_delft layers
    tu_delft_layers=Object.keys(map.map.style._layers).filter(key => key.startsWith('tu_delft_')).reduce((obj, key) => {
        obj[key] = map.map.style._layers[key];
        return obj;
      }, {});

    if(set_visibility=='toggle') {
        set_visibility=!tu_delft_layers[0].implementation.scene.visible
    }

    for(var i=0;i<Object.keys(tu_delft_layers).length;i++) {
        Object.values(tu_delft_layers)[i].implementation.scene.visible = set_visibility
    }

    render_func()
}

function toggle_visibility_threebox_model(url, checkboxID){       
    tb_3d_objecten.world.children.filter(x => x.userData.obj==url)[0].visible = document.getElementById(checkboxID).checked
    render_func()
}

function change_3D_map(type,pitchAngle = 0) {
    switch(type) {
        case '2D':
            visibility_tudelft(false)
            l=map.layers.getLayerById('tudelft_extruded_layer')
            if(l != 'undefined') {l.setOptions({visible: false})}
            map.map.flyTo({pitch: pitchAngle});
            break;
        case '2DGebouwen':
            visibility_tudelft(true)
            l=map.layers.getLayerById('tudelft_extruded_layer')
            if(l != 'undefined') {l.setOptions({visible: true})}
            map.map.flyTo({pitch: pitchAngle});
            break;
        case 'pitch':
            map.map.flyTo({pitch: pitchAngle});
            break;
        default:
            break;
      }
}
// ----------------------------------------------------------------------------------
// Helper functions
// ----------------------------------------------------------------------------------

function initialize_threebox_windows(){
    // Add a new Threebox for all other 3D objects. This window can be used to switch the visibility to true and false or remove the object

    return new Promise(function (resolve, reject) {
        if (typeof window.tb == "undefined"){
            window.tb_3d_objecten = new Threebox(
                map.map,
                map.map.getCanvas().getContext('webgl'),
                {
                    //realSunlight: true,
                    defaultLights: true,
                    enableSelectingObjects: false, //change this to false to disable 3D objects selection
                    enableDraggingObjects: false, //change this to false to disable 3D objects drag & move once selected
                    enableRotatingObjects: false, //change this to false to disable 3D objects rotation once selected
                    enableTooltips: false // change this to false to disable default tooltips on fill-extrusion and 3D models
                    
                }
            );

            window.tb = new Threebox(
                map.map,
                map.map.getCanvas().getContext('webgl'),
                {
                    //realSunlight: true,
                    defaultLights: true,
                    enableSelectingObjects: false, //change this to false to disable 3D objects selection
                    enableDraggingObjects: false, //change this to false to disable 3D objects drag & move once selected
                    enableRotatingObjects: false, //change this to false to disable 3D objects rotation once selected
                    enableTooltips: false // change this to false to disable default tooltips on fill-extrusion and 3D models
                    
                }
            );

            resolve([tb_3d_objecten,tb])
        } else {
            // still need to return data, will be undefined otherwise
            resolve([tb_3d_objecten,tb])
        }
    });

}

function render_func(){
    // get camera position
    camera_position = map.getCamera()
    zoom_lev = camera_position.zoom
    // update the zoom level very very very slightly -> In order to 'refresh' the map with the buildings
    map.setCamera({
        zoom: zoom_lev+0.0000001
    });
}