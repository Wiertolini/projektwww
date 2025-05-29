let controller = new AbortController();
let allCharacters = [];
let allSpells = [];
let currentSort = 'asc';

async function fetchData() {
    try {
        const response = await fetch('bazadanych.json');
        if (!response.ok) {
            throw new Error('Nie udało się pobrać danych');
        }
        return await response.json();
    } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        showErrorModal('Nie udało się załadować danych. Spróbuj ponownie później.');
        return null;
    }
}

async function fetchCharacters() {
    const data = await fetchData();
    if (!data || !data.postacie) return [];

    return data.postacie.map((character, index) => {
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
                Data urodzenia: ${character.data_urodzenia || 'Nieznana'},
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
}

async function fetchSpells() {
    const data = await fetchData();
    if (!data || !data.zaklęcia) return [];

    let spells = [];
    for (const category in data.zaklęcia) {
        if (data.zaklęcia.hasOwnProperty(category)) {
            spells = spells.concat(data.zaklęcia[category].map(spell => ({
                name: spell.name,
                description: spell.description,
                category: category
            })));
        }
    }
    return spells;
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

function filterSpells(spells, searchTerm, categoryFilter) {
    if (!spells || !Array.isArray(spells)) return [];

    return spells.filter(spell => {
        const matchesSearch = !searchTerm || 
            spell.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || 
            spell.category.toLowerCase().includes(categoryFilter.toLowerCase());
        return matchesSearch && matchesCategory;
    });
}

function displayCharacters(characters) {
    const container = document.getElementById('characters-container');
    if (!container) return;
    
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
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const characterId = btn.dataset.id;
            showCharacterDetails(characterId);
        });
    });

    initScrollAnimations();
}

function displaySpells(spells) {
    const accordionContainer = document.querySelector('.spells-accordion');
    if (!accordionContainer) return;

    // Najpierw wyczyść istniejące elementy
    accordionContainer.innerHTML = '';

    // Grupuj zaklęcia według kategorii
    const spellsByCategory = {};
    spells.forEach(spell => {
        if (!spellsByCategory[spell.category]) {
            spellsByCategory[spell.category] = [];
        }
        spellsByCategory[spell.category].push(spell);
    });

    // Dla każdej kategorii utwórz element accordion
    for (const category in spellsByCategory) {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        const accordionBtn = document.createElement('button');
        accordionBtn.className = 'accordion-btn';
        accordionBtn.textContent = category;
        
        const accordionContent = document.createElement('div');
        accordionContent.className = 'accordion-content';
        accordionContent.style.display = 'none';
        
        spellsByCategory[category].forEach(spell => {
            const spellElement = document.createElement('div');
            spellElement.className = 'spell-item scroll-animation';
            spellElement.innerHTML = `
                <h4>${spell.name}</h4>
                <p>${spell.description}</p>
            `;
            accordionContent.appendChild(spellElement);
        });
        
        accordionItem.appendChild(accordionBtn);
        accordionItem.appendChild(accordionContent);
        accordionContainer.appendChild(accordionItem);
        
        // Dodaj obsługę kliknięcia
        accordionBtn.addEventListener('click', () => {
            accordionBtn.classList.toggle('active');
            accordionContent.style.display = accordionContent.style.display === 'block' ? 'none' : 'block';
        });
    }
    
    initScrollAnimations();
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

                </div>
            </div>
            <button class="close-modal-btn">Zamknij</button>
        `;

        modal.style.display = 'block';

        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('close-modal-btn')) {
                modal.style.display = 'none';
            }
        });

    } catch (error) {
        console.error('Błąd:', error);
        showErrorModal('Nie udało się załadować szczegółów postaci.');
    }
}

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
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.scroll-animation').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', async () => {
    // Ładowanie postaci
    allCharacters = await fetchCharacters();
    displayCharacters(allCharacters);

    // Ładowanie zaklęć
    allSpells = await fetchSpells();
    displaySpells(allSpells);

    // Obsługa wyszukiwania postaci
    if (document.getElementById('character-search')) {
        document.getElementById('character-search').addEventListener('input', (e) => {
            const filtered = filterAndSortCharacters(
                allCharacters,
                e.target.value,
                document.getElementById('house-filter').value,
                currentSort
            );
            displayCharacters(filtered);
        });
    }

    // Obsługa filtrowania po domu
    if (document.getElementById('house-filter')) {
        document.getElementById('house-filter').addEventListener('change', (e) => {
            const filtered = filterAndSortCharacters(
                allCharacters,
                document.getElementById('character-search').value,
                e.target.value,
                currentSort
            );
            displayCharacters(filtered);
        });
    }

    // Obsługa sortowania
    if (document.getElementById('sort-characters')) {
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
    }

    // Obsługa wyszukiwania zaklęć
    if (document.getElementById('spell-search')) {
        document.getElementById('spell-search').addEventListener('input', (e) => {
            const filtered = filterSpells(
                allSpells,
                e.target.value,
                document.getElementById('spell-category-filter').value
            );
            displaySpells(filtered);
        });
    }

    // Obsługa filtrowania kategorii zaklęć
    if (document.getElementById('spell-category-filter')) {
        document.getElementById('spell-category-filter').addEventListener('change', (e) => {
            const filtered = filterSpells(
                allSpells,
                document.getElementById('spell-search').value,
                e.target.value
            );
            displaySpells(filtered);
        });
    }
});