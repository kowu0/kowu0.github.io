document.addEventListener('DOMContentLoaded', () => {
    const storyContainer = document.getElementById('story-container');
    const checkButton = document.getElementById('check-button');
    const nextButton = document.getElementById('next-button');
    const taskTitle = document.getElementById('task-title');
    const currentProgressSpan = document.getElementById('current-progress');
    const totalProgressSpan = document.getElementById('total-progress');

    let allStories = [];
    let currentStory = null;
    let completedStoryIds = [];
    const targetProgress = 5;

    // Get class from URL
    const urlParams = new URLSearchParams(window.location.search);
    const classNum = urlParams.get('class') || '1';
    totalProgressSpan.innerText = targetProgress;

    async function loadStories() {
        try {
            const response = await fetch(`class${classNum}_data.json`);
            const data = await response.json();
            return data.orthography;
        } catch (error) {
            console.error('Error loading stories:', error);
            storyContainer.innerHTML = '<p>Nie udało się załadować zadań. Spróbuj ponownie później.</p>';
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

    function renderStory(story) {
        currentStory = story;
        storyContainer.innerHTML = '';
        taskTitle.innerText = `Klasa ${classNum}: ${story.title}`;
        currentProgressSpan.innerText = completedStoryIds.length + 1;

        const storyDiv = document.createElement('div');
        storyDiv.className = 'story-item';
        
        let textHtml = story.text;
        story.placeholders.forEach((placeholder, placeholderIndex) => {
            const selectId = `placeholder-${placeholderIndex}`;
            let optionsHtml = '<option value="" disabled selected>...</option>';
            const shuffledOptions = shuffleArray([...placeholder.options]);

            shuffledOptions.forEach(option => {
                optionsHtml += `<option value="${option}">${option}</option>`;
            });

            const selectHtml = `<select id="${selectId}" class="exercise-select">${optionsHtml}</select>`;
            textHtml = textHtml.replace('___', selectHtml);
        });

        storyDiv.innerHTML = `<p>${textHtml}</p>`;
        storyContainer.appendChild(storyDiv);
        
        // Reset buttons
        checkButton.style.display = 'inline-block';
        nextButton.style.display = 'none';
        nextButton.innerText = 'Następna historia';
    }

    function pickNewStory() {
        // Filter out stories that were already completed in this session
        let availableStories = allStories.filter(s => !completedStoryIds.includes(s.id));
        
        // If we ran out of unique stories but didn't reach target, reset (allow repeats)
        if (availableStories.length === 0) {
            completedStoryIds = [];
            availableStories = allStories;
        }

        const randomStory = availableStories[Math.floor(Math.random() * availableStories.length)];
        renderStory(randomStory);
    }

    async function init() {
        setupHelp('W tym zadaniu musisz uzupełnić luki w tekście odpowiednimi literami lub wyrazami. Wybierz poprawną opcję z listy rozwijanej dla każdej luki, a następnie kliknij przycisk "Sprawdź odpowiedzi". Jeśli wszystko będzie dobrze, będziesz mógł przejść do następnej historii!');
        allStories = await loadStories();
        if (allStories.length > 0) {
            pickNewStory();
        }
    }

    checkButton.addEventListener('click', () => {
        let allCorrect = true;
        currentStory.placeholders.forEach((placeholder, placeholderIndex) => {
            const selectElement = document.getElementById(`placeholder-${placeholderIndex}`);
            selectElement.classList.remove('correct', 'incorrect');

            if (selectElement.value === placeholder.correct) {
                selectElement.classList.add('correct');
            } else {
                selectElement.classList.add('incorrect');
                allCorrect = false;
            }
        });

        if (allCorrect) {
            completedStoryIds.push(currentStory.id);
            checkButton.style.display = 'none';
            nextButton.style.display = 'inline-block';
            showFriendlyAlert('Brawo! Wszystkie odpowiedzi są poprawne. Możesz iść dalej!', 'success');

            if (completedStoryIds.length >= targetProgress) {
                nextButton.innerText = 'Zakończ';
                nextButton.classList.add('final-step');
            }
        } else {
            showFriendlyAlert('Niektóre odpowiedzi są błędne. Spróbuj jeszcze raz!', 'error');
        }
    });

    nextButton.addEventListener('click', () => {
        if (completedStoryIds.length >= targetProgress) {
            window.location.href = 'index.html';
        } else {
            pickNewStory();
        }
    });

    init();
});