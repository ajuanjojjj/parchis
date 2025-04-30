import type { BoardInterface } from "../components/Board/BoardInterface";
import { getMapStore, type MapStore } from "./Store";
import { LocalPlayer, RemotePlayer, RobotPlayer, type PlayerInterface } from "./Player";
import type { RemoteMessage, Connection_Instance, ParchisState, PlayerState } from "./remote/Connection";
import type { Application } from "pixi.js";
import { PixiPiece } from "../components/PixiPiece";

export class Parchis {
	public readonly hostId: string;
	public readonly board: BoardInterface;
	public players: MapStore<number, PlayerInterface | null>;
	private remotes = new Set<Connection_Instance>;
	private app: Application | null;

	private get allPieces() {
		const players = this.players.values();
		return players.map(player => {
			if (player == null) return [];
			return [...player.pieces.values()];
		}).flat();
	}

	constructor(board: BoardInterface, app: Application | null) {
		this.app = app;
		this.board = board;
		this.hostId = crypto.randomUUID();

		const players = new Map<number, PlayerInterface | null>();
		for (let i = 1; i <= board.maxPlayers; i++) {
			players.set(i, null);
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
			console.error(player.pieces.keys(), pieceId);
			throw new Error(`The player ${playerId} dont has the piece ${pieceId}`);
		}

		const extraMoves = new Array<number>();

		const piecesAtNewPosition = this.allPieces
			.filter(p => p.player.playerId != playerId || p.pieceId !== pieceId)	// Filter out the piece itself
			.filter(p => p.position === newPosition)	// Filter out the pieces at the new position
			;


		const piecesCount = piecesAtNewPosition.length + 1;	// +1 for the piece itself
		piecesAtNewPosition.forEach((piece, index) => {	// Rearrange the current pieces
			piece.staticMove(piece.position, piecesAtNewPosition.length + 1, index);
		});

		// Move the piece to the new position
		if (animate) {
			// TODO Get all the steps and moves and such and animate the piece
			piece.staticMove(newPosition, piecesCount, piecesAtNewPosition.length);
		} else {
			piece.staticMove(newPosition, piecesCount, piecesAtNewPosition.length);
		}

		const piecesAtOldPosition = this.allPieces
			.filter(p => p.player.playerId != playerId || p.pieceId !== pieceId)	// Filter out the piece itself
			.filter(p => p.position === piece.position)	// Filter out the pieces at the new position
			;
		piecesAtOldPosition.forEach((piece, index) => {	// Rearrange the current pieces
			piece.staticMove(piece.position, piecesAtOldPosition.length, index);
		});

		piece.position = newPosition;	// Update the position of the piece

		return extraMoves;
	}


	// public possibleMoves(playerId: string, pieceId: number, diceValues: number[]): boolean {
	// 	return true;
	// }

	// private isValidMove(playerId: number, pieceId: number, newPosition: number): boolean {
	// 	return true;
	// }

	public addRemote(remote: Connection_Instance) {
		this.remotes.add(remote);	//Add to list, so we can notify it later
		remote.onMessage = (msg) => this.handleMessage(msg);
		return () => {
			this.remotes.delete(remote);
		};
	}

	public notifyRemotes(message: RemoteMessage) {
		this.remotes.forEach(remote => {
			remote.sendMessage(message);
		});
	}

	public handleMessage(message: string) {
		if (this.app == null) { throw new Error("App is null, cannot handle message" + message); }

		const parsedMessage = JSON.parse(message) as RemoteMessage;
		switch (parsedMessage.type) {
			case "state":
				this.setState(parsedMessage.state, this.app);
				break;
			case "move":
				this.movePiece(parsedMessage.playerId, parsedMessage.pieceId, parsedMessage.newPosition, parsedMessage.animate);
				break;
			default:
				console.error("Unknown message type", parsedMessage.type);
		}
	}

	public setState(state: ParchisState, app: Application) {
		const newMap = new Map<number, PlayerInterface | null>(this.players.getSnapshot());
		for (const player of state.players) {
			const newPlayer = playerFromState(this, app, player);
			newMap.set(newPlayer.playerId, newPlayer);
		}
		this.players.setMap(newMap);	// Set the new map to the players
	}

	public setPlayer(playerState: PlayerState) {
		if (this.app == null) { throw new Error("App is null, cannot add player"); }

		const player = playerFromState(this, this.app, playerState);
		this.players.set(player.playerId, player);

		this.notifyRemotes({
			type: "state",
			state: this.getState(),
		});
	}

	public getState(): ParchisState {
		const players = this.players.values().map(player => {
			if (player == null) return null;
			return {
				playerId: player.playerId,
				hostId: player.hostId,
				type: player.type,
				pieces: [...player.pieces.values()].map(piece => {
					return {
						pieceId: piece.pieceId,
						position: piece.position,
					};
				}),
			};
		}).filter(player => player != null) as PlayerState[];

		return {
			players: players,
		};
	}
}

function playerFromState(game: Parchis, app: Application, playerState: PlayerState): PlayerInterface {
	const piecesMap = new Map<number, PixiPiece>();

	let player;
	if (game.hostId === playerState.hostId) {
		if (playerState.type === "robot") player = new RobotPlayer(playerState.playerId, playerState.hostId, game, piecesMap);
		else player = new LocalPlayer(playerState.playerId, playerState.hostId, game, piecesMap);
	} else {
		if (playerState.type === "robot") player = new RemotePlayer(playerState.playerId, playerState.hostId, game, "remoteRobot", piecesMap);
		else player = new RemotePlayer(playerState.playerId, playerState.hostId, game, "remotePlayer", piecesMap);
	}



	for (const piece of playerState.pieces) {
		piecesMap.set(piece.pieceId, new PixiPiece({
			player,
			pieceId: piece.pieceId,
			position: piece.position,
			board: game.board,
			app: app,
		}));
	}

	return player;
}
