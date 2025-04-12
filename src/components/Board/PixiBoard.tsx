import { useEffect, useRef } from "react";
import { Assets, Sprite } from "pixi.js";
import { usePixiApp } from "../../hooks/usePixiApp";
import type { BoardInterface } from "./BoardInterface";
import type { PlayerInterface } from "../../ts/Parchis";

export function PixiBoard(props: { id: string; board: BoardInterface | null; setPlayers: (newPlayers: PlayerInterface[]) => void; }) {
	const pixiContainer = useRef<HTMLDivElement>(null);
	const app = usePixiApp(1000, pixiContainer);

	useEffect(() => {
		if (app == null) return;
		if (props.board == null) return;
		const boardImage = props.board.backgroundURL;

		const boardSprite = new Sprite();
		boardSprite.width = app.canvas.width;
		boardSprite.height = app.canvas.height;
		boardSprite.eventMode = 'static'; // Enables interactions like pointer/touch events
		boardSprite.on("pointerdown", (e) => {
			const x = Math.round((e.clientX - 336) / 1000 * 63);
			const y = Math.round((e.clientY - 164) / 1000 * 63);
			console.log(`Board clicked at ${x}, ${y}`);
		});
		Assets.load(boardImage)
			.then(texture => boardSprite.texture = texture);

		app.stage.addChild(boardSprite);

		return () => {
			app.stage.removeChild(boardSprite);
			boardSprite.destroy({ children: true });
		};
	}, [props.board, app]);

	return <div ref={pixiContainer} id={props.id} />;
};


// const game = new Parchis(board);