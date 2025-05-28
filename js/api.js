let controller = new AbortController();
let allCharacters = []; 
let currentSort = 'asc';

async function fetchCharacters() {
    try {
        const response = await fetch('bazadanych.json');
        if (!response.ok) {
            throw new Error('Nie udało się pobrać danych postaci');
        }
        const data = await response.json();

        // Mapowanie wszystkich postaci z pliku JSON
        const characters = data.map((character, index) => {
            let imageUrl = character.obraz || '';
            
            if (!imageUrl || imageUrl.includes('undefined')) {
                imageUrl = 'zdj/default.png';
            }

            return {
                    id: `char-${index}`,
                    name: character.imię || 'Nieznana postać',
                    house: character.dom || 'Brak domu',
                    image: imageUrl,
                    dateOfBirth: character.data_urodzenia || character.rok_urodzenia || 'Nieznana',
                    ancestry: character.pochodzenie || 'Nieznane',
                    patronus: character.patronus || 'Brak',
                    description: `
                        Imię: ${character.imię || 'Nieznane'},
                        Pseudonimy: ${character.pseudonimy ? character.pseudonimy.join(', ') : 'Brak'},
                        Płeć: ${character.płeć || 'Nieznana'},
                        Gatunek: ${character.gatunek || 'Nieznany'},
                        Dom: ${character.dom || 'Brak domu'},
                        Data urodzenia: ${character.data_urodzenia || character.rok_urodzenia || 'Nieznana'},
                        Czarodziej: ${character.czarodziej ? 'Tak' : 'Nie'},
                        Pochodzenie: ${character.pochodzenie || 'Nieznane'},
                        Kolor oczu: ${character.oczy || 'Nieznany'},
                        Kolor włosów: ${character.włosy || 'Nieznany'},
                        Różdżka: ${character.różdżka || 'Brak informacji'},
                        Patronus: ${character.patronus || 'Brak'},
                        Uczeń Hogwartu: ${character.uczeń_hogwartu ? 'Tak' : 'Nie'},
                        Pracownik Hogwartu: ${character.pracownik_hogwartu ? 'Tak' : 'Nie'},
                        Aktor: ${character.aktor || 'Nieznany'},
                        Status: ${character.żyje ? 'Żyje' : 'Nie żyje'}
                    `
                    };
        });

        return characters;

    } catch (error) {
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

    // Dodajemy event listenery do przycisków
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const characterId = btn.dataset.id;
            showCharacterDetails(characterId);
        });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.scroll-animation').forEach(el => observer.observe(el));
}

function showCharacterDetails(characterId) {
    try {
        const character = allCharacters.find(c => c.id === characterId);

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

        // Zamknięcie modala po kliknięciu na tło
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Zamknięcie modala przyciskiem
        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'Zamknij';
        closeBtn.className = 'close-modal-btn';
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        modalBody.appendChild(closeBtn);

    } catch (error) {
        console.error('Błąd:', error);
        showErrorModal('Nie udało się załadować szczegółów postaci.');
    }
}

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

// Inicjalizacja animacji
initScrollAnimations();