document.addEventListener('DOMContentLoaded', function() {
    var countdownDisplay = document.getElementById('countdown');
    var progressBar = document.getElementById('progressBar');
    var answerInput = document.getElementById('answer');
    var resultDisplay = document.getElementById('result');
    var startButton = document.getElementById('startButton');
    var resetButton = document.getElementById('resetButton');
    var leaderboardBody = document.getElementById('leaderboardBody');
    var userNameInput = document.getElementById('userNameInput');
    var submitNameButton = document.getElementById('submitNameButton');
    var leaderboardCaption = document.getElementById('leaderboardCaption');
    var nameInputContainer = document.getElementById('nameInputContainer');
    var practiceContainer = document.getElementById('practiceContainer');
    var leaderboard = document.getElementById('leaderboard');
    var dbStatus = document.getElementById('dbStatus');
    var correctAnswer = 0;
    var timer;
    var correctCount = 0;
    var wrongCount = 0;
    var totalAttempts = 0;
    var practiceStarted = false;
    var countdownTimer;
    var userName = '';

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'check_connection.php', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var response = JSON.parse(xhr.responseText);
            if (response.status === 'success') {
                dbStatus.textContent = response.message;
                dbStatus.style.color = 'green';
            } else {
                dbStatus.textContent = response.message;
                dbStatus.style.color = 'red';
            }
        }
    };
    xhr.send();

    function getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function showMultiplication() {
        var num1 = getRandomNumber(0, 10);
        var num2 = getRandomNumber(0, 10);
        correctAnswer = num1 * num2;
        document.getElementById('multiplication').innerText = num1 + ' x ' + num2;
    }

    function checkAnswer() {
        var userAnswer = parseInt(answerInput.value);
        if (!isNaN(userAnswer)) {
            totalAttempts++;
            if (userAnswer === correctAnswer) {
                correctCount++;
                answerInput.style.backgroundColor = '#c8e6c9';
            } else {
                wrongCount++;
                answerInput.style.backgroundColor = '#ffcdd2';
            }
            setTimeout(function() {
                answerInput.style.backgroundColor = '';
            }, 500);
            answerInput.value = '';
            showMultiplication();
        }
    }

    function startPractice() {
        if (!practiceStarted) {
            practiceStarted = true;
            showMultiplication();
            startCountdown();
            answerInput.disabled = false;
            answerInput.focus();
            resetButton.style.display = 'none';
        }
    }

    function resetPractice() {
        clearInterval(timer);
        clearInterval(countdownTimer);
        countdownDisplay.textContent = '';
        resultDisplay.textContent = '';
        correctCount = 0;
        wrongCount = 0;
        totalAttempts = 0;
        practiceStarted = false;
        startButton.disabled = false;
        resetButton.style.display = 'none';
        progressBar.style.width = '100%';
        answerInput.disabled = true; // Modificado para desactivar el campo de respuesta
        answerInput.value = '';
        progressBar.className = 'progress-bar progress-bar-green';
    }

    function showResults() {
        var currentDate = new Date().toLocaleString();
        var newRow = document.createElement('tr');
        var difference = correctCount - wrongCount;
        var classification = '';

        if (difference >= -1000 && difference <= 19) {
            classification = 'FP';
        } else if (difference >= 20 && difference <= 29) {
            classification = 'ED';
        } else if (difference >= 30 && difference <= 39) {
            classification = 'TP';
        } else {
            classification = 'CF';
        }

        newRow.innerHTML = '<td>' + currentDate + '</td>' +
                           '<td>' + correctCount + '</td>' +
                           '<td>' + wrongCount + '</td>' +
                           '<td>' + totalAttempts + '</td>' +
                           '<td>' + difference + '</td>' +
                           '<td>' + classification + '</td>';
        leaderboardBody.appendChild(newRow);

        saveResultsToDatabase(currentDate, correctCount, wrongCount, totalAttempts, difference, classification);
    }

    function saveResultsToDatabase(date, correct, wrong, attempts, difference, classification) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'save_results.php', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText);
            }
        };
        xhr.send('username=' + encodeURIComponent(userName) +
                 '&date=' + encodeURIComponent(date) +
                 '&correct=' + correct +
                 '&wrong=' + wrong +
                 '&attempts=' + attempts +
                 '&difference=' + difference +
                 '&classification=' + encodeURIComponent(classification));
    }

    function startCountdownTimer() {
        var countdownTime = 5;
        countdownDisplay.textContent = countdownTime;
        startButton.disabled = true;
        countdownTimer = setInterval(function() {
            countdownTime--;
            countdownDisplay.textContent = countdownTime;
            if (countdownTime <= 0) {
                clearInterval(countdownTimer);
                countdownDisplay.textContent = '';
                startPractice();
            }
        }, 1000);
    }

    function startCountdown() {
        var totalTime = 60;
        var intervalDuration = 1000;
        var timeLeft = totalTime;
        var progressBarIncrement = 100 / totalTime;

        timer = setInterval(function() {
            timeLeft--;
            countdownDisplay.textContent = timeLeft;
            updateProgressBar(progressBarIncrement * timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timer);
                countdownDisplay.textContent = '¡Tiempo!';
                document.getElementById('multiplication').textContent = '';
                answerInput.disabled = true;
                showResults();
                resetButton.style.display = 'block';
            }
        }, intervalDuration);
    }

    function updateProgressBar(progress) {
        progressBar.style.width = progress + '%';
        if (progress <= 10) {
            progressBar.className = 'progress-bar progress-bar-red';
        } else if (progress <= 50) {
            progressBar.className = 'progress-bar progress-bar-orange';
        } else {
            progressBar.className = 'progress-bar progress-bar-green';
        }
    }

    submitNameButton.addEventListener('click', function() {
        userName = userNameInput.value.trim();
        if (userName !== '') {
            nameInputContainer.style.display = 'none';
            practiceContainer.classList.remove('hidden');
            leaderboard.classList.remove('hidden');
            leaderboardCaption.textContent = `Resultados de ${userName}`;
            startButton.disabled = false;
        }
    });

    startButton.addEventListener('click', startCountdownTimer);

    resetButton.addEventListener('click', resetPractice);
    resetButton.style.display = 'none';

    answerInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            checkAnswer();
        }
    });
});
