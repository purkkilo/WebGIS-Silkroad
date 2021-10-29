<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card
          id="myMap"
          elevation="20"
          :dark="isDarkMode"
          style="padding:30px"
        >
          <p>
            Web app for showing cities along the silkroad, along with some hotel
            locations close to the cities
          </p>
          <v-btn
            text
            outlined
            href="https://github.com/purkkilo/WebGIS-Silkroad"
            target="_blank"
          >
            <v-icon>mdi-github</v-icon> Github
          </v-btn>
          <l-map
            :zoom="zoom"
            :center="center"
            :options="mapOptions"
            style="height: 600px;z-index:1"
            @update:center="centerUpdate"
            @update:zoom="zoomUpdate"
            @ready="initMap()"
            ref="myMap"
          >
            <l-tile-layer :url="url" :attribution="attribution" />
          </l-map>
          <v-row>
            <v-col>
              <v-card-title
                ><v-icon>mdi-information-variant</v-icon> Map info</v-card-title
              >
              <v-card-subtitle>
                <span
                  ><v-icon color="blue darken-4">mdi-crosshairs</v-icon> Center:
                  ({{ currentCenter.lat }}, {{ currentCenter.lng }})<br />
                  <v-icon>mdi-mouse-move-vertical</v-icon> Mouse position:
                  {{ mousePosition }}<br />
                  <v-icon>mdi-magnify-plus-outline</v-icon> Zoom:
                  {{ currentZoom }}
                </span>
              </v-card-subtitle>
            </v-col>
            <v-col>
              <v-card-title
                ><v-icon>mdi-information-variant</v-icon> Road
                info</v-card-title
              >
              <v-card-subtitle>
                <span
                  ><v-icon color="grey darken-2">mdi-road-variant</v-icon
                  >{{ roads.length }} roads<br />
                  <v-icon color="blue lighten-1">mdi-city</v-icon
                  >{{ cityCount }} unique,
                  {{ cityCount + duplicateCount }} total cities <br />
                  City info and coordinates fetched with leaflet-geosearch and
                  OpenStreetMapProvider <br />
                  Hoteldata fetched from Google Places API
                </span>
              </v-card-subtitle>
            </v-col>
          </v-row>

          <v-card-actions>
            <v-row>
              <v-col>
                <v-btn
                  rounded
                  outlined
                  color="blue"
                  @click="toggleMarkers(false)"
                  ><v-icon v-if="markersHidden">mdi-eye</v-icon
                  ><v-icon v-else>mdi-eye-off</v-icon
                  >{{ markersHidden ? "Show cities" : "Hide cities" }}</v-btn
                >
              </v-col>
              <v-col>
                <v-btn
                  rounded
                  outlined
                  color="blue darken-2"
                  @click="toggleMarkers(true)"
                  ><v-icon v-if="hotelMarkersHidden">mdi-eye</v-icon
                  ><v-icon v-else>mdi-eye-off</v-icon
                  >{{
                    hotelMarkersHidden ? "Show hotels" : "Hide hotels"
                  }}</v-btn
                >
              </v-col>
              <v-col>
                <v-btn
                  rounded
                  outlined
                  color="blue darken-2"
                  @click="map.flyTo([32.54681317351517, 67.7821466853562], 2)"
                  ><v-icon color="green">mdi-restart</v-icon>Reset map</v-btn
                >
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-btn
                  text
                  small
                  rounded
                  outlined
                  color="blue darken-2"
                  @click="
                    download(
                      roads,
                      'silkroadCityData.json',
                      'application/json',
                      true
                    )
                  "
                  ><v-icon color="green">mdi-download</v-icon>Download City
                  Data</v-btn
                >
              </v-col>
              <v-col>
                <v-btn
                  text
                  small
                  rounded
                  outlined
                  color="blue darken-2"
                  @click="
                    download(
                      hotels,
                      'silkroadHotelData.json',
                      'application/json',
                      true
                    )
                  "
                  ><v-icon color="green">mdi-download</v-icon>Download Hotel
                  Data</v-btn
                >
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card :dark="isDarkMode" elevation="20">
          <v-card-title>Roads</v-card-title>
          <v-data-table
            :headers="roadHeaders"
            :items="roads"
            item-key="id"
            sort-by="id"
            class="elevation-20"
          >
            <template v-slot:[`item.isHidden`]="{ item }">
              <v-btn
                rounded
                outlined
                small
                :color="item.color"
                @click="toggleLine(item.id)"
                ><v-icon v-if="item.isHidden">mdi-eye</v-icon
                ><v-icon v-else>mdi-eye-off</v-icon
                >{{ item.isHidden ? "Show" : "Hide" }}</v-btn
              >
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col>
        <v-card :dark="isDarkMode" elevation="20" id="cities">
          <v-card-title>Cities</v-card-title>
          <v-data-table
            :headers="headers"
            :items="cities"
            item-key="id"
            sort-by="id"
            class="elevation-20"
            :search="search"
          >
            <template v-slot:top>
              <v-col>
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="Search"
                  single-line
                  hide-details
                ></v-text-field>
              </v-col>
            </template>
            <template v-slot:[`item.selected`]="{ item }">
              <v-btn
                rounded
                outlined
                small
                color="blue"
                @click="focusOnCity(item.id)"
                ><v-icon>mdi-map-search</v-icon>Focus</v-btn
              >
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col md="3">
        <v-card dark style="padding:10px;background: rgba(1,1,1,0.5);">
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

<script>
import L from "leaflet";
import { LMap, LTileLayer } from "vue2-leaflet";
import cityData from "../data/data.json";
import hotels from "../data/hotels.json";
import "leaflet.awesome-markers";
//import { OpenStreetMapProvider } from "leaflet-geosearch";   // Used in getting city coordinates
//import { Loader } from "@googlemaps/js-api-loader";          // Used in getting hotels from given city

export default {
  name: "Map",
  components: {
    LMap,
    LTileLayer,
  },
  props: ["isDarkMode"],
  data() {
    return {
      zoom: 2,
      center: L.latLng(32.54681317351517, 67.7821466853562),
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      currentZoom: 2,
      currentCenter: L.latLng(32.54681317351517, 67.7821466853562),
      showParagraph: false,
      mapOptions: {
        zoomSnap: 0.5,
      },
      map: null,
      roads: cityData.roads,
      //provider: new OpenStreetMapProvider({ language: "en" }),
      cityMarkers: [],
      hotelMarkers: [],
      cityCount: 0,
      duplicateCount: 0,
      pointList: [],
      roadLinesLayer: L.layerGroup(),
      roadLines: [],
      cities: [],
      headers: [
        {
          text: "Name",
          value: "name",
          align: "start",
        },
        { text: "Road", value: "road", align: "right" },
        {
          text: "Focus on map",
          value: "selected",
          align: "right",
          sortable: false,
        },
      ],
      roadHeaders: [
        {
          text: "Name",
          value: "name",
          align: "start",
        },
        { text: "Cities", value: "cities.length", align: "right" },
        {
          text: "Show/Hide",
          value: "isHidden",
          align: "right",
          sortable: false,
        },
      ],
      search: "",
      markersHidden: false,
      hotelMarkersHidden: false,
      google: null,
      hotels: hotels.cities,
      hotelData: {
        cities: [],
      },
      mousePosition: "( 0, 0 )",
    };
  },
  mounted() {
    document.title = "WebGIS silkroad";
    /* Used to fetch hotels from google places api, data cached to /data/hotels.json
      this.google = new Loader({
        apiKey: <Apikey>,
        version: "weekly",
        libraries: ["places"],
        language: "en",
      });
    */
  },
  methods: {
    // Get reference for the map, and populate it
    initMap() {
      this.map = this.$refs.myMap.mapObject;
      // For getting mouseposition
      this.map.addEventListener("mousemove", (event) => {
        let lat = Math.round(event.latlng.lat * 10000) / 10000;
        let lng = Math.round(event.latlng.lng * 10000) / 10000;
        this.mousePosition = `( ${lat}, ${lng} )`;
      });
      this.populateMap();
    },
    zoomUpdate(zoom) {
      this.currentZoom = zoom;
    },
    centerUpdate(center) {
      this.currentCenter = center;
    },
    // Populate the map with markers for cities and hotels, and polylines for roads
    populateMap() {
      this.cityCount = 0;
      this.roads.forEach((road) => {
        this.pointList = [];
        road.cities.forEach((city) => {
          this.cities.find((c) => c.name === city.name)
            ? ++this.duplicateCount
            : ++this.cityCount;

          // Add marker for city
          this.addCity([city.lat, city.lng], city.name, road.name, null);
          // Add point for polyline
          this.pointList.push([city.lat, city.lng]);
          // Show hotels located in the city
          this.showHotels(city);
        });
        // Draw the road
        this.drawRoad(this.pointList, road);
      });
    },
    // Add city to array and add marker to it's place on the map
    addCity(coords, city, road) {
      let id = this.cities.length
        ? this.cities[this.cities.length - 1].id + 1
        : 0; // Id for city to find them from the array
      // Add city to array for data-table
      this.cities.push({
        id: id,
        name: city,
        lat: coords[0],
        lng: coords[1],
        latlng: `${coords[0]}, ${coords[1]}`,
        road: road,
        selected: false,
      });
      // Place marker
      this.addMarker(coords, city, false);
    },
    // Add marker for city/hotel
    addMarker(coords, label, isHotel) {
      let id = this.cityMarkers.length
        ? this.cityMarkers[this.cityMarkers.length - 1].id + 1
        : 0; // Id for marker to find them from the array

      let marker;
      // Different icons for hotel and city
      const cityIcon = L.AwesomeMarkers.icon({
        icon: "city",
        prefix: "mdi",
        markerColor: "blue",
      });
      const hotelIcon = L.icon({
        iconUrl:
          "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/lodging-71.png",
        shadowUrl:
          "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/lodging-71.png",
        iconSize: [20, 20], // size of the icon
        shadowSize: [20, 20], // size of the shadow
      });

      // If marker is for hotel, use hotel's icon
      if (isHotel) {
        marker = L.marker(coords, {
          icon: hotelIcon,
          iconSize: [15, 15],
          shadowSize: [15, 15],
        });
        marker.bindPopup(
          `<h1>${label} <i class="blue--text mdi mdi-bed icon-white"></i></h1><p><b>${coords[0]}, ${coords[1]}</b> <i class="mdi mdi-crosshairs-gps icon-white"></p>`,
          {
            closeButton: true,
          }
        );
      } else {
        // else use marker with city icon
        marker = L.marker(coords, {
          icon: cityIcon,
          iconSize: [15, 15],
          shadowSize: [15, 15],
        });
        marker.bindPopup(
          `<h1>${label} <i class="blue--text mdi mdi-city icon-white"></i></h1><p><b>${coords[0]}, ${coords[1]}</b> <i class="mdi mdi-crosshairs-gps icon-white"></p>`,
          {
            closeButton: true,
          }
        );
      }

      // Add marker to map
      marker.id = id;
      this.map.addLayer(marker);

      // depending on if the marker is for hotel, choose array
      if (isHotel) {
        this.hotelMarkers.push(marker);
      } else {
        this.cityMarkers.push(marker);
      }
    },
    drawRoad(pointList, road) {
      // Add array of coordinates to line and form polyline from it
      const line = L.polyline(pointList, {
        color: road.color,
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1,
      });
      line.id = road.id;
      line.isHidden = false;
      this.roadLines.push(line);
      // Add the current line to layer of roadLinesLayer for toggling/deleting roadLines
      this.roadLinesLayer.addLayer(line);
      // Show road on the map
      line
        .bindPopup(
          `<h1>${road.name} <i class="blue--text mdi mdi-road-variant icon-white"></i></h1><div class="headline">${road.cities.length} cities</div>`
        )
        .addTo(this.map);
    },
    // Toggle road's visibility on the map
    toggleLine(id) {
      // Find road in the array
      let index = this.roadLines.findIndex((l) => l.id === id);
      // if found (should be found always, but still)
      if (index > -1) {
        const line = this.roadLines[index];
        // If road is hidden, show it and vice versa
        if (!line.isHidden) {
          this.map.removeLayer(this.roadLines[index]);
        } else {
          this.map.addLayer(this.roadLines[index]);
        }
        line.isHidden = !line.isHidden;

        // Update road on the data-table
        const roadIndex = this.roads.findIndex((l) => l.id === id);
        if (roadIndex > -1) {
          const road = this.roads[roadIndex];
          road.isHidden = !road.isHidden;
        }
      }
    },
    // Toggle markers visibility on the map
    toggleMarkers(isHotel) {
      // if isHotel, hide/show hotelmarkers
      if (isHotel) {
        if (!this.hotelMarkersHidden) {
          this.hotelMarkers.forEach((marker) => {
            this.map.removeLayer(marker);
          });
        } else {
          this.hotelMarkers.forEach((marker) => {
            this.map.addLayer(marker);
          });
        }
        this.hotelMarkersHidden = !this.hotelMarkersHidden;
      } else {
        // otherwise hide/show normal markers
        if (!this.markersHidden) {
          this.cityMarkers.forEach((marker) => {
            this.map.removeLayer(marker);
          });
        } else {
          this.cityMarkers.forEach((marker) => {
            this.map.addLayer(marker);
          });
        }
        this.markersHidden = !this.markersHidden;
      }
    },
    // Zoom in on the city on the map
    focusOnCity(cityId) {
      let index = this.cities.findIndex((c) => c.id === cityId);
      if (index > -1) {
        const city = this.cities[index];
        // Go to the map on the UI
        this.$vuetify.goTo("#myMap");
        // Zoom the map into the city
        this.map.flyTo([city.lat, city.lng], 14);
      }
    },
    // Add hotels to the map
    showHotels(city) {
      const index = this.hotels.findIndex((c) => c.name === city.name);
      if (index > -1) {
        const hotels = this.hotels[index].hotels;
        hotels.forEach((hotel) => {
          this.addMarker([hotel.lat, hotel.lng], hotel.name, true);
        });
      }
    },
    /*
      Fetch 3 hotels from given city
      Unused now, but was used when mapping hotels to json file
      Could've used database and/or google services,
      but decided to store all relevant data locally because
      there isn't that much information to store. Also silk road cities aren't changing their place anymore.
    */
    getHotels(city) {
      // Load google api
      this.google.load().then((google) => {
        // Dummy map to use the nearbysearch
        const map = new google.maps.Map(document.getElementById("map"), {
          center: L.latLng(city.lat, city.lng),
          zoom: 15,
        });
        // init service and request
        const service = new google.maps.places.PlacesService(map);
        const request = {
          location: L.latLng(city.lat, city.lng),
          radius: 100000,
          type: ["hotel"],
        };
        // Fetch hotels
        service.nearbySearch(request, async (results, status) => {
          if (status == google.maps.places.PlacesServiceStatus.OK) {
            if (!results.length) {
              console.log("No results for: " + city.name);
            } else {
              const hotels = [];
              // If found more than 3 results, limit the amount to 3
              // Found a lot more hotels in test searches so decided to limit it
              const limit = results.length > 3 ? 3 : results.length;
              for (var i = 0; i < limit; i++) {
                const hotel = {
                  name: results[i].name,
                  lat: results[i].geometry.location.lat(),
                  lng: results[i].geometry.location.lng(),
                };
                hotels.push(hotel);
              }
              this.hotelData.cities.push({
                name: city.name,
                hotels: hotels,
              });
            }
          }
        });
      });
    },
    // Download files to client using blobs
    // Used in creating json files from api data
    download(content, fileName, contentType, stringify) {
      if (stringify) {
        content = JSON.stringify(content);
      }
      var a = document.createElement("a");
      var file = new Blob([content], { type: contentType });
      a.href = URL.createObjectURL(file);
      a.download = fileName;
      a.click();
    },
  },
};
</script>
