// // * Initial variables assignments, names are self-explanatory
// const colorInput = document.getElementById("colorPicker");
// const selectTable = document.getElementById("pixelCanvas");
// const formInput = document.getElementById("sizePicker");
// const heightInput = document.getElementById("inputHeight");
// const widthInput = document.getElementById("inputWidth");

// /*
// * @description collects form input information, passes it to functions to create table and assign color
// * @param {event} e
// */
// formInput.addEventListener("submit", function (e) {
//     selectTable.innerHTML = "";
//     e.preventDefault();
//     // let heightInput = document.getElementById("inputHeight");
//     // let widthInput = document.getElementById("inputWeight");
//     makeGrid(heightInput, widthInput);
//     addColor(colorInput);
// });

// /*
// * @description creates table
// * @param {number} height
// * @param {number} width
// */
// function makeGrid(height, width) {
//     for (let i = 0; i < heightInput.value; i++) {
//         const row = selectTable.insertRow();
//         for (let n = 0; n < widthInput.value; n++) {
//             const cell = row.insertCell();
//         }
//     }
// }

// /*
// * @description colours cells, adding event listeners for "mousedown", "mousemove" and "mouseup"
// * @param {value} color
// */
// function addColor(color) {
//     const allCells = document.querySelectorAll("td");
//     let isDrawing = false;
//     for (let i = 0; i < allCells.length; i++) {
//         allCells[i].addEventListener("mousedown", function (e) {
//             isDrawing = true;
//             e.target.style.backgroundColor = colorInput.value;
//         });

//         allCells[i].addEventListener("mousemove", function (e) {
//             if (isDrawing === true) {
//                 e.target.style.backgroundColor = colorInput.value;
//             }
//         });

//         allCells[i].addEventListener("mouseup", function (e) {
//             if (isDrawing === true) {
//                 isDrawing = false;
//             }
//         })
//     }
// };// * Initial variables assignments, names are self-explanatory
// --- ZMIENNE GLOBALNE ---
const colorInput = document.getElementById("colorPicker");
const selectTable = document.getElementById("pixelCanvas");
const formInput = document.getElementById("sizePicker");
const sizeInput = document.getElementById("gridSize"); // Pobiera wartość z <select>
const eraserBtn = document.getElementById("eraserBtn");

let isErasing = false; // Śledzi, czy gumka jest włączona
let isDrawing = false; // Śledzi, czy przycisk myszy jest wciśnięty

// --- OBSŁUGA GUMKI ---
eraserBtn.addEventListener("click", function () {
  isErasing = !isErasing; // Przełącza stan (prawda/fałsz)

  // Wizualna aktualizacja przycisku
  if (isErasing) {
    eraserBtn.textContent = "Gumka (Wł)";
    eraserBtn.style.backgroundColor = "#e74c3c"; // Czerwony kolor informujący o aktywnej gumce
  } else {
    eraserBtn.textContent = "Gumka (Wył)";
    eraserBtn.style.backgroundColor = ""; // Powrót do domyślnego stylu
  }
});

// --- OBSŁUGA FORMULARZA ---
/*
 * Pobiera informacje z formularza, czyści starą siatkę i wywołuje funkcje budujące nową
 */
formInput.addEventListener("submit", function (e) {
  e.preventDefault(); // Zapobiega przeładowaniu strony
  selectTable.innerHTML = ""; // Czyści obecną tabelę
  makeGrid();
  addColor();
});

// --- TWORZENIE SIATKI ---
/*
 * Tworzy kwadratową tabelę na podstawie wybranego rozmiaru (32, 64 lub 100)
 */
function makeGrid() {
  const size = sizeInput.value;

  for (let i = 0; i < size; i++) {
    const row = selectTable.insertRow();
    for (let n = 0; n < size; n++) {
      const cell = row.insertCell(); // insertCell domyślnie tworzy <td>
    }
  }
}

// --- FUNKCJA POMOCNICZA DO MALOWANIA ---
/*
 * Sprawdza stan gumki i nadaje kolor lub go usuwa
 */
function applyColor(cell) {
  if (isErasing) {
    cell.style.backgroundColor = ""; // Usuwa kolor (przezroczystość)
  } else {
    cell.style.backgroundColor = colorInput.value; // Nadaje kolor z colorPickera
  }
}

// --- DODAWANIE ZDARZEŃ DO KOMÓREK ---
/*
 * Podpina nasłuchiwacze zdarzeń do wszystkich komórek w tabeli
 */
function addColor() {
  const allCells = document.querySelectorAll("td");

  for (let i = 0; i < allCells.length; i++) {
    // Kiedy użytkownik wciska przycisk myszy na komórce
    allCells[i].addEventListener("mousedown", function (e) {
      isDrawing = true;
      applyColor(e.target);
    });

    // Kiedy użytkownik najeżdża na komórkę (i trzyma wciśnięty przycisk)
    allCells[i].addEventListener("mouseover", function (e) {
      if (isDrawing === true) {
        applyColor(e.target);
      }
    });
  }
}

// --- GLOBALNE ZATRZYMANIE RYSOWANIA ---
// Gwarantuje, że rysowanie zostanie przerwane, nawet jeśli użytkownik puści
// przycisk myszy będąc kursorem poza obszarem siatki
document.addEventListener("mouseup", function () {
  isDrawing = false;
});
