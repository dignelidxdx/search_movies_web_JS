(async function load() {


    async function getData(url) {
      const response = await fetch(url);
      const data = await response.json();
      if (data.data.movie_count > 0) {
        return data;
      } 
  
      throw new Error('No se encontró ningun resultado')
    }

    async function getDataUser(url) {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }
  
    const $form = document.getElementById('form');
    const $home = document.getElementById('home');
    const $featuringContainer = document.getElementById('featuring');
  
    function setAttributes($element, attributes) {
      for (const attribute in attributes) {
        $element.setAttribute(attribute, attributes[attribute]); 
      }
    }
    const BASE_API = 'https://yts.mx/api/v2/';
  
    function featuringTemplate(peli) {
      return (
        `
        <div class="featuring">
        <div class="featuring-image">
          <img src="${peli.medium_cover_image}" width="70" height="100" alt="">
        </div>
        <div class="featuring-content">
          <p class="featuring-title">Pelicula encontrada</p>
          <p class="featuring-album">${peli.title}</p>
        </div>
      </div>
      `
      )
    }
    function videoItemTemplate(movie, category) {
      return (
        ` <div class="primaryPlaylistItem" data-id="${movie.id}" data-category=${category} >
            <div class="primaryPlaylistItem-image">
  
              <img src="${movie.medium_cover_image}">
            </div>
            <h4 class="primaryPlaylistItem-title">
              ${movie.title}         
            </h4>
        </div> 
        `       
    )}
    
    $form.addEventListener('submit', async (event) => {
      event.preventDefault();
      $home.classList.add('search-active');
      const $loader = document.createElement('img');
      setAttributes($loader, {
        src: 'src/images/loader.gif',
        height: 50,
        width: 50,
      })
      $featuringContainer.append($loader);
  
      const data = new FormData($form);
      try {
        const {
          data: {
            movies: pelis
          }
        } = await getData(`${BASE_API}list_movies.json?limit=1&query_term=${data.get('name')}`);
        const HTMLString = featuringTemplate(pelis[0]);
        $featuringContainer.innerHTML = HTMLString;
      } catch(error) {
        alert(error.message);
        $loader.remove();
        $home.classList.remove('search-active');
      }
      
    })
  
    
    
    function createTemplate(HTMLString) {
      const html = document.implementation.createHTMLDocument();
      html.body.innerHTML = HTMLString;
      return html.body.children[0];
    }
    
    function addEventClick($element) {
      $element.addEventListener('click', () => {
        showModal($element);
      }
      )
    }
    function renderMovieList(list, $container, category) {
      $container.children[0].remove();
      // actionList.data.movies
      list.forEach((movie) => {
        const HTMLString = videoItemTemplate(movie, category);
        // const html = document.implementation.createHTMLDocument();
        const movieElement = createTemplate(HTMLString);
        // html.body.innerHTML = HTMLString;
        $container.append(movieElement);
        const image = movieElement.querySelector('img');
        image.addEventListener('load', (event) => {
          event.srcElement.classList.add('fadeIn');
        } )      
        addEventClick(movieElement);
      } )
    }
  
    async function cacheExist(category) {
      const listName = `${category}List`;
      const cacheList = window.localStorage.getItem(listName);
  
      if (cacheList) {
        return JSON.parse(cacheList);
      }
      const { data: { movies: data } } = await getData(`${BASE_API}list_movies.json?genre=${category}`);
      window.localStorage.setItem(listName, JSON.stringify(data))
  
      return data;
      
    }
    
  
    // const { data: { movies: actionList} } = await getData(`${BASE_API}list_movies.json?genre=action`)
    // window.localStorage.setItem('actionList', JSON.stringify(actionList));
    const actionList = await cacheExist('action');
    const $actionContainer = document.querySelector('#action');
    // renderMovieList(actionList.data.movies, $actionContainer, action);
    renderMovieList(actionList, $actionContainer, "action");
  
    // const { data: { movies: dramaList } } = await getData(`${BASE_API}list_movies.json?genre=drama`)
    // window.localStorage.setItem('dramaList', JSON.stringify(dramaList));
    const dramaList = await cacheExist('drama');
    const $dramaContainer = document.querySelector('#drama');
    // renderMovieList(dramaList.data.movies, $dramaContainer, drama);
    renderMovieList(dramaList, $dramaContainer, "drama");
    
    const { data: { movies: animationList } } = await getData(`${BASE_API}list_movies.json?genre=animation`)
    window.localStorage.setItem('animationList', JSON.stringify(animationList));
    // const animationList = await cacheExist('animaton');
    const $animationContainer = document.querySelector('#animation');
    // renderMovieList(animationList.data.movies, $animationContainer, animation);
    renderMovieList(animationList, $animationContainer, "animation");
     
    
    const $modal = document.getElementById('modal');
    const $overlay = document.getElementById('overlay');
    const $hideModal = document.getElementById('hide-modal');
  
    // document.querySelector('#modal img')
    const $modalTitle = $modal.querySelector('h1');
    const $modalImage = $modal.querySelector('img');
    const $modalDescription = $modal.querySelector('p');
  
    function findById(list, id) {
      return list.find(movie => movie.id === parseInt(id, 10))
    }
    function findMovie(id, category) {
      switch (category) {
        case 'action' : {
          return findById(actionList, id)
        }
        case 'drama' : {
          return findById(dramaList, id)
        }
        case 'animation' : {
          return findById(animationList, id)
        }
        default: {
          findById(actionList, id)
        }
      }
      
    }
  
    function showModal($element) {
      $overlay.classList.add('active');
      $modal.style.animation = 'modalIn .8s forwards';
      const id = $element.dataset.id;
      const category = $element.dataset.category;
      const data = findMovie(id, category)
      $modalTitle.textContent = data.title;
      $modalImage.setAttribute( 'src', data.medium_cover_image )
      $modalDescription.textContent = data.description_full;
    }
  
    $hideModal.addEventListener('click', hideModal);
    function hideModal() {
      $overlay.classList.remove('active');
      $modal.style.animation = 'modalOut .8s forwards';
    }
  
  
  
  
  
  })()