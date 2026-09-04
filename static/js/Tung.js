function fitPage() {
    var page = document.getElementsByClassName("webpage")[0];

    if (page == null) {
        return;
    }

    var holder = document.getElementById("pageHolder");

    if (holder == null) {
        holder = document.createElement("div");
        holder.id = "pageHolder";
        page.parentNode.insertBefore(holder, page);
        holder.appendChild(page);
    }

    var scale = Math.min(1, window.innerWidth / 1496, window.innerHeight / 850);
    var sideSpace = (window.innerWidth - (1496 * scale)) / 2;

    page.style.transformOrigin = "top left";
    page.style.transform = "scale(" + scale + ")";
    page.style.marginLeft = sideSpace + "px";

    holder.style.width = "100vw";
    holder.style.height = (850 * scale) + "px";
}

fitPage();
window.onresize = fitPage;


function listenAction() {
    var main = document.getElementById("main");

    if (main != null && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        var speech = new SpeechSynthesisUtterance(main.innerText);
        speech.rate = 0.9;

        window.speechSynthesis.speak(speech);
    }
}

var listenButton = document.getElementById("listenButton");

if (listenButton != null) {
    listenButton.onclick = listenAction;
}


function setCookie(name, value) {
    document.cookie = name + "=" + value + "; path=/; max-age=2592000";
}

function getCookie(name) {
    var search = name + "=";
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();

        if (cookie.indexOf(search) == 0) {
            return cookie.substring(search.length);
        }
    }

    return "";
}


/* HELP PAGE TEXT SIZE CONTROLS */

var currentTextScale = 1;

function storeOriginalTextSizes() {
    var main = document.getElementById("main");

    if (main == null) {
        return;
    }

    var elements = main.querySelectorAll("h1, h2, h3, p, li, a, button, strong, span, small");

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];

        if (element.getAttribute("data-original-font-size") == null) {
            var style = window.getComputedStyle(element);
            var fontSize = parseFloat(style.fontSize);

            if (!isNaN(fontSize)) {
                element.setAttribute("data-original-font-size", fontSize);
            }

            if (style.lineHeight != "normal") {
                var lineHeight = parseFloat(style.lineHeight);

                if (!isNaN(lineHeight)) {
                    element.setAttribute("data-original-line-height", lineHeight);
                }
            }
        }
    }
}

function applyTextScale(scale) {
    var main = document.getElementById("main");

    if (main == null) {
        return;
    }

    storeOriginalTextSizes();

    var elements = main.querySelectorAll("h1, h2, h3, p, li, a, button, strong, span, small");

    for (var i = 0; i < elements.length; i++) {
        var element = elements[i];
        var originalSize = Number(element.getAttribute("data-original-font-size"));

        if (originalSize > 0) {
            element.style.fontSize = (originalSize * scale) + "px";
        }

        var originalLineHeight = element.getAttribute("data-original-line-height");

        if (originalLineHeight != null && Number(originalLineHeight) > 0) {
            element.style.lineHeight = (Number(originalLineHeight) * scale) + "px";
        }
    }

    currentTextScale = scale;

    var status = document.getElementById("textSizeStatus");

    if (status != null) {
        if (scale > 1) {
            status.textContent = "Current text size: Larger";
        } else if (scale < 1) {
            status.textContent = "Current text size: Smaller";
        } else {
            status.textContent = "Current text size: Normal";
        }
    }
}

function largerText() {
    applyTextScale(1.15);
}

function smallerText() {
    applyTextScale(0.90);
}

function resetText() {
    applyTextScale(1);
}

var largerTextButton = document.getElementById("largerTextButton");
var smallerTextButton = document.getElementById("smallerTextButton");
var resetTextButton = document.getElementById("resetTextButton");

if (largerTextButton != null) {
    largerTextButton.onclick = largerText;
}

if (smallerTextButton != null) {
    smallerTextButton.onclick = smallerText;
}

if (resetTextButton != null) {
    resetTextButton.onclick = resetText;
}


/* LESSON QUESTIONS */

var lessonAnswers = {
    email1: { correct: "b", message: "Do not use the urgent link. Open the official app or contact the bank using a number you already trust." },
    email2: { correct: "a", message: "An unexpected request for a security code is a warning sign." },
    email3: { correct: "b", message: "Verify the message using a trusted contact method instead of trusting the message itself." },

    web1: { correct: "b", message: "The full website address is a stronger clue than logos or professional design." },
    web2: { correct: "a", message: "HTTPS protects the connection, but it does not prove the website itself is genuine." },
    web3: { correct: "b", message: "An official app or saved bookmark avoids unexpected links." },

    wifi1: { correct: "b", message: "Your own mobile data or waiting for a trusted connection is safer for banking." },
    wifi2: { correct: "b", message: "Sensitive logins and payments are best avoided on unfamiliar public Wi-Fi." },
    wifi3: { correct: "b", message: "Use networks you recognise and trust." },

    pass1: { correct: "b", message: "A long unique password or passphrase is safer than reusing a short password." },
    pass2: { correct: "a", message: "Two-factor authentication adds a second proof of identity." },
    pass3: { correct: "b", message: "Keep one-time security codes private." }
};

var lessonProgress = {};

function checkLessonAnswer(questionId, choice) {
    var question = lessonAnswers[questionId];

    if (question == null || lessonProgress[questionId] == true) {
        return;
    }

    var letters = ["a", "b", "c"];
    var feedback = document.getElementById(questionId + "Feedback");
    var chosenButton = document.getElementById(questionId + choice);
    var correctButton = document.getElementById(questionId + question.correct);

    if (correctButton != null) {
        correctButton.classList.add("correct-answer");
    }

    if (choice == question.correct) {
        if (feedback != null) {
            feedback.className = "lesson-feedback correct";
            feedback.textContent = "✓ Correct. " + question.message;
        }
    } else {
        if (chosenButton != null) {
            chosenButton.classList.add("wrong-answer");
        }

        if (feedback != null) {
            feedback.className = "lesson-feedback incorrect";
            feedback.textContent = "✗ Not quite. " + question.message;
        }
    }

    lessonProgress[questionId] = true;

    for (var i = 0; i < letters.length; i++) {
        var button = document.getElementById(questionId + letters[i]);

        if (button != null) {
            button.disabled = true;
        }
    }

    unlockLessonButton();
}

function unlockLessonButton() {
    var completeButton = document.getElementById("lessonCompleteButton");

    if (completeButton == null) {
        return;
    }

    var questionsOnPage = document.getElementsByClassName("lesson-question");
    var allAnswered = true;

    for (var i = 0; i < questionsOnPage.length; i++) {
        if (lessonProgress[questionsOnPage[i].id] != true) {
            allAnswered = false;
        }
    }

    if (allAnswered) {
        completeButton.disabled = false;

        var message = document.getElementById("completeMessage");

        if (message != null) {
            message.textContent = "✓ All 3 questions answered. You can now mark this lesson complete.";
        }
    }
}

function markLessonComplete(name) {
    var completeButton = document.getElementById("lessonCompleteButton");

    if (completeButton != null && completeButton.disabled) {
        return;
    }

    setCookie("lesson_" + name, "done");

    var message = document.getElementById("completeMessage");

    if (message != null) {
        message.textContent = "✓ Lesson marked as complete. These skills appear again in Escape the Scam.";
    }
}


/* ESCAPE THE SCAM - ALL 10 QUESTIONS ARE MULTIPLE CHOICE */

var questionNumber = 0;
var score = 0;
var selectedAnswer = 0;
var streak = 0;
var gameResults = [];

var questions = [
    {
        type: "PHISHING EMAIL",
        title: "Your bank sends you an urgent message",
        scenario: "URGENT: Your account will be closed in 30 minutes. Click this link now and enter your password.",
        answerOne: "Click the link quickly so the account stays open.",
        answerTwo: "Do not click. Open the bank app or call using a trusted number.",
        correct: 2,
        tip: "Phishing often creates urgency or fear. Stop and verify the message using contact details you already trust."
    },
    {
        type: "FAKE WEBSITE",
        title: "Which website address is safer?",
        scenario: "You want to log in to your bank and two different web addresses appear.",
        answerOne: "https://www.mybank.com.au",
        answerTwo: "http://mybank-login-bonus.example",
        correct: 1,
        tip: "Read the full address carefully. HTTPS helps protect the connection, but the address still needs to belong to the real organisation."
    },
    {
        type: "PUBLIC WI-FI",
        title: "You need to transfer money at a café",
        scenario: "Your phone is connected to an unfamiliar free public Wi-Fi network.",
        answerOne: "Do the transfer now because public Wi-Fi is always safe.",
        answerTwo: "Wait or use your own mobile data for the banking task.",
        correct: 2,
        tip: "Avoid sensitive accounts on unfamiliar public Wi-Fi. A trusted connection or your own mobile data is safer."
    },
    {
        type: "PASSWORD SAFETY",
        title: "Choose the stronger password habit",
        scenario: "You are creating a new important account.",
        answerOne: "Reuse one short password so it is easy to remember.",
        answerTwo: "Use a long, unique password or passphrase.",
        correct: 2,
        tip: "A long unique password reduces the chance that one stolen password exposes several accounts."
    },
    {
        type: "TWO-FACTOR AUTHENTICATION",
        title: "The account offers 2FA",
        scenario: "You can add a second sign-in step using a code from your phone.",
        answerOne: "Turn it on because it adds another layer of security.",
        answerTwo: "Turn it off because a password is always enough.",
        correct: 1,
        tip: "Two-factor authentication adds another proof of identity if someone steals your password."
    },
    {
        type: "SUSPICIOUS MESSAGE",
        title: "A friend sends an unexpected link",
        scenario: "The message says: 'Is this you in this video?' followed by a strange link.",
        answerOne: "Open it because the message came from a friend.",
        answerTwo: "Contact your friend another way before opening the link.",
        correct: 2,
        tip: "A trusted person's account can be hacked. If a message is unusual, confirm it another way before opening links."
    },
    {
        type: "PERSONAL INFORMATION",
        title: "A caller asks for a verification code",
        scenario: "Someone claiming to be from your bank asks you to read out a one-time security code sent to your phone.",
        answerOne: "Give them the code because they said they are from the bank.",
        answerTwo: "Do not share the code. End the call and contact the bank yourself.",
        correct: 2,
        tip: "One-time codes are security information. Never give one to an unexpected caller or message sender."
    },
    {
        type: "SOFTWARE UPDATE",
        title: "Your device says an update is available",
        scenario: "The update appears through your device's normal Settings menu.",
        answerOne: "Install trusted updates because they can fix security problems.",
        answerTwo: "Never install updates because updates are usually scams.",
        correct: 1,
        tip: "Updates from the device's normal settings or official app store can fix known security weaknesses."
    },
    {
        type: "BANKING LINK",
        title: "You receive an unexpected banking link",
        scenario: "A text message says there is a problem with your account and tells you to sign in using the link.",
        answerOne: "Use the link because the message says it is urgent.",
        answerTwo: "Ignore the link and open the official bank app or website yourself.",
        correct: 2,
        tip: "Do not use unexpected banking links. Open the official app or type the trusted website address yourself."
    },
    {
        type: "UNIQUE PASSWORD",
        title: "Why is a unique password safer?",
        scenario: "You are deciding whether to reuse the same password on several accounts.",
        answerOne: "If one password is stolen, your other accounts can still have different passwords.",
        answerTwo: "Using the same password everywhere makes every account safer.",
        correct: 1,
        tip: "Unique passwords stop one stolen password from automatically giving access to your other accounts."
    }
];

function updateGameProgress() {
    var bars = document.querySelectorAll(".game-progress span");

    for (var i = 0; i < bars.length; i++) {
        bars[i].className = "";

        if (gameResults[i] == true) {
            bars[i].classList.add("correct-progress");
        } else if (gameResults[i] == false) {
            bars[i].classList.add("wrong-progress");
        } else if (i == questionNumber) {
            bars[i].classList.add("current");
        }
    }
}

function showQuestion() {
    var gameType = document.getElementById("gameType");

    if (gameType == null) {
        return;
    }

    var q = questions[questionNumber];
    selectedAnswer = 0;

    document.getElementById("gameType").textContent = q.type;
    document.getElementById("gameQuestion").textContent = q.title;
    document.getElementById("scenario").textContent = q.scenario;
    document.getElementById("questionCount").textContent = (questionNumber + 1) + " of " + questions.length;
    document.getElementById("scoreText").textContent = score + " / " + questions.length;

    var streakText = document.getElementById("streakText");

    if (streakText != null) {
        streakText.textContent = streak + " ★";
    }

    var answerOne = document.getElementById("answerOne");
    var answerTwo = document.getElementById("answerTwo");
    var feedback = document.getElementById("feedback");
    var teach = document.getElementById("teach");
    var checkButton = document.getElementById("checkButton");
    var nextButton = document.getElementById("nextButton");

    answerOne.textContent = "A. " + q.answerOne;
    answerTwo.textContent = "B. " + q.answerTwo;

    answerOne.className = "game-answer answer-left";
    answerTwo.className = "game-answer answer-right";

    answerOne.disabled = false;
    answerTwo.disabled = false;

    feedback.className = "game-feedback";
    feedback.textContent = "Choose an answer, then press Check answer.";
    teach.textContent = "";

    checkButton.style.display = "block";
    checkButton.disabled = false;
    nextButton.style.display = "none";

    updateGameProgress();
}

function chooseAnswer(answer) {
    selectedAnswer = answer;

    var answerOne = document.getElementById("answerOne");
    var answerTwo = document.getElementById("answerTwo");

    if (answerOne == null || answerTwo == null) {
        return;
    }

    answerOne.classList.remove("selected");
    answerTwo.classList.remove("selected");

    if (answer == 1) {
        answerOne.classList.add("selected");
    } else {
        answerTwo.classList.add("selected");
    }
}

function checkAnswer() {
    var q = questions[questionNumber];
    var feedback = document.getElementById("feedback");
    var teach = document.getElementById("teach");
    var answerOne = document.getElementById("answerOne");
    var answerTwo = document.getElementById("answerTwo");

    if (selectedAnswer == 0) {
        feedback.className = "game-feedback incorrect";
        feedback.textContent = "✗ Choose an answer first, then press Check answer.";
        return;
    }

    var correct = selectedAnswer == q.correct;
    gameResults[questionNumber] = correct;

    if (q.correct == 1) {
        answerOne.classList.add("correct-choice");
    } else {
        answerTwo.classList.add("correct-choice");
    }

    if (correct) {
        score = score + 1;
        streak = streak + 1;
        feedback.className = "game-feedback correct";
        feedback.textContent = "✓ CORRECT — great safe choice.";
    } else {
        streak = 0;

        if (selectedAnswer == 1) {
            answerOne.classList.add("wrong-choice");
        } else {
            answerTwo.classList.add("wrong-choice");
        }

        feedback.className = "game-feedback incorrect";
        feedback.textContent = "✗ INCORRECT — the safer answer is highlighted.";
    }

    teach.innerHTML = "<strong>Why it matters:</strong> " + q.tip;

    document.getElementById("scoreText").textContent = score + " / " + questions.length;

    var streakText = document.getElementById("streakText");

    if (streakText != null) {
        streakText.textContent = streak + " ★";
    }

    answerOne.disabled = true;
    answerTwo.disabled = true;

    document.getElementById("checkButton").style.display = "none";
    document.getElementById("nextButton").style.display = "block";

    updateGameProgress();
}

function nextQuestion() {
    questionNumber = questionNumber + 1;

    if (questionNumber < questions.length) {
        showQuestion();
    } else {
        setCookie("gameScore", score);

        try {
            localStorage.setItem("gameScore", score);
        } catch (e) {
        }

        window.location.href = "game-complete.html";
    }
}

var answerOneButton = document.getElementById("answerOne");

if (answerOneButton != null) {
    answerOneButton.onclick = function () {
        chooseAnswer(1);
    };

    document.getElementById("answerTwo").onclick = function () {
        chooseAnswer(2);
    };

    document.getElementById("checkButton").onclick = checkAnswer;
    document.getElementById("nextButton").onclick = nextQuestion;

    showQuestion();
}


/* RESULTS PAGE */

function showFinalResult() {
    var finalScore = document.getElementById("finalScore");

    if (finalScore == null) {
        return;
    }

    var savedScore = getCookie("gameScore");

    if (savedScore == "") {
        try {
            savedScore = localStorage.getItem("gameScore") || "0";
        } catch (e) {
            savedScore = "0";
        }
    }

    var numberScore = Number(savedScore);
    var title = document.getElementById("resultTitle");
    var band = document.getElementById("resultBand");
    var message = document.getElementById("resultMessage");

    finalScore.textContent = numberScore + " / 10";

    if (numberScore >= 9) {
        band.textContent = "CYBER SAFETY CHAMPION";
        title.textContent = "Outstanding scam spotting!";
        message.textContent = "You recognised nearly every risky situation. Keep using the same stop, check and verify habits online.";
    } else if (numberScore >= 7) {
        band.textContent = "STRONG SCAM SPOTTER";
        title.textContent = "Great work!";
        message.textContent = "You spotted most of the risky situations. Review anything you missed and try the game again when you are ready.";
    } else if (numberScore >= 5) {
        band.textContent = "CYBER SAFETY LEARNER";
        title.textContent = "Good progress!";
        message.textContent = "You have a useful starting point. Review the four lessons, then try Escape the Scam again.";
    } else {
        band.textContent = "BUILDING CONFIDENCE";
        title.textContent = "Keep practising!";
        message.textContent = "Review the short lessons and their three practice questions, then come back to the game. The aim is to build confidence.";
    }
}

showFinalResult();
