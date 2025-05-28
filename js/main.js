document.addEventListener('DOMContentLoaded', () => {
    // Elementy DOM
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Funkcja pomocnicza: usuwanie znaków diakrytycznych
    function removeDiacritics(text) {
        const replacements = {
            'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
            'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
            'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
            'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
        };
        return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, char => replacements[char] || char);
    }

    // 1. Obsługa motywu (jasny/ciemny)
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (savedTheme === null && prefersDarkScheme.matches)) {
            document.body.classList.add('dark-mode');
        }
        
        themeToggle?.addEventListener('click', () => {
            const isDark = document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            updateThemeIcon();
        });
        
        updateThemeIcon();
    }

    function updateThemeIcon() {
        if (!themeToggle) return;
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.querySelector('.sun').style.display = isDark ? 'none' : 'inline-block';
        themeToggle.querySelector('.moon').style.display = isDark ? 'inline-block' : 'none';
    }

    // 2. Menu mobilne
    function initMobileMenu() {
        if (!menuToggle || !navMenu) return;

        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            menuToggle.setAttribute('aria-expanded', navMenu.classList.contains('active'));
        });

        // Zamknij menu po kliknięciu linku
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // 3. Smooth scroll
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    // Zamknij menu mobilne jeśli otwarte
                    if (navMenu.classList.contains('active')) {
                        menuToggle.classList.remove('active');
                        navMenu.classList.remove('active');
                        menuToggle.setAttribute('aria-expanded', 'false');
                    }
                    
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // 4. Rozszerzone dane zaklęć
    const spellsData = {
        defensive: [
            { name: "Protego", description: "Tworzy magiczną tarczę odbijającą zaklęcia" },
            { name: "Expecto Patronum", description: "Przywołuje patronusa do obrony przed dementorami" },
            { name: "Protego Maxima", description: "Silniejsza wersja zaklęcia Protego" },
            { name: "Repello Inimicum", description: "Odpycha intruzów od chronionego obszaru" },
            { name: "Fianto Duri", description: "Wzmacnia istniejące bariery ochronne" },
            { name: "Salvio Hexia", description: "Chroni przed złymi zaklęciami" },
            { name: "Expelliarmus", description: "Rozbraja przeciwnika" },
            { name: "Muffliato", description: "Uniemożliwia podsłuchanie rozmowy" }
        ],
        offensive: [
            { name: "Avada Kedavra", description: "Śmiertelne zaklęcie, powoduje natychmiastową śmierć" },
            { name: "Crucio", description: "Zaklęcie tortur, powoduje ekstremalny ból" },
            { name: "Imperio", description: "Daje całkowitą kontrolę nad ofiarą" },
            { name: "Sectumsempra", description: "Powoduje głębokie cięcia na ciele ofiary" },
            { name: "Confringo", description: "Powoduje eksplozję celu" },
            { name: "Reducto", description: "Niszczy przedmioty na które jest rzucone" },
            { name: "Diffindo", description: "Przecina przedmioty" },
            { name: "Bombarda", description: "Wywołuje małą eksplozję" }
        ],
        utility: [
            { name: "Lumos", description: "Tworzy światło na końcu różdżki" },
            { name: "Accio", description: "Przyciąga przedmioty z odległości" },
            { name: "Alohomora", description: "Otwiera zamknięte drzwi i kłódki" },
            { name: "Episkey", description: "Leczy drobne urazy i skaleczenia" },
            { name: "Wingardium Leviosa", description: "Unosi przedmioty w powietrzu" },
            { name: "Reparo", description: "Naprawia uszkodzone przedmioty" },
            { name: "Aguamenti", description: "Tworzy strumień wody" },
            { name: "Incendio", description: "Wytwarza ogień" },
            { name: "Nox", description: "Gasí światło z zaklęcia Lumos" },
            { name: "Scourgify", description: "Czyści przedmioty" }
        ],
        transfiguration: [
            { name: "Vera Verto", description: "Zamienia zwierzęta w kielichy" },
            { name: "Draconifors", description: "Zamienia przedmioty w smoki" },
            { name: "Lapifors", description: "Zamienia przedmioty w króliki" },
            { name: "Avifors", description: "Zamienia przedmioty w ptaki" },
            { name: "Transmutacja", description: "Zmienia właściwości przedmiotów" },
            { name: "Conjunto", description: "Tworzy przedmioty z niczego" }
        ],
        charms: [
            { name: "Petrificus Totalus", description: "Paraliżuje ofiarę" },
            { name: "Rictusempra", description: "Wywołuje niekontrolowany śmiech" },
            { name: "Tarantallegra", description: "Wywołuje niekontrolowany taniec" },
            { name: "Serpensortia", description: "Przywołuje węża" },
            { name: "Locomotor Mortis", description: "Skleja nogi ofiary" },
            { name: "Levicorpus", description: "Podnosi ofiarę za kostkę" },
            { name: "Liberacorpus", description: "Odwraca efekt Levicorpus" },
            { name: "Finite Incantatem", description: "Kończy działanie bieżących zaklęć" }
        ]
    };

    // 5. Poprawiona inicjalizacja akordeonu z zaklęciami (z zastosowaniem removeDiacritics)
    function initSpellsAccordion() {
        const accordionButtons = document.querySelectorAll('.accordion-btn');
        
        accordionButtons.forEach((btn, index) => {
            // Inicjalizacja atrybutów ARIA
            btn.setAttribute('aria-expanded', 'false');
            btn.setAttribute('aria-controls', `spells-accordion-${index}`);
            const content = btn.nextElementSibling;
            content.setAttribute('id', `spells-accordion-${index}`);

            // Dodaj nasłuchiwacz zdarzeń
            btn.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                
                // Zamknij wszystkie inne akordeony
                document.querySelectorAll('.accordion-btn').forEach(otherBtn => {
                    if (otherBtn !== this) {
                        closeAccordion(otherBtn);
                    }
                });

                // Przełącz stan aktualnego akordeonu
                if (isExpanded) {
                    closeAccordion(this);
                } else {
                    openAccordion(this, content, index);
                }
            });

            // Otwórz pierwszy akordeon domyślnie
            if (index === 0) {
                openAccordion(btn, content, index);
            }
        });

        function openAccordion(btn, content, index) {
            btn.setAttribute('aria-expanded', 'true');
            btn.classList.add('active');
            content.classList.add('active');
            
            // Załaduj zawartość tylko jeśli jest pusta
            if (content.innerHTML === '') {
                loadSpellsContent(content, index);
            }
        }

        function closeAccordion(btn) {
            const content = btn.nextElementSibling;
            btn.setAttribute('aria-expanded', 'false');
            btn.classList.remove('active');
            content.classList.remove('active');
        }

        function loadSpellsContent(content, index) {
            const categories = ['defensive', 'offensive', 'utility', 'transfiguration', 'charms'];
            const titles = ['Defensywne', 'Ofensywne', 'Użytkowe', 'Transmutacyjne', 'Uroki'];
            
            if (index < 0 || index >= categories.length) return;
            
            const category = categories[index];
            const title = titles[index];
            const sortedSpells = [...spellsData[category]].sort((a, b) => a.name.localeCompare(b.name));
            
            content.innerHTML = `
                <div class="spells-content-wrapper">
                    <h3 class="spells-category-title">${removeDiacritics(title)} <span class="spells-count">(${sortedSpells.length})</span></h3>
                    <ul class="spells-list" role="list">
                        ${sortedSpells.map(spell => `
                            <li class="spell-item" role="listitem">
                                <div class="spell-card">
                                    <span class="spell-name">${removeDiacritics(spell.name)}</span>
                                    <span class="spell-description">${removeDiacritics(spell.description)}</span>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
    }

    // 6. Animacje scrollowania
    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.scroll-animation').forEach(el => observer.observe(el));
    }

    // 7. Efekt scrollowania dla navbaru
    function initNavbarScrollEffect() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Inicjalizacja wszystkich funkcji
    initTheme();
    initMobileMenu();
    initSmoothScroll();
    initSpellsAccordion();
    initScrollAnimations();
    initNavbarScrollEffect();
});