import { Assets, Sprite, type Application, type FederatedPointerEvent } from "pixi.js";
import { gsap } from "gsap"; // To animate the movement
import type { BoardInterface } from "./Board/BoardInterface";
import { Howl } from "howler"; // For sound effects
import type { Parchis } from "../ts/Parchis";


export class PixiPiece {
	private sprite: Sprite;
	private dragging: boolean = false;
	private clickedAt: ClickStadistics = [0, 0, 0];
	private sound: Howl;

	private board: BoardInterface;	// I need to know the board to get the coordinates i should move to
	private game: Parchis;			// I need to know the game to report the move to the game

	public readonly playerId: number;	// I need my identity to report the move to the game
	public readonly pieceId: number;	// I need my identity to report the move to the game
	public position: number;			// Tenicamente la posicion deberia estar en otra entidad. Tenicamente solo tendria la id compuesta y la posicion, asi que aqui se queda.

	constructor(playerId: number, pieceId: number, position: number, game: Parchis, board: BoardInterface, app: Application) {
		const color = (["red", "yellow", "blue", "green"] as const)[playerId - 1]!;
		const sprite = new Sprite();
		const coords = board.getCoordinates(position, 1, 0);
		sprite.x = coords.x;
		sprite.y = coords.y;
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

		this.board = board;
		this.sprite = sprite;
		this.game = game;
		this.playerId = playerId;
		this.pieceId = pieceId;

		this.position = position;

		this.sound = getSounds();

		app.stage.addChild(sprite); // Add the sprite to the stage
	}

	private onPointerDown() {
		this.dragging = true;
		this.sprite.alpha = 0.7;
		this.sprite.zIndex = 10;

		this.clickedAt = [performance.now(), this.sprite.x, this.sprite.y];

		playSound(this.sound);
	}
	private onPointerUp() {
		this.dragging = false;
		this.sprite.alpha = 1;
		this.sprite.zIndex = 0; // Reset zIndex to default

		// If the piece was clicked for more than 100ms, we consider it a drag

		const clickedTo = [performance.now(), this.sprite.x, this.sprite.y] as const;
		if (wasDrag(this.clickedAt, clickedTo)) {
			playSound(this.sound);

			const closest = this.board.getSquare({ x: this.sprite.x, y: this.sprite.y }, 7.5); // Get the closest square to the clicked position
			if (closest == null) {
				alert("You are not close enough to a position");
			} else {
				this.game.movePiece(this.playerId, this.pieceId, closest, false);
			}
		} else {
			const newPos = window.prompt("Insert the new new position");
			if (newPos) {
				const newPosInt = parseInt(newPos);
				if (isNaN(newPosInt)) {
					alert("Invalid position");
					return;
				}
				this.game.movePiece(this.playerId, this.pieceId, newPosInt, true);
			}
		}
	}
	private onDragMove(event: FederatedPointerEvent) {
		if (!this.dragging) return;
		const newPosition = event.global;
		this.sprite.x = newPosition.x;
		this.sprite.y = newPosition.y;
	}

	public animateMoves(moves: Array<{ position: number, memberCount: number; nthMember: number; }>) {
		const timeline = gsap.timeline({ paused: true });

		for (const move of moves) {
			const { position, memberCount, nthMember } = move;
			const posCoordinates = this.board.getCoordinates(position, memberCount, nthMember);
			timeline.to(this.sprite, {
				x: posCoordinates.x,
				y: posCoordinates.y,
				duration: 0.3,
				// ease: i == 1 ? "power2.in" : i == newPos ? "power2.out" : "none",
			});
		}
		timeline.play();
	}
	public staticMove(position: number, memberCount: number, nthMember: number) {
		const posCoordinates = this.board.getCoordinates(position, memberCount, nthMember);
		this.sprite.x = posCoordinates.x;
		this.sprite.y = posCoordinates.y;
		this.sprite.zIndex = nthMember;
	}
}

const PIECE_SPRITES_COUNT = 11;
function playSound(soundSprite: Howl) {
	const soundId = Math.floor(Math.random() * PIECE_SPRITES_COUNT);
	soundSprite.stop(); // Stop all sounds before playing the new one
	soundSprite.play(`sprite${soundId}`);
}
function getSounds(): Howl {
	const sprites = new Array(PIECE_SPRITES_COUNT).fill("0").map<[number, number]>((_, i) => [i * 1000, 1000]);
	const spriteMap = Object.fromEntries(sprites.map((sprite, i) => [`sprite${i}`, sprite]));
	return new Howl({
		src: ['sounds/piece.ogg', 'sounds/piece.mp3'],
		sprite: spriteMap,
	});
}

type ClickStadistics = Readonly<[number, number, number]>;
function wasDrag(clickedAt: ClickStadistics, clickedTo: ClickStadistics) {
	// Check if it was held for less than 100ms
	const time_low = (clickedAt[0] + 100) > clickedTo[0];
	if (time_low) return false;


	// Check if the distance is less than 20 pixels
	const distanceX = Math.abs(clickedAt[1] - clickedTo[1]);
	const distanceY = Math.abs(clickedAt[2] - clickedTo[2]);
	const distance = distanceX + distanceY;
	if (distance < 20) return false;

	return true;
}