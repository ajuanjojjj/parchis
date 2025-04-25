import type { DiceValue } from "../../components/Dice/Dice";

export interface RTC_Instance {
	onConnection: () => void;
	onMessage: (msg: string) => void;
	onClose: () => void;

	sendMessage(message: string): void;

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
export type RemoteMessage = MoveMessage | DiceRequestMessage | DiceResultMessage;