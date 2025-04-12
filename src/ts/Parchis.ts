import type { Application } from "pixi.js";
import type { BoardInterface } from "../components/Board/BoardInterface";
import { PixiPiece } from "../components/Piece";

export class Parchis {
	private board: BoardInterface;
	private players: Map<number, PlayerInterface> = new Map();
	private get allPlayers() {
		return Array.from(this.players.values());
	}
	private get allPieces() {
		return this.allPlayers.map(player => [...player.pieces.values()]).flat();
	}

	constructor(board: BoardInterface) {
		this.board = board;
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

	public addPlayer(player: PlayerInterface): void {
		if (this.players.has(player.playerId)) {
			throw new Error(`Player ${player.playerId} already exists.`);
		}
		this.players.set(player.playerId, player);
	}
	public removePlayer(playerId: number): void {
		if (!this.players.has(playerId)) {
			throw new Error(`Player ${playerId} does not exist.`);
		}
		this.players.delete(playerId);
	}

	public setApp(app: Application): void {
		for (const player of this.players.values()) {
			for (const piece of player.pieces.values()) {

				const Piece1 = new PixiPiece(piece.pieceId, player.playerId, 1000 + (piece.pieceId + 1), this, this.board);
				app.stage.addChild(Piece1.spriteRef);
			}
		}
	}

	// public possibleMoves(playerId: string, pieceId: number, diceValues: number[]): boolean {
	// 	return true;
	// }

	// private isValidMove(playerId: number, pieceId: number, newPosition: number): boolean {
	// 	return true;
	// }
}



export interface PlayerInterface {
	type: "robot" | "remote" | "local" | "none";
	playerId: number;
	pieces: Map<number, PixiPiece>;

	triggerDiceRoll: () => void;
	movePiece: (pieceId: number, newPosition: number) => void;

	get canDiceRoll(): boolean;
	set canDiceRoll(value: boolean);
}


export class LocalPlayer {
	public readonly type: "robot" | "remote" | "local";
	public readonly id: number;
	public pieces: Map<number, PixiPiece> = new Map();
	private _canDiceRoll: boolean = false;

	constructor(playerId: number, piecesCount: number) {
		this.id = playerId;
		this.type = "local";
	}


	triggerDiceRoll(): void {

	}
	movePiece(pieceId: number, newPosition: number): void {

	}

	get canDiceRoll(): boolean {
		return this._canDiceRoll;
	}
	set canDiceRoll(value: boolean) {
		this._canDiceRoll = value;
	}
}

export class AddPlayer {
	readonly type = "none";
	playerId: number;
	constructor(playerId: number) {
		this.playerId = playerId;
	}

	setLocal(): void {
	}

	setRemote(): void {
	}

	setRobot(): void {
	}
}