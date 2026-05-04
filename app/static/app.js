const gridSize = 9;
const gridElement = document.querySelector("#grid");
const countButton = document.querySelector("#count-neighbours");
const nextStateButton = document.querySelector("#reveal-next-state");
const resetButton = document.querySelector("#reset-initial-state");
const clearButton = document.querySelector("#clear-grid");
const statusElement = document.querySelector("#status");

const gridState = Array.from({ length: gridSize }, () =>
  Array.from({ length: gridSize }, () => false)
);
let countsVisible = false;
let initialGridState = null;

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

function copyGridState() {
  return gridState.map((row) => [...row]);
}

function updateResetButton() {
  resetButton.disabled = initialGridState === null;
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

function renderGrid() {
  document.querySelectorAll(".cell").forEach((cell) => {
    renderCell(cell, Number(cell.dataset.row), Number(cell.dataset.column));
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

function replaceGridState(nextGrid) {
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      gridState[row][column] = nextGrid[row][column];
    }
  }
}

async function revealNextState() {
  setStatus("Revealing next state...");

  if (initialGridState === null) {
    initialGridState = copyGridState();
    updateResetButton();
  }

  if (countsVisible) {
    hideCounts("");
  }

  try {
    const response = await fetch("/api/next-state", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grid: gridState }),
    });

    if (!response.ok) {
      throw new Error("The server could not reveal the next state.");
    }

    const result = await response.json();
    replaceGridState(result.grid);
    renderGrid();

    setStatus("Next state revealed.");
  } catch (error) {
    setStatus(error.message);
  }
}

function hideCounts(statusMessage = "Neighbour counts hidden.") {
  countsVisible = false;
  updateCountButton();

  document.querySelectorAll(".cell").forEach((cell) => {
    renderCell(cell, Number(cell.dataset.row), Number(cell.dataset.column));
  });

  if (statusMessage) {
    setStatus(statusMessage);
  }
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

function resetInitialState() {
  if (initialGridState === null) {
    return;
  }

  replaceGridState(initialGridState);
  initialGridState = null;
  countsVisible = false;
  updateCountButton();
  updateResetButton();
  renderGrid();
  setStatus("Initial state restored.");
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
  initialGridState = null;
  updateCountButton();
  updateResetButton();
  setStatus("Grid cleared.");
}

countButton.addEventListener("click", toggleCounts);
clearButton.addEventListener("click", clearGrid);
nextStateButton.addEventListener("click", revealNextState);
resetButton.addEventListener("click", resetInitialState);

createGrid();
updateCountButton();
updateResetButton();
