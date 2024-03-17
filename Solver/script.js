"use strict";

window.addEventListener("load", initialize);
let GRID_COLS = 0;
let GRID_ROWS = 0;
let start;
let goal;
const route = [];
const finalRoute = [];

// #region CONTROLLER

async function initialize() {
	await buildMaze();
	document.getElementById("findRouteBtn").addEventListener("click", (event) => {
		if (visitCell(start)) {
			showRoute();
		}
	});
}

async function buildMaze() {
	// Load JSON file
	const maze = await fetch("./maze.json")
		.then((response) => response.json())
		.catch((error) => {
			console.error("Error:", error);
		});
	// Setup model
	setupModel(maze);

	// Setup view
	showView();
}

function visitCell(cell) {
	// mark cell as visited and add it to route
	cell.visited = true;
	route.push(cell);
	finalRoute.push(cell);
	// if goal found return cell
	if (cell.row === goal.row && cell.col === goal.col) {
		return cell;
	}
	// get available neighbors
	const neighbors = getNeighors(cell);
	while (neighbors.length !== 0) {
		const foundCell = visitCell(neighbors[neighbors.length - 1]);
		if (foundCell === false) {
			finalRoute.pop();
			neighbors.pop();
		} else {
			return foundCell;
		}
	}
	return false;
}

function getNeighors(cell) {
	const neighbors = [];
	if (!cell.north) {
		const neighbor = model[cell.row - 1][cell.col];
		if (!neighbor.visited) {
			neighbors.push(neighbor);
		}
	}
	if (!cell.south) {
		const neighbor = model[cell.row + 1][cell.col];
		if (!neighbor.visited) {
			neighbors.push(neighbor);
		}
	}
	if (!cell.east) {
		const neighbor = model[cell.row][cell.col + 1];
		if (!neighbor.visited) {
			neighbors.push(neighbor);
		}
	}
	if (!cell.west) {
		const neighbor = model[cell.row][cell.col - 1];
		if (!neighbor.visited) {
			neighbors.push(neighbor);
		}
	}
	return neighbors;
}

// #endregion

// #region VIEW
function showView() {
	const container = document.getElementById("container");
	container.style.setProperty("--GRID_COLS", GRID_COLS);
	for (let i = 0; i < GRID_ROWS; i++) {
		for (let j = 0; j < GRID_COLS; j++) {
			// add cell elements with correct walls for each of the cells in the model
			const cell = document.createElement("div");
			cell.classList.add("cell");
			if (model[i][j].north) {
				cell.classList.add("north");
			}
			if (model[i][j].south) {
				cell.classList.add("south");
			}
			if (model[i][j].east) {
				cell.classList.add("east");
			}
			if (model[i][j].west) {
				cell.classList.add("west");
			}
			if (i === start.row && j === start.col) {
				cell.id = "start";
			}
			if (i === goal.row && j === goal.col) {
				cell.id = "goal";
			}
			container.appendChild(cell);
		}
	}
}

function showRoute() {
	const cells = document.querySelectorAll(".cell");
	for (let i = 0; i < route.length; i++) {
		// create cell element
		const cell = cells[GRID_COLS * route[i].row + route[i].col];
		const element = document.createElement("div");
		if (finalRoute.includes(route[i])) {
			element.classList.add("finalRoute");
		} else element.classList.add("route");
		cell.appendChild(element);
	}
}
// #endregion

// #region MODEL
let model = [];

function setupModel(maze) {
	GRID_ROWS = maze.rows;
	GRID_COLS = maze.cols;
	model = maze.maze;
	start = model[maze.start.row][maze.start.col];
	goal = model[maze.goal.row][maze.goal.col];
}

// #endregion
