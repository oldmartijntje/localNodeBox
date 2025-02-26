document.addEventListener('DOMContentLoaded', function () {
    // Declare an empty object to hold our JSON data
    let categoryData = {};

    // Game variables
    let gameItems = [];
    let currentItems = [];
    let placedItems = [];
    let currentCardIndex = 0;
    let score = 0;
    let gameActive = false;
    let currentCategory = 'gameTheory';

    // Highscore variables for each category
    const highscores = {
        gameTheory: { score: 0, percent: 0 },
        filmTheory: { score: 0, percent: 0 },
        foodTheory: { score: 0, percent: 0 },
        styleTheory: { score: 0, percent: 0 },
        "oldmartijntje-projects": { score: 0, percent: 0 }
    };

    // Load highscores from localStorage
    loadHighscores();

    // DOM elements
    const categorySelect = document.getElementById('category-select');
    const startButton = document.querySelector('.start-button');
    const resetButtons = document.querySelectorAll('.reset-button');
    const currentCard = document.querySelector('.current-card');
    const timeline = document.querySelector('.timeline');
    const scoreDisplay = document.querySelector('.score');
    const highscoreDisplay = document.querySelector('.highscore');
    const highscorePercentDisplay = document.querySelector('.highscore-percent');
    const highscoreFill = document.querySelector('.highscore-fill');
    const gameOverMessage = document.querySelector('.game-over');
    const successMessage = document.querySelector('.success-message');
    const resultMessages = document.querySelectorAll('.result-message');
    const finalScores = document.querySelectorAll('.final-score');
    const indicators = document.querySelectorAll('.indicator');
    const optionSelector = document.getElementById('optionSelector');

    // Initialize highscore display for the default category
    displayHighscore();

    // Category selection event
    categorySelect.addEventListener('change', function () {
        currentCategory = this.value;
        displayHighscore();
    });

    // Disable the start button until JSON data is loaded
    startButton.disabled = true;

    // Fetch the game JSON data from exampleurl
    fetch("./gameJson.json")
        .then(response => response.json())
        .then(data => {
            categoryData = data;
            // Re-enable the start button now that the data is loaded
            startButton.disabled = false;
            Object.keys(categoryData).forEach(category => {
                if (categoryData[category][0].Id == undefined || true) {
                    let lenngth = categoryData[category].length;
                    for (let i = 0; i < lenngth; i++) {
                        categoryData[category][i].id = i;
                    }
                }
            });

        })
        .catch(error => {
            console.error("Error fetching game data: ", error);
        });

    function loadHighscores() {
        Object.keys(highscores).forEach(category => {
            const savedScore = localStorage.getItem(`timeline_highscore_${category}`);
            const savedPercent = localStorage.getItem(`timeline_highscore_percent_${category}`);
            if (savedScore) highscores[category].score = parseInt(savedScore);
            if (savedPercent) highscores[category].percent = parseInt(savedPercent);
        });
    }

    // Initialize the game
    function initGame() {
        // Ensure JSON data is loaded for the current category
        if (!categoryData[currentCategory]) {
            console.error("Game data not loaded for category:", currentCategory);
            return;
        }
        const items = categoryData[currentCategory];

        // Reset variables and randomize game items
        gameItems = [...items].sort(() => Math.random() - 0.5);
        for (let i = 0; i < 5; i++) {
            gameItems = gameItems.sort(() => Math.random() - 0.5);
        }
        currentItems = [];
        placedItems = [];
        currentCardIndex = 0;
        score = 0;
        gameActive = true;
        indicators.forEach(element => { element.style.display = 'block'; });
        scoreDisplay.textContent = score;
        timeline.innerHTML = '';
        gameOverMessage.style.display = 'none';
        successMessage.style.display = 'none';
        optionSelector.style.display = 'none';
        addDropZone(0, items);
        if (gameItems.length > 0) {
            showNextCard();
        }
        currentCard.style.display = 'block';
        timeline.style.display = 'block';
        startButton.style.display = 'none';
    }

    function showNextCard() {
        if (currentCardIndex < gameItems.length) {
            const item = gameItems[currentCardIndex];
            document.querySelector('.current-card .card-title').textContent = item.title;
            const cardLink = document.querySelector('.current-card .card-link');
            cardLink.textContent = item.link;
            cardLink.href = item.link;
            currentItems.push(item);
        } else {
            endGame(true);
        }
    }

    function addDropZone(index, allItems) {
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.textContent = 'Drop here';
        dropZone.dataset.index = index;
        dropZone.addEventListener('click', function () {
            if (gameActive) {
                placeCard(parseInt(this.dataset.index), allItems);
            }
        });
        if (index === 0 && timeline.firstChild) {
            timeline.insertBefore(dropZone, timeline.firstChild);
        } else {
            const items = timeline.querySelectorAll('.timeline-item');
            if (index > 0 && index <= items.length) {
                timeline.insertBefore(dropZone, items[index - 1].nextSibling);
            } else {
                timeline.appendChild(dropZone);
            }
        }
        return dropZone;
    }

    function placeCard(index, allItems) {
        if (!gameActive || currentCardIndex >= gameItems.length) return;
        const currentItem = gameItems[currentCardIndex];
        const timelineItem = document.createElement('div');
        timelineItem.className = 'timeline-item';
        const card = document.createElement('div');
        card.className = 'card';
        const cardTitle = document.createElement('div');
        cardTitle.className = 'card-title';
        cardTitle.textContent = currentItem.title;
        const cardLink = document.createElement('a');
        cardLink.className = 'card-link';
        cardLink.href = currentItem.link;
        cardLink.textContent = currentItem.link;
        cardLink.target = '_blank';
        const cardId = document.createElement('div');
        cardId.style.marginTop = '5px';
        cardId.style.color = '#666';
        cardId.textContent = `Nr: ${allItems.length - currentItem.id}`;
        card.appendChild(cardTitle);
        card.appendChild(cardLink);
        card.appendChild(cardId);
        timelineItem.appendChild(card);
        const isCorrect = checkPlacement(currentItem, index, placedItems);
        const items = timeline.querySelectorAll('.timeline-item');
        if (index === 0) {
            if (items.length > 0) {
                timeline.insertBefore(timelineItem, items[0]);
            } else {
                timeline.appendChild(timelineItem);
            }
        } else if (index >= items.length) {
            timeline.appendChild(timelineItem);
        } else {
            timeline.insertBefore(timelineItem, items[index]);
        }
        placedItems.splice(index, 0, currentItem);
        if (isCorrect) {
            card.style.borderColor = '#2ecc71';
            score++;
            scoreDisplay.textContent = score;
            updateDropZones(allItems);
            currentCardIndex++;
            if (currentCardIndex < gameItems.length) {
                showNextCard();
            } else {
                endGame(true);
            }
        } else {
            card.style.borderColor = '#e74c3c';
            endGame(false);
        }
    }

    function updateDropZones(allItems) {
        document.querySelectorAll('.drop-zone').forEach(zone => zone.remove());
        const items = timeline.querySelectorAll('.timeline-item');
        addDropZone(0, allItems);
        for (let i = 1; i <= items.length; i++) {
            addDropZone(i, allItems);
        }
        timeline.scrollTop = timeline.scrollHeight;
    }

    function checkPlacement(item, index, placedItems) {
        if (placedItems.length === 0) return true;
        if (index > 0) {
            const itemBefore = placedItems[index - 1];
            if (item.id < itemBefore.id) return false;
        }
        if (index < placedItems.length) {
            const itemAfter = placedItems[index];
            if (item.id > itemAfter.id) return false;
        }
        return true;
    }

    function endGame(completed) {
        gameActive = false;
        currentCard.style.display = 'none';
        const percentScore = Math.round((score / gameItems.length) * 100);
        if (score > highscores[currentCategory].score) {
            highscores[currentCategory].score = score;
            localStorage.setItem(`timeline_highscore_${currentCategory}`, score);
        }
        if (percentScore > highscores[currentCategory].percent) {
            highscores[currentCategory].percent = percentScore;
            localStorage.setItem(`timeline_highscore_percent_${currentCategory}`, percentScore);
        }
        displayHighscore();
        const scoreText = `Final Score: ${score} out of ${gameItems.length} (${percentScore}%)`;
        finalScores.forEach(el => el.textContent = scoreText);
        optionSelector.style.display = 'block';
        if (completed) {
            successMessage.style.display = 'block';
        } else {
            gameOverMessage.style.display = 'block';
        }
    }

    function displayHighscore() {
        const currentHighscore = highscores[currentCategory];
        highscoreDisplay.textContent = currentHighscore.score;
        highscorePercentDisplay.textContent = currentHighscore.percent + '%';
        highscoreFill.style.width = currentHighscore.percent + '%';
    }

    startButton.addEventListener('click', initGame);
    resetButtons.forEach(button => {
        button.addEventListener('click', function () {
            gameOverMessage.style.display = 'none';
            successMessage.style.display = 'none';
            initGame();
        });
    });
});