import init, { Universe, Cell } from "../pkg/life_game.js";

const wasm = await init("./pkg/life_game_bg.wasm");
console.log(wasm);

const CELL_SIZE = 2;
const GRID_COLOR = "#CCCCCC";
const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const universe = Universe.new();
const width = universe.width();
const height = universe.height();

const canvas = document.getElementById("life-game");
canvas.width = (CELL_SIZE + 1) * width + 1;
canvas.height = (CELL_SIZE + 1) * height + 1;

const ctx = canvas.getContext("2d");

const drawGrid = () => {
	ctx.beginPath();
	ctx.strokeStyle = GRID_COLOR;

	//vert lines
	for (let i = 0; i < width; i++) {
		ctx.moveTo(i * (CELL_SIZE + 1) + 1, 0);
		ctx.lineTo(i * (CELL_SIZE + 1) + 1, (CELL_SIZE + 1) * height + 1);
	}

	//hori lines
	for (let i = 0; i < height; i++) {
		ctx.moveTo(0, i * (CELL_SIZE + 1) + 1);
		ctx.lineTo((CELL_SIZE + 1) * width + 1, i * (CELL_SIZE + 1) + 1);
	}
	ctx.stroke();
};

const drawCells = () => {
	const cellsPtr = universe.cells();
	const cells = new Uint8Array(wasm.memory.buffer, cellsPtr, width * height);

	ctx.beginPath();

	for (let row = 0; row < height; row++) {
		for (let col = 0; col < width; col++) {
			const idx = universe.get_index(row, col);

			ctx.fillStyle = cells[idx] === Cell.Dead ? DEAD_COLOR : ALIVE_COLOR;

			ctx.fillRect(
				col * (CELL_SIZE + 1) + 1,
				row * (CELL_SIZE + 1) + 1,
				CELL_SIZE,
				CELL_SIZE
			);
		}
	}

	ctx.stroke();
};

const renderLoop = () => {
	//canvas.textContent = universe.render();
	universe.tick();

	//drawGrid();
	drawCells();

	requestAnimationFrame(renderLoop);
};
requestAnimationFrame(renderLoop);
