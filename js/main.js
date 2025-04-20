import init, { Universe, Cell } from "../pkg/life_game.js";

const wasm = await init("./pkg/life_game_bg.wasm");

let animationId = null;
const CELL_SIZE = 2;

const DEAD_COLOR = "#FFFFFF";
const ALIVE_COLOR = "#000000";

const universe = Universe.new();
const width = universe.width();
const height = universe.height();

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

const bitIsSet = (n, arr) => {
	const byte = Math.floor(n / 8);
	const mask = 1 << n % 8;
	return (arr[byte] & mask) === mask;
};

const drawCells = () => {
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

			ctx.fillStyle = bitIsSet(idx, cells) ? ALIVE_COLOR : DEAD_COLOR;

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
