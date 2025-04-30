export class RTC_Client {
	private dataChannel: RTCDataChannel | null = null;
	private peerConnection: RTCPeerConnection;

	constructor() {
		this.peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]  // STUN server
		});
	}

	public async init(offer: RTCSessionDescriptionInit, remoteCandidates: RTCIceCandidateInit[]): Promise<RTC_Client_Response> {
		const answer = await this.createAnswer(offer);
		const candidates = await this.getCandidates();

		this.peerConnection.ondatachannel = (ev) => this.setupDataChannel(ev.channel);

		await this.setIceCandidates(remoteCandidates);

		return {
			answer,
			candidates,
		};
	}

	onConnection: () => void = () => { };
	onMessage: (msg: string) => void = () => { };
	onClose: () => void = () => { };

	public sendMessage(message: string) {
		const dataChannel = this.dataChannel;
		if (dataChannel && dataChannel.readyState === "open") {
			dataChannel.send(message);
		} else {
			console.error("Data channel is not open. Cannot send message.");
		}
	}

	public kill() {
		this.peerConnection.close();
		this.dataChannel?.close();
		this.dataChannel = null;
	}

	private getCandidates() {
		return new Promise<Array<RTCIceCandidate>>((resolve) => {
			const candidates = new Array<RTCIceCandidate>();

			this.peerConnection.onicecandidate = (event) => {
				if (event.candidate === null) {
					console.log("all ICE gathering on all transports is complete.");
					resolve(candidates);
				} else if (event.candidate) {
					console.log("ICE Candidate Found:", event.candidate);
					candidates.push(event.candidate);
				}
			};
		});
	}

	private setupDataChannel(channel: RTCDataChannel) {
		this.dataChannel = channel;

		channel.onopen = () => {
			this.onConnection();
		};
		channel.onmessage = (event) => {
			this.onMessage(event.data);
		};
		channel.onclose = () => {
			this.onClose();
		};
		channel.onerror = (event) => {
			console.error("Data channel error:", event);
		};

	}

	private async createAnswer(remoteInit: RTCSessionDescriptionInit) {
		const remote = new RTCSessionDescription(remoteInit);
		await this.peerConnection.setRemoteDescription(remote);

		const answer = await this.peerConnection.createAnswer();
		await this.peerConnection.setLocalDescription(answer);

		if (this.peerConnection.localDescription == null) throw new Error("localDescription is null after setLocalDescription");

		return this.peerConnection.localDescription;
	}
	private async setIceCandidates(candidatesInit: RTCIceCandidateInit[]) {
		for (const candidateInit of candidatesInit) {
			const candidate = new RTCIceCandidate(candidateInit);
			await this.peerConnection.addIceCandidate(candidate);
			console.log("ICE Candidate added:", candidate);
		}
	}

}

export interface RTC_Client_Response {
	answer: RTCSessionDescription,
	candidates: RTCIceCandidateInit[];
}