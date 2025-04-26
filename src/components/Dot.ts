import { Assets, Sprite, } from "pixi.js";

export class Dot {
	public sprite: Sprite;
	constructor(x: number, y: number) {
		const sprite = new Sprite();
		sprite.x = convert(x);
		sprite.y = convert(y);
		sprite.width = 10;
		sprite.height = 10;
		sprite.anchor.set(0);
		sprite.interactive = true; // Enable interaction
		Assets.load(import.meta.env.BASE_URL + `assets/dot.svg`).then(texture => sprite.texture = texture); // Load the texture from the assets folder
		this.sprite = sprite;
		sprite.on("click", () => {
			console.log(`Dot clicked at ${x}, ${y}`);
		});
	}
}
const convert = (val: number) => (1000 / 63) * val;