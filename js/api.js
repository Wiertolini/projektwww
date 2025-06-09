let controller = new AbortController();
let allCharacters = [];
let allSpells = [];
let currentSort = 'asc';

// Pobiera dane z pliku JSON
async function fetchData() {
    try {
        const response = await fetch('bazadanych.json');
        if (!response.ok) throw new Error('Nie udało się pobrać danych');
        return await response.json();
    } catch (error) {
        console.error('Błąd podczas pobierania danych:', error);
        showErrorModal('Nie udało się załadować danych. Spróbuj ponownie później.');
        return null;
    }
}

// Przetwarza dane postaci z JSONa
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
            pseudonyms: character.pseudonimy || [],
            gender: character.płeć || 'Nieznana',
            species: character.gatunek || 'Nieznany',
            house: character.dom || 'Brak domu',
            dateOfBirth: character.data_urodzenia || character.rok_urodzenia || 'Nieznana',
            isWizard: character.czarodziej ? 'Tak' : 'Nie',
            ancestry: character.pochodzenie || 'Nieznane',
            eyes: character.oczy || 'Nieznany',
            hair: character.włosy || 'Nieznany',
            wand: character.różdżka || 'Brak informacji',
            patronus: character.patronus || 'Brak',
            student: character.uczeń_hogwartu ? 'Tak' : 'Nie',
            staff: character.pracownik_hogwartu ? 'Tak' : 'Nie',
            actor: character.aktor || 'Nieznany',
            alive: character.żyje ? 'Żyje' : 'Nie żyje',
            image: imageUrl
        };
    });
}

// Przetwarza dane zaklęć z JSONa
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

// Filtruje i sortuje postaci
function filterAndSortCharacters(characters, searchTerm, houseFilter, sortOrder) {
    if (!characters || !Array.isArray(characters)) return [];
    return [...characters]
        .filter(character => {
            const matchesSearch = !searchTerm || character.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesHouse = !houseFilter || (character.house && character.house.toLowerCase() === houseFilter.toLowerCase());
            return matchesSearch && matchesHouse;
        })
        .sort((a, b) => {
            if (!sortOrder) return 0;
            return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        });
}

// Filtruje zaklęcia
function filterSpells(spells, searchTerm, categoryFilter) {
    if (!spells || !Array.isArray(spells)) return [];

    return spells.filter(spell => {
        const matchesSearch = !searchTerm || spell.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !categoryFilter || spell.category.toLowerCase().includes(categoryFilter.toLowerCase());
        return matchesSearch && matchesCategory;
    });
}

// Wyświetla postaci w kontenerze
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

        const houseClass = character.house.replace(/\s+/g, '').toLowerCase(); 

        card.innerHTML = `
            <div class="character-image-container">
                <img src="${character.image}" alt="${character.name}" class="character-image" loading="lazy" onerror="this.onerror=null; this.src='assets/images/default-character.jpg'">
            </div>
            <div class="character-info">
                <h3>${character.name}</h3>
                <p class="house ${character.house}">${character.house}</p>
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

// Wyświetla zaklęcia w akordeonie
function displaySpells(spells) {
    const accordionContainer = document.querySelector('.spells-accordion');
    if (!accordionContainer) return;
    accordionContainer.innerHTML = '';

    const spellsByCategory = {};
    spells.forEach(spell => {
        if (!spellsByCategory[spell.category]) {
            spellsByCategory[spell.category] = [];
        }
        spellsByCategory[spell.category].push(spell);
    });

    for (const category in spellsByCategory) {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';

        const accordionBtn = document.createElement('button');
        accordionBtn.className = 'accordion-btn';
        accordionBtn.textContent = category;

        const accordionContent = document.createElement('div');
        accordionContent.className = 'accordion-content';

        spellsByCategory[category].forEach(spell => {
            const spellElement = document.createElement('div');
            spellElement.className = 'spell-item scroll-animation';
            spellElement.innerHTML = `<h4>${spell.name}</h4><p>${spell.description}</p>`;
            accordionContent.appendChild(spellElement);
        });

        accordionItem.appendChild(accordionBtn);
        accordionItem.appendChild(accordionContent);
        accordionContainer.appendChild(accordionItem);

        accordionBtn.addEventListener('click', () => {
            accordionBtn.classList.toggle('active');
            accordionContent.classList.toggle('show');
        });
    }

    initScrollAnimations();
}

// Pokazuje szczegóły postaci w modalnym oknie
function showCharacterDetails(characterId) {
    try {
        const character = allCharacters.find(c => c.id === characterId);
        if (!character) throw new Error('Postać nie została znaleziona');

        const modal = document.getElementById('character-modal');
        const modalBody = document.getElementById('modal-body');

        modalBody.innerHTML = `
            <div class="modal-character">
                <div class="modal-image-container">
                    <img src="${character.image}" alt="${character.name}" class="modal-image" onerror="this.onerror=null; this.src='assets/images/default-character.jpg'">
                </div>
                <div class="modal-details">
                    <h2>${character.name}</h2>
                    <p><strong>Dom:</strong> ${character.house}</p>
                    <p><strong>Pseudonimy:</strong> ${character.pseudonyms.length ? character.pseudonyms.join(', ') : 'Brak'}</p>
                    <p><strong>Płeć:</strong> ${character.gender}</p>
                    <p><strong>Gatunek:</strong> ${character.species}</p>
                    <p><strong>Data urodzenia:</strong> ${character.dateOfBirth}</p>
                    <p><strong>Czarodziej:</strong> ${character.isWizard}</p>
                    <p><strong>Pochodzenie:</strong> ${character.ancestry}</p>
                    <p><strong>Kolor oczu:</strong> ${character.eyes}</p>
                    <p><strong>Kolor włosów:</strong> ${character.hair}</p>
                    <p><strong>Różdżka:</strong> ${character.wand}</p>
                    <p><strong>Patronus:</strong> ${character.patronus}</p>
                    <p><strong>Uczeń Hogwartu:</strong> ${character.student}</p>
                    <p><strong>Pracownik Hogwartu:</strong> ${character.staff}</p>
                    <p><strong>Aktor:</strong> ${character.actor}</p>
                    <p><strong>Status:</strong> ${character.alive}</p>
                </div>
            </div>
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

// Wyświetla komunikat o błędzie
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

// Inicjalizuje animacje przewijania
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

// Inicjalizuje aplikację po załadowaniu DOM
document.addEventListener('DOMContentLoaded', async () => {
    allCharacters = await fetchCharacters();
    displayCharacters(allCharacters);

    allSpells = await fetchSpells();
    displaySpells(allSpells);

    document.getElementById('character-search')?.addEventListener('input', (e) => {
        const filtered = filterAndSortCharacters(allCharacters, e.target.value, document.getElementById('house-filter').value, currentSort);
        displayCharacters(filtered);
    });

    document.getElementById('house-filter')?.addEventListener('change', (e) => {
        const filtered = filterAndSortCharacters(allCharacters, document.getElementById('character-search').value, e.target.value, currentSort);
        displayCharacters(filtered);
    });

    document.getElementById('sort-characters')?.addEventListener('click', () => {
        currentSort = currentSort === 'asc' ? 'desc' : 'asc';
        const filtered = filterAndSortCharacters(allCharacters, document.getElementById('character-search').value, document.getElementById('house-filter').value, currentSort);
        displayCharacters(filtered);
        document.getElementById('sort-characters').textContent = currentSort === 'asc' ? 'Sortuj A-Z' : 'Sortuj Z-A';
    });

    document.getElementById('spell-search')?.addEventListener('input', (e) => {
        const filtered = filterSpells(allSpells, e.target.value, document.getElementById('spell-category-filter').value);
        displaySpells(filtered);
    });

    document.getElementById('spell-category-filter')?.addEventListener('change', (e) => {
        const filtered = filterSpells(allSpells, document.getElementById('spell-search').value, e.target.value);
        displaySpells(filtered);
    });
});