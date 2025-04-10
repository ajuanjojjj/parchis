import { useEffect, useRef } from "react";
import { Application, Assets, Sprite, type Texture } from "pixi.js";
import { Piece } from "../Piece";
import { Parchis } from "../../ts/Parchis";
import { Board4x_SVG } from "./Board4x_SVG";

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

			setupBoard(boardTexture);
			setupPieces();
		}

		function setupBoard(boardTexture: Texture) {	//
			const board = new Sprite(boardTexture);
			board.width = app.canvas.width;
			board.height = app.canvas.height;
			board.eventMode = 'static'; // Enables interactions like pointer/touch events
			board.on("pointerdown", (e) => {
				const x = Math.round((e.clientX - 336) / 1000 * 63);
				const y = Math.round((e.clientY - 164) / 1000 * 63);
				console.log(`Board clicked at ${x}, ${y}`);
			});
			app.stage.addChild(board);
		}
		function setupPieces() {
			const game = new Parchis(4); // Create a new game instance with 4 players
			const board = new Board4x_SVG(1000); // Create a new board instance

			for (let i = 0; i < 4; i++) {
				const Piece1 = new Piece(1, i, 1000 + (i + 1), game, board);
				app.stage.addChild(Piece1.spriteRef);
				game.players.get(1)!.pieces.set(i, Piece1); // Add the piece to the player


				const Piece2 = new Piece(2, i, 2000 + (i + 1), game, board);
				app.stage.addChild(Piece2.spriteRef);
				game.players.get(2)!.pieces.set(i, Piece2); // Add the piece to the player


				const Piece3 = new Piece(3, i, 3000 + (i + 1), game, board);
				app.stage.addChild(Piece3.spriteRef);
				game.players.get(3)!.pieces.set(i, Piece3); // Add the piece to the player


				const Piece4 = new Piece(4, i, 4000 + (i + 1), game, board);
				app.stage.addChild(Piece4.spriteRef);
				game.players.get(4)!.pieces.set(i, Piece4); // Add the piece to the player
			}
		}

		// return () => {
		// 	app.destroy(true, { children: true });
		// };
	}, []);



	return <div ref={pixiContainer} id={props.id} />;
};

export default PixiBoard;
