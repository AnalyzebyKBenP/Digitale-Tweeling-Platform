function GetMapCesium(token, coords) {
    Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzZDlmYzRlNC0wN2M1LTQyOTEtYjdjNy03ZTVhZjIzYTMyYzciLCJpZCI6NjcxOTUsImlhdCI6MTYzMTYwNTM4Mn0.EatS_HYxrsAbjUnroBBNiQq8dIns33W8ZKrtBTzQG4Q"
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(coords[0], coords[1], coords[2], coords[3]);
    Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
    Cesium.Camera.OFFSET = new Cesium.HeadingPitchRoll(0, Cesium.Math.toRadians(45), 0);

    // Initializing cesium map
    viewer = new Cesium.Viewer('cesiumMap', {
        //Create an Azure Maps imagery provider for the base road tileset. 
        // imageryProvider: new Cesium.AzureMapsImageryProvider({
        //     authOptions: authOptions,
        //     tilesetId: 'microsoft.base.road',
        // }),
        terrainProvider: new Cesium.createWorldTerrain(),
        baseLayerPicker: false,
        sceneModePicker: false,
        geocoder: true,
        shadows: true,
        timeline: true,
        animation: true,
        homeButton: true,
        navigationHelpButton: true,
        navigationInstructionsInitiallyVisible: true
    });
    // const camera = new Cesium.Camera(scene)
    document.addEventListener('keydown', function (e) {
        setKey(e);
    }, false);

    function setKey(event) {
        var horizontalDegrees = 5.0;
        var verticalDegrees = 5.0;
        var scratchRectangle = new Cesium.Rectangle();
        // viewer.camera.DEFAULT_VIEW_FACTOR = 0;

        var viewRect = viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid, scratchRectangle);
        if (Cesium.defined(viewRect)) {
            horizontalDegrees *= Cesium.Math.toDegrees(viewRect.east - viewRect.west) / 360.0;
            verticalDegrees *= Cesium.Math.toDegrees(viewRect.north - viewRect.south) / 180.0;
        }

        if (event.keyCode === 39) { // right arrow
            viewer.camera.rotateRight(Cesium.Math.toRadians(horizontalDegrees));
        } else if (event.keyCode === 37) { // left arrow
            viewer.camera.rotateLeft(Cesium.Math.toRadians(horizontalDegrees));
        } else if (event.keyCode === 40) { // up arrow
            viewer.camera.rotateUp(Cesium.Math.toRadians(verticalDegrees));
        } else if (event.keyCode === 38) { // down arrow
            viewer.camera.rotateDown(Cesium.Math.toRadians(verticalDegrees));
        }
    }
}

function changeCesiumYear(sourceURL) {
    // All tile layer consists of primitives. loop over these primitives
    for (p = 0; p < viewer.scene.primitives._primitives.length; p++) {
        sourceUrlprim = viewer.scene.primitives._primitives[p]._url
        // If the url of the primitive contains the source url of the specific year set show to true
        if (sourceUrlprim.includes(sourceURL)) {
            viewer.scene.primitives._primitives[p].show = true
        }
        else {
            viewer.scene.primitives._primitives[p].show = false
        }
    }
}

function addCesiumMapControls(controls) {
    const mapControls = document.getElementById('map_controls_3D')
    controls.forEach(async (control) => {
        const button = `
        <button id="2d_btn" class="opacity-0" title="${control.title}" type="button" data-click="3D" data-img="img_25d_btn"
            onclick="change_3D_map(type = 'cesium', tileSet = '${control.tileSet}')">
            <img id="${control.tileSet}" class="absolute w-full h-full top-0 z-10 object-cover"
                src="base/static/images/button_3d.png" alt="${control.title}">
            <span class="absolute w-full h-full inline-block z-20 left-0 bottom-0 bg-linear-black"></span>
            <span data-hover="${control.title}" data-title="${control.title}"
                class="data-hover text-12 absolute w-full inline-block z-30 left-0 bottom-0 text-white"></span>
        </button>`
        mapControls.insertAdjacentHTML('beforeend', button)
    })
}

async function createTileSet(tileSets) {
    await tileSets.forEach(async (tileSet) => {
        await tileSet.sets.forEach(async (set) => {
            await viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
                url: tileSet.url + set,
                useSimpleLighting: tileSet.useSimpleLighting,
                maximumScreenSpaceError: tileSet.maximumScreenSpaceError,
                dynamicScreenSpaceError: tileSet.dynamicScreenSpaceError,
                dynamicScreenSpaceErrorDensity: tileSet.dynamicScreenSpaceErrorDensity,
                dynamicScreenSpaceErrorFactor: tileSet.dynamicScreenSpaceErrorFactor,
                dynamicScreenSpaceErrorHeightFalloff: tileSet.dynamicScreenSpaceErrorHeightFalloff,
            })
            )
        })
    })
}

function changeView2Cesium() {
    // following computation is required in order to compute the center location of the cesium map
    //   Which is required for the camera position in the azure maps.
    //https://community.cesium.com/t/calculate-position-based-on-direction-and-distance/11644/3
    function ReprojectedPoint(latitude, longitude, height, elev, azimut, length) {
        // Define prensent camera location
        latitude = Cesium.Math.toRadians(latitude);
        longitude = Cesium.Math.toRadians(longitude);
        var origin = new Cesium.Cartographic(longitude, latitude, height);
        var originC3 = new Cesium.Cartographic.toCartesian(origin);

        // Altitude (aka Elevation) and Azimuth can also be seen as Pitch and Heading, with Roll = 0:
        var heading = Cesium.Math.toRadians(azimut);
        var pitch = Cesium.Math.toRadians(elev);
        var roll = 0.0;
        var direction = new Cesium.HeadingPitchRoll(heading, pitch, roll);

        var result = createROIfromRotation(origin, direction, length);

        return result
    }

    function createROIfromRotation(position, rotation, length) {
        // position: Cartographic - {latitude, longitude, altitude})
        // rotation: HeadingPitchRoll - {heading, pitch, roll}

        // Based on answer found here:
        // https://stackoverflow.com/questions/58021985/create-a-point-in-a-direction-in-cesiumjs

        var cartesianPosition = Cesium.Ellipsoid.WGS84.cartographicToCartesian(position);

        rotation.heading = rotation.heading - Cesium.Math.toRadians(90);
        var referenceFrame1 = Cesium.Transforms.headingPitchRollQuaternion(cartesianPosition, rotation);
        var rotationMatrix = Cesium.Matrix3.fromQuaternion(referenceFrame1, new Cesium.Matrix3());
        var rotationScaled = Cesium.Matrix3.multiplyByVector(rotationMatrix, new Cesium.Cartesian3(length, 0, 0), new Cesium.Cartesian3());
        var roiPos = Cesium.Cartesian3.add(cartesianPosition, rotationScaled, new Cesium.Cartesian3());

        return roiPos;
    }

    // Get azure maps camera position
    az_loc = map.getCamera()

    // Define specific variables
    lon_left = az_loc.bounds[0]
    lat_left = az_loc.bounds[1]
    lon_right = az_loc.bounds[2]
    lat_right = az_loc.bounds[3]
    lon = az_loc.center[0]
    lat = az_loc.center[1]
    zoom = az_loc.zoom

    // Compute the altitude based on a formula;  (startheight)/(2**zoomlevel)
    altitude = 40075017 / Math.pow(2, zoom)

    // Convert azuremaps location to cartographic
    cart = Cesium.Cartographic.fromDegrees(lon, lat, altitude)

    // Convert pitch to the right scale 
    degrees = az_loc.pitch
    radians = degrees * (Math.PI / 180)

    // Compared to the azure maps (center of the map) the cesium camera position is 'behind'.
    //   Therefore the heading is 180 degrees in the other direction 
    headingview = az_loc.bearing - 180

    // Compute the absolute difference from the cesium camera to the center of the map
    distance = cart.height / (Math.cos(radians))
    // distance = (Math.tan(radians)) * cart.height

    // Compute translate location
    CameraPoint = ReprojectedPoint(
        lat, //Cesium.Math.toDegrees(cart.latitude),
        lon, //Cesium.Math.toDegrees(cart.longitude),
        altitude,
        az_loc.pitch,
        headingview,
        distance
    )

    // Convert reprojected point to cartesian
    cart = Cesium.Cartographic.fromCartesian(CameraPoint)

    cart.height = altitude
    CameraPoint = Cesium.Cartographic.toCartesian(cart)
    heading = az_loc.bearing

    return { CameraPoint, heading, degrees }
}

function changeView2AzureMaps() {
    // following computation is required in order to compute the center location of the cesium map
    //   Which is required for the camera position in the azure maps.
    //https://community.cesium.com/t/calculate-position-based-on-direction-and-distance/11644/3

    function ReprojectedPoint(latitude, longitude, height, elev, azimut, length) {
        // Define prensent camera location
        latitude = Cesium.Math.toRadians(latitude);
        longitude = Cesium.Math.toRadians(longitude);
        var origin = new Cesium.Cartographic(longitude, latitude, height);
        var originC3 = new Cesium.Cartographic.toCartesian(origin);

        // Altitude (aka Elevation) and Azimuth can also be seen as Pitch and Heading, with Roll = 0:
        var heading = azimut //Cesium.Math.toRadians(azimut);
        var pitch = Cesium.Math.toRadians(elev);
        var roll = 0.0;
        var direction = new Cesium.HeadingPitchRoll(heading, pitch, roll);

        var result = createROIfromRotation(origin, direction, length);

        return result
    }

    function createROIfromRotation(position, rotation, length) {
        // position: Cartographic - {latitude, longitude, altitude})
        // rotation: HeadingPitchRoll - {heading, pitch, roll}

        // Based on answer found here:
        // https://stackoverflow.com/questions/58021985/create-a-point-in-a-direction-in-cesiumjs

        var cartesianPosition = Cesium.Ellipsoid.WGS84.cartographicToCartesian(position);

        rotation.heading = rotation.heading - Cesium.Math.toRadians(90);
        var referenceFrame1 = Cesium.Transforms.headingPitchRollQuaternion(cartesianPosition, rotation);
        var rotationMatrix = Cesium.Matrix3.fromQuaternion(referenceFrame1, new Cesium.Matrix3());
        var rotationScaled = Cesium.Matrix3.multiplyByVector(rotationMatrix, new Cesium.Cartesian3(length, 0, 0), new Cesium.Cartesian3());
        var roiPos = Cesium.Cartesian3.add(cartesianPosition, rotationScaled, new Cesium.Cartesian3());
        return roiPos;
    }

    // Convert reporjected point to carthographic (lon, lat, altitude)
    cart = Cesium.Cartographic.fromCartesian(viewer.camera.position)

    // Convert pitch to the right scale 
    degrees = 90 - Math.abs(Cesium.Math.toDegrees(viewer.camera.pitch))
    radians = degrees * (Math.PI / 180)

    // Get the heading of the camera
    headingview = Cesium.Math.toDegrees(viewer.camera.heading)

    // Compute the absolute difference from the cesium camera to the center of the map
    distance = cart.height * (Math.tan(radians))

    // Compute translate location
    centerMap = ReprojectedPoint(
        Cesium.Math.toDegrees(cart.latitude),
        Cesium.Math.toDegrees(cart.longitude),
        cart.height,
        viewer.camera.pitch,
        viewer.camera.heading,
        distance
    )

    // Convert reprojected point to cartesian
    cart = Cesium.Cartographic.fromCartesian(centerMap)

    // Compute zoomlevel based on https://learn.microsoft.com/en-us/azure/azure-maps/zoom-levels-and-tile-grid?tabs=csharp
    zoomlevel = Math.log2((40075017 / cart.height))          //Math.log((40075017/cart.height)) / Math.log(2)

    return { cart, zoomlevel, headingview, degrees }
}