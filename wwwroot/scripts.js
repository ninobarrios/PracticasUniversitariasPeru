/*function obtenerEstadisticas() {
    axios.all([
        axios.get('https://practicasuniversitariasperu.com/contarObservacionesSemana'),
        axios.get('https://practicasuniversitariasperu.com/contarObservacionesTotal'),
        axios.get('https://practicasuniversitariasperu.com/contarObservacionesDiaAnterior')
    ])
        .then(axios.spread((responseSemana, responseTotal, responseDiaAnterior) => {
            console.log("Semana:", responseSemana.data);
            console.log("Total:", responseTotal.data);
            console.log("Día Anterior:", responseDiaAnterior.data);

            const conteo = responseDiaAnterior.data?.count || 0;
            const conteo2 = responseSemana.data?.count || 0;
            const conteo3 = responseTotal.data?.count || 0;

            document.getElementById('spinner').style.display = 'none';

            document.querySelector('.total_observaciones .dia p').textContent = conteo.toLocaleString('es-PE');
            document.querySelector('.total_observaciones .semana p').textContent = conteo2.toLocaleString('es-PE');
            document.querySelector('.total_observaciones .total p').textContent = conteo3.toLocaleString('es-PE');
        }))
        .catch(error => {
            document.getElementById('spinner').style.display = 'none';
        });
}

document.addEventListener("DOMContentLoaded", obtenerEstadisticas);


*/














let currentPage = 1; 
const offersPerPage = 20; 
let offersData = []; 
/*
window.onload = function () {
    obtenerEstadisticas();

    document.getElementById('spinner').style.display = 'block';

    axios.get('https://practicasuniversitariasperu.com/ofertas-laborales-hoy')
        .then(response => {
            document.getElementById('spinner').style.display = 'none';

            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                offersData = response.data; 
                displayOffers(); 
            } else {
                document.getElementById('offers-container2').innerHTML = '<p>No hay ofertas disponibles.</p>';
            }
        })
        .catch(error => {
            document.getElementById('spinner').style.display = 'none';
            console.error('Error al obtener las ofertas:', error);
            document.getElementById('offers-container2').innerHTML = '<p class="error-message">Error al cargar las ofertas.</p>';
        });
};
*/
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getPlatformImage(platform) {
    const platformImages = {
        'Bumeran': '/imagenes/bumeran.avif',
        'Computrabajo': '/imagenes/computrabajo.avif',
        'Linkedin': '/imagenes/linkedin.avif',
        'Indeed': '/imagenes/indeed.avif',
        'Buscojobs': '/imagenes/buscojobs.avif',
        'Convocatorias de Trabajo': '/imagenes/convocatorias_2024.avif',


    };
    return platformImages[platform] || null;
}
/*
function displayOffers() {
    const start = (currentPage - 1) * offersPerPage;
    const end = currentPage * offersPerPage;
    const offersToDisplay = offersData.slice(start, end); 

    let htmlContent = '';
    offersToDisplay.forEach(offer => {
        const platformImage = getPlatformImage(offer.plataforma);

        htmlContent += `
            <div class="boxcajaoferta">
                <h2>${capitalizeFirstLetter(offer.nom_oferta)}</h2>
                <div class="division"></div>
                <div class="empresa">
                    <h3>${capitalizeFirstLetter(offer.nom_empresa)}</h3>
                </div>
                <div class="lugar">
                    <img src="/imagenes/ubi.avif" alt="Ubicación" />
                    <h3>${offer.lugar}</h3>
                </div>
                <div class="foto_plataforma">
                    ${platformImage ? `<img src="${platformImage}" alt="Logo de ${offer.plataforma}" />` : ''}
                </div>
                
            </div>
        `;
    });

    document.getElementById('offers-container2').innerHTML = htmlContent;
    updatePaginationButtons(); 
    displayPageNumbers(); 
}
*/
function updatePaginationButtons() {
    const totalPages = Math.ceil(offersData.length / offersPerPage); 

    document.getElementById('prevPage').disabled = currentPage === 1;

    document.getElementById('nextPage').disabled = currentPage === totalPages;
}

function displayPageNumbers() {
    const totalPages = Math.ceil(offersData.length / offersPerPage);
    const maxPagesToShow = 5; 
    let startPage = currentPage - Math.floor(maxPagesToShow / 2);
    let endPage = currentPage + Math.floor(maxPagesToShow / 2);

    if (startPage < 1) {
        startPage = 1;
        endPage = Math.min(maxPagesToShow, totalPages);
    }

    if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    let pageNumbersHTML = '';

    for (let i = startPage; i <= endPage; i++) {
        pageNumbersHTML += `
            <span class="pageNumber ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>
        `;
    }

    document.getElementById('pageNumbers').innerHTML = pageNumbersHTML;
}

function changePage(direction) {
    const totalPages = Math.ceil(offersData.length / offersPerPage);

    if (direction === 'next' && currentPage < totalPages) {
        currentPage++;
    } else if (direction === 'prev' && currentPage > 1) {
        currentPage--; 
    }

    displayOffers(); 
}

function goToPage(pageNumber) {
    currentPage = pageNumber;
    displayOffers(); 
}

let isMenuOpen = false;

        function toggleMenu() {
            isMenuOpen = !isMenuOpen;
            const navbarCollapse = document.getElementById('navbarNav');
            navbarCollapse.classList.toggle('show', isMenuOpen);
        }

        function handleNavItemClick() {
            if (isMenuOpen) {
                toggleMenu(); 
            }
        }



        function toggleAnswer(id) {
            var answer = document.getElementById('answer-' + id);
            var button = answer.previousElementSibling;
        
            if (answer.style.display === 'none') {
                answer.style.display = 'block';
                button.setAttribute('aria-expanded', 'true');
            } else {
                answer.style.display = 'none';
                button.setAttribute('aria-expanded', 'false');
            }
        }
        