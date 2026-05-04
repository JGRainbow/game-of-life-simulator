from fastapi.testclient import TestClient

from app.game import GRID_SIZE
from app.main import app

client = TestClient(app)


def empty_grid() -> list[list[bool]]:
    return [[False for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]


def test_index_page_loads() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert "Conway's Game of Life" in response.text


def test_count_neighbours_endpoint_returns_counts() -> None:
    grid = empty_grid()
    grid[0][1] = True
    grid[1][0] = True
    grid[1][1] = True

    response = client.post("/api/count-neighbours", json={"grid": grid})

    assert response.status_code == 200
    assert response.json()["counts"][0][0] == 3


def test_count_neighbours_endpoint_rejects_invalid_grid() -> None:
    grid = empty_grid()
    grid[0] = grid[0][:-1]

    response = client.post("/api/count-neighbours", json={"grid": grid})

    assert response.status_code == 400
    assert "exactly 9 cells" in response.json()["detail"]
