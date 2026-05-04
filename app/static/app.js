const gridSize = 9;
const gridElement = document.querySelector("#grid");
const countButton = document.querySelector("#count-neighbours");
const clearButton = document.querySelector("#clear-grid");
const statusElement = document.querySelector("#status");

const gridState = Array.from({ length: gridSize }, () =>
  Array.from({ length: gridSize }, () => false)
);
let countsVisible = false;

function setStatus(message) {
  statusElement.textContent = message;
}

function renderCell(cell, row, column) {
  const isAlive = gridState[row][column];

  cell.classList.toggle("alive", isAlive);
  cell.setAttribute("aria-pressed", String(isAlive));
  cell.textContent = countsVisible ? cell.dataset.count || "" : "";
}

function updateCountButton() {
  countButton.setAttribute("aria-pressed", String(countsVisible));
}

function createGrid() {
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.row = String(row);
      cell.dataset.column = String(column);
      cell.setAttribute("aria-label", `Row ${row + 1}, column ${column + 1}`);

      cell.addEventListener("click", () => {
        gridState[row][column] = !gridState[row][column];
        cell.dataset.count = "";
        renderCell(cell, row, column);

        if (countsVisible) {
          countNeighbours();
        } else {
          setStatus("");
        }
      });

      renderCell(cell, row, column);
      gridElement.appendChild(cell);
    }
  }
}

function renderCounts(counts) {
  document.querySelectorAll(".cell").forEach((cell) => {
    const row = Number(cell.dataset.row);
    const column = Number(cell.dataset.column);

    cell.dataset.count = String(counts[row][column]);
    renderCell(cell, row, column);
  });
}

async function countNeighbours() {
  setStatus("Counting neighbours...");

  try {
    const response = await fetch("/api/count-neighbours", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grid: gridState }),
    });

    if (!response.ok) {
      throw new Error("The server could not count this grid.");
    }

    const result = await response.json();
    renderCounts(result.counts);
    setStatus("Neighbour counts updated.");
  } catch (error) {
    setStatus(error.message);
  }
}

function hideCounts() {
  countsVisible = false;
  updateCountButton();

  document.querySelectorAll(".cell").forEach((cell) => {
    renderCell(cell, Number(cell.dataset.row), Number(cell.dataset.column));
  });
  setStatus("Neighbour counts hidden.");
}

async function toggleCounts() {
  if (countsVisible) {
    hideCounts();
    return;
  }

  countsVisible = true;
  updateCountButton();
  await countNeighbours();
}

function clearGrid() {
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      gridState[row][column] = false;
    }
  }

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.dataset.count = "";
    renderCell(cell, Number(cell.dataset.row), Number(cell.dataset.column));
  });
  countsVisible = false;
  updateCountButton();
  setStatus("Grid cleared.");
}

countButton.addEventListener("click", toggleCounts);
clearButton.addEventListener("click", clearGrid);

createGrid();
updateCountButton();
