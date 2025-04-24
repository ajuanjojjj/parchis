import type { DiceValue } from "../components/Dice/Dice";
import type { Parchis } from "./Parchis";
import { PixiPiece } from "../components/PixiPiece";
import type { Application } from "pixi.js";
import type { RTC_Instance } from "./RTC/Connection";

export abstract class PlayerInterface {
	public abstract readonly type: "robot" | "remote" | "local" | "none";
	public readonly playerId: number;
	public readonly pieces: Map<number, PixiPiece>;
	public onRollDices: ((values: [DiceValue, DiceValue] | [null, null]) => void) | null = null;	// Callback to be called when the player rolls the dices
	protected readonly game: Parchis;

	constructor(playerId: number, game: Parchis) {
		this.playerId = playerId;
		this.game = game;
		this.pieces = new Map<number, PixiPiece>();
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
	movePiece(pieceId: number, newPosition: number, animate: boolean): void {
		this.game.movePiece(this.playerId, pieceId, newPosition, animate);
	}


	get canDiceRoll(): boolean {
		return true;
		return this.game.playersTurn === this.playerId;
	}
}

export class LocalPlayer extends PlayerInterface {
	public readonly type = "local";

	constructor(playerId: number, game: Parchis, app: Application, customPiecesCount?: number) {
		super(playerId, game);
		console.log("Creating local player ", playerId, ", access it with window.parchis.player" + playerId);

		const piecesCount = customPiecesCount ?? this.game.board.intendedPiecesCount;	// Default to board's pieces count if not specified
		for (let i = 0; i < piecesCount; i++) {
			const piece = new PixiPiece(playerId, i, (1000 * playerId) + (i + 1), game, game.board, app);
			this.pieces.set(i, piece);
		}


		// @ts-ignore -- This is a hack to access the player from the global window object
		if (window.parchis == null) window.parchis = {};	// Create the parchis object if it doesn't exist
		// @ts-ignore -- This is a hack to access the player from the global window object
		window.parchis["player" + playerId] = this;
	}
}
export class RemotePlayer extends PlayerInterface {
	public readonly type = "local";

	constructor(playerId: number, game: Parchis, app: Application, customPiecesCount?: number) {
		super(playerId, game);

		const piecesCount = customPiecesCount ?? this.game.board.intendedPiecesCount;	// Default to board's pieces count if not specified
		for (let i = 0; i < piecesCount; i++) {
			const piece = new PixiPiece(playerId, i, (1000 * playerId) + (i + 1), game, game.board, app);
			this.pieces.set(i, piece);
		}
	}
}
export class RobotPlayer extends PlayerInterface {
	public readonly type = "robot";

	constructor(playerId: number, game: Parchis, app: Application, customPiecesCount?: number) {
		super(playerId, game);
		console.log("Creating local player ", playerId, ", access it with window.parchis.player" + playerId);

		const piecesCount = customPiecesCount ?? this.game.board.intendedPiecesCount;	// Default to board's pieces count if not specified
		for (let i = 0; i < piecesCount; i++) {
			const piece = new PixiPiece(playerId, i, (1000 * playerId) + (i + 1), game, game.board, app);
			this.pieces.set(i, piece);
		}

		// @ts-ignore -- This is a hack to access the player from the global window object
		if (window.parchis == null) window.parchis = {};	// Create the parchis object if it doesn't exist
		// @ts-ignore -- This is a hack to access the player from the global window object
		window.parchis["player" + playerId] = this;
	}
}

export class AddPlayer extends PlayerInterface {
	readonly type = "none";

	constructor(playerId: number, game: Parchis) {
		super(playerId, game);
	}

	setLocal(app: Application): void {
		this.game.players.set(this.playerId,
			new LocalPlayer(this.playerId, this.game, app)
		);
	}

	setRemote(app: Application, remote: RTC_Instance): void {
		this.game.players.set(this.playerId,
			new LocalPlayer(this.playerId, this.game, app)
		);
		// this.game.addRemote(remote);
	}

	setRobot(app: Application): void {
		this.game.players.set(this.playerId,
			new RobotPlayer(this.playerId, this.game, app)
		);
	}
}


function RollDice(): DiceValue {
	return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}