from typing import Sequence

GRID_SIZE = 9

Grid = list[list[bool]]
CountGrid = list[list[int]]


def validate_grid(grid: Sequence[Sequence[bool]]) -> Grid:
    """Return a normalized 9x9 boolean grid or raise ValueError."""
    if len(grid) != GRID_SIZE:
        raise ValueError(f"Grid must contain exactly {GRID_SIZE} rows.")

    normalized_grid: Grid = []
    for row_index, row in enumerate(grid):
        if len(row) != GRID_SIZE:
            raise ValueError(
                f"Row {row_index} must contain exactly {GRID_SIZE} cells."
            )

        normalized_row: list[bool] = []
        for column_index, cell in enumerate(row):
            if not isinstance(cell, bool):
                raise ValueError(
                    f"Cell ({row_index}, {column_index}) must be true or false."
                )
            normalized_row.append(cell)

        normalized_grid.append(normalized_row)

    return normalized_grid


def count_living_neighbours(grid: Sequence[Sequence[bool]]) -> CountGrid:
    validated_grid = validate_grid(grid)
    counts: CountGrid = []

    for row_index in range(GRID_SIZE):
        count_row: list[int] = []

        for column_index in range(GRID_SIZE):
            living_neighbours = 0

            for row_delta in (-1, 0, 1):
                for column_delta in (-1, 0, 1):
                    if row_delta == 0 and column_delta == 0:
                        continue

                    neighbour_row = row_index + row_delta
                    neighbour_column = column_index + column_delta

                    if (
                        0 <= neighbour_row < GRID_SIZE
                        and 0 <= neighbour_column < GRID_SIZE
                        and validated_grid[neighbour_row][neighbour_column]
                    ):
                        living_neighbours += 1

            count_row.append(living_neighbours)

        counts.append(count_row)

    return counts


def reveal_next_state(grid: Sequence[Sequence[bool]]) -> Grid:
    validated_grid = validate_grid(grid)
    neighbour_counts = count_living_neighbours(validated_grid)
    next_grid: Grid = []

    for row_index in range(GRID_SIZE):
        next_row: list[bool] = []

        for column_index in range(GRID_SIZE):
            is_alive = validated_grid[row_index][column_index]
            living_neighbours = neighbour_counts[row_index][column_index]

            next_row.append(
                living_neighbours == 3 or (is_alive and living_neighbours == 2)
            )

        next_grid.append(next_row)

    return next_grid
