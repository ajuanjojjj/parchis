import { Application, Assets } from "pixi.js";
import { useState, useEffect } from "react";

export function usePixiApp(size: number) {
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

			const base = import.meta.env.BASE_URL + "assets/";
			await Assets.load([
				base + "board.svg",
				base + "piece_red.svg",
				base + "piece_blue.svg",
				base + "piece_green.svg",
				base + "piece_yellow.svg",
			]);


			if (!killed) {

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
	}, [size]);

	return app;
}