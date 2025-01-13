async function test(){
    const response = await fetch("/api/test")
    const result = await response.json()
    console.log(result)
}
await test()


const board = document.querySelectorAll('.cell');
const questionContainer = document.getElementById('question-container');
const questionText = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitAnswerButton = document.getElementById('submit-answer');
const message = document.getElementById('message');

let currentPlayer = 'X'; // Växlar mellan X och O
let gameActive = true;

// Backend-länk
const API_URL = 'https://localhost:5001/api/game';

board.forEach(cell => {
    cell.addEventListener('click', () => {
        if (!cell.classList.contains('taken') && gameActive) {
            // Visa fråga
            fetch(API_URL + '/question')
                .then(response => response.json())
                .then(data => {
                    questionText.textContent = data.question;
                    questionContainer.style.display = 'block';
                });
            // Vänta på svar
        }
    });
});

submitAnswerButton.addEventListener('click', () => {
    const userAnswer = answerInput.value;
    fetch(API_URL + '/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: userAnswer })
    })
        .then(response => response.json())
        .then(data => {
            if (data.correct) {
                makeMove(); // Gör draget
            } else {
                message.textContent = 'Fel svar! Turen går över.';
                switchPlayer();
            }
            questionContainer.style.display = 'none';
            answerInput.value = '';
        });
});

function makeMove() {
    const selectedCell = Array.from(board).find(cell => !cell.classList.contains('taken'));
    selectedCell.textContent = currentPlayer;
    selectedCell.classList.add('taken');

    // Kontrollera om någon har vunnit
    checkWinner();
    switchPlayer();
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

function checkWinner() {
    // Enkel vinstkontroll (3 rutor i rad)
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (
            board[a].textContent &&
            board[a].textContent === board[b].textContent &&
            board[a].textContent === board[c].textContent
        ) {
            message.textContent = `Spelare ${currentPlayer} vinner!`;
            gameActive = false;
            return;
        }
    }
}
