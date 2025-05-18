// api.js
const API_BASE_URL = 'https://hp-api.onrender.com/api';

let controller = new AbortController(); // do przerywania fetchów

async function fetchCharacters() {
    if (controller) controller.abort();
    controller = new AbortController();

    try {
        const response = await fetch(`${API_BASE_URL}/characters`, {
            signal: controller.signal
        });
        if (!response.ok) {
            throw new Error('Failed to fetch characters');
        }
        const data = await response.json();

        // Ogranicz do głównych postaci
        const mainCharacters = data.filter(character => 
            ['Harry Potter', 'Ron Weasley', 'Hermione Granger', 'Draco Malfoy', 
             'Albus Dumbledore', 'Severus Snape', 'Minerva McGonagall',
             'Rubeus Hagrid', 'Sirius Black', 'Remus Lupin',
             'Bellatrix Lestrange', 'Lord Voldemort'].includes(character.name)
        );

        return data.map(character => ({
            id: character.id || Math.random().toString(36).substr(2, 9),
            name: character.name || 'Unknown character',
            house: character.house || 'No house',
            image: character.image || character.picture || 'assets/images/default-character.jpg',
            dateOfBirth: character.dateOfBirth || character.birthday || 'Unknown',
            ancestry: character.ancestry || 'Unknown',
            patronus: character.patronus || 'None',
            description: `Wizard: ${character.wizard ? 'Yes' : 'No'}, 
                         Gender: ${character.gender || 'Unknown'}, 
                         Actor: ${character.actor || 'Unknown'}`
        }));
    } catch (error) {
        if (error.name === 'AbortError') return [];
        console.error('Error fetching characters:', error);
        showErrorModal('Failed to load characters. Please try again later.');
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

    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'character-card scroll-animation';
        card.innerHTML = `
            <img src="${character.image}"
                 alt="${character.name}" 
                 class="character-image"
                 onerror="this.src='assets/images/default-character.jpg'">
            <div class="character-info">
                <h3>${character.name}</h3>
                <p class="house ${character.house ? character.house.replace(/\s+/g, '-').toLowerCase() : 'no-house'}">
                    ${character.house || 'No house'}
                </p>
                <button class="details-btn" data-id="${character.id}">More details</button>
            </div>
        `;
        container.appendChild(card);
    });

    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', () => showCharacterDetails(btn.dataset.id));
    });

    // Ponowna obserwacja scroll-animation
    initScrollAnimations();
}

async function showCharacterDetails(characterId) {
    try {
        const characters = await fetchCharacters();
        const character = characters.find(c => c.id === characterId);

        if (!character) throw new Error('Character not found');

        const modal = document.getElementById('character-modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <div class="modal-character">
                <img src="${character.image}" 
                     alt="${character.name}" class="modal-image">
                <div class="modal-details">
                    <h2>${character.name}</h2>
                    <p class="house ${character.house ? character.house.replace(/\s+/g, '-').toLowerCase() : 'no-house'}">
                        ${character.house || 'No house'}
                    </p>
                    <p><strong>Birth date:</strong> ${character.dateOfBirth}</p>
                    <p><strong>Ancestry:</strong> ${character.ancestry}</p>
                    <p><strong>Patronus:</strong> ${character.patronus}</p>
                    <p>${character.description}</p>
                </div>
            </div>
        `;

        modal.style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        showErrorModal('Failed to load character details.');
    }
}

// Inicjalizacja po załadowaniu DOM
let allCharacters = [];
let currentSort = 'asc';

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

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
            currentSort === 'asc' ? 'Sort A-Z' : 'Sort Z-A';
    });

    // Obsługa zamykania modala (dodana raz)
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('character-modal').style.display = 'none';
    });
    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('character-modal')) {
            document.getElementById('character-modal').style.display = 'none';
        }
    });
});

// Unified modal handler
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
