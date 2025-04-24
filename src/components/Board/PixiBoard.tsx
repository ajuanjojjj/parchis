import { useEffect, useRef } from "react";
import { Assets, Sprite, type Application } from "pixi.js";
import type { BoardInterface } from "./BoardInterface";

export function PixiBoard(props: { id: string; board: BoardInterface; app: Application | null; }) {
	const pixiContainer = useRef<HTMLDivElement>(null);
	const { board, app } = props;

	useEffect(() => {
		if (pixiContainer.current == null) return;
		if (app == null) return;

		pixiContainer.current.innerHTML = ""; // Clear previous content
		pixiContainer.current.appendChild(app.canvas);
	}, [pixiContainer, app]);

	useEffect(() => {
		if (app == null) return;
		if (board == null) return;
		const boardImage = board.backgroundURL;

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
	}, [board, app]);

	return <div ref={pixiContainer} id={props.id} />;
};