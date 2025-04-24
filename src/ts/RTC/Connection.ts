export interface RTC_Instance {
	onMessage: (msg: string) => void;
	onClose: () => void;

	sendMessage(message: string): void;

	kill(): void;
}