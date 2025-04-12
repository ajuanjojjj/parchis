export interface PlayerInstance {
	type: "robot" | "remote" | "local";
	id: number;

	triggerDiceRoll: () => void;
	movePiece: (pieceId: number, newPosition: number) => void;

	get canDiceRoll(): boolean;
	set canDiceRoll(value: boolean);
}