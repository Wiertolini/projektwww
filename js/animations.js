
class AnimationsManager {
    constructor() {
        this.initScrollAnimations();
        this.animateLogo();
        this.animateButtons();
        this.setupParallax();
        this.setupHoverAnimations();
        this.setupHouseCardsAnimations();

    }

    // Animacje przy scrollowaniu
    initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.scroll-animation');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, { 
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        animatedElements.forEach(el => observer.observe(el));
    }

    // Animacja logo
    animateLogo() {
        const logo = document.querySelector('.logo img');
        if (logo) {
            logo.style.transition = 'transform 0.5s ease, filter 0.3s ease';
            
            logo.addEventListener('mouseover', () => {
                logo.style.transform = 'rotate(15deg) scale(1.1)';
                logo.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.7))';
            });
            
            logo.addEventListener('mouseout', () => {
                logo.style.transform = 'rotate(0) scale(1)';
                logo.style.filter = 'none';
            });
        }
    }

    // Animacja przycisków
    animateButtons() {
        const buttons = document.querySelectorAll('button, .btn, .submit-btn, .cta-button');
        
        buttons.forEach(button => {
            button.style.transition = 'all 0.2s ease';
            
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.95)';
                button.style.opacity = '0.9';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = 'scale(1)';
                button.style.opacity = '1';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
                button.style.opacity = '1';
            });
            if (button.classList.contains('cta-button')) {
                setInterval(() => {
                    button.style.boxShadow = '0 0 0 0 rgba(245, 197, 66, 0.7)';
                    setTimeout(() => {
                        button.style.boxShadow = '0 0 0 10px rgba(245, 197, 66, 0)';
                    }, 500);
                }, 2000);
            }
        });
    }

    // Efekt paralaksy
    setupParallax() {
        const hero = document.querySelector('.hero');
        if (hero) {
            window.addEventListener('scroll', () => {
                const scrollValue = window.scrollY;
                hero.style.backgroundPositionY = `${scrollValue * 0.5}px`;
                
                // Efekt przyciemniania przy scrollu
                const opacity = 1 - Math.min(scrollValue / 300, 0.3);
                hero.querySelector('.hero-content').style.opacity = opacity;
            });
        }
    }

    // Animacje hover dla elementów
    setupHoverAnimations() {
        // Karty postaci
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.character-card')) {
                const card = e.target.closest('.character-card');
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
                card.style.transition = 'all 0.3s ease';
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.character-card')) {
                const card = e.target.closest('.character-card');
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            }
        });

        // Linki w nawigacji
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.style.transition = 'all 0.3s ease';
            
            link.addEventListener('mouseover', () => {
                link.style.transform = 'translateX(5px)';
                link.style.color = '#f5c542';
            });
            
            link.addEventListener('mouseout', () => {
                link.style.transform = 'translateX(0)';
                link.style.color = '';
            });
        });
    }

    // Animacje kart domów Hogwartu
    setupHouseCardsAnimations() {
        const houseCards = document.querySelectorAll('.house-card');
        
        houseCards.forEach(card => {
            card.style.transition = 'transform 0.5s ease, box-shadow 0.3s ease';
            
            card.addEventListener('mouseover', () => {
                card.style.transform = 'scale(1.05) rotate(1deg)';
                card.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
                
                // Efekt podświetlenia w kolorze domu
                const houseClass = Array.from(card.classList).find(cls => 
                    ['gryffindor', 'slytherin', 'hufflepuff', 'ravenclaw'].includes(cls)
                );
                
                if (houseClass) {
                    const colors = {
                        gryffindor: 'rgba(174, 0, 1, 0.3)',
                        slytherin: 'rgba(42, 98, 61, 0.3)',
                        hufflepuff: 'rgba(236, 185, 57, 0.3)',
                        ravenclaw: 'rgba(34, 47, 91, 0.3)'
                    };
                    card.style.boxShadow = `0 10px 25px ${colors[houseClass]}`;
                }
            });
            
            card.addEventListener('mouseout', () => {
                card.style.transform = 'scale(1) rotate(0)';
                card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
            });
        });
    }

   
}

// Inicjalizacja animacji po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    new AnimationsManager();
});