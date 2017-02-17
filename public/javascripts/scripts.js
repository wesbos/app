/*
  eslint-disable
*/

// function autocomplete() {
//   const input = document.querySelector('#address-name');
//   if (!input) return; // There is no input on this page
//   const latInput = document.querySelector('#lat');
//   const lngInput = document.querySelector('#lng');
//   const dropdown = new google.maps.places.Autocomplete(input);

//   dropdown.addListener('place_changed', () => {
//     const place = dropdown.getPlace();
//     latInput.value = place.geometry.location.lat();
//     lngInput.value = place.geometry.location.lng();
//   });
//   input.addEventListener('keydown', (e) => {
//     if (e.keyCode === 13) e.preventDefault();
//   });
// }

// let map;
// var infoWindow = new google.maps.InfoWindow();

//  function makeMap() {
//   const mapDiv = document.querySelector('#map');
//   if (!mapDiv) return; // no map on this page!
//   // start with some options
//   const mapOptions = {
//     center: { lat: -34.397, lng: 150.644 },
//     zoom: 2
//   };
//   // make the map
//   map = new google.maps.Map(mapDiv, mapOptions);
//   // load some places onto that map
//   loadPlaces();
//   // make an autocomplete
//   const input = document.querySelector('[name="geolocate"]');
//   const autocomplete = new google.maps.places.Autocomplete(input);
//   autocomplete.addListener('place_changed', () => {
//     const place = autocomplete.getPlace();
//     loadPlaces(place.geometry.location.lat(), place.geometry.location.lng());
//   });
//   return map;
// }

// function loadPlaces(lat = 43.2640088, lng = -79.87494730000003) {
//   // fetch the data from the API
//   axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
//     .then(response => {
//       const places = response.data;
//       console.log(places);
//       if (!places.length) {
//         console.log('No places Found');
//         return;
//       }
//       const bounds = new google.maps.LatLngBounds();
//       const markers = places.map(place => {
//         const [placeLng, placeLat] = place.location.coordinates;
//         const position = { lat: placeLat, lng: placeLng };
//         bounds.extend(position);
//         const marker = new google.maps.Marker({
//           map,
//           position
//         });
//         marker.place = place;

//         marker.addListener('click', function() {
//           console.log(this.place);
//           const html = `
//             <div class="popup">
//               <a href="/stores/${this.place.slug}">
//                 <img width=300 src="/uploads/${this.place.photo || 'store.png'}" alt="" />
//                 <p>${this.place.name} — ${this.place.location.address}</p>
//               </a>
//             </div>
//           `;
//           infoWindow.setContent(html);
//           infoWindow.open(map, this);
//         });
//         console.log(marker);
//       });

//       map.setCenter(bounds.getCenter());
//       map.fitBounds(bounds);
//       map.setZoom(map.getZoom() - 1);
//     })
//     .catch(err => {
//       console.log('error handler');
//       console.log(err.response.data.message);
//       // console.log('An error happened');
//       // console.log(err.message);
//     });
// }


// autocomplete();
// makeMap();


// // Forms
// const heartForms = document.querySelectorAll('form.heart');
// heartForms.forEach(form => form.addEventListener('submit', ajaxHeart));

// function ajaxHeart(e) {
//   e.preventDefault();
//   axios
//     .post(this.action)
//     .then(res => {
//       // toggle the button
//       console.log(this.heart);
//       const isHearted = this.heart.classList.toggle('heart__button--hearted');

//       if (isHearted) {
//         this.heart.classList.add('heart__button--float');
//         setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
//       }

//       // update the hearts HTML
//       document.querySelector('.heart-count').textContent = res.data.hearts.length;
//     });
// }


// function searchResultsHTML(stores, searchTerm) {
//   return stores.map((store, i) => `
//     <a class="search__result" href="/stores/${store.slug}">
//       <strong>${store.name}</strong>
//     </a>
//   `).join('');
// }

// function typeAhead() {
//   const search = document.querySelector('.search');
//   if (!search) return;
//   const searchInput = search.querySelector('input[name="search"]');
//   const searchResults = search.querySelector('.search__results');

//   searchInput.addEventListener('input', function() {
//     if (!this.value) {
//       searchResults.style.display = 'none';
//       return;
//     }

//     // searchResults.innerHTML = `<div class="search__result">Searching...</div>`;
//     searchResults.style.display = 'block';

//     axios
//       .get(`/api/search?q=${this.value}`)
//       .then(res => {
//         if (res.data.length) {
//           searchResults.innerHTML = searchResultsHTML(res.data);
//           return;
//         }
//         searchResults.innerHTML = `<div class="search__result"><p>No Results for ${this.value} Found</p></div>`;
//       })
//       .catch(err => {
//         console.error(err);
//       });
//   });

//   searchInput.addEventListener('keydown', function(e) {
//     if (![38, 40, 13].includes(e.keyCode)) return;
//     const activeClass = 'search__result--active';
//     const current = search.querySelector('.' + activeClass);
//     const items = search.querySelectorAll('.search__result');
//     let next;
//     // if Down, and there is one selected
//     if (e.keyCode === 40 && current) {
//       // the next one, or the first one
//       next = current.nextElementSibling || items[0];
//       console.log(next);
//     } else if (e.keyCode === 40) {
//       next = items[0];
//     } else if (e.keyCode === 38 && current) {
//       next = current.previousElementSibling || items[items.length - 1];
//     } else if (e.keyCode === 38) {
//       next = items[items.length - 1];
//     } else if (e.keyCode === 13 && current.href) {
//       window.location = current.href;
//       return;
//     }

//     if (current) current.classList.remove(activeClass);
//     next.classList.add(activeClass);
//     return false;
//   });
// }

// typeAhead();
