import { Assets, Sprite, type FederatedPointerEvent, type Texture } from "pixi.js";
import { gsap } from "gsap"; // To animate the movement
import { actuallyPositions } from "./positions";

// Positions 1-1000 are places on the board
// Positions 1001-1100 are the "Home" positions for player 1
// Positions 1101-1500 are the "End Column" positions for player 1
// Position 1501 is the "End" position for player 1
// Positions 2001-2100 are the "Home" positions for player 2, etc

export class Piece {
	public sprite: Sprite;
	private dragging: boolean = false;
	private clickedAt = 0;
	private position = 0;

	constructor(color: "red" | "blue" | "green" | "yellow", position: number) {
		const sprite = new Sprite();
		sprite.x = positions[position - 1].x;
		sprite.y = positions[position - 1].y;
		sprite.width = 50;
		sprite.height = 50;
		sprite.anchor.set(0.5);
		sprite.eventMode = 'static'; // Enables interactions like pointer/touch events
		sprite.cursor = 'pointer';   // Shows hand cursor like buttonMode did
		Assets.load(`/assets/piece_${color}.svg`).then(texture => sprite.texture = texture); // Load the texture from the assets folder

		// Dragging logic
		sprite
			.on("pointerdown", () => this.onPointerDown())
			.on("pointerup", () => this.onPointerUp())
			.on("pointermove", (event) => this.onDragMove(event))
			;

		this.sprite = sprite;
		this.position = position;

	}

	setTexture(texture: Texture): Piece {
		this.sprite.texture = texture;
		return this;
	}

	onPointerDown() {
		this.dragging = true;
		this.sprite.alpha = 0.7;
		this.sprite.zIndex = 10;

		// Is there an alternative to performance for animations and such
		this.clickedAt = performance.now();
	}

	onPointerUp() {
		this.dragging = false;
		this.sprite.alpha = 1;
		this.sprite.zIndex = 0; // Reset zIndex to default

		// If the piece was clicked for more than 100ms, we consider it a drag
		if (this.clickedAt + 100 < performance.now()) {
			//Ya hemos drageado xd
		} else {
			const newPos = window.prompt("Insert the new new position, current one is " + this.position);
			if (newPos) {
				this.animateMove(Number(newPos) - 1);
			}
		}
	}

	onDragMove(event: FederatedPointerEvent) {
		if (!this.dragging) return;
		const newPosition = event.global;
		this.sprite.x = newPosition.x;
		this.sprite.y = newPosition.y;
	}
	async animateMove(newPos: number) {
		let i = 0;
		const timeline = gsap.timeline({ paused: true });
		while (i++ != newPos) {
			const pos = positions[i % positions.length];
			// await this.moveAsync({
			// 	newX: pos.x,
			// 	newY: pos.y,
			// 	duration: 0.2,
			// 	ease: i == 1 ? "none" : i == newPos ? "none" : "none"
			// });
			timeline.to(this.sprite, {
				x: pos.x,
				y: pos.y,
				duration: 0.3,
				// ease: i == 1 ? "power2.in" : i == newPos ? "power2.out" : "none",
			});
		}
		timeline.play();

	}

	moveAsync(params: { newX: number, newY: number, duration: number, ease: "in" | "out" | "none"; }): Promise<void> {
		const { newX, newY, duration = 1, ease = "out" } = params;
		return new Promise<void>((resolve) => {
			gsap.to(this.sprite, {
				x: newX,
				y: newY,
				duration: duration, // 1 second transition time
				ease: ease != "none" ? "power2." + ease : ease,
				onComplete: () => {
					resolve(); // Resolve the promise when the animation is complete
				}
			});
		});
	}
}

//Esto no esta del todo bien. Falla cuando cambias de vertical a horizontal 
const getCoord = (pos: number) => ((960 / 21) * pos) + 20; // 20 is the padding
const positions = actuallyPositions.map((pos) => {
	return {
		x: getCoord(pos[0]),
		y: getCoord(pos[1]),
	};
});

console.log(actuallyPositions);
