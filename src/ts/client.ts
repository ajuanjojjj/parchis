export class RTC_Client {
	private dataChannel: RTCDataChannel | null = null;
	private peerConnection: RTCPeerConnection;

	constructor() {
		this.peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]  // STUN server
		});
	}


	public async init(offer: RTCSessionDescriptionInit, remoteCandidates: RTCIceCandidateInit[]): Promise<RTC_Client_Init> {
		const answer = await this.createAnswer(offer);
		const candidates = await this.getCandidates();

		this.peerConnection.ondatachannel = (ev) => this.setupDataChannel(ev.channel);

		await this.setIceCandidates(remoteCandidates);

		return { answer, candidates };
	}

	onOpen: () => void = () => { };
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


	private getCandidates() {
		return new Promise<Array<RTCIceCandidate>>((resolve) => {
			const candidates = new Array<RTCIceCandidate>();
			this.peerConnection.onicecandidate = (event) => {

				if (event.candidate === null) {
					console.log("all ICE gathering on all transports is complete.");
					resolve(candidates);
				} else if ((event.candidate as unknown) == "") {
					console.log(" no further candidates to come in this generation.");
				} else if (event.candidate) {
					console.log("ICE Candidate Found:", event.candidate);
					candidates.push(event.candidate);
				}
			};
		});
	}

	private setupDataChannel(dataChannel: RTCDataChannel) {
		this.dataChannel = dataChannel;
		this.dataChannel.onopen = () => {
			this.onOpen();
		};
		this.dataChannel.onmessage = (event) => {
			this.onMessage(event.data);
		};
		this.dataChannel.onclose = () => {
			this.onClose();
		};
		this.dataChannel.onerror = (event) => {
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

export interface RTC_Client_Init {
	answer: RTCSessionDescription,
	candidates: RTCIceCandidateInit[];
}