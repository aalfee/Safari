document.addEventListener('DOMContentLoaded', function () {
    const buttons = document.querySelectorAll('.answer-button');
    const selectedAnswerInput = document.getElementById('selected-answer');
    const resultDiv = document.getElementById('result');
    const questionContainer = document.querySelector('.question-container');
    const gifContainer = document.getElementById('gif-container');
    const correctSound = document.getElementById('correct-sound'); // Select the audio element
    let currentQuestionIndex = 0;
    let questions = [];
    let triesLeft = 3;

    function loadQuestions() {
        fetch('questions.csv')
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then((csvData) => {
                questions = parseCSV(csvData);
                questions = shuffleArray(questions); // Randomize the question order
                displayQuestion(currentQuestionIndex);
            })
            .catch((error) => {
                console.error('Error loading CSV file:', error);
            });
    }

    function parseCSV(csvData) {
        const rows = csvData.trim().split('\n');
        const headers = rows[0].split(',').map(header => header.trim()); // Trim headers to avoid issues
        const data = rows.slice(1).map((row) => {
            const values = row.split(',').map(value => value.trim()); // Trim values to avoid issues
            const obj = headers.reduce((acc, header, index) => {
                acc[header] = values[index] || ''; // Ensure undefined values are handled
                return acc;
            }, {});
            return obj;
        });
        return data;
    }

    function displayQuestion(index) {
        if (questions.length === 0) {
            questionContainer.innerHTML = 'No questions available.';
            return;
        }
        const question = questions[index];
        questionContainer.innerHTML = `<p>${question.question}</p>`;
        buttons[0].textContent = `A. ${question.optionA}`;
        buttons[1].textContent = `B. ${question.optionB}`;
        buttons[2].textContent = `C. ${question.optionC}`;
        buttons[3].textContent = `D. ${question.optionD}`;
        buttons[4].textContent = `E. ${question.optionE || ''}`;
        selectedAnswerInput.value = ''; // Clear selected answer
        resultDiv.textContent = ''; // Clear previous result
        triesLeft = 3; // Reset tries for the new question
        updateTriesDisplay();
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function updateTriesDisplay() {
        resultDiv.textContent = `Tries left: ${triesLeft}`;
    }

    function playAnimation() {
        gifContainer.style.display = 'block'; // Show the GIF container
        correctSound.play(); // Play the sound effect
        setTimeout(() => {
            gifContainer.style.display = 'none'; // Hide the GIF container after a delay
        }, 3000); // Adjust the timeout duration to match the length of your GIF
    }

    buttons.forEach((button) => {
        button.addEventListener('click', function () {
            buttons.forEach((btn) => (btn.style.backgroundColor = '#f9f9f9')); // Reset button colors
            this.style.backgroundColor = '#d0eaff'; // Highlight selected button
            selectedAnswerInput.value = this.dataset.answer; // Store selected answer
            console.log('Selected Answer:', selectedAnswerInput.value);
        });
    });

    // Handle form submission
    document.getElementById('quiz-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const selectedAnswer = selectedAnswerInput.value.trim(); // Trim whitespace

        // Debugging: Check the length of questions array and current question index
        console.log('Questions Array:', questions);
        console.log('Current Question Index:', currentQuestionIndex);

        // Make sure currentQuestionIndex is within the valid range
        if (currentQuestionIndex >= questions.length) {
            resultDiv.textContent = 'No more questions available.';
            return;
        }

        const question = questions[currentQuestionIndex];
        
        // Debugging: Check if question object is defined
        console.log('Current Question Object:', question);
        
        if (!question || !question.correct) {
            resultDiv.textContent = 'Error: Missing question data.';
            return;
        }

        const correctAnswer = question.correct.trim(); // Trim whitespace

        // Debugging: Check selected and correct answers
        console.log('Selected Answer:', selectedAnswer);
        console.log('Correct Answer:', correctAnswer);

        if (!selectedAnswer) {
            resultDiv.textContent = 'Please select an answer.';
            return;
        }

        if (selectedAnswer === correctAnswer) {
            playAnimation(); // Play the GIF and sound effect
            
            resultDiv.textContent = 'Correct!';
            setTimeout(() => {
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    displayQuestion(currentQuestionIndex);
                } else {
                    resultDiv.textContent = 'Quiz Completed!';
                }
            }, 3000); // Delay to allow GIF to play before moving to the next question
        } else {
            triesLeft--;
            if (triesLeft > 0) {
                resultDiv.textContent = `Incorrect. Try again! Tries left: ${triesLeft}`;
            } else {
                resultDiv.textContent = `Incorrect. Moving to the next question.`;
                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    displayQuestion(currentQuestionIndex);
                } else {
                    resultDiv.textContent = 'Quiz Completed!';
                }
                triesLeft = 3; // Reset tries for the next question
            }
        }
    });

    // Load questions on page load
    loadQuestions();
});
