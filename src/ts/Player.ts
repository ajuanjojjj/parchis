import type { DiceValue } from "../components/Dice/Dice";
import type { Parchis } from "./Parchis";
import type { PixiPiece } from "../components/PixiPiece";

export abstract class PlayerInterface {
	public abstract readonly type: "robot" | "local" | "remotePlayer" | "remoteRobot";
	public readonly hostId: string;
	public readonly playerId: number;
	public readonly pieces: Map<number, PixiPiece>;
	protected readonly game: Parchis;

	public onRollDices: ((values: [DiceValue, DiceValue] | [null, null]) => void) | null = null;	// Callback to be called when the player rolls the dices

	constructor(playerId: number, hostId: string, game: Parchis, pieces: Map<number, PixiPiece>) {
		this.playerId = playerId;
		this.hostId = hostId;
		this.game = game;
		this.pieces = pieces;
	}


	async triggerDiceRoll(): Promise<void> {
		if (this.onRollDices == null) return;

		this.onRollDices([
			null,
			null
		]);

		await new Promise((resolve) => setTimeout(resolve, 1000));

		this.onRollDices([
			RollDice(),
			RollDice(),
		]);
	}

	get canDiceRoll(): boolean {
		return true;
		// return this.game.playersTurn === this.playerId;
	}

	abstract movePiece(pieceId: number, newPosition: number, animate: boolean): void;	// Move the piece to the new position. This function should be called by the game when the player moves a piece.
}

export class LocalPlayer extends PlayerInterface {
	public readonly type = "local";

	constructor(playerId: number, hostId: string, game: Parchis, pieces: Map<number, PixiPiece>) {
		super(playerId, hostId, game, pieces);
	}

	movePiece(pieceId: number, newPosition: number, animate: boolean): void {
		this.game.movePiece(this.playerId, pieceId, newPosition, animate);
		this.game.notifyRemotes({
			type: "move",
			playerId: this.playerId,
			pieceId: pieceId,
			newPosition: newPosition,
			animate: animate,
		});
	}
}
export class RemotePlayer extends PlayerInterface {
	public readonly type;

	constructor(playerId: number, hostId: string, game: Parchis, type: "remotePlayer" | "remoteRobot", pieces: Map<number, PixiPiece>) {
		super(playerId, hostId, game, pieces);
		this.type = type;
	}

	movePiece(pieceId: number, newPosition: number, animate: boolean): void {
		this.game.movePiece(this.playerId, pieceId, newPosition, animate);
	}
}
export class RobotPlayer extends PlayerInterface {
	public readonly type = "robot";

	constructor(playerId: number, hostId: string, game: Parchis, pieces: Map<number, PixiPiece>) {
		super(playerId, hostId, game, pieces);

		console.log("Creating robot player ", playerId, ", access it with window.parchis.player" + playerId);
		// @ts-ignore -- This is a hack to access the player from the global window object
		if (window.parchis == null) window.parchis = {};	// Create the parchis object if it doesn't exist
		// @ts-ignore -- This is a hack to access the player from the global window object
		window.parchis["player" + playerId] = this;
	}

	movePiece(pieceId: number, newPosition: number, animate: boolean): void {
		this.game.movePiece(this.playerId, pieceId, newPosition, animate);
		this.game.notifyRemotes({
			type: "move",
			playerId: this.playerId,
			pieceId: pieceId,
			newPosition: newPosition,
			animate: animate,
		});
	}
}

function RollDice(): DiceValue {
	return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}