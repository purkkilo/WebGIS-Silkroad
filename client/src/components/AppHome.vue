<script setup>
import { ref, reactive, onMounted } from 'vue'
import L from 'leaflet'
import { LMap, LTileLayer } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import data from '../data/data.json'
import hotelDataJson from '../data/hotels.json'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import {
  mdiMagnify,
  mdiMouseMoveVertical,
  mdiRestart,
  mdiCity,
  mdiMagnifyPlusOutline,
  mdiGithub,
  mdiTextBoxSearchOutline,
  mdiMapSearch,
  mdiDownload,
  mdiRoadVariant,
  mdiEye,
  mdiEyeOff,
  mdiInformationVariant,
  mdiCrosshairsGps,
  mdiCrosshairs,
} from '@mdi/js'

const defaultIcon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.shadowPane = null
// props
const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false,
  },
})
const isDarkMode = props.isDarkMode
// sort state
const sortRoadsBy = ref([{ key: 'id', order: 'asc' }])
const sortCitiesBy = ref([{ key: 'name', order: 'asc' }])
// map / UI state
const zoom = ref(3.5)
const currentZoom = ref(3.5)
const center = ref(L.latLng(26.93514153043711, 73.7505164869342))
const currentCenter = ref(L.latLng(26.93514153043711, 73.7505164869342))
const url = ref('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
const attribution = ref('&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors')
const mapOptions = reactive({ zoomSnap: 0.5 })
const showCityInfo = ref(false)
const dialogCity = reactive({})
const myMap = ref(null) // template ref to the LMap component
const map = ref(null) // leaflet map object (map.value)

// data
const roads = ref(data.roads || [])
const hotels = ref(hotelDataJson.cities || [])
const cityMarkers = ref([])
const hotelMarkers = ref([])
const cityCount = ref(0)
const duplicateCount = ref(0)
const pointList = ref([])
const roadLinesLayer = ref(L.layerGroup())
const roadLines = ref([])
const cities = ref([])
const cityLayer = ref(L.layerGroup())
const hotelLayer = ref(L.layerGroup())
const headers = ref([
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Road', key: 'road', align: 'center' },
  { title: 'Focus on map', key: 'selected', align: 'center', sortable: false },
  { title: 'View info', key: 'viewed', align: 'center', sortable: false },
])
const roadHeaders = ref([
  { title: 'Name', key: 'name', align: 'start' },
  { title: 'Cities', key: 'cities.length', align: 'center' },
  { title: 'Show/Hide', key: 'isHidden', align: 'center', sortable: false },
])
const search = ref('')
const markersHidden = ref(false)
const hotelMarkersHidden = ref(false)
//const google = ref(null);
//const hotelData = reactive({ cities: [] });
const mousePosition = ref('( 0, 0 )')

// mounted
onMounted(() => {
  document.title = 'WebGIS Silkroad'
})

function initMap(leafletMap) {
  map.value = leafletMap

  cityLayer.value.addTo(map.value)
  hotelLayer.value.addTo(map.value)

  map.value.on('mousemove', (event) => {
    const lat = Math.round(event.latlng.lat * 10000) / 10000
    const lng = Math.round(event.latlng.lng * 10000) / 10000
    mousePosition.value = `( ${lat}, ${lng} )`
  })

  populateMap()
}

// Populate the map with roads, city markers and hotels
function populateMap() {
  cityCount.value = 0
  duplicateCount.value = 0
  cities.value = []

  roads.value.forEach((road) => {
    pointList.value = []
    road.cities.forEach((city) => {
      // count duplicates
      const exists = cities.value.find((c) => c.name === city.name)
      if (exists) duplicateCount.value++
      else cityCount.value++

      // add city entry and marker
      addCity(city, road.name)

      // polyline point
      pointList.value.push([city.lat, city.lng])

      // add hotels
      showHotels(city)
    })

    // draw road polyline
    drawRoad(pointList.value, road)
  })
}

function addCity(city, roadName) {
  const id = cities.value.length ? cities.value[cities.value.length - 1].id + 1 : 0
  cities.value.push({
    id,
    name: city.name,
    lat: city.lat,
    lng: city.lng,
    latlng: `${city.lat}, ${city.lng}`,
    road: roadName,
    selected: false,
    viewed: false,
  })

  addMarker([city.lat, city.lng], city.name, false)
}

function addMarker(coords, label, isHotel) {
  let marker

  const hotelIcon = L.icon({
    iconUrl: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/lodging-71.png',
    shadowUrl: 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/lodging-71.png',
    iconSize: [20, 20],
    shadowSize: [20, 20],
  })

  // city icon (AwesomeMarkers if available, else default)
  let cityIcon = defaultIcon
  if (L.AwesomeMarkers?.icon) {
    cityIcon = L.AwesomeMarkers.icon({
      icon: 'city',
      prefix: 'mdi',
      markerColor: 'blue',
    })
  }
  let popupIcon = isHotel
    ? `<i class="mdi mdi-bed" style="color:#44518e"></i>`
    : `<i class="mdi mdi-city" style="color:#2196f3"></i>`

  if (isHotel) {
    marker = L.marker(coords, { icon: hotelIcon })
  } else {
    marker = L.marker(coords, { icon: cityIcon })
  }

  marker.bindPopup(
    `<h1>${popupIcon} ${label}</h1><p><b><i class="mdi mdi-crosshairs-gps" style="color:black"></i> ${coords[0]}, ${coords[1]}</b></p>`,
    { closeButton: true },
  )

  //map.value.addLayer(marker);
  ;(isHotel ? hotelLayer.value : cityLayer.value).addLayer(marker)
  if (isHotel) hotelMarkers.value.push(marker)
  else cityMarkers.value.push(marker)
}

function drawRoad(pointListArg, road) {
  const line = L.polyline(pointListArg, {
    color: road.color,
    weight: 3,
    opacity: 0.5,
    smoothFactor: 1,
  })
  line.id = road.id
  line.isHidden = false
  roadLines.value.push(line)
  roadLinesLayer.value.addLayer(line)
  line
    .bindPopup(
      `
    <div class="leaflet-popup-content">
      <h3>
        ${road.name}
        <i class="mdi mdi-road-variant" style="color:#2196f3"></i>
      </h3>
      <div>${road.cities.length} cities</div>
    </div>
  `,
    )
    .addTo(map.value)
}

function toggleLine(id) {
  const index = roadLines.value.findIndex((l) => l.id === id)
  if (index > -1) {
    const line = roadLines.value[index]
    if (!line.isHidden) {
      map.value.removeLayer(line)
    } else {
      map.value.addLayer(line)
    }
    line.isHidden = !line.isHidden

    const roadIndex = roads.value.findIndex((l) => l.id === id)
    if (roadIndex > -1) {
      roads.value[roadIndex].isHidden = !roads.value[roadIndex].isHidden
    }
  }
}

function toggleMarkers(isHotel) {
  const layer = isHotel ? hotelLayer.value : cityLayer.value
  const hidden = isHotel ? hotelMarkersHidden : markersHidden

  if (!hidden.value) {
    map.value.removeLayer(layer)
  } else {
    map.value.addLayer(layer)
  }

  hidden.value = !hidden.value
}

function findCityFromArray(cityId) {
  const idx = cities.value.findIndex((c) => c.id === cityId)
  return idx > -1 ? cities.value[idx] : null
}

function focusOnCity(cityId) {
  const city = findCityFromArray(cityId)
  if (city && map.value) {
    // scroll UI to map (vuetify's goTo from v2 removed in v3)
    const el = document.getElementById('myMap')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    map.value.flyTo([city.lat, city.lng], 14)
  }
}

function viewCityData(cityId) {
  const city = findCityFromArray(cityId)
  if (city) {
    dialogCity[cityId] = true
    showCityInfo.value = true
  }
}

function showHotels(city) {
  const index = hotels.value.findIndex((c) => c.name === city.name)
  if (index > -1) {
    const hs = hotels.value[index].hotels
    hs.forEach((h) => addMarker([h.lat, h.lng], h.name, true))
  }
}

// getHotels left as-is but converted to use the `google` ref if you choose to re-enable
/*
async function getHotels(city) {
  // disabled unless you configure Loader and google libs
  if (!google.value || !google.value.load) return;
  const g = await google.value.load();
  const dummyMap = new g.maps.Map(document.createElement("div"), {
    center: L.latLng(city.lat, city.lng),
    zoom: 15,
  });
  const service = new g.maps.places.PlacesService(dummyMap);
  const request = {
    location: L.latLng(city.lat, city.lng),
    radius: 100000,
    type: ["hotel"],
  };

  service.nearbySearch(request, function (results, status) {
    if (status == g.maps.places.PlacesServiceStatus.OK) {
      if (!results.length) {
        console.log("No results for: " + city.name);
      } else {
        const hotelsFound = [];
        const limit = results.length > 3 ? 3 : results.length;
        for (let i = 0; i < limit; i++) {
          hotelsFound.push({
            name: results[i].name,
            lat: results[i].geometry.location.lat(),
            lng: results[i].geometry.location.lng(),
          });
        }
        hotelData.cities.push({ name: city.name, hotels: hotelsFound });
      }
    }
  });
}
*/
function download(content, fileName, contentType, stringify) {
  let out = content
  if (stringify) out = JSON.stringify(content)
  const a = document.createElement('a')
  const file = new Blob([out], { type: contentType })
  a.href = URL.createObjectURL(file)
  a.download = fileName
  a.click()
}
</script>
<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card id="myMap" elevation="20" style="padding: 30px">
          <p style="text-align: center; font-size: 18px; font-weight: bold">
            Web app for showing cities along the silkroad, along with some hotel locations close to
            the cities
          </p>
          <v-btn
            text
            variant="outlined"
            href="https://github.com/purkkilo/WebGIS-Silkroad"
            target="_blank"
          >
            <v-icon :icon="mdiGithub" /> Github
          </v-btn>
          <!-- Vue-Leaflet map -->
          <l-map
            :ref="myMap"
            :zoom="zoom"
            :center="center"
            :options="mapOptions"
            style="height: 600px; z-index: 1"
            @ready="initMap"
          >
            <l-tile-layer :url="url" :attribution="attribution" />
          </l-map>

          <v-row>
            <v-col>
              <v-card-title><v-icon :icon="mdiInformationVariant"></v-icon> Map info</v-card-title>
              <v-card-subtitle>
                <span
                  ><v-icon color="blue darken-4" :icon="mdiCrosshairs"></v-icon> Center: ({{
                    currentCenter.lat
                  }}, {{ currentCenter.lng }})<br />
                  <v-icon :icon="mdiMouseMoveVertical"></v-icon> Mouse position: {{ mousePosition
                  }}<br />
                  <v-icon :icon="mdiMagnifyPlusOutline"></v-icon> Zoom: {{ currentZoom }}<br />
                  Zoom by: Double clicking left mouse button, Shift + Draw area while holding left
                  mouse button, Mousewheel, Zoom icons on the map
                </span>
              </v-card-subtitle>
            </v-col>

            <v-col>
              <v-card-title><v-icon :icon="mdiInformationVariant"></v-icon> Road info</v-card-title>
              <v-card-subtitle>
                <span
                  ><v-icon color="grey darken-2" :icon="mdiRoadVariant"></v-icon
                  >{{ roads.length }} roads<br />
                  <v-icon color="blue lighten-1" :icon="mdiCity"></v-icon>{{ cityCount }} unique,
                  {{ cityCount + duplicateCount }} total cities <br />
                  City info and coordinates fetched with leaflet-geosearch and OpenStreetMapProvider
                  <br />
                  Hoteldata fetched from Google Places API
                </span>
              </v-card-subtitle>
            </v-col>
          </v-row>

          <v-card-actions>
            <v-row style="padding: 10px">
              <v-col>
                <v-btn rounded variant="tonal" color="blue" @click="toggleMarkers(false)">
                  <v-icon v-if="markersHidden" :icon="mdiEye"></v-icon>
                  <v-icon v-else :icon="mdiEyeOff"></v-icon>
                  {{ markersHidden ? 'Show cities' : 'Hide cities' }}
                </v-btn>
              </v-col>

              <v-col>
                <v-btn rounded variant="tonal" color="blue darken-2" @click="toggleMarkers(true)">
                  <v-icon v-if="hotelMarkersHidden" :icon="mdiEye"></v-icon>
                  <v-icon v-else :icon="mdiEyeOff"></v-icon>
                  {{ hotelMarkersHidden ? 'Show hotels' : 'Hide hotels' }}
                </v-btn>
              </v-col>

              <v-col>
                <v-btn
                  rounded
                  variant="tonal"
                  color="blue darken-2"
                  @click="map?.flyTo([26.93514153043711, 73.7505164869342], 3.5)"
                >
                  <v-icon color="green" :icon="mdiRestart"></v-icon>Reset map
                </v-btn>
              </v-col>
              <v-col>
                <v-btn
                  text
                  small
                  rounded
                  variant="tonal"
                  color="blue darken-2"
                  @click="download(roads, 'silkroadCityData.json', 'application/json', true)"
                >
                  <v-icon color="green" :icon="mdiDownload"></v-icon>Download City Data
                </v-btn>
              </v-col>

              <v-col>
                <v-btn
                  text
                  small
                  rounded
                  variant="tonal"
                  color="blue darken-2"
                  @click="download(hotels, 'silkroadHotelData.json', 'application/json', true)"
                >
                  <v-icon color="green" :icon="mdiDownload"></v-icon>Download Hotel Data
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card elevation="20">
          <v-card-title>Roads</v-card-title>
          <v-data-table
            :headers="roadHeaders"
            :items="roads"
            item-key="id"
            :sort-by="sortRoadsBy"
            @update:sort-by="sortRoadsBy = $event"
            class="elevation-20"
          >
            <template v-slot:[`item.isHidden`]="{ item }">
              <v-btn rounded variant="tonal" small :color="item.color" @click="toggleLine(item.id)">
                <v-icon v-if="item.isHidden" :icon="mdiEye"></v-icon>
                <v-icon v-else :icon="mdiEyeOff"></v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>

      <v-col>
        <v-card elevation="20" id="cities">
          <v-card-title>Cities</v-card-title>
          <v-data-table
            :headers="headers"
            :items="cities"
            item-key="id"
            :sort-by="sortCitiesBy"
            @update:sort-by="sortCitiesBy = $event"
            class="elevation-20"
            :search="search"
          >
            <template v-slot:top>
              <v-col>
                <v-text-field
                  v-model="search"
                  :append-icon="mdiMagnify"
                  label="Search"
                  single-line
                  hide-details
                />
              </v-col>
            </template>

            <template v-slot:[`item.selected`]="{ item }">
              <v-btn rounded variant="tonal" small color="blue" @click="focusOnCity(item.id)">
                <v-icon :icon="mdiMapSearch"></v-icon>
              </v-btn>
            </template>

            <template v-slot:[`item.viewed`]="{ item }">
              <v-btn
                rounded
                variant="tonal"
                small
                color="blue lighten-2"
                @click="viewCityData(item.id)"
              >
                <v-icon :icon="mdiTextBoxSearchOutline"></v-icon>
              </v-btn>

              <v-dialog v-model="dialogCity[item.id]" max-width="600">
                <v-card>
                  <v-card-title
                    :class="{
                      'text-h5 grey darken-3': isDarkMode,
                      'text-h5 grey lighten-2': !isDarkMode,
                    }"
                  >
                    {{ item.name }}
                  </v-card-title>

                  <v-card-text>
                    <v-list>
                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon color="grey darken-2" :icon="mdiRoadVariant"></v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>{{ item.road }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>

                      <v-list-item>
                        <v-list-item-icon>
                          <v-icon color="grey darken-2" :icon="mdiCrosshairsGps"></v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <v-list-item-title>{{ item.latlng }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card-text>

                  <v-divider />

                  <v-card-actions>
                    <v-spacer />
                    <v-btn color="primary" text @click="dialogCity[item.id] = false"> Close </v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-row style="margin-top: 20px">
      <v-col md="3">
        <v-card dark style="padding: 10px">
          Photo by
          <a
            href="https://unsplash.com/@manuelmeurisse?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            >Manuel Meurisse</a
          >
          on
          <a
            href="https://unsplash.com/?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText"
            >Unsplash</a
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style>
/* keep any custom styles here */
</style>
