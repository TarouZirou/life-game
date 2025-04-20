import init, { Universe } from "../pkg/life_game.js";
await init();
const pre = document.getElementById("life-game");
const universe = Universe.new();
const renderLoop = () => {
	pre.textContent = universe.render();
	universe.tick();

	requestAnimationFrame(renderLoop);
};
requestAnimationFrame(renderLoop);
