export class RTC_Host {
	dataChannel: RTCDataChannel | null = null;
	peerConnection;

	constructor() {
		this.peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]  // STUN server
		});
	}

	async init(): Promise<RTC_Host_Init> {
		const localCandidates = this.getCandidates();
		const offer = this.createOffer();

		this.setupDataChannel();

		return {
			offer: await offer,
			candidates: await localCandidates
		};
	}

	async connectClient(offerInit: RTCSessionDescriptionInit, candidatesInit: RTCIceCandidateInit[]) {
		this.setIceCandidates(candidatesInit);
		this.setAnswer(offerInit);
	}



	onOpen: () => void = () => { };
	onMessage: (msg: string) => void = () => { };
	onClose: () => void = () => { };


	/**
	 * @param {string} message 
	 * @public
	 */
	sendMessage(message: string) {
		const dataChannel = this.dataChannel;
		if (dataChannel && dataChannel.readyState === "open") {
			dataChannel.send(message);
		} else {
			console.error("Data channel is not open. Cannot send message.");
		}
	}



	//Private methods

	private async createOffer() {
		// this.dataChannel = this.peerConnection.createDataChannel("chat");
		const offer = await this.peerConnection.createOffer();
		await this.peerConnection.setLocalDescription(offer);

		if (this.peerConnection.localDescription == null) throw new Error("localDescription is null after setLocalDescription");

		return this.peerConnection.localDescription;
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

	private setupDataChannel() {
		this.dataChannel = this.peerConnection.createDataChannel("chat");
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

	private async setAnswer(remoteInit: RTCSessionDescriptionInit) {
		const remote = new RTCSessionDescription(remoteInit);
		await this.peerConnection.setRemoteDescription(remote);
	}
	private async setIceCandidates(candidatesInit: RTCIceCandidateInit[]) {
		for (const candidateInit of candidatesInit) {
			const candidate = new RTCIceCandidate(candidateInit);
			await this.peerConnection.addIceCandidate(candidate);
			console.log("ICE Candidate added:", candidate);
		}
	}

}

export interface RTC_Host_Init {
	offer: RTCSessionDescription,
	candidates: RTCIceCandidateInit[];
}