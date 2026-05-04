import pytest

from app.game import GRID_SIZE, count_living_neighbours, reveal_next_state, validate_grid


def empty_grid() -> list[list[bool]]:
    return [[False for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]


def test_empty_grid_has_zero_neighbours() -> None:
    counts = count_living_neighbours(empty_grid())

    assert counts == [[0 for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]


def test_center_cell_counts_all_eight_neighbours() -> None:
    grid = empty_grid()
    center = 4

    for row in range(center - 1, center + 2):
        for column in range(center - 1, center + 2):
            if row != center or column != center:
                grid[row][column] = True

    counts = count_living_neighbours(grid)

    assert counts[center][center] == 8


def test_corner_cell_counts_three_possible_neighbours() -> None:
    grid = empty_grid()
    grid[0][1] = True
    grid[1][0] = True
    grid[1][1] = True

    counts = count_living_neighbours(grid)

    assert counts[0][0] == 3


def test_edge_cell_counts_five_possible_neighbours() -> None:
    grid = empty_grid()
    grid[0][3] = True
    grid[0][5] = True
    grid[1][3] = True
    grid[1][4] = True
    grid[1][5] = True

    counts = count_living_neighbours(grid)

    assert counts[0][4] == 5


def test_full_grid_counts_only_in_bounds_neighbours() -> None:
    grid = [[True for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]

    counts = count_living_neighbours(grid)

    assert counts[0][0] == 3
    assert counts[0][4] == 5
    assert counts[4][4] == 8


def test_validation_rejects_wrong_row_count() -> None:
    with pytest.raises(ValueError, match="exactly 9 rows"):
        validate_grid(empty_grid()[:-1])


def test_validation_rejects_wrong_column_count() -> None:
    grid = empty_grid()
    grid[0] = grid[0][:-1]

    with pytest.raises(ValueError, match="exactly 9 cells"):
        validate_grid(grid)


def test_validation_rejects_non_boolean_cells() -> None:
    grid = empty_grid()
    grid[0][0] = 1  # type: ignore[assignment]

    with pytest.raises(ValueError, match="must be true or false"):
        validate_grid(grid)


def test_live_cell_with_one_neighbour_dies() -> None:
    grid = empty_grid()
    grid[4][4] = True
    grid[4][5] = True

    next_grid = reveal_next_state(grid)

    assert next_grid[4][4] is False


def test_live_cell_with_two_neighbours_survives() -> None:
    grid = empty_grid()
    grid[4][4] = True
    grid[4][5] = True
    grid[5][4] = True

    next_grid = reveal_next_state(grid)

    assert next_grid[4][4] is True


def test_live_cell_with_more_than_three_neighbours_dies() -> None:
    grid = empty_grid()
    grid[4][4] = True
    grid[3][4] = True
    grid[4][3] = True
    grid[4][5] = True
    grid[5][4] = True

    next_grid = reveal_next_state(grid)

    assert next_grid[4][4] is False


def test_dead_cell_with_three_neighbours_becomes_alive() -> None:
    grid = empty_grid()
    grid[3][4] = True
    grid[4][3] = True
    grid[4][5] = True

    next_grid = reveal_next_state(grid)

    assert next_grid[4][4] is True
