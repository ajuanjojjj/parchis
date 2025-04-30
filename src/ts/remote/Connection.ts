import type { DiceValue } from "../../components/Dice/Dice";

export interface Connection_Instance {
	onConnection: () => void;
	onMessage: (msg: string) => void;
	onClose: () => void;

	sendMessage(message: RemoteMessage): void;

	kill(): void;
}

export interface MoveMessage {
	// messageId: number;
	type: "move";
	playerId: number;
	pieceId: number;
	newPosition: number;
	animate: boolean;
}
export interface DiceRequestMessage {
	// messageId: number;
	type: "diceRequest";
	playerId: number;
	requesteeId: number;
}
export interface DiceResultMessage {
	// messageId: number;
	type: "diceResult";
	playerId: number;
	result: [DiceValue, DiceValue];
}

export interface StateMessage {
	// messageId: number;
	type: "state";
	state: ParchisState;
}
export type RemoteMessage = MoveMessage | DiceRequestMessage | DiceResultMessage | StateMessage;


export interface ParchisState {
	players: PlayerState[];
	// board: BoardInterface;
}
export interface PlayerState {
	playerId: number;
	hostId: string;
	type: "robot" | "player";
	pieces: PieceState[];
}
export interface PieceState {
	pieceId: number;
	position: number;
}