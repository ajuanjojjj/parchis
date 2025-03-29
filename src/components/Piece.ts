import { Assets, Sprite, type FederatedPointerEvent, type Texture } from "pixi.js";
import { gsap } from "gsap"; // To animate the movement
import { All_Positions, Board_Positions, Home_Positions } from "./positions";

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

	private get internalX() {
		return this.sprite.x / (1000 / 63); // Convert back to the original value
	}
	private get internalY() {
		return this.sprite.y / (1000 / 63); // Convert back to the original value
	}

	constructor(color: "red" | "blue" | "green" | "yellow", position: number) {
		const sprite = new Sprite();
		sprite.x = convert(Home_Positions[color][position][0]);
		sprite.y = convert(Home_Positions[color][position][1]);
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
			.on("globalmousemove", (event) => this.onDragMove(event))
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
			const x = this.internalX;
			const y = this.internalY;
			const actualNearest = All_Positions
				.sort((a, b) => {
					const aDist = Math.abs(a[0] - x) + Math.abs(a[1] - y);
					const bDist = Math.abs(b[0] - x) + Math.abs(b[1] - y);
					return aDist - bDist;
				})[0]; // Get the nearest position
			const distance = Math.abs(actualNearest[0] - x) + Math.abs(actualNearest[1] - y);
			if (distance > 5) {
				alert("You are not close enough to a position");
			} else {
				this.sprite.x = convert(actualNearest[0]);
				this.sprite.y = convert(actualNearest[1]);
			}

		} else {
			const newPos = window.prompt("Insert the new new position, current one is " + this.position);
			if (newPos) {
				this.animateMove(Number(newPos));
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
		newPos = Math.max(1, Math.min(newPos, Board_Positions.length)) - 1; // Clamp the value between 0 and positions.length - 1 
		let i = this.position;
		const timeline = gsap.timeline({ paused: true });

		while (i != newPos) {
			i++;
			i = i % Board_Positions.length;
			const pos = Board_Positions[i];
			timeline.to(this.sprite, {
				x: convert(pos[0] + .5),
				y: convert(pos[1] + .5),
				duration: 0.3,
				// ease: i == 1 ? "power2.in" : i == newPos ? "power2.out" : "none",
			});
		}
		timeline.play();

		this.position = newPos;
	}
}



const convert = (val: number) => (1000 / 63) * (val + 0.5);

