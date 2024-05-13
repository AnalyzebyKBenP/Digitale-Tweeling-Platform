function cnstr_deelAutos() {
    loading_gif(true)

    // icons
    map.imageSprite.add('MyWheels', 'https://alkmaarsmartcity001.blob.core.windows.net/icons/MyWheelsLogoTrans.png')
    map.imageSprite.add('GreenWheels', 'https://alkmaarsmartcity001.blob.core.windows.net/icons/GreenWheelsLogoTrans.png')
    map.imageSprite.add('ConnectCar', 'https://alkmaarsmartcity001.blob.core.windows.net/icons/ConnectCarLogoTrans.png')

    datasource_deelauto = new atlas.source.DataSource();
    map.sources.add(datasource_deelauto);

    client_geoserver.getFeatures({
        typeNames: 'Smartcity_Alkmaar:DeelAutos',
        }).then(fc => {
        datasource_deelauto.add(fc);
        deelauto_symbol_layer = new atlas.layer.SymbolLayer(datasource_deelauto, null, {
            iconOptions: {
                    image: [
                        'case',
                        ['all', ['has', 'bedrijf'], ['==', ['get', 'bedrijf'], 'MyWheels']],
                        'MyWheels',
                        ['all', ['has', 'bedrijf'], ['==', ['get', 'bedrijf'], 'GreenWheels']],
                        'GreenWheels', "ConnectCar"
                    ],
                    size: 1
                }, 
                //visible: false,
                maxZoom: 24,
                minZoom: 0,
                opacity : 1
            });

        map.layers.add(deelauto_symbol_layer,LayerLevelHigh);

        loading_gif(false)
    })
    .catch(err => {
        console.log(err)
        // alert(`Data kon niet opgehaald worden`);
        loading_gif(false)
        document.getElementById('error_panel_id').style.display = "block"
    });
}