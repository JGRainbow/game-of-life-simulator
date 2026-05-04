from typing import Annotated

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

from app.game import CountGrid, count_living_neighbours

app = FastAPI(title="Conway's Game of Life")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")


class CountNeighboursRequest(BaseModel):
    grid: Annotated[list[list[bool]], Field(min_length=9, max_length=9)]


class CountNeighboursResponse(BaseModel):
    counts: CountGrid


@app.get("/", response_class=HTMLResponse)
def index(request: Request) -> HTMLResponse:
    return templates.TemplateResponse(request, "index.html")


@app.post("/api/count-neighbours", response_model=CountNeighboursResponse)
def count_neighbours(payload: CountNeighboursRequest) -> CountNeighboursResponse:
    try:
        counts = count_living_neighbours(payload.grid)
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error

    return CountNeighboursResponse(counts=counts)
