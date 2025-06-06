import { type Application } from "pixi.js";
import { useRef, useState, useEffect } from "react";
import type { AddPlayer } from "../../ts/Player";
import { RTC_Client, type RTC_Client_Response } from "../../ts/remote/RPC_Client";
import { RTC_Host, type RTC_Host_Offer } from "../../ts/remote/RPC_Host";
import { Loader } from "../Loader";

export function HostConnectScreen(props: { player: AddPlayer; app: Application | null; onClose: () => void; }) {
	const host = useRef<RTC_Host>(null);
	const [connString, setConnString] = useState<string | null>(null);
	const [errorCopying, setErrorCopying] = useState(false);
	const [textAreaAnswer, setTextAreaAnswer] = useState<string>("");

	//Init the host connection on mount
	useEffect(() => {
		const initConnection = async () => {
			host.current = new RTC_Host();
			let connection: RTC_Host_Offer;
			try {
				connection = await host.current.init();
			} catch (error) {
				console.error("Error initializing host:", error);
				alert("Error initializing host. Please try again.");
				return;
			}

			const connString = toBase64(JSON.stringify(connection));

			try {
				await navigator.clipboard.writeText(`\`\`\`${connString}\`\`\``);
			} catch {
				console.warn("Error copying connection string to clipboard. Displaying it instead.");
				setErrorCopying(true);
			}

			setConnString(connString);
		};
		initConnection();
	}, []);

	const submitTextAreaAnswer = (text: string) => {
		if (host.current == null) {
			alert("Host is not initialized yet. Please try again.");
			return;
		}
		const response = text.trim().replace(/^```/, "").replace(/```$/, "");

		let parsed;
		try {
			parsed = JSON.parse(fromBase64(response ?? ""));
		} catch (err) {
			console.error("Error parsing response:", err);
			alert("Error parsing response");
			return;
		}

		try {
			host.current.connectClient(parsed.answer, parsed.candidates);
		} catch (error) {
			console.error("Error connecting client:", error);
			alert("Error connecting client. Please try again.");
			host.current.kill();
			return;
		}

		if (props.app == null) {
			alert("App is not initialized yet. Please try again.");
			return;
		}

		return props.player.setHost(props.app, host.current);
	};

	const readAnswerFromClipboard = async () => {
		try {
			const text = await navigator.clipboard.readText();
			submitTextAreaAnswer(text);
		} catch (error) {
			console.error("Error reading from clipboard:", error);
		}
	};


	if (errorCopying) {
		return (
			<div>
				<p>Connection string:</p>
				<code style={{ overflowWrap: "break-word" }}>{connString}</code>
				<button onClick={() => setErrorCopying(false)}>
					Next
				</button>
			</div>
		);
	}
	if (connString) {
		return (
			<div>
				<p>Paste the client response</p>
				<button onClick={readAnswerFromClipboard}>
					Paste from clipboard
				</button>

				<div>Or paste it below</div>
				<textarea value={textAreaAnswer} onChange={(e) => setTextAreaAnswer(e.target.value)} ></textarea>
				<button onClick={() => submitTextAreaAnswer(textAreaAnswer)}>
					Connect
				</button>

			</div>
		);
	}
}
export function ClientConnectScreen(props: { player: AddPlayer; app: Application | null; onClose: () => void; }) {
	const client = useRef<RTC_Client>(null);
	const [connString, setConnString] = useState<string>("");
	const [errorCopying, setErrorCopying] = useState(false);
	const [textAreaAnswer, setTextAreaAnswer] = useState<string>("");



	const submitTextAreaAnswer = async (text: string) => {
		const offer = text.trim().replace(/^```/, "").replace(/```$/, "");

		const freshClient = new RTC_Client();

		let parsed;
		try {
			parsed = JSON.parse(fromBase64(offer ?? ""));
		} catch (err) {
			console.error("Error parsing response:", err, fromBase64(offer ?? ""));
			alert("Error parsing offer");
			return;
		}

		let response: RTC_Client_Response;
		try {
			response = await freshClient.init(parsed.offer, parsed.candidates);
		} catch (err) {
			alert("Error connecting to host. Please try again.");
			console.error("Error connecting to host. Please try again.", err);
			freshClient.kill();
			return;
		}

		const connString = toBase64(JSON.stringify(response));
		try {
			await navigator.clipboard.writeText(`\`\`\`${connString}\`\`\``);
		} catch {
			console.warn("Error copying connection string to clipboard. Displaying it instead.");
			setErrorCopying(true);
		}

		freshClient.onConnection = () => {
			if (props.app == null) {
				alert("App is not initialized yet. Please try again.");
				return;
			}

			props.onClose();
			props.player.setClient(props.app, freshClient);
		};

		client.current = freshClient;
		setConnString(connString);
	};

	const readAnswerFromClipboard = async () => {
		try {
			const text = await navigator.clipboard.readText();
			submitTextAreaAnswer(text);
		} catch (error) {
			console.error("Error reading from clipboard:", error);
		}
	};


	if (connString == "") {
		return (
			<div>
				<p>Paste the host offer</p>
				<button onClick={readAnswerFromClipboard}>
					Paste from clipboard
				</button>

				<div>Or paste it below</div>
				<textarea value={textAreaAnswer} onChange={(e) => setTextAreaAnswer(e.target.value)} ></textarea>
				<button onClick={() => submitTextAreaAnswer(textAreaAnswer)}>
					Connect
				</button>
			</div>
		);
	}

	return (
		<div>
			<h1>Send the connection string to the host</h1>
			{errorCopying == false && <p>It has been copied to your clipboard</p>}

			<details>
				<summary>Connection string:</summary>
				<code style={{ overflowWrap: "break-word" }}>{connString}</code>
			</details>

			<p>Waiting for the host to connect</p>
			<Loader />
		</div>
	);

}

function toBase64(str: string) {
	const utf8Bytes = new TextEncoder().encode(str); // UTF-8 encoding
	const binaryStr = String.fromCharCode(...utf8Bytes);
	return btoa(binaryStr);
}
function fromBase64(base64: string) {
	const binaryStr = atob(base64);
	const bytes = Uint8Array.from(binaryStr, ch => ch.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

