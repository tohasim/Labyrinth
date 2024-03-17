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
	document.getElementById("generate-btn").addEventListener("click", (event) => {
		const rows = document.getElementById("row-input").value;
		const cols = document.getElementById("col-input").value;
		generateMaze(rows, cols);
	});
}

function generateMaze(rows, cols) {
	GRID_ROWS = rows;
	GRID_COLS = cols;
	// Start with a grid full of walls
	const walledCells = [];
	for (let i = 0; i < rows; i++) {
		let row = [];
		for (let j = 0; j < cols; j++) {
			let cell = {
				row: i,
				col: j,
				north: true,
				south: true,
				east: true,
				west: true,
			};
			row.push(cell);
		}
		walledCells.push(row);
	}
	const json = {
		rows: rows,
		cols: cols,
		start: { row: 0, col: 0 },
		goal: { row: 1, col: 1 },
		maze: walledCells,
	};

	const wallList = [];
	// Pick a cell
	const cell =
		walledCells[Math.floor(Math.random() * rows)][
			Math.floor(Math.random() * cols)
		];
	// Mark it as part of the maze
	cell.partOfMaze = true;
	// Add walls to the wall list
	const wallsObject = getWalls(cell);
	wallList.push(wallsObject);

	// While there are still walls in the wall list
	while (wallList.length !== 0) {
		// Pick a random wall from wall list
		const cellIndex = Math.floor(Math.random() * wallList.length);
		const wallCell = wallList[cellIndex];
		const wall = {
			cell: wallCell,
			direction:
				wallCell.walls[Math.floor(Math.random() * wallCell.walls.length)],
		};
		// If only 1 of the cells the wall divides is in the maze
		let otherWall;
		switch (wall.direction) {
			case "north":
				otherWall = walledCells[wall.cell.cell.row - 1][wall.cell.cell.col];
				break;
			case "south":
				otherWall = walledCells[wall.cell.cell.row + 1][wall.cell.cell.col];
				break;
			case "east":
				otherWall = walledCells[wall.cell.cell.row][wall.cell.cell.col + 1];
				break;
			case "west":
				otherWall = walledCells[wall.cell.cell.row][wall.cell.cell.col - 1];
				break;
		}
		let oppositeWall;
		if (otherWall.partOfMaze !== true) {
			// Make the wall a passage
			switch (wall.direction) {
				case "north":
					json.maze[wall.cell.cell.row][wall.cell.cell.col].north = false;
					json.maze[otherWall.row][otherWall.col].south = false;
					oppositeWall = "south";
					break;
				case "south":
					json.maze[wall.cell.cell.row][wall.cell.cell.col].south = false;
					json.maze[otherWall.row][otherWall.col].north = false;
					oppositeWall = "north";
					break;
				case "east":
					json.maze[wall.cell.cell.row][wall.cell.cell.col].east = false;
					json.maze[otherWall.row][otherWall.col].west = false;
					oppositeWall = "west";
					break;
				case "west":
					json.maze[wall.cell.cell.row][wall.cell.cell.col].west = false;
					json.maze[otherWall.row][otherWall.col].east = false;
					oppositeWall = "east";
					break;
			}
			// Add neighbor walls of the cell to wall list
			const neighborWalls = getWalls(otherWall);
			neighborWalls.walls = neighborWalls.walls.filter(
				(tempWall) => tempWall !== oppositeWall
			);
			if (neighborWalls.cell.partOfMaze !== true) wallList.push(neighborWalls);
			// Mark other cell as part of maze
			otherWall.partOfMaze = true;
		}
		// Remove wall from list
		const directionIndex = wallList[cellIndex].walls.indexOf(wall.direction);
		wallList[cellIndex].walls.splice(directionIndex, 1);
		if (wallList[cellIndex].walls.length === 0) wallList.splice(cellIndex, 1);
	}
	do {
		json.goal = {
			row: Math.floor(Math.random() * GRID_ROWS),
			col: Math.floor(Math.random() * GRID_COLS),
		};
		json.start = {
			row: Math.floor(Math.random() * GRID_ROWS),
			col: Math.floor(Math.random() * GRID_COLS),
		};
	} while (
		json.goal.row === json.start.row &&
		json.goal.col === json.start.col
	);
	buildMaze(json);
}

function checkCellInWallList(cell, wallList) {
	for (let i = 0; i < wallList.length; i++) {
		if (wallList[i].cell.row === cell.row && wallList[i].cell.col === cell.col)
			return true;
	}
	return false;
}

function getWalls(cell) {
	let walls = ["north", "south", "east", "west"];
	if (cell.col === 0) walls = walls.filter((wall) => wall !== "west");
	if (cell.col === GRID_COLS - 1)
		walls = walls.filter((wall) => wall !== "east");
	if (cell.row === 0) walls = walls.filter((wall) => wall !== "north");
	if (cell.row === GRID_ROWS - 1)
		walls = walls.filter((wall) => wall !== "south");
	return { cell: cell, walls: walls };
}

async function buildMaze(maze) {
	console.log(maze);
	// Setup model
	setupModel(maze);

	// Setup view
	showView();
}

// #endregion

// #region VIEW
function showView() {
	const container = document.getElementById("container");
	container.innerHTML = "";
	container.classList.add("north");
	container.classList.add("south");
	container.classList.add("east");
	container.classList.add("west");
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
	model = maze.maze;
	start = model[maze.start.row][maze.start.col];
	goal = model[maze.goal.row][maze.goal.col];
}

// #endregion
