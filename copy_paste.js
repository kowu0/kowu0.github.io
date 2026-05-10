document.addEventListener("DOMContentLoaded", () => {
  const textToCopy = document.getElementById("text-to-copy");
  const pasteInput = document.getElementById("paste-input");
  const checkButton = document.getElementById("check-button");
  const nextButton = document.getElementById("next-button");
  const currentProgressSpan = document.getElementById("current-progress");
  const totalProgressSpan = document.getElementById("total-progress");
  const instructionText = document.getElementById("instruction-text");

  let allTasks = [];
  let currentTaskIndex = 0;
  const targetProgress = 5;

  // Get class from URL
  const urlParams = new URLSearchParams(window.location.search);
  const classNum = urlParams.get("class") || "1";

  // Funkcja tasująca tablicę (algorytm Fisher-Yates)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async function loadTasks() {
    try {
      const response = await fetch(`class${classNum}_data.json`);
      const data = await response.json();
      return data.copyPaste;
    } catch (error) {
      console.error("Error loading tasks:", error);
      return [];
    }
  }

  function renderTask() {
    const task = allTasks[currentTaskIndex];
    textToCopy.innerText = task.text;
    instructionText.innerText = task.instruction || "Skopiuj poniższy wyraz:";
    pasteInput.value = "";
    pasteInput.classList.remove("correct", "incorrect");
    currentProgressSpan.innerText = currentTaskIndex + 1;

    checkButton.style.display = "inline-block";
    nextButton.style.display = "none";

    if (currentTaskIndex + 1 >= targetProgress) {
      nextButton.innerText = "Zakończ";
    } else {
      nextButton.innerText = "Dalej";
    }
  }

  // Block typing to "force" paste
  pasteInput.addEventListener("keydown", (e) => {
    // Allow: Ctrl+V, Cmd+V, Backspace, Delete, Tab, Arrow keys
    const isPaste = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v";
    const isFunctional = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
    ].includes(e.key);

    if (!isPaste && !isFunctional) {
      e.preventDefault();
    }
  });

  checkButton.addEventListener("click", () => {
    const task = allTasks[currentTaskIndex];
    if (pasteInput.value === task.text) {
      pasteInput.classList.add("correct");
      pasteInput.classList.remove("incorrect");
      checkButton.style.display = "none";
      nextButton.style.display = "inline-block";
      showFriendlyAlert(
        "Świetnie! Skopiowałeś i wkleiłeś poprawnie.",
        "success",
      );
    } else {
      pasteInput.classList.add("incorrect");
      showFriendlyAlert(
        "To nie jest poprawnie skopiowany wyraz. Spróbuj jeszcze raz!",
        "error",
      );
    }
  });

  // Obsługa kliknięcia przycisku "Dalej" / "Zakończ"
  nextButton.addEventListener("click", () => {
    if (currentTaskIndex + 1 >= targetProgress) {
      // Zakończenie zadań - możesz tu dodać np. powrót do menu głównego
      showFriendlyAlert("Ukończyłeś wszystkie zadania!", "success");
    } else {
      currentTaskIndex++;
      renderTask();
    }
  });

  async function init() {
    setupHelp(
      'W tym zadaniu musisz skopiować tekst z górnego pola i wkleić go do dolnego pola. Aby skopiować, zaznacz tekst i użyj kombinacji klawiszy CTRL+C (Windows). Następnie kliknij w pole poniżej i użyj CTRL+V (Windows), aby wkleić. Gotowe? Kliknij "Sprawdź"!',
    );

    // Pobierz zadania i od razu je przetasuj, aby za każdym razem były w innej kolejności
    const loadedTasks = await loadTasks();
    allTasks = shuffleArray(loadedTasks);

    totalProgressSpan.innerText = Math.min(allTasks.length, targetProgress);
    if (allTasks.length > 0) {
      renderTask();
    }
  }

  init();
});
