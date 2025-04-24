export class RTC_Host {
	dataChannel: RTCDataChannel | null = null;
	peerConnection;

	constructor() {
		this.peerConnection = new RTCPeerConnection({
			iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]  // STUN server
		});
	}

	public async init(): Promise<RTC_Host_Offer> {
		const localCandidates = this.getCandidates();
		const channel = this.getChannel("chat");

		// The candidates gathering and chennel need to be setup before the offer is created. 
		const offer = this.createOffer();

		this.dataChannel = channel;
		return {
			offer: await offer,
			candidates: await localCandidates
		};
	}

	public async connectClient(offerInit: RTCSessionDescriptionInit, candidatesInit: RTCIceCandidateInit[]) {
		await this.setAnswer(offerInit);
		await this.setIceCandidates(candidatesInit);
	}

	public kill() {
		this.peerConnection.close();
		this.dataChannel?.close();
		this.dataChannel = null;
	}


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
				} else if (event.candidate) {
					console.log("ICE Candidate Found:", event.candidate);
					candidates.push(event.candidate);
				}
			};
		});
	}

	private getChannel(label: string) {
		const channel = this.peerConnection.createDataChannel(label);

		channel.onmessage = (event) => {
			this.onMessage(event.data);
		};
		channel.onclose = () => {
			this.onClose();
		};
		channel.onerror = (event) => {
			console.error("Data channel error:", event);
		};

		return channel;
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

export interface RTC_Host_Offer {
	offer: RTCSessionDescription,
	candidates: RTCIceCandidateInit[];
}