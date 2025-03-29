import { useEffect, useRef } from "react";
import { Application, Assets, Sprite, type Texture } from "pixi.js";
import { Piece } from "./Piece";

export function PixiBoard(props: { id: string; }) {
	const pixiContainer = useRef<HTMLDivElement>(null);
	const appRef = useRef<Application | null>(null);

	useEffect(() => {
		const app = new Application();
		app.init({
			width: 1000,
			height: 1000,
			backgroundColor: 0xf4a261,
		}).then(() => {
			loadAssets();
			appRef.current = app;
			if (pixiContainer.current != null) {
				pixiContainer.current.innerHTML = ""; // Clear previous content
				pixiContainer.current.appendChild(app.canvas);
			}
		});

		async function loadAssets() {
			const boardTexture = await Assets.load<Texture>("/assets/board.svg");
			await Assets.load([
				"/assets/piece_red.svg",
				"/assets/piece_blue.svg",
				"/assets/piece_green.svg",
				"/assets/piece_yellow.svg",
			]);

			setup(boardTexture);
		}

		function setup(boardTexture: Texture) {
			const board = new Sprite(boardTexture);
			board.width = app.canvas.width;
			board.height = app.canvas.height;
			board.eventMode = 'static'; // Enables interactions like pointer/touch events
			board.on("pointerdown", (e) => {
				console.log(`Board clicked at ${e.clientX}, ${e.clientY}`);
			});
			app.stage.addChild(board);

			for (let i = 0; i < 4; i++) {
				app.stage.addChild(new Piece("red", i).sprite);
				app.stage.addChild(new Piece("blue", i).sprite);
				app.stage.addChild(new Piece("green", i).sprite);
				app.stage.addChild(new Piece("yellow", i).sprite);
			}

			// for (const [x, y] of [...tubos.green,]) {
			// 	app.stage.addChild(new Dot(x, y).sprite);
			// }
		}


		// return () => {
		// 	app.destroy(true, { children: true });
		// };
	}, []);



	return <div ref={pixiContainer} id={props.id} />;
};

export default PixiBoard;
