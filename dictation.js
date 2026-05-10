document.addEventListener("DOMContentLoaded", () => {
  const storyDisplay = document.getElementById("dictation-story-display");
  const inputArea = document.getElementById("dictation-input-area");
  const checkButton = document.getElementById("check-button");
  const nextButton = document.getElementById("next-button");
  const currentProgressSpan = document.getElementById("current-progress");
  const totalProgressSpan = document.getElementById("total-progress");
  const taskTitle = document.getElementById("task-title");

  let allTasks = [];
  let currentTask = null;
  let completedTaskIds = [];
  const targetProgress = 5;

  const urlParams = new URLSearchParams(window.location.search);
  const classNum = urlParams.get("class") || "1";

  async function loadTasks() {
    try {
      const response = await fetch(`class${classNum}_data.json`);
      const data = await response.json();
      return data.dictation;
    } catch (error) {
      console.error("Error loading dictation tasks:", error);
      return [];
    }
  }

  function renderTask(task) {
    currentTask = task;
    taskTitle.innerText = `Dyktando - ${task.title}`;
    storyDisplay.innerHTML = `<p>${task.text}</p>`;
    inputArea.innerHTML = ""; // Clear previous inputs
    currentProgressSpan.innerText = completedTaskIds.length + 1;

    const characters = task.text.split("");
    characters.forEach((char, index) => {
      const charInput = document.createElement("input");
      charInput.type = "text";
      charInput.maxLength = 1;
      charInput.className = "char-input";
      charInput.dataset.index = index;

      if (char === " ") {
        charInput.readOnly = true;
        charInput.value = " ";
        charInput.classList.add("space-input");
      } else if (/[.,!?;:]/.test(char)) {
        // Punctuation
        charInput.readOnly = true;
        charInput.value = char;
        charInput.classList.add("punctuation-input");
      }

      charInput.addEventListener("input", (e) => {
        if (e.target.value.length === 1) {
          const nextInput = inputArea.querySelector(
            `[data-index="${parseInt(e.target.dataset.index) + 1}"]`,
          );
          if (nextInput) {
            nextInput.focus();
          }
        }
      });

      charInput.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && e.target.value === "") {
          const prevInput = inputArea.querySelector(
            `[data-index="${parseInt(e.target.dataset.index) - 1}"]`,
          );
          if (prevInput) {
            prevInput.focus();
          }
        }
        if (e.key === " " && e.target.readOnly) {
          e.preventDefault(); // Zatrzymuje domyślne zachowanie (np. przewijanie strony w dół)

          const nextInput = inputArea.querySelector(
            `[data-index="${parseInt(e.target.dataset.index) + 1}"]`,
          );
          if (nextInput) {
            nextInput.focus();
          }
        }
      });

      inputArea.appendChild(charInput);
    });

    checkButton.style.display = "inline-block";
    nextButton.style.display = "none";

    if (completedTaskIds.length >= targetProgress) {
      nextButton.innerText = "Zakończ";
    } else {
      nextButton.innerText = "Dalej";
    }
  }

  function checkAnswer() {
    let allCorrect = true;
    const characters = currentTask.text.split("");
    const inputElements = inputArea.querySelectorAll(".char-input");

    inputElements.forEach((inputEl, index) => {
      inputEl.classList.remove("correct", "incorrect");
      const expectedChar = characters[index];
      const enteredChar = inputEl.value;

      if (enteredChar.toLowerCase() === expectedChar.toLowerCase()) {
        inputEl.classList.add("correct");
      } else {
        inputEl.classList.add("incorrect");
        allCorrect = false;
      }
    });

    if (allCorrect) {
      completedTaskIds.push(currentTask.id);
      checkButton.style.display = "none";
      nextButton.style.display = "inline-block";
      showFriendlyAlert("Świetnie! Przepisałeś tekst bezbłędnie!", "success");
    } else {
      showFriendlyAlert(
        "Ojej, są błędy! Sprawdź podświetlone literki i spróbuj ponownie.",
        "error",
      );
    }
  }

  function pickNewTask() {
    let availableTasks = allTasks.filter(
      (t) => !completedTaskIds.includes(t.id),
    );

    if (availableTasks.length === 0) {
      completedTaskIds = []; // Reset if all unique tasks were used
      availableTasks = allTasks;
    }
    const randomTask =
      availableTasks[Math.floor(Math.random() * availableTasks.length)];
    renderTask(randomTask);
  }

  checkButton.addEventListener("click", checkAnswer);

  nextButton.addEventListener("click", () => {
    if (completedTaskIds.length >= targetProgress) {
      window.location.href = "index.html";
    } else {
      pickNewTask();
    }
  });

  async function init() {
    setupHelp(
      'W tym zadaniu Twoim celem jest przepisanie tekstu z góry, literka po literce, w puste kwadraciki. Klikaj w kwadraciki i wpisuj odpowiednie znaki. Znaki interpunkcyjne są już uzupełnione. Kiedy skończysz, kliknij "Sprawdź"!',
    );
    const tasksConfig = await loadTasks();
    allTasks = tasksConfig;
    totalProgressSpan.innerText = Math.min(allTasks.length, targetProgress);
    if (allTasks.length > 0) {
      pickNewTask();
    }
  }

  init();
});
