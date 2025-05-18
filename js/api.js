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

        // Filtruj główne postacie ze zdjęciami
        const mainCharactersWithImages = data.filter(character => {
            const isMainCharacter = mainCharactersNames.includes(character.name);
            const hasImage = character.image || character.picture;
            return isMainCharacter && hasImage;
        });

        // Mapuj do formatu wyjściowego z polskimi opisami
        return mainCharactersWithImages.map(character => ({
            id: character.id || Math.random().toString(36).substr(2, 9),
            name: character.name || 'Nieznana postać',
            house: character.house || 'Brak domu',
            image: character.image || character.picture,
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
            <img src="${character.image}"
                 alt="${character.name}" 
                 class="character-image"
                 onerror="this.parentNode.remove()">
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

    initScrollAnimations();
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
                <img src="${character.image}" 
                     alt="${character.name}" class="modal-image">
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

    document.getElementById('house-filter').addEventListener('change', (e) => {
        const filtered = filterAndSortCharacters(
            allCharacters,
            document.getElementById('character-search').value,
            e.target.value,
            currentSort
        );
        displayCharacters(filtered);
    });

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
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('character-modal')) {
            document.getElementById('character-modal').style.display = 'none';
        }
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