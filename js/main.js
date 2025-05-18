document.addEventListener('DOMContentLoaded', () => {
    // Elementy DOM
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const themeToggle = document.querySelector('.theme-toggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // 1. Obsługa motywu (jasny/ciemny)
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (savedTheme === null && prefersDarkScheme.matches)) {
            document.body.classList.add('dark-mode');
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const isDark = document.body.classList.toggle('dark-mode');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                updateThemeIcon();
            });
        }
        
        updateThemeIcon();
    }

    function updateThemeIcon() {
        if (!themeToggle) return;
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.querySelector('.sun').style.display = isDark ? 'none' : 'block';
        themeToggle.querySelector('.moon').style.display = isDark ? 'block' : 'none';
    }

    // 2. Menu mobilne
    function initMobileMenu() {
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                menuToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
                const isExpanded = navMenu.classList.contains('active');
                menuToggle.setAttribute('aria-expanded', isExpanded);
            });
        }
    }

    // 3. Smooth scroll
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // 4. Zaklęcia - dane statyczne
    const spellsData = {
        defensive: [
            { name: "Protego", description: "Tworzy magiczną tarczę odbijającą zaklęcia" },
            { name: "Expecto Patronum", description: "Przywołuje patronusa do obrony przed dementorami" },
            { name: "Protego Maxima", description: "Silniejsza wersja zaklęcia Protego" },
            { name: "Repello Inimicum", description: "Odpycha intruzów od chronionego obszaru" }
        ],
        offensive: [
            { name: "Avada Kedavra", description: "Śmiertelne zaklęcie, powoduje natychmiastową śmierć" },
            { name: "Crucio", description: "Zaklęcie tortur, powoduje ekstremalny ból" },
            { name: "Imperio", description: "Daje całkowitą kontrolę nad ofiarą" },
            { name: "Sectumsempra", description: "Powoduje głębokie cięcia na ciele ofiary" }
        ],
        utility: [
            { name: "Lumos", description: "Tworzy światło na końcu różdżki" },
            { name: "Accio", description: "Przyciąga przedmioty z odległości" },
            { name: "Alohomora", description: "Otwiera zamknięte drzwi i kłódki" },
            { name: "Episkey", description: "Leczy drobne urazy i skaleczenia" }
        ]
    };

    // 5. Inicjalizacja akordeonu z zaklęciami
    function initSpellsAccordion() {
        const accordionButtons = document.querySelectorAll('.accordion-btn');
        
        accordionButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const content = btn.nextElementSibling;
                const isActive = content.classList.contains('active');
                
                // Zamknij wszystkie inne akordeony
                document.querySelectorAll('.accordion-content').forEach(item => {
                    if (item !== content) {
                        item.classList.remove('active');
                    }
                });
                
                // Otwórz/zamknij aktualny akordeon
                if (!isActive) {
                    loadSpellsContent(content, index);
                }
                content.classList.toggle('active');
            });
        });
    }

    function loadSpellsContent(content, index) {
        let category, title;
        
        switch(index) {
            case 0:
                category = 'defensive';
                title = 'Defensywne';
                break;
            case 1:
                category = 'offensive';
                title = 'Ofensywne';
                break;
            case 2:
                category = 'utility';
                title = 'Użytkowe';
                break;
            default:
                return;
        }

        content.innerHTML = `
            <h3 class="spells-category-title">Zaklęcia ${title}</h3>
            <ul class="spells-list">
                ${spellsData[category].map(spell => `
                    <li class="spell-item">
                        <span class="spell-name">${spell.name}</span>
                        <span class="spell-description">${spell.description}</span>
                    </li>
                `).join('')}
            </ul>
        `;
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
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
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