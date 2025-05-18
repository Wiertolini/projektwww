

// W funkcji validateContactForm popraw część z localStorage:
const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
submissions.push(formData);
localStorage.setItem('contactSubmissions', JSON.stringify(submissions));


// Funkcje pomocnicze
function showError(input, message) {
    const errorElement = input.nextElementSibling;
    errorElement.textContent = message;
    input.classList.add('error');
}

function clearError(input) {
    const errorElement = input.nextElementSibling;
    errorElement.textContent = '';
    input.classList.remove('error');
}

// Walidacja formularza kontaktowego
function validateContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    let isValid = true;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        isValid = true;

        // Walidacja imienia
        if (nameInput.value.trim() === '') {
            showError(nameInput, 'Imię jest wymagane');
            isValid = false;
        } else {
            clearError(nameInput);
        }

        // Walidacja emaila
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            showError(emailInput, 'Wprowadź poprawny email');
            isValid = false;
        } else {
            clearError(emailInput);
        }

        // Walidacja wiadomości
        if (messageInput.value.trim() === '') {
            showError(messageInput, 'Wiadomość jest wymagana');
            isValid = false;
        } else if (messageInput.value.trim().length < 10) {
            showError(messageInput, 'Wiadomość musi mieć co najmniej 10 znaków');
            isValid = false;
        } else {
            clearError(messageInput);
        }

        if (isValid) {
            const formData = {
                name: nameInput.value,
                email: emailInput.value,
                house: document.getElementById('contact-house').value,
                message: messageInput.value,
                timestamp: new Date().toISOString()
            };

            try {
                // Symulacja wysłania formularza
                console.log('Form data:', formData);
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Pokazanie komunikatu sukcesu
                alert('Dziękujemy za wiadomość! Odezwiemy się wkrótce.');
                form.reset();
                
                // Zapisz w localStorage
                const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || []);
                submissions.push(formData);
                localStorage.setItem('contactSubmissions', JSON.stringify(submissions));
            } catch (error) {
                console.error('Błąd:', error);
                alert('Wystąpił błąd podczas wysyłania formularza. Spróbuj ponownie.');
            }
        }
    });

    // Live validation
    nameInput.addEventListener('input', () => clearError(nameInput));
    emailInput.addEventListener('input', () => clearError(emailInput));
    messageInput.addEventListener('input', () => clearError(messageInput));
}

// Quiz
async function initQuiz() {
    const quizForm = document.getElementById('quiz-form');
    if (!quizForm) return;

    try {
        // Pobranie pytań z API
        const response = await fetch('https://hp-api.onrender.com/api/questions');
        if (!response.ok) throw new Error('Failed to fetch questions');
        const questions = await response.json();

        // Jeśli API nie zwraca pytań, użyj domyślnych
        const quizQuestions = questions.length > 0 ? questions.slice(0, 5) : [
            {
                question: "Kto jest dyrektorem Hogwartu na początku serii?",
                options: ["Albus Dumbledore", "Minerva McGonagall", "Severus Snape", "Dolores Umbridge"],
                answer: "Albus Dumbledore"
            },
            {
                question: "Jakie zwierzę to Patronus Harry'ego?",
                options: ["Lew", "Jeleń", "Feniks", "Wilk"],
                answer: "Jeleń"
            },
            {
                question: "Który przedmiot nauczał Severus Snape?",
                options: ["Obrona przed czarną magią", "Eliksiry", "Zaklęcia", "Opieka nad magicznymi stworzeniami"],
                answer: "Eliksiry"
            }
        ];

        // Reszta funkcji pozostaje bez zmian...
    } catch (error) {
        console.error('Błąd:', error);
        document.getElementById('quiz-results').innerHTML = 
            '<p class="error">Nie udało się załadować quizu. Spróbuj ponownie później.</p>';
    }
}

function calculateResults(questions, form) {
    let correct = 0;
    const results = [];
    
    questions.forEach((question, index) => {
        const selectedOption = form.querySelector(`input[name="q${index}"]:checked`);
        const isCorrect = selectedOption && selectedOption.value === question.answer;
        
        if (isCorrect) correct++;
        
        results.push({
            question: question.question,
            selected: selectedOption?.value || 'Brak odpowiedzi',
            correctAnswer: question.answer,
            isCorrect
        });
    });
    
    return {
        score: correct,
        total: questions.length,
        details: results
    };
}

function displayResults(results) {
    const resultsContainer = document.getElementById('quiz-results');
    resultsContainer.innerHTML = `
        <h3>Twój wynik: ${results.score}/${results.total}</h3>
        <div class="results-details">
            ${results.details.map((result, index) => `
                <div class="result-item ${result.isCorrect ? 'correct' : 'incorrect'}">
                    <h4>${index + 1}. ${result.question}</h4>
                    <p>Twoja odpowiedź: ${result.selected}</p>
                    ${!result.isCorrect ? `<p>Poprawna odpowiedź: ${result.correctAnswer}</p>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Inicjalizacja formularzy
document.addEventListener('DOMContentLoaded', () => {
    validateContactForm();
    initQuiz();
});