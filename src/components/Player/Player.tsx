import { useCallback, useState } from 'react';
import { Dice, type DiceValue } from '../Dice/Dice';
import styles from './Player.module.css';
import { RTC_Host } from '../../ts/host';
import { RTC_Client } from '../../ts/client';
import type { AddPlayer, PlayerInterface } from '../../ts/Parchis';

export function PlayerElement(props: { id?: string; className?: string; player: PlayerInterface | AddPlayer; playerId: number; }) {
	const colors = [
		"#e94738",
		"#fac51d",
		"#1e91fe",
		"#23ca58",
	];

	const playerStyle = {
		"gridArea": "P" + props.playerId,
		"--color": colors[props.playerId - 1],

		"--dice-color": colors[props.playerId - 1],
		// "--dice-border-color": "hsl(46, 96%, 40%)",
		"--dice-dot-color": "#2b2b2b",
	} as React.CSSProperties;

	if (props.player.type == "none") {
		return (
			<div id={props.id} className={props.className} style={playerStyle}>
				<ConnectPlayer player={props.player as AddPlayer} />
			</div>
		);
	}


	switch (props.player.type) {
		case "robot":
			return (
				<div id={props.id} className={props.className} style={playerStyle}>
					<PlayerLandscape player={props.player} />
				</div>);
		case "remote":
			return (
				<div id={props.id} className={props.className} style={playerStyle}>
					<PlayerLandscape player={props.player} />
				</div>);
		case "local":
			return (
				<div id={props.id} className={props.className} style={playerStyle}>
					<PlayerLandscape player={props.player} />
				</div>
			);
	}
}

function PlayerLandscape(props: { player: PlayerInterface; }) {
	const [value1, setValue1] = useState<DiceValue | null>(1);
	const [value2, setValue2] = useState<DiceValue | null>(1);

	const onClickDices = useCallback(async () => {
		setValue1(null);
		setValue2(null);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setValue1(RollDice());
		setValue2(RollDice());
	}, []);

	const inverted = (props.player.playerId == 2 || props.player.playerId == 4) ? styles.inverted : '';
	return (
		<div className={`${styles.landscape} ${styles.player} ${inverted}`}>
			<div className={styles.playerName}>Player {props.player.playerId}</div>
			<img src="/assets/defaultPFP.png" alt="Avatar" className={styles.avatar} />
			<div onClick={onClickDices} className={styles.dicesContainer}>
				<Dice value={value1} />
				<Dice value={value2} />
			</div>
		</div>
	);
}
function ConnectPlayer(props: { player: AddPlayer; }) {
	const onClickAdd = (async () => {
		const result = window.prompt(`Enter "bot" or "join" or "invite" or "local"`);
		if (result == "local") return props.player.setLocal();
		if (result == "bot") return props.player.setRobot();

		if (result == "invite") {
			let connection;
			const host = new RTC_Host();
			try {
				connection = await host.init();
			} catch (error) {
				console.error("Error initializing host:", error);
				alert("Error initializing host. Please try again.");
				return;
			}
			const connString = toBase64(JSON.stringify(connection));

			try {
				await navigator.clipboard.writeText(`\`\`\`${connString}\`\`\``);
				console.log("Connection string copied to clipboard:", connString);
				alert("Connection string copied to clipboard. Send it to the client.");
			} catch {
				alert("Send this to the client: " + connString);
			}
			const response = prompt("Paste the client response");

			try {
				const parsed = JSON.parse(fromBase64(response ?? ""));
				host.connectClient(parsed.offer, parsed.candidates);
				alert("You are smart. You are the host.");
			} catch {
				alert("asshole");
				host.kill();
				return;
			}

			return;
		}

		if (result == "join") {
			const offer = prompt("Paste the host offer");
			let response;
			try {
				const parsed = JSON.parse(fromBase64(offer ?? ""));
				const client = new RTC_Client();
				response = client.init(parsed.offer, parsed.candidates);
				alert("You are smart. You are the client.");
			} catch {
				alert("asshole");
				return;
			}

			const connString = toBase64(JSON.stringify(response));
			try {
				await navigator.clipboard.writeText(`\`\`\`${connString}\`\`\``);
				console.log("Connection string copied to clipboard:", connString);
				alert("Connection string copied to clipboard. Send it to the client.");
			} catch {
				alert("Send this to the client: " + connString);
			}


			return;
		}
	});

	const inverted = (props.player.playerId == 2 || props.player.playerId == 4) ? styles.inverted : '';
	return (
		<div className={`${styles.landscape} ${styles.player} ${inverted}`} onClick={onClickAdd}>
			<div className={styles.playerName}>Player {props.player.playerId}</div>
			<img src="/assets/avatars/addUser.svg" alt="Avatar" className={styles.avatar} />
			<div style={{ flex: 1 }}></div>
		</div>
	);
}

function RollDice() {
	return (Math.floor(Math.random() * 6) + 1) as DiceValue;
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