import { useEffect, useRef, useState } from "react";
import { Input } from "../../components/Input";
import { RTC_Host, type RTC_Host_Offer } from "../../ts/RTC/host";
import { RTC_Client, type RTC_Client_Response } from "../../ts/RTC/client";

export function RTC() {
	const [mode, setMode] = useState<null | "host" | "client">(null);

	return <>
		<h1>WebRTC</h1>
		<h2>Choose Mode</h2>
		<button onClick={() => setMode("host")}>Host</button>
		<button onClick={() => setMode("client")}>Client</button>

		{mode === "host" && <HostElement />}
		{mode === "client" && <ClientElement />}
	</>;
}

function HostElement() {
	const host = useRef(new RTC_Host());
	const [offer, setOffer] = useState<RTC_Host_Offer>();
	const [messages, setMessages] = useState(new Array<string>());
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		host.current.init().then((o) => {
			setOffer(o);
			console.log("Offer", o.offer);

		});
	}, []);

	const onAnswer = (data: string) => {
		const answer = JSON.parse(data) as {
			answer: RTCSessionDescriptionInit,
			candidates: RTCIceCandidateInit[];
		};
		if (typeof answer !== "object" || answer == null) throw new Error("Answer is not an object");
		if (!answer.answer) throw new Error("Answer is null or undefined");
		if (!answer.candidates) throw new Error("Candidates is null or undefined");

		host.current.connectClient(answer.answer, answer.candidates);
		setIsReady(true);

		host.current.onMessage = (message: string) => {
			setMessages((prev) => [...prev, message]);
		};
		host.current.onClose = () => {
			console.log("Data channel is closed");
		};

	};

	const sendMessage = (message: string) => {
		host.current.sendMessage(message);
	};


	return <>
		<h2>Host - WebRTC</h2>

		<h3>Offer</h3>
		<code id="offer">
			{JSON.stringify(offer)}
		</code>

		{!isReady && <>
			<Input title="Set Answer" onComplete={onAnswer} />
		</>}

		{isReady && <>
			<Input title="Message" onComplete={sendMessage} />
			{messages.map((message) => <div>{message}</div>)}
		</>}
	</>;
}

function ClientElement() {
	const host = useRef(new RTC_Client());
	const [answer, setAnswer] = useState<RTC_Client_Response>();
	const [messages, setMessages] = useState(new Array<string>());
	const [isReady, setIsReady] = useState(false);

	const onAnswer = (data: string) => {
		const answer = JSON.parse(data) as {
			offer: RTCSessionDescriptionInit,
			candidates: RTCIceCandidateInit[];
		};
		if (typeof answer !== "object" || answer == null) throw new Error("Answer is not an object");
		if (!answer.offer) throw new Error("offer is null or undefined");
		if (!answer.candidates) throw new Error("Candidates is null or undefined");

		host.current.init(answer.offer, answer.candidates).then((answer) => {
			setAnswer(answer);
			setIsReady(true);
		});

		host.current.onMessage = (message: string) => {
			setMessages((prev) => [...prev, message]);
		};
		host.current.onClose = () => {
			console.log("Data channel is closed");
		};
	};

	const sendMessage = (message: string) => {
		host.current.sendMessage(message);
	};

	return <>
		<h2>Client - WebRTC</h2>

		{!isReady && <>
			<Input title="Set Answer" onComplete={onAnswer} />
		</>}

		<h3>Answer</h3>
		<div>
			<code>
				{JSON.stringify(answer)}
			</code>
		</div>


		{isReady && <>
			<Input title="Message" onComplete={sendMessage} />
			{messages.map((message) => <div>{message}</div>)}
		</>}
	</>;
}