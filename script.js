// Mobile detection function
function isOnMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
            window.innerWidth <= 768;
}

// --- DATA -----------------------------------------------------------
// Data for the intro message sequence
const introMessages = [
    "hiii",
    "I just like randomly remembered we did 21 questions some time ago yah",
    "and I've decided we should go again",
    "except this time I'll be asking all the questions 😛",
    "and they'll be like trivia that's based on our raccoonship (racoon + relationship)",
    "but don't worry!! they'll be vv easy I think",
    "okay, first question..."
];

// Data for the 20 two-choice questions
const questions = [
    { question: "What kind of event did we first meet at?", answers: ["Birthday", "Graduation"], correct: "Birthday"},
    { question: "What was the first thing we talked about on Instagram?", answers: ["Cats", "Hamilton"], correct: "Hamilton"},
    { question: "What app allowed us to express our compound drawing artistry?", answers: ["DrawTogether!", "Scribbles"], correct: "DrawTogether!" },
    { question: "Where was the second place we met up (if the first was the bday)?", answers: ["Sarit", "Nairobi Safari Walk"], correct: "Nairobi Safari Walk" },
    { question: "What animal did we feed there?", answers: ["Giraffe", "Lion"], correct: "Giraffe" },
    { question: "Which emojis describe the item I gave you there?", answers: ["🦝👑", "⬛🐈"], correct: "⬛🐈" },
    { question: "What was the name of the that game we played there?", answers: ["DeeWee", "WeeDee"], correct: "DeeWee" },
    { question: "When did we first say 'I love you' (based on my memory)?", answers: ["When leaving The Hub", "When leaving the safari walk place"], correct: "When leaving the safari walk place" },
    { question: "Where was our first kiss?", answers: ["In a trampoline", "In a changing room stall thing"], correct: "In a trampoline" },
    { question: "What did you convince me to buy at The Hub?", answers: ["Fake shit 😭", "A pink bra"], correct: "Fake shit 😭" },
    { question: "What animal did we (try to) paint the that time you came over?", answers: ["Raccoons", "Frogs"], correct: "Frogs" },
    { question: "What funny number have you lowered my rice purity test score to?", answers: ["69", "67"], correct: "69" },
    { question: "What was the first game we played on Roblox (based on my memory)?", answers: ["Drive it!", "Webbed"], correct: "Webbed" },
    { question: "Who won air hockey?", answers: ["Debbie", "Wenzel"], correct: "Debbie" },
    { question: "What language was I doing on Duolingo the that other time you came over 😭?", answers: ["French", "Spanish"], correct: "French" },
    { question: "What were you attending like just before we met up at Sarit?", answers: ["A conference", "A wedding"], correct: "A conference" },
    { question: "What was my first response to 'What song comes to mind when you think of us?'?", answers: ["Nothing by Bruno Major", "Heaven by Calum Scott"], correct: "Nothing by Bruno Major" },
    { question: "What was your first response to 'What song comes to mind when you think of us?'?", answers: ["I Love You by Fontaines D.C.", "Anyone Else but You by The Mouldy Peaches"], correct: "I Love You by Fontaines D.C." },
    { question: "Who won the that attempt at poker at arboretum 😛?", answers: ["Debbie", "Wenzel"], correct: "Wenzel" },
    { question: "What song is on the keychain you gave me (which I'm still so grateful for btw)?", answers: ["Nothing by Bruno Major", "The Red Means I Love You by Madds Buckley"], correct: "Nothing by Bruno Major" }
];

// Data for the pre-final message sequence (re-added)
const preFinalMessages = [
    "the last question is a bit different...",
    "you'll have to solve clues to reveal the question, one word at a time",
];

// Data for the word-guessing game
const wordClues = [
    { word: "Will", clue: "The gay one in Stranger Things" },
    { word: "you", clue: "Fill in the blank: 'Dear Theodosia, what to say to ___?'" },
    { word: "be", clue: "🐝 - e" },
    { word: "my", clue: "I call you '__ fwbonuses', '__ love' and '__ raqueen' (all the blanks are the same word)" },
    { word: "Valentine", clue: "It's February, I think yk what the last word is 🌹" }
];

// She said
let sheSaidYes = false;

// --- STATE MANAGEMENT -----------------------------------------------
let currentState = 'intro'; // intro, questions, preFinal, wordClue, final
let currentIntroIndex = 0;
let currentQuestionIndex = 0;
let currentPreFinalIndex = 0; // New index for preFinalMessages
let currentWordClueIndex = 0;
let score = 0;
let guessedWords = [];

// --- DOM ELEMENTS ---------------------------------------------------
const mainContainer = document.getElementById('main-container');

// --- RENDERING & VIEW LOGIC -----------------------------------------

/**
 * Main function to update the view with a crossfade effect.
 * @param {function} renderFunction - The function that builds the HTML for the next state.
 */
function updateView(renderFunction) {
    mainContainer.classList.add('fade-out');
    setTimeout(() => {
        renderFunction();
        mainContainer.classList.remove('fade-out');
    }, 500); // Match CSS transition duration
}

/**
 * Updates only the message text within a sequence, keeping the 'Next' button visible.
 * @param {string} newMessage - The new message text to display.
 */
function updateMessageView(newMessage) {
    const messageElement = document.querySelector('.message-content');
    if (messageElement) {
        messageElement.classList.add('fade-out-message');
        setTimeout(() => {
            messageElement.textContent = newMessage;
            messageElement.classList.remove('fade-out-message');
        }, 500); // Matches CSS transition for .message-content
    }
}

/** Renders the initial layout for a message sequence (intro or pre-final). */
function renderMessageSequence(initialMessage, handler) {
    mainContainer.innerHTML = `
        <p class="message-content">${initialMessage}</p>
        <div class="button-container">
            <button id="next-button">></button>
        </div>
    `;
    document.getElementById('next-button').addEventListener('click', handler);
}

/** Renders the current question. */
function renderQuestion() {
    const q = questions[currentQuestionIndex];
    mainContainer.innerHTML = `
        <h2>Question ${currentQuestionIndex + 1}</h2>
        <h1>${q.question}</h1>
        <div class="button-container">
            <button class="answer-button">${q.answers[0]}</button>
            <button class="answer-button">${q.answers[1]}</button>
        </div>
    `;
    document.querySelectorAll('.answer-button').forEach(button => {
        button.addEventListener('click', (e) => handleAnswerClick(e.target));
    });
}

/** Renders the word-guessing game. */
function renderWordClue() {
    const currentClue = wordClues[currentWordClueIndex].clue;
    const phraseProgress = wordClues.map((item, index) => 
        index < guessedWords.length ? item.word : "_____"
    ).join(" ");

    mainContainer.innerHTML = `
        <h2>Question 21</h2>
        <h1 class="clue-phrase-progress">${phraseProgress}</h1>
        <p class="clue-text message-content">Clue: ${currentClue}</p>
        <div class="button-container">
            <input type="text" id="word-input" class="word-input" placeholder="Type the word...">
            <button id="word-submit-button">Submit</button>
        </div>
    `;
    
    const input = document.getElementById('word-input');
    input.focus();
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('word-submit-button').click();
        }
    });
    document.getElementById('word-submit-button').addEventListener('click', handleWordSubmit);
}

/**
 * Updates the clue view: instantly updates the phrase, fades the clue.
 */
function updateWordClueView(newPhrase, newClue) {
    const phraseElement = document.querySelector('.clue-phrase-progress');
    const clueElement = document.querySelector('.clue-text');

    if (phraseElement && clueElement) {
        // Instantly update the phrase
        phraseElement.textContent = newPhrase;

        // Fade the clue out and in
        clueElement.classList.add('fade-out-message');
        
        setTimeout(() => {
            clueElement.textContent = `Clue: ${newClue}`;
            clueElement.classList.remove('fade-out-message');
            
            const input = document.getElementById('word-input');
            if (input) {
                input.value = '';
                input.focus();
            }
        }, 500); // Matches CSS transition for .message-content
    }
}

/** Renders the special Valentine's question. */
function renderFinalQuestion() {
    document.body.classList.add('valentine-theme');
    createFloatingHearts();
    mainContainer.innerHTML = `
        <img id="WeeImg" src="images/Wee.png" alt="Wee">
        <h1>Will you be my Valentine?</h1>
        <div class="button-container">
            <button id="yes-button">Yes</button>
            <button id="no-button">No</button>
        </div>
    `;
    document.getElementById('yes-button').addEventListener('click', handleYesClick);
    document.getElementById('no-button').addEventListener('click', handleNoClick)
    const noButton = document.getElementById('no-button');
    document.addEventListener('mousemove', (e) => moveNoButton(e, noButton));
    noButton.addEventListener('mouseover', (e) => noButtonJump(e, noButton));
}

/** Renders the final success message with the score. */
function renderFinalMessage() {
    document.body.classList.add('valentine-theme'); // Ensure theme persists
    if (sheSaidYes) {
        mainContainer.innerHTML = `
            <img src="images/yay.avif" alt="yay" class="final-gif">
            <h1>YAAAY I LOVE YOU SO MUCH MY RAQUEEN 🌹❤️❤️❤️</h1>
            <p class="score-text">You got ${score} / ${questions.length + 1} btw</p>
        `;
    } else {
        mainContainer.innerHTML = `
            <img src="images/ok.gif" alt="💔" class="final-gif">
            <h1>Okay... maybe next year?</h1>
            <p class="score-text">You got ${score} / ${questions.length + 1} btw</p>
        `;
    }
}

// --- EVENT HANDLERS & LOGIC -----------------------------------------

/** Handles 'Next' clicks during the intro. */
function handleNextIntro() {
    if (soundtrack.paused) {
        soundtrack.play();
    }

    currentIntroIndex++;
    if (currentIntroIndex < introMessages.length) {
        // Just update the message text
        updateMessageView(introMessages[currentIntroIndex]);
    } else {
        // Transition to the next major state
        currentState = 'questions';
        updateView(renderQuestion);
    }
}

/** Handles clicks on an answer button. */
function handleAnswerClick(button) {
    const selectedAnswer = button.textContent;
    const correctAnswer = questions[currentQuestionIndex].correct;
    
    // Disable buttons after selection
    document.querySelectorAll('.answer-button').forEach(btn => btn.disabled = true);
    
    if (selectedAnswer === correctAnswer) {
        score++;
        button.classList.add('correct-flash');
    } else {
        button.classList.add('incorrect-flash');
    }
    
    // Wait for the animation to play before proceeding
    setTimeout(() => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            updateView(renderQuestion);
        } else {
            currentState = 'preFinal'; // Transition to preFinal messages
            updateView(() => renderMessageSequence(preFinalMessages[0], handleNextPreFinal));
        }
    }, 500);
}

/** Handles 'Next' clicks during the pre-final messages. (Re-implemented) */
function handleNextPreFinal() {
    currentPreFinalIndex++;
    if (currentPreFinalIndex < preFinalMessages.length) {
        updateMessageView(preFinalMessages[currentPreFinalIndex]);
    } else {
        currentState = 'wordClue'; // Transition to word guessing game
        updateView(renderWordClue);
    }
}

/** Handles the submission of a guessed word. */
function handleWordSubmit() {
    const input = document.getElementById('word-input');
    const submittedWord = input.value.trim();
    const correctWord = wordClues[currentWordClueIndex].word;

    if (submittedWord.toLowerCase() === correctWord.toLowerCase()) {
        guessedWords.push(correctWord);
        currentWordClueIndex++;

        if (currentWordClueIndex < wordClues.length) {
            // Update the view with the new subtle transition
            const newPhrase = wordClues.map((item, index) => 
                index < guessedWords.length ? item.word : "_____"
            ).join(" ");
            const newClue = wordClues[currentWordClueIndex].clue;
            updateWordClueView(newPhrase, newClue);
        } else {
            // All words guessed, transition to the final state
            currentState = 'final';
            updateView(renderFinalQuestion);
        }
    } else {
        input.classList.add('wiggle');
        setTimeout(() => input.classList.remove('wiggle'), 500);
    }
}

/** Handles the 'Yes' click on the final question. */
function handleYesClick() {
    score++; // Question 21 is always correct
    document.removeEventListener('mousemove', moveNoButton);
    document.getElementById('no-button').removeEventListener('mouseover', noButtonJump);
    sheSaidYes = true;

    updateView(renderFinalMessage);
}

/** Handles the 'No' click on the final question. */
function handleNoClick() {
    score++; // Question 21 is always correct
    document.removeEventListener('mousemove', moveNoButton);
    document.getElementById('no-button').removeEventListener('mouseover', noButtonJump);

    updateView(renderFinalMessage);
}

/** Moves the 'No' button away from the cursor. */
function moveNoButton(event, noButton) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const noButtonX = noButton.offsetLeft + noButton.offsetWidth / 2;
    const noButtonY = noButton.offsetTop + noButton.offsetHeight / 2;

    const deltaX = mouseX - noButtonX;
    const deltaY = mouseY - noButtonY;
    const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

    const maxDistance = 300; // The distance at which the noButton moves away

    if (distance < maxDistance) {
        const angle = Math.atan2(deltaY, deltaX);

        const moveX = Math.cos(angle) * (maxDistance * 0.2);
        const moveY = Math.sin(angle) * (maxDistance * 0.2);

        // Calculate new noButton position
        const newLeft = noButton.offsetLeft - moveX;
        const newTop = noButton.offsetTop - moveY;

        // Ensure the noButton stays within the viewport
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const boundedLeft = Math.min(
            Math.max(0, newLeft),
            windowWidth - noButton.offsetWidth
        );
        const boundedTop = Math.min(
            Math.max(0, newTop),
            windowHeight - noButton.offsetHeight
        );

        noButton.style.left = boundedLeft + 'px';
        noButton.style.top = boundedTop + 'px';
    }
}

function noButtonJump(event, noButton) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const noButtonX = noButton.offsetLeft + noButton.offsetWidth / 2;
    const noButtonY = noButton.offsetTop + noButton.offsetHeight / 2;

    const deltaX = mouseX - noButtonX;
    const deltaY = mouseY - noButtonY;

    const angle = Math.atan2(deltaY, deltaX);

    const maxDistance = 300;

    const moveX = Math.cos(angle) * (maxDistance * 0.3);
    const moveY = Math.sin(angle) * (maxDistance * 0.3);

    // Calculate new noButton position
    const newLeft = noButton.offsetLeft + moveX;
    const newTop = noButton.offsetTop + moveY;

    // Ensure the noButton stays within the viewport
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const boundedLeft = Math.min(
        Math.max(0, newLeft),
        windowWidth - noButton.offsetWidth
    );
    const boundedTop = Math.min(
        Math.max(0, newTop),
        windowHeight - noButton.offsetHeight
    );

    noButton.style.left = boundedLeft + 'px';
    noButton.style.top = boundedTop + 'px';
}

/** Creates and animates floating hearts. */
function createFloatingHearts() {
    const heartCount = 50;
    for (let i = 0; i < heartCount; i++) {
        const heart = document.createElement('img');
        heart.src = 'images/heart.png';
        heart.classList.add('heart');
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.animationDuration = `${Math.random() * 10 + 5}s`;
        // heart.style.animationDelay = `${Math.random() * 0.5}s`;
        document.body.appendChild(heart);
    }
}

// --- INITIALIZATION -------------------------------------------------
window.onload = () => {
    if (!isOnMobile()){
        updateView(() => renderMessageSequence(introMessages[0], handleNextIntro));
    } else {
        document.getElementById('main-container').innerText = 'use Mac pls'
    }
};