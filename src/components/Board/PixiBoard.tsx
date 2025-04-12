import { useEffect, useRef } from "react";
import { Assets, Sprite, } from "pixi.js";
import { Piece } from "../Piece";
import { Parchis } from "../../ts/Parchis";
import type { BoardInterface } from "./BoardInterface";
import { usePixiApp } from "../../hooks/usePixiApp";

export function PixiBoard(props: { id: string; board: BoardInterface | null; }) {
	const pixiContainer = useRef<HTMLDivElement>(null);
	const app = usePixiApp(1000, pixiContainer);

	useEffect(() => {
		if (app == null) return;
		if (props.board == null) return;

		const board = new Sprite();
		board.width = app.canvas.width;
		board.height = app.canvas.height;
		board.eventMode = 'static'; // Enables interactions like pointer/touch events
		board.on("pointerdown", (e) => {
			const x = Math.round((e.clientX - 336) / 1000 * 63);
			const y = Math.round((e.clientY - 164) / 1000 * 63);
			console.log(`Board clicked at ${x}, ${y}`);
		});
		Assets.load(props.board.backgroundURL)
			.then(texture => board.texture = texture);

		app.stage.addChild(board);

		return () => {
			app.stage.removeChild(board);
			board.destroy({ children: true });
		};
	}, [props.board, app]);

	useEffect(() => {
		if (app == null) return;
		if (props.board == null) return;

		const game = new Parchis(4); // Create a new game instance with 4 players

		for (let i = 0; i < 4; i++) {
			const Piece1 = new Piece(1, i, 1000 + (i + 1), game, props.board);
			app.stage.addChild(Piece1.spriteRef);
			game.players.get(1)!.pieces.set(i, Piece1); // Add the piece to the player


			const Piece2 = new Piece(2, i, 2000 + (i + 1), game, props.board);
			app.stage.addChild(Piece2.spriteRef);
			game.players.get(2)!.pieces.set(i, Piece2); // Add the piece to the player


			const Piece3 = new Piece(3, i, 3000 + (i + 1), game, props.board);
			app.stage.addChild(Piece3.spriteRef);
			game.players.get(3)!.pieces.set(i, Piece3); // Add the piece to the player


			const Piece4 = new Piece(4, i, 4000 + (i + 1), game, props.board);
			app.stage.addChild(Piece4.spriteRef);
			game.players.get(4)!.pieces.set(i, Piece4); // Add the piece to the player
		}
	}, [props.board, app]);


	return <div ref={pixiContainer} id={props.id} />;
};

export default PixiBoard;
