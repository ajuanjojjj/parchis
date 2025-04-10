import type { Piece } from "../components/Piece";

export class Parchis {
	public players: Map<number, Player> = new Map();
	public get allPlayers() {
		return Array.from(this.players.values());
	}
	public get allPieces() {
		return this.allPlayers.map(player => [...player.pieces.values()]).flat();
	}

	constructor(playerCount: number) {
		for (let i = 1; i <= playerCount; i++) {
			const player = new Player(i, 4);
			this.players.set(i, player);
		}
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

		return extraMoves;
	}

	public possibleMoves(playerId: string, pieceId: number, diceValues: number[]): boolean {
		return true;
	}

	private isValidMove(playerId: number, pieceId: number, newPosition: number): boolean {
		return true;
	}
}


export class Player {
	public pieces: Map<number, Piece> = new Map();

	constructor(playerId: number, piecesCount: number) {
		// for (let i = 1; i <= piecesCount; i++) {
		// 	const piece = new Piece(playerId * 1000 + i);
		// 	this.pieces.set(i, piece);
		// }
	}
}


// Positions 1-1000 are places on the board
// Positions 1001-1100 are the "Home" positions for player 1
// Positions 1101-1500 are the "End Column" positions for player 1
// Position 1501 is the "End" position for player 1
// Positions 2001-2100 are the "Home" positions for player 2, etc
// export class Piece {
// 	public position: number;

// 	constructor(position: number) {
// 		this.position = position;
// 	}
// }