import type { BoardInterface } from "../components/Board/BoardInterface";
import { PixiPiece } from "../components/Piece";
import { getMapStore, type MapStore } from "./Store";
import type { DiceValue } from "../components/Dice/Dice";

export class Parchis {
	public readonly board: BoardInterface;
	public players: MapStore<number, PlayerInterface>;

	private get allPieces() {
		const players = this.players.values();
		return players.map(player => [...player.pieces.values()]).flat();
	}
	private _playersTurn: number;

	public get playersTurn() {
		return this._playersTurn;
	}
	public nextTurn() {
		const playersList = this.players.keys();
		const currentPlayerIndex = playersList.indexOf(this._playersTurn);
		if (currentPlayerIndex === -1) throw new Error(`Player ${this._playersTurn} not found in players list.`);

		const nextPlayerIndex = (currentPlayerIndex + 1) % playersList.length;
		this._playersTurn = playersList[nextPlayerIndex];
	}

	constructor(board: BoardInterface) {
		this.board = board;
		this._playersTurn = -1;

		const players = new Map<number, PlayerInterface>();
		for (let i = 1; i <= board.maxPlayers; i++) {
			const player = new AddPlayer(i, this);
			players.set(i, player);
		}
		this.players = getMapStore(players);
	}

	public movePiece(playerId: number, pieceId: number, newPosition: number, animate: boolean): number[] {
		const player = this.players.get(playerId);
		if (player == null) {
			throw new Error(`Dont exists de player ${playerId} in the players.`);
		}

		const piece = player.pieces.get(pieceId);
		if (piece == null) {
			throw new Error(`The player ${playerId} dont has the piece ${pieceId}`);
		}

		const extraMoves = new Array<number>();

		const piecesAtPosition = this.allPieces
			.filter(p => p.playerId != playerId || p.pieceId !== pieceId)	// Filter out the piece itself
			.filter(p => p.position === newPosition)	// Filter out the pieces at the new position
			;


		const piecesCount = piecesAtPosition.length + 1;	// +1 for the piece itself
		// Rearrange the current pieces
		piecesAtPosition.forEach((piece, index) => {
			piece.staticMove(newPosition, piecesCount, index);
		});

		// Move the piece to the new position
		piece.staticMove(newPosition, piecesCount, piecesAtPosition.length);
		piece.position = newPosition;	// Update the position of the piece

		return extraMoves;
	}


	// public possibleMoves(playerId: string, pieceId: number, diceValues: number[]): boolean {
	// 	return true;
	// }

	// private isValidMove(playerId: number, pieceId: number, newPosition: number): boolean {
	// 	return true;
	// }

}



export abstract class PlayerInterface {
	public abstract readonly type: "robot" | "remote" | "local" | "none";
	public readonly playerId: number;
	public readonly pieces: Map<number, PixiPiece>;
	public onRollDices: ((values: [DiceValue, DiceValue] | [null, null]) => void) | null = null;	// Callback to be called when the player rolls the dices
	protected readonly game: Parchis;

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
	movePiece(pieceId: number, newPosition: number): void {

	}


	get canDiceRoll(): boolean {
		return true;
		return this.game.playersTurn === this.playerId;
	}

	constructor(playerId: number, game: Parchis) {
		this.playerId = playerId;
		this.game = game;
		this.pieces = new Map<number, PixiPiece>();
	}
}


export class LocalPlayer extends PlayerInterface {
	public readonly type = "local";

	constructor(playerId: number, game: Parchis, customPiecesCount?: number) {
		super(playerId, game);
		console.log("Creating local player ", playerId, ", access it with window.parchis.player" + playerId);

		const piecesCount = customPiecesCount ?? this.game.board.intendedPiecesCount;	// Default to board's pieces count if not specified
		for (let i = 0; i < piecesCount; i++) {
			const piece = new PixiPiece(playerId, i, 1000 + (i + 1), game, game.board);
			this.pieces.set(i, piece);
		}

		// @ts-ignore -- This is a hack to access the player from the global window object
		if (window.parchis == null) window.parchis = {};	// Create the parchis object if it doesn't exist
		// @ts-ignore -- This is a hack to access the player from the global window object
		window.parchis["player" + playerId] = this;
	}
}
export class RobotPlayer extends PlayerInterface {
	public readonly type = "robot";

	constructor(playerId: number, game: Parchis, customPiecesCount?: number) {
		super(playerId, game);
		console.log("Creating local player ", playerId, ", access it with window.parchis.player" + playerId);

		const piecesCount = customPiecesCount ?? this.game.board.intendedPiecesCount;	// Default to board's pieces count if not specified
		for (let i = 0; i < piecesCount; i++) {
			const piece = new PixiPiece(playerId, i, 1000 + (i + 1), game, game.board);
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

	setLocal(): void {
		this.game.players.set(this.playerId,
			new LocalPlayer(this.playerId, this.game)
		);
	}

	setRemote(): void {
	}

	setRobot(): void {
		this.game.players.set(this.playerId,
			new RobotPlayer(this.playerId, this.game)
		);
	}
}

function RollDice(): DiceValue {
	return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}