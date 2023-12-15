// @ts-check

/**
 * @typedef {object} IpAddressData
 * @property {Outputs} outputs
 * @property {Coordinates} coordinates
 */

/**
 * @typedef {object} Outputs
 * @property {string} ip
 * @property {string} location
 * @property {string} timezone
 * @property {string} isp
 */

/**
 * @typedef {object} Coordinates
 * @property {number} lat
 * @property {number} lng
 */

/** @type {HTMLInputElement|null} */
const input = document.querySelector('#ip_search');

/** @type {HTMLInputElement|null} */
const btn = document.querySelector('#ip_search+button');

/** https://openlayers.org/ */
let map;

// ************************** 1. Events *********************************//

window.addEventListener('load', async () => {
    const newData = await fetchData();
    if (newData !== undefined) {
        /**
         * @type {Coordinates}
         */
        let coordinates = { lat: 52.60311, lng: 39.57076 };
        if (newData) {
            coordinates = newData.coordinates;
            updateOutputs(newData.outputs);
        }

        // @ts-ignore
        const view = new ol.View({
            // @ts-ignore
            center: ol.proj.fromLonLat([coordinates.lng, coordinates.lat]),
            maxZoom: 18,
            zoom: 12
        });

        // @ts-ignore
        const markerLayer = new ol.layer.Vector({
            // @ts-ignore
            source: new ol.source.Vector({
                features: [
                    // @ts-ignore
                    new ol.Feature({
                        // @ts-ignore
                        geometry: new ol.geom.Point(
                            // @ts-ignore
                            ol.proj.fromLonLat(
                                [coordinates.lng, coordinates.lat]
                            )
                        )
                    })
                ]
            }),
            // @ts-ignore
            style: new ol.style.Style({
                // @ts-ignore
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    width: 27,
                    height: 35,
                    src: 'images/icon-location.svg'
                })
            })
        });

        createMap();
        map.addLayer(markerLayer);
        map.setView(view);
    } else {
        const inputDiv = document.querySelector('header>.row>div');
        if (inputDiv) {
            inputDiv.setAttribute('data-status', 'connection-error');
        }
    }
});

input?.addEventListener('input', async (e) => {
    const inputDiv = document.querySelector('header>.row>div');
    if (inputDiv && inputDiv.getAttribute('data-status')) {
        inputDiv.removeAttribute('data-status');
    }
});

input?.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const inputDiv = document.querySelector('header>.row>div');
        if (inputDiv) {
            if (inputDiv.getAttribute('data-status')) {
                inputDiv.removeAttribute('data-status');
            }
            const newData = await fetchData();
            if (newData !== undefined) {
                if (newData) {
                    updateMap(newData);
                } else {
                    inputDiv.setAttribute('data-status', 'warning');
                }
            } else {
                inputDiv.setAttribute('data-status', 'connection-error');
            }
        }
    }
});

btn?.addEventListener('click', async () => {
    const inputDiv = document.querySelector('header>.row>div');
    if (inputDiv) {
        if (inputDiv.getAttribute('data-status')) {
            inputDiv.removeAttribute('data-status');
        }
        const newData = await fetchData();
        if (newData !== undefined) {
            if (newData) {
                updateMap(newData);
            } else {
                inputDiv.setAttribute('data-status', 'warning');
            }
        } else {
            inputDiv.setAttribute('data-status', 'connection-error');
        }
    }
});

// ************************* 2. Functions *******************************//

/**
 * Fetch data from https://geo.ipify.org/. 
 * 
 * Possible states: `undefined` - internet connection error,
 * `null` - bad ip address or domain, `IpAddressData` - all good.
 * @return {Promise<IpAddressData|null|undefined>}
 */
async function fetchData() {
    const url = 'https://geo.ipify.org/api/v2/country,city';
    const apiKey = 'at_MdU6O27iaZac8jML2soKZW6cSxT11';
    const ipAddress = input?.value;
    const domain = input?.value;

    try {
        const response = await fetch(`${url}?apiKey=${apiKey}&ipAddress=${ipAddress}&domain=${domain}`);
        const data = await response.json();
        if (data.code === undefined) {
            return {
                outputs: {
                    ip: data.ip,
                    location: `${data.location.city}, ${data.location.region} ${data.location.postalCode}`,
                    timezone: `UTC ${data.location.timezone}`,
                    isp: data.isp,
                },
                coordinates: {
                    lat: data.location.lat,
                    lng: data.location.lng,
                }
            };
        } else {
            // if incorrect ip address or domain
            return null;
        }
    } catch (error) {
        // if internet connection error
        return undefined;
    }
}

function createMap() {
    // @ts-ignore
    const source = new ol.source.OSM({ maxZoom: 18 });
    // @ts-ignore
    const layer = new ol.layer.Tile({ source: source });

    // @ts-ignore
    map = new ol.Map({
        layers: [
            layer,
        ],
        target: 'map',
    });
}

/**
 * Function which {@link updateOutputs} and {@link setMarker} 
 * @param {IpAddressData} data 
 */
function updateMap(data) {
    if (map === undefined) {
        createMap();
    }
    updateOutputs(data.outputs);
    setMarker(data.coordinates);
}

/**
 * @param {Outputs} outputs
 */
function updateOutputs(outputs) {
    const ip = document.querySelectorAll('output')[0];
    const location = document.querySelectorAll('output')[1];
    const timezone = document.querySelectorAll('output')[2];
    const isp = document.querySelectorAll('output')[3];
    if (ip && location && timezone && isp) {
        ip.textContent = outputs.ip;
        location.textContent = outputs.location;
        timezone.textContent = outputs.timezone;
        isp.textContent = outputs.isp;
    }
}

/**
 * Create new marker on the map and remove previous.
 * @param {Coordinates} coordinates 
 */
function setMarker(coordinates) {
    // @ts-ignore
    const layer = new ol.layer.Vector({
        // @ts-ignore
        source: new ol.source.Vector({
            features: [
                // @ts-ignore
                new ol.Feature({
                    // @ts-ignore
                    geometry: new ol.geom.Point(
                        // @ts-ignore
                        ol.proj.fromLonLat(
                            [coordinates.lng, coordinates.lat]
                        )
                    )
                })
            ]
        }),
        // @ts-ignore
        style: new ol.style.Style({
            // @ts-ignore
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                width: 27,
                height: 35,
                src: 'images/icon-location.svg'
            })
        })
    });

    // @ts-ignore
    const view = new ol.View({
        // @ts-ignore
        center: ol.proj.fromLonLat([coordinates.lng, coordinates.lat]),
        maxZoom: 18,
        zoom: 12
    })

    const layers = map.getAllLayers();
    // remove previous marker
    map.removeLayer(layers[1]);
    // add new marker
    map.addLayer(layer);
    map.setView(view);
}