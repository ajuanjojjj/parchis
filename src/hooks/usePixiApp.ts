import { Application, Assets } from "pixi.js";
import { useState, useEffect } from "react";

export function usePixiApp(size: number, pixiContainer: React.RefObject<HTMLDivElement | null>) {
	const [app, setApp] = useState<Application | null>(null);

	useEffect(() => {
		let pixiApp: Application;
		let killed = false;
		let initialized = false;

		const init = async () => {
			// Create and init your app
			pixiApp = new Application();

			await pixiApp.init({
				width: size,
				height: size,
				backgroundColor: 0xf4a261,
			});

			await Assets.load([
				"/assets/board.svg",
				"/assets/piece_red.svg",
				"/assets/piece_blue.svg",
				"/assets/piece_green.svg",
				"/assets/piece_yellow.svg",
			]);


			if (pixiContainer.current && !killed) {
				pixiContainer.current.innerHTML = ""; // Clear previous content
				pixiContainer.current.appendChild(pixiApp.canvas);

				setApp(pixiApp);
				initialized = true;
			}
		};

		const initPromise = init();

		return () => {
			killed = true;

			if (pixiApp) {
				initPromise.then(() => {
					pixiApp.destroy(true, {
						children: true,
						texture: true,
					});
				});
			}

			if (initialized)
				setApp(null);

			console.log(`PixiApp destroyed. Was initialized: ${initialized}. Was killed early: ${killed}`);

		};
	}, [pixiContainer, size]);

	return app;
}