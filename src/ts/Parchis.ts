import type { BoardInterface } from "../components/Board/BoardInterface";
import { getMapStore, type MapStore } from "./Store";
import { type PlayerInterface, AddPlayer } from "./Player";

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
		if (animate) {
			// TODO Get all the steps and moves and such and animate the piece
			piece.staticMove(newPosition, piecesCount, piecesAtPosition.length);
		} else {
			piece.staticMove(newPosition, piecesCount, piecesAtPosition.length);
		}
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