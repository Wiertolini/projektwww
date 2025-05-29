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
    initScrollAnimations();
    initNavbarScrollEffect();
});