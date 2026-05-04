# Conway's Game of Life Simulator

A small FastAPI web app for exploring a 9x9 Conway's Game of Life grid.

## Features

- Click or tap cells to toggle them between dead and alive.
- Press `toggle counts` to show or hide each cell's living neighbours.
- Press `reveal next state` to apply Conway's Game of Life rules once and hide visible counts.
- Press `reset initial state` after revealing a next state to restore the grid as it was before the first reveal.
- Uses Python for grid validation, neighbour counting, and next-state logic.
- Keeps the frontend to minimal HTML, CSS, and JavaScript.

## Run Locally

Create a virtual environment and install dependencies:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Start the app:

```sh
uvicorn app.main:app --reload
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in a browser.

## Test

```sh
pytest
```

## API

`POST /api/count-neighbours`

Request body:

```json
{
  "grid": [
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false],
    [false, false, false, false, false, false, false, false, false]
  ]
}
```

The submitted grid must contain exactly 9 rows, and each row must contain exactly 9 boolean values.

`POST /api/next-state`

Accepts the same request body and returns the next 9x9 boolean grid after applying Conway's rules.
