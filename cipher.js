document.addEventListener("DOMContentLoaded", () => {
  const cipherKeyContainer = document.getElementById("cipher-key-container");
  const cipherPhraseContainer = document.getElementById(
    "cipher-phrase-container",
  );
  const cipherInput = document.getElementById("cipher-input");
  const checkButton = document.getElementById("check-button");
  const nextButton = document.getElementById("next-button");
  const currentProgressSpan = document.getElementById("current-progress");
  const totalProgressSpan = document.getElementById("total-progress");
  const phraseHint = document.getElementById("phrase-hint");

  let allPhrases = [];
  let currentPhrase = null;
  let completedPhraseIds = [];
  const targetProgress = 5;

  // Get class from URL
  const urlParams = new URLSearchParams(window.location.search);
  const classNum = urlParams.get("class") || "1";

  async function loadTasks() {
    try {
      const response = await fetch(`class${classNum}_data.json`);
      const data = await response.json();
      return data.cipher;
    } catch (error) {
      console.error("Error loading cipher tasks:", error);
      return { letters: [], colors: [], phrases: [] };
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function generateCipherKey(availableLetters, availableColors) {
    const shuffledColors = shuffleArray([...availableColors]);
    const cipherMap = {};
    for (let i = 0; i < availableLetters.length; i++) {
      cipherMap[availableLetters[i]] =
        shuffledColors[i % shuffledColors.length];
    }
    return cipherMap;
  }

  function renderCipherKey(cipherMap) {
    cipherKeyContainer.innerHTML = "";
    for (const letter in cipherMap) {
      const keyItem = document.createElement("div");
      keyItem.className = "cipher-key-item";
      keyItem.innerHTML = `<span class="color-square" style="background-color: ${cipherMap[letter]};"></span> ${letter}`;
      cipherKeyContainer.appendChild(keyItem);
    }
  }

  function renderPhrase(phraseText, cipherMap) {
    cipherPhraseContainer.innerHTML = "";
    for (const char of phraseText.toUpperCase()) {
      if (char === " ") {
        const space = document.createElement("div");
        space.style.width = "20px"; // Visual space for words
        cipherPhraseContainer.appendChild(space);
      } else if (cipherMap[char]) {
        const colorSquare = document.createElement("div");
        colorSquare.className = "color-square";
        colorSquare.style.backgroundColor = cipherMap[char];
        cipherPhraseContainer.appendChild(colorSquare);
      } else {
        // Handle letters not in cipher map if necessary, e.g., show an empty square or ignore
        console.warn(`Letter ${char} not found in cipher map.`);
      }
    }
  }

  function pickNewPhrase() {
    let availablePhrases = allPhrases.filter(
      (p) => !completedPhraseIds.includes(p.id),
    );

    if (availablePhrases.length === 0) {
      completedPhraseIds = []; // Reset if all unique phrases were used
      availablePhrases = allPhrases;
    }
    const randomPhrase =
      availablePhrases[Math.floor(Math.random() * availablePhrases.length)];
    currentPhrase = randomPhrase;

    currentCipherMap = generateCipherKey(allTasks.letters, allTasks.colors);
    renderCipherKey(currentCipherMap);

    renderPhrase(currentPhrase.text, currentCipherMap);
    phraseHint.innerText = currentPhrase.hint
      ? `Wskazówka: ${currentPhrase.hint}`
      : "";
    cipherInput.value = "";
    cipherInput.classList.remove("correct", "incorrect");
    currentProgressSpan.innerText = completedPhraseIds.length + 1;

    checkButton.style.display = "inline-block";
    nextButton.style.display = "none";

    if (completedPhraseIds.length >= targetProgress) {
      nextButton.innerText = "Zakończ";
    } else {
      nextButton.innerText = "Dalej";
    }
  }

  checkButton.addEventListener("click", () => {
    if (cipherInput.value.toUpperCase() === currentPhrase.text.toUpperCase()) {
      cipherInput.classList.add("correct");
      cipherInput.classList.remove("incorrect");
      completedPhraseIds.push(currentPhrase.id);
      checkButton.style.display = "none";
      nextButton.style.display = "inline-block";
      showFriendlyAlert('Brawo! Hasło zostało poprawnie rozszyfrowane.', 'success');
    } else {
      cipherInput.classList.add("incorrect");
      showFriendlyAlert("To nie jest poprawne hasło. Spróbuj jeszcze raz!", 'error');
    }
  });

  nextButton.addEventListener("click", () => {
    if (completedPhraseIds.length >= targetProgress) {
      window.location.href = "index.html"; // Redirect to home on completion
    } else {
      pickNewPhrase();
    }
  });

  async function init() {
    setupHelp('Każda litera ma przypisany kolorowy kwadracik. Spójrz na kolorowe kwadraciki w dolnej części i odczytaj przypisane im litery z tabelki na górze. Wpisz odgadnięte hasło w pole tekstowe i kliknij "Sprawdź"!');
    const cipherConfig = await loadTasks();
    allTasks = cipherConfig;
    allPhrases = allTasks.phrases;
    totalProgressSpan.innerText = Math.min(allPhrases.length, targetProgress);
    if (allPhrases.length > 0) {
      pickNewPhrase();
    }
  }

  init();
});
