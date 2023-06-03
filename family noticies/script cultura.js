document.addEventListener('DOMContentLoaded', function () {
    const rssUrls = [
        { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/cultura/portada', source: 'El Pa\u00eds', numNews: 30 },
        { url: 'https://e00-elmundo.uecdn.es/elmundo/rss/cultura.xml', source: 'El Mundo', numNews: 30 },
        { url: 'https://www.lavanguardia.com/rss/cultura.xml', source: 'La Vanguardia', numNews: 30 },
        { url: 'https://www.levante-emv.com/rss/section/4699', source: 'Levante EMV', numNews: 30 },
        { url: 'https://www.20minutos.es/rss/cultura/', source: '20 Minutos', numNews: 30 },
    ];

    const promises = rssUrls.map(({ url, source, numNews }) => fetchNews(url, source, numNews));

    Promise.all(promises)
        .then(results => {
            const newsItems = results.flat();
            shuffleNews(newsItems);
            showNewsInFeed(newsItems);
        })
        .catch(error => {
            console.log('Error al obtener las noticias: ', error);
        });
});

function fetchNews(rssUrl, source, numNews) {
    return fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rssUrl))
        .then(response => response.json())
        .then(data => {
            const items = data.items;

            // Obtener las primeras numNews noticias
            const selectedItems = items.slice(0, numNews);

            // Agregar el origen de la fuente a cada noticia
            selectedItems.forEach(item => {
                item.source = source;
            });

            return selectedItems;
        });
}

function shuffleNews(newsItems) {
    let currentIndex = newsItems.length;
    let temporaryValue;
    let randomIndex;

    // Mientras queden elementos para mezclar
    while (currentIndex !== 0) {
        // Elegir un elemento restante de forma aleatoria
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // Intercambiar con el elemento actual
        temporaryValue = newsItems[currentIndex];
        newsItems[currentIndex] = newsItems[randomIndex];
        newsItems[randomIndex] = temporaryValue;
    }
}

function showNewsInFeed(newsItems) {
    const newsContainer = document.getElementById('news-feed');
    newsContainer.innerHTML = ''; // Limpiar el contenedor de noticias

    newsItems.forEach(item => {
        const newsCard = createNewsCard(item.title, item.description, item.link, item.source, item.enclosure?.link);
        newsContainer.appendChild(newsCard);
    });
}


function createNewsCard(title, description, link, source, image) {
    const card = document.createElement('div');
    card.className = 'news-card';

    if (image) {
        card.style.backgroundImage = `url(${image})`;
    }

    const contentContainer = document.createElement('div');
    contentContainer.className = 'content-container';

    const titleElement = document.createElement('h1');
    titleElement.className = 'news-title';
    titleElement.textContent = title;

    const subtitleElement = document.createElement('p');
    subtitleElement.className = 'news-subtitle';
    subtitleElement.textContent = truncateSubtitle(description, 0);

    const sourceElement = document.createElement('p');
    sourceElement.className = 'news-source';
    sourceElement.textContent = 'Fuente: ' + source;

    const buttonElement = document.createElement('a');
    buttonElement.className = 'news-button';
    buttonElement.textContent = 'Leer m\u00e1s';
    buttonElement.href = link;
    buttonElement.target = '_blank';

    const imageElement = new Image();  // Crear un elemento de imagen

    imageElement.onload = function() {
        // Ocultar el loader después de cargar la imagen
        card.classList.remove('loader');
        card.style.backgroundImage = `url(${image})`;
        card.style.opacity = 1;  // Mostrar la tarjeta de noticias
    };

    imageElement.src = image;  // Cargar la imagen

    contentContainer.appendChild(titleElement);
    contentContainer.appendChild(subtitleElement);
    contentContainer.appendChild(sourceElement);
    contentContainer.appendChild(buttonElement);

    card.appendChild(contentContainer);

    return card;
}

function truncateSubtitle(subtitle, limit) {
    if (subtitle.split(' ').length > limit) {
        return subtitle.split(' ').slice(0, limit).join(' ') + '';
    }
    return subtitle;
}

// Agregar eventos de clic a los botones
addClickEventsToButtons();

function addClickEventsToButtons() {
    var scrollButton = document.getElementById('scrollButton');
    var newsCards = document.getElementsByClassName('news-card');
    var currentCardIndex = 0;

    function scrollToNextCard() {
        if (currentCardIndex < newsCards.length - 1) {
            currentCardIndex++;
            newsCards[currentCardIndex].scrollIntoView({ behavior: 'smooth' });
        }
    }

    function scrollToPreviousCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            newsCards[currentCardIndex].scrollIntoView({ behavior: 'smooth' });
        }
    }

    scrollButton.addEventListener('click', scrollToNextCard);
    scrollButton.addEventListener('dblclick', scrollToPreviousCard);

    var twentyPercentHeight = Math.floor(window.innerHeight * 0.2);

    document.addEventListener('click', function (event) {
        if (event.clientY > window.innerHeight - twentyPercentHeight) {
            scrollToNextCard();
        } else if (event.clientY < twentyPercentHeight) {
            scrollToPreviousCard();
        }
    });
}
