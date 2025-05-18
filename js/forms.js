
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
                const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
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
    const quizQuestionsContainer = document.getElementById('quiz-questions');
    if (!quizForm || !quizQuestionsContainer) return;

    try {
        // Domyślne pytania (na wypadek gdyby API nie działało)
        const defaultQuestions = [
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
            },
            {
                question: "Jak nazywa się różdżka Harry'ego Pottera?",
                options: ["Blackthorn", "Holly", "Elder", "Vine"],
                answer: "Holly"
            },
            {
                question: "Kto jest opiekunem domu Gryffindor?",
                options: ["Albus Dumbledore", "Minerva McGonagall", "Severus Snape", "Filius Flitwick"],
                answer: "Minerva McGonagall"
            }
        ];

        let questions = defaultQuestions;

        // Spróbuj pobrać pytania z API
        try {
            const response = await fetch('https://hp-api.onrender.com/api/questions');
            if (response.ok) {
                const apiQuestions = await response.json();
                if (apiQuestions.length > 0) {
                    questions = apiQuestions.slice(0, 5);
                }
            }
        } catch (apiError) {
            console.log('Używam domyślnych pytań quizu', apiError);
        }

        // Wygeneruj HTML dla pytań
        quizQuestionsContainer.innerHTML = questions.map((question, index) => `
            <div class="quiz-question">
                <h3>${index + 1}. ${question.question}</h3>
                <div class="options">
                    ${question.options.map(option => `
                        <label>
                            <input type="radio" name="q${index}" value="${option}" required>
                            ${option}
                        </label>
                    `).join('')}
                </div>
            </div>
        `).join('');

        // Obsługa wysłania quizu
        quizForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const results = calculateResults(questions, quizForm);
            displayResults(results);
        });

    } catch (error) {
        console.error('Błąd inicjalizacji quizu:', error);
        quizQuestionsContainer.innerHTML = `
            <div class="quiz-error">
                <p>Nie udało się załadować quizu. Spróbuj odświeżyć stronę.</p>
            </div>
        `;
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
    
    // Przewiń do wyników
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
}

// Inicjalizacja formularzy
document.addEventListener('DOMContentLoaded', () => {
    validateContactForm();
    initQuiz();
});