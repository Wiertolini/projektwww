// api.js
const API_BASE_URL = 'https://hp-api.onrender.com/api';

let controller = new AbortController(); // do przerywania zapytań

async function fetchCharacters() {
    if (controller) controller.abort();
    controller = new AbortController();

    try {
        const response = await fetch(`${API_BASE_URL}/characters`, {
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error('Nie udało się pobrać postaci');
        }
        const data = await response.json();

        // Lista głównych postaci
        const mainCharactersNames = [
            'Harry Potter', 'Ron Weasley', 'Hermione Granger',
            'Draco Malfoy', 'Albus Dumbledore', 'Severus Snape',
            'Minerva McGonagall', 'Rubeus Hagrid', 'Sirius Black',
            'Remus Lupin', 'Bellatrix Lestrange', 'Lord Voldemort',
            'Neville Longbottom', 'Luna Lovegood', 'Ginny Weasley',
            'Dobby', 'Fred Weasley', 'George Weasley',
            'Arthur Weasley', 'Molly Weasley'
        ];

        // Filtruj i mapuj główne postacie, poprawiając URL zdjęć
        const mainCharacters = data
            .filter(character => mainCharactersNames.includes(character.name))
            .map(character => {
                // Poprawiamy URL zdjęć
                let imageUrl = character.image || character.picture;
                
                // Jeśli URL jest niepełny (bez domeny), dodajemy bazowy adres API
                if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
                    imageUrl = imageUrl.startsWith('/') 
                        ? `https://hp-api.onrender.com${imageUrl}`
                        : `https://hp-api.onrender.com/${imageUrl}`;
                }
                
                // Domyślne zdjęcie jeśli brak lub URL jest nieprawidłowy
                if (!imageUrl || imageUrl.includes('undefined')) {
                    imageUrl = 'assets/images/default-character.jpg';
                }

                return {
                    ...character,
                    image: imageUrl
                };
            });

        
        return mainCharacters.map(character => ({
            id: character.id || Math.random().toString(36).substr(2, 9),
            name: character.name || 'Nieznana postać',
            house: character.house || 'Brak domu',
            image: character.image,
            dateOfBirth: character.dateOfBirth || character.birthday || 'Nieznana',
            ancestry: character.ancestry || 'Nieznane',
            patronus: character.patronus || 'Brak',
            description: `Czarodziej: ${character.wizard ? 'Tak' : 'Nie'}, 
                         Płeć: ${character.gender || 'Nieznana'}, 
                         Aktor: ${character.actor || 'Nieznany'}`
        }));

    } catch (error) {
        if (error.name === 'AbortError') return [];
        console.error('Błąd podczas pobierania postaci:', error);
        showErrorModal('Nie udało się załadować postaci. Spróbuj ponownie później.');
        return [];
    }
}

function filterAndSortCharacters(characters, searchTerm, houseFilter, sortOrder) {
    if (!characters || !Array.isArray(characters)) return [];

    return [...characters]
        .filter(character => {
            const matchesSearch = !searchTerm || 
                character.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesHouse = !houseFilter || 
                (character.house && character.house.toLowerCase() === houseFilter.toLowerCase());
            return matchesSearch && matchesHouse;
        })
        .sort((a, b) => {
            if (!sortOrder) return 0;
            return sortOrder === 'asc' 
                ? a.name.localeCompare(b.name) 
                : b.name.localeCompare(a.name);
        });
}

function displayCharacters(characters) {
    const container = document.getElementById('characters-container');
    container.innerHTML = '';

    if (characters.length === 0) {
        container.innerHTML = '<p class="no-results">Nie znaleziono pasujących postaci</p>';
        return;
    }

    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card scroll-animation';
        card.innerHTML = `
            <div class="character-image-container">
                <img src="${character.image}"
                     alt="${character.name}" 
                     class="character-image"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='assets/images/default-character.jpg'">
            </div>
            <div class="character-info">
                <h3>${character.name}</h3>
                <p class="house ${character.house ? character.house.replace(/\s+/g, '-').toLowerCase() : 'no-house'}">
                    ${character.house || 'Brak domu'}
                </p>
                <button class="details-btn" data-id="${character.id}">Więcej szczegółów</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', () => showCharacterDetails(btn.dataset.id));
    });

    // Ponowna obserwacja scroll-animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animation').forEach(el => observer.observe(el));
}

async function showCharacterDetails(characterId) {
    try {
        const characters = await fetchCharacters();
        const character = characters.find(c => c.id === characterId);

        if (!character) throw new Error('Postać nie została znaleziona');

        const modal = document.getElementById('character-modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <div class="modal-character">
                <div class="modal-image-container">
                    <img src="${character.image}" 
                         alt="${character.name}" 
                         class="modal-image"
                         onerror="this.onerror=null; this.src='assets/images/default-character.jpg'">
                </div>
                <div class="modal-details">
                    <h2>${character.name}</h2>
                    <p class="house ${character.house ? character.house.replace(/\s+/g, '-').toLowerCase() : 'no-house'}">
                        ${character.house || 'Brak domu'}
                    </p>
                    <p><strong>Data urodzenia:</strong> ${character.dateOfBirth}</p>
                    <p><strong>Pochodzenie:</strong> ${character.ancestry}</p>
                    <p><strong>Patronus:</strong> ${character.patronus}</p>
                    <p>${character.description}</p>
                </div>
            </div>
        `;

        modal.style.display = 'block';

        // Dodaj obsługę kliknięcia poza modalem
        const closeModal = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                modal.removeEventListener('click', closeModal);
            }
        };
        modal.addEventListener('click', closeModal);

    } catch (error) {
        console.error('Błąd:', error);
        showErrorModal('Nie udało się załadować szczegółów postaci.');
    }
}

// Inicjalizacja po załadowaniu DOM
let allCharacters = [];
let currentSort = 'asc';

document.addEventListener('DOMContentLoaded', async () => {
    allCharacters = await fetchCharacters();
    displayCharacters(allCharacters);

    // Obsługa wyszukiwania
    document.getElementById('character-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value;
        const filtered = filterAndSortCharacters(
            allCharacters,
            searchTerm,
            document.getElementById('house-filter').value,
            currentSort
        );
        displayCharacters(filtered);
    });

    // Filtrowanie po domu
    document.getElementById('house-filter').addEventListener('change', (e) => {
        const filtered = filterAndSortCharacters(
            allCharacters,
            document.getElementById('character-search').value,
            e.target.value,
            currentSort
        );
        displayCharacters(filtered);
    });

    // Sortowanie
    document.getElementById('sort-characters').addEventListener('click', () => {
        currentSort = currentSort === 'asc' ? 'desc' : 'asc';
        const filtered = filterAndSortCharacters(
            allCharacters,
            document.getElementById('character-search').value,
            document.getElementById('house-filter').value,
            currentSort
        );
        displayCharacters(filtered);
        document.getElementById('sort-characters').textContent = 
            currentSort === 'asc' ? 'Sortuj A-Z' : 'Sortuj Z-A';
    });

    // Obsługa zamykania modala
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('character-modal').style.display = 'none';
    });
});

function showErrorModal(message) {
    const errorModal = document.createElement('div');
    errorModal.className = 'error-modal';
    errorModal.innerHTML = `
        <div class="error-content">
            <p>${message}</p>
            <button class="close-error">OK</button>
        </div>
    `;
    document.body.appendChild(errorModal);

    document.querySelector('.close-error').addEventListener('click', () => {
        errorModal.remove();
    });
}

// Funkcja pomocnicza do animacji
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animation');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
}