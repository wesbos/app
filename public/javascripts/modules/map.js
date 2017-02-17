/* global google */
import axios from 'axios';

// start with some options
const mapOptions = {
  center: { lat: -34.397, lng: 150.644 },
  zoom: 2
};

function loadPlaces(map, lat = 43.2640088, lng = -79.87494730000003) {
  const infoWindow = new google.maps.InfoWindow();
  // fetch the data from the API
  axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
  .then(response => {
    const places = response.data;
    console.log(places);
    if (!places.length) {
      console.log('No places Found');
      return;
    }
    const bounds = new google.maps.LatLngBounds();

    // Create the markers
    const markers = places.map(place => {
      const [placeLng, placeLat] = place.location.coordinates;
      const position = { lat: placeLat, lng: placeLng };
      bounds.extend(position);
      const marker = new google.maps.Marker({
        map,
        position
      });
      marker.place = place;
      return marker;
    });

    // listen on each marker
    markers.forEach(marker => marker.addListener('click', function() {
      console.log(this.place);
      const html = `
        <div class="popup">
          <a href="/stores/${this.place.slug}">
            <img width=300 src="/uploads/${this.place.photo || 'store.png'}" alt="" />
            <p>${this.place.name} — ${this.place.location.address}</p>
          </a>
        </div>
      `;
      infoWindow.setContent(html);
      infoWindow.open(map, this);
    }));

    map.setCenter(bounds.getCenter());
    map.fitBounds(bounds);
    map.setZoom(map.getZoom() - 1);
  })
  .catch(err => {
    console.log(err.response.data.message);
  });
}

function makeMap(mapDiv) {
  if (!mapDiv) return; // no map on this page!
  // make the map
  const map = new google.maps.Map(mapDiv, mapOptions);
  // load some places onto that map
  loadPlaces(map);
  // make an autocomplete
  const input = document.querySelector('[name="geolocate"]');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng());
  });
  return map;
}


export default makeMap;
