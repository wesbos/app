const axios = require('axios');

function searchResultsHTML(stores) {
  return stores.map((store) => `
    <a class="search__result" href="/stores/${store.slug}">
      <strong>${store.name}</strong>
    </a>
  `).join('');
}

function typeAhead(search) {
  if (!search) return;
  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.addEventListener('input', function() {
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    // searchResults.innerHTML = `<div class="search__result">Searching...</div>`;
    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = searchResultsHTML(res.data);
          return;
        }
        searchResults.innerHTML = `<div class="search__result"><p>No Results for ${this.value} Found</p></div>`;
      })
      .catch(err => {
        console.error(err);
      });
  });

  searchInput.addEventListener('keydown', (e) => {
    if (![38, 40, 13].includes(e.keyCode)) return;
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    // if Down, and there is one selected
    if (e.keyCode === 40 && current) {
      // the next one, or the first one
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
      return;
    }

    if (current) current.classList.remove(activeClass);
    next.classList.add(activeClass);
    return false;
  });
}

export default typeAhead;
