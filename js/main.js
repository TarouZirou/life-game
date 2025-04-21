import init, { Universe, Cell } from "../pkg/life_game.js";

const wasm = await init("./pkg/life_game_bg.wasm");

let animationId = null;
const CELL_SIZE = 2;

const DEAD_COLOR = "#000000";
const ALIVE_COLOR = "#00FF00";

const universe = Universe.new();
let width = universe.width();
let height = universe.height();

const canvas = document.getElementById("life-game");
canvas.width = CELL_SIZE * width;
canvas.height = CELL_SIZE * height;

const ctx = canvas.getContext("2d");

const isPaused = () => animationId === null;

const playPauseButton = document.getElementById("play-pause");
const play = () => {
	playPauseButton.textContent = "⏸";
	renderLoop();
};

const pause = () => {
	playPauseButton.textContent = "▶";
	cancelAnimationFrame(animationId);
	animationId = null;
};

playPauseButton.addEventListener("click", (e) => {
	if (isPaused()) {
		play();
	} else {
		pause();
	}
});

const widthRange = document.getElementById("width-value");
widthRange.addEventListener("input", (e) => {
	width = Math.floor(e.target.value);
	universe.set_width(width);
	canvas.width = CELL_SIZE * width;
});

const heightRange = document.getElementById("height-value");
heightRange.addEventListener("input", (e) => {
	height = Math.floor(e.target.value);
	universe.set_height(height);
	canvas.height = CELL_SIZE * height;
});

canvas.addEventListener("mousedown", (e) => {
	const boundingRect = canvas.getBoundingClientRect();

	const scaleX = canvas.width / boundingRect.width;
	const scaleY = canvas.height / boundingRect.height;

	const canvasLeft = (e.clientX - boundingRect.left) * scaleX;
	const canvasTop = (e.clientY - boundingRect.top) * scaleY;

	const row = Math.min(Math.floor(canvasTop / CELL_SIZE), height - 1);
	const col = Math.min(Math.floor(canvasLeft / CELL_SIZE), width - 1);

	universe.toggle_cell(row, col);

	drawCells();
});

const bitIsSet = (n, arr) => {
	const byte = Math.floor(n / 8);
	const mask = 1 << n % 8;
	return (arr[byte] & mask) === mask;
};

const drawCells = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = DEAD_COLOR;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const cellsPtr = universe.cells();
	const cells = new Uint8Array(
		wasm.memory.buffer,
		cellsPtr,
		(width * height) / 8
	);

	ctx.beginPath();

	for (let row = 0; row < height; row++) {
		for (let col = 0; col < width; col++) {
			const idx = universe.get_index(row, col);
			if (!bitIsSet(idx, cells)) {
				continue;
			}
			ctx.fillStyle = ALIVE_COLOR;

			ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
		}
	}

	ctx.stroke();
};

const renderLoop = () => {
	//canvas.textContent = universe.render();
	universe.tick();

	drawCells();

	animationId = requestAnimationFrame(renderLoop);
};

play();
