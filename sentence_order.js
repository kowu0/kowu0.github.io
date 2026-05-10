document.addEventListener("DOMContentLoaded", () => {
    const wordTilesContainer = document.getElementById("word-tiles-container");
    const sentenceDropArea = document.getElementById("sentence-drop-area");
    const checkButton = document.getElementById("check-button");
    const nextButton = document.getElementById("next-button");
    const currentProgressSpan = document.getElementById("current-progress");
    const totalProgressSpan = document.getElementById("total-progress");

    let allSentences = [];
    let currentSentenceData = null;
    let completedSentenceIds = [];
    const targetProgress = 5;

    const urlParams = new URLSearchParams(window.location.search);
    const classNum = urlParams.get("class") || "1";

    async function loadTasks() {
        try {
            const response = await fetch(`class${classNum}_data.json`);
            const data = await response.json();
            return data.sentenceOrder;
        } catch (error) {
            console.error("Error loading sentence order tasks:", error);
            return [];
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function splitSentenceIntoWords(sentence) {
        if (classNum === "1") {
            // For class 1, only split by space, no punctuation handling
            return sentence.split(' ').filter(word => word.length > 0);
        } else {
            // For classes 2 and 3, split words and keep punctuation as separate tiles
            // Use Unicode property escape \p{L} for letters, plus \w for numbers/underscore, and punctuation.
            // The 'u' flag ensures proper Unicode handling.
            return sentence.match(/[\p{L}\w]+|[.,!?;:]/gu);
        }
    }

    function createWordTile(word) {
        const tile = document.createElement("div");
        tile.className = "word-tile draggable";
        tile.textContent = word;
        tile.draggable = true;
        tile.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text/plain", word);
            e.dataTransfer.effectAllowed = "move";
            e.target.classList.add('dragging');
        });
        tile.addEventListener("dragend", (e) => {
            e.target.classList.remove('dragging');
        });
        return tile;
    }

    function renderWordTiles(sentence) {
        wordTilesContainer.innerHTML = "";
        const words = splitSentenceIntoWords(sentence);
        const shuffledWords = shuffleArray([...words]);

        shuffledWords.forEach(word => {
            const tile = createWordTile(word);
            wordTilesContainer.appendChild(tile);
        });
    }

    function setupDragAndDrop() {
        sentenceDropArea.addEventListener("dragover", (e) => {
            e.preventDefault(); // Allow drop
            e.dataTransfer.dropEffect = "move";
            sentenceDropArea.classList.add('drag-over');
        });

        sentenceDropArea.addEventListener("dragleave", () => {
            sentenceDropArea.classList.remove('drag-over');
        });

        sentenceDropArea.addEventListener("drop", (e) => {
            e.preventDefault();
            sentenceDropArea.classList.remove('drag-over');
            const draggedWord = e.dataTransfer.getData("text/plain");
            const draggedTile = document.querySelector('.dragging');

            if (draggedTile) {
                // Remove from original container if it was in the shuffled tiles
                if (draggedTile.parentNode === wordTilesContainer) {
                    wordTilesContainer.removeChild(draggedTile);
                } else if (draggedTile.parentNode === sentenceDropArea) {
                    // If moving within drop area, just reorder (for future enhancement)
                    // For now, simple append
                    sentenceDropArea.removeChild(draggedTile);
                }
                
                // Append to drop area
                sentenceDropArea.appendChild(draggedTile);
                draggedTile.draggable = false; // Make it non-draggable once dropped in the sentence area
            }
        });

        // Allow clicking tiles back to the shuffled container
        sentenceDropArea.addEventListener("click", (e) => {
            if (e.target.classList.contains("word-tile")) {
                const tile = e.target;
                sentenceDropArea.removeChild(tile);
                wordTilesContainer.appendChild(tile);
                tile.draggable = true; // Make it draggable again
            }
        });
    }

    function checkSentence() {
        const orderedWords = Array.from(sentenceDropArea.children).map(tile => tile.textContent);
        const originalWords = splitSentenceIntoWords(currentSentenceData.sentence);

        if (orderedWords.join(" ") === originalWords.join(" ")) {
            sentenceDropArea.classList.add("correct");
            sentenceDropArea.classList.remove("incorrect");
            completedSentenceIds.push(currentSentenceData.id);
            checkButton.style.display = "none";
            nextButton.style.display = "inline-block";
            showFriendlyAlert('Wspaniale! Zdanie jest ułożone poprawnie.', 'success');
        } else {
            sentenceDropArea.classList.add("incorrect");
            sentenceDropArea.classList.remove("correct");
            showFriendlyAlert("Niepoprawne ułożenie zdania. Spróbuj jeszcze raz!", 'error');
        }
    }

    function pickNewSentence() {
        let availableSentences = allSentences.filter(
            (s) => !completedSentenceIds.includes(s.id),
        );

        if (availableSentences.length === 0) {
            completedSentenceIds = []; // Reset if all unique sentences were used
            availableSentences = allSentences;
        }
        const randomSentence =
            availableSentences[Math.floor(Math.random() * availableSentences.length)];
        currentSentenceData = randomSentence;

        renderWordTiles(currentSentenceData.sentence);
        sentenceDropArea.innerHTML = ""; // Clear drop area
        sentenceDropArea.classList.remove("correct", "incorrect");
        currentProgressSpan.innerText = completedSentenceIds.length + 1;

        checkButton.style.display = "inline-block";
        nextButton.style.display = "none";

        if (completedSentenceIds.length >= targetProgress) {
            nextButton.innerText = "Zakończ";
        } else {
            nextButton.innerText = "Dalej";
        }
    }

    checkButton.addEventListener("click", checkSentence);

    nextButton.addEventListener("click", () => {
        if (completedSentenceIds.length >= targetProgress) {
            window.location.href = "index.html"; // Redirect to home on completion
        } else {
            pickNewSentence();
        }
    });

    async function init() {
        setupHelp('Przeciągnij kafelki ze słowami do dolnego prostokąta, aby ułożyć z nich poprawne zdanie. Jeśli się pomylisz, możesz kliknąć kafelek w dolnym prostokącie, aby wrócił na górę. Gdy ułożysz całe zdanie, kliknij przycisk "Sprawdź"!');
        const sentencesConfig = await loadTasks();
        allSentences = sentencesConfig;
        totalProgressSpan.innerText = Math.min(allSentences.length, targetProgress);
        if (allSentences.length > 0) {
            pickNewSentence();
            setupDragAndDrop();
        }
    }

    init();
});
