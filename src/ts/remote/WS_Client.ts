import type { Connection_Instance, RemoteMessage } from "./Connection";

const URL_SERVER = 'ws://localhost:10000';

export class WS_Client implements Connection_Instance {
	private wsConnection: WebSocket;
	private lobbyId: string = '';

	constructor(lobbyId: string) {
		this.wsConnection = new WebSocket(URL_SERVER);
		this.lobbyId = lobbyId;
		this.wsConnection.onmessage = (event) => {
			const data = JSON.parse(event.data);
			if (data.type === 'lobbyClosed') {
				this.onClose();
			} else {
				this.onMessage(event.data);
			}
		};
	}

	private connect() {
		return new Promise<void>((resolve, reject) => {
			this.wsConnection.onopen = function () {
				resolve();
			};
			this.wsConnection.onerror = function (err) {
				reject(err);
			};
		});
	}



	static async create(lobbyId: string, password: string): Promise<WS_Client> {
		const client = new WS_Client(lobbyId);
		await client.connect();
		client.wsConnection.send(JSON.stringify({ type: 'create', lobbyId, password: password }));

		return new Promise((resolve) => {
			const listener = (event: MessageEvent) => {
				const data = JSON.parse(event.data);
				if (data.type === 'lobbyCreated') {
					resolve(client);
				}
				client.wsConnection.removeEventListener('message', listener);
			};
			client.wsConnection.addEventListener('message', listener);
		});

	}
	static async join(lobbyId: string, password: string): Promise<WS_Client> {
		const client = new WS_Client(lobbyId);
		await client.connect();
		client.wsConnection.send(JSON.stringify({ type: 'join', lobbyId, password: password }));

		return new Promise((resolve) => {
			const listener = (event: MessageEvent) => {
				const data = JSON.parse(event.data);
				if (data.type === 'lobbyJoined') {
					resolve(client);
				}
				client.wsConnection.removeEventListener('message', listener);
			};
			client.wsConnection.addEventListener('message', listener);
		});
	}

	onConnection: () => void = () => { };
	onMessage: (msg: string) => void = () => { };
	onClose: () => void = () => { };

	public sendMessage(message: RemoteMessage) {
		this.wsConnection.send(JSON.stringify({ type: 'lobbyMessage', lobby: this.lobbyId, message: message }));
	}

	public kill() {
		this.wsConnection.close();
	}
}
