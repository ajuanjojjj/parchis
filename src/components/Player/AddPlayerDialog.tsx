import { useRef, useEffect } from "react";
import styles from "./PlayerBanner.module.css";
import type { Parchis } from "../../ts/Parchis";
import { WS_Client } from "../../ts/remote/WS_Client";

export function AddPlayerDialog(props: { open: boolean; onClose: () => void; playerId: number, game: Parchis; }) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (props.open) {
			ref.current?.showModal();
		} else {
			ref.current?.close();
		}
	}, [props.open]);


	const onLocalPlayer = () => {
		props.game.setPlayer({
			type: "player",
			playerId: props.playerId,
			hostId: props.game.hostId,
			pieces: [
				{ pieceId: 1, position: (props.playerId * 1000) + 1 },
				{ pieceId: 2, position: (props.playerId * 1000) + 2 },
				{ pieceId: 3, position: (props.playerId * 1000) + 3 },
				{ pieceId: 4, position: (props.playerId * 1000) + 4 },
			],
		});
		props.onClose();
	};
	const onRobotPlayer = () => {
		props.game.setPlayer({
			type: "robot",
			playerId: props.playerId,
			hostId: props.game.hostId,
			pieces: [
				{ pieceId: 1, position: (props.playerId * 1000) + 1 },
				{ pieceId: 2, position: (props.playerId * 1000) + 2 },
				{ pieceId: 3, position: (props.playerId * 1000) + 3 },
				{ pieceId: 4, position: (props.playerId * 1000) + 4 },
			],
		});
		props.onClose();
	};


	const onHostPlayer = async () => {
		const lobbyId = prompt("Enter lobby ID to host a seat:");
		if (lobbyId == null || lobbyId.trim() === "") {
			alert("Invalid lobby ID. Please try again.");
			return;
		}
		const connection = await WS_Client.create(lobbyId, "");
		props.game.addRemote(connection);
		props.onClose();
	};
	const onClientPlayer = async () => {
		const lobbyId = prompt("Enter lobby ID to host a seat:");
		if (lobbyId == null || lobbyId.trim() === "") {
			alert("Invalid lobby ID. Please try again.");
			return;
		}
		const connection = await WS_Client.join(lobbyId, "");
		props.game.addRemote(connection);
		props.onClose();
		//TODO Load the game state from the server
	};

	return (
		<dialog ref={ref} onCancel={props.onClose} className={styles.myDialog}>
			<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<h2>Add Player</h2>
			</div>

			<div>
				<p>Choose a player type:</p>
				<button className={styles.playerTypeButton} onClick={onLocalPlayer}>Local Player</button>
				<button className={styles.playerTypeButton} onClick={onHostPlayer}>Host a seat</button>
				<button className={styles.playerTypeButton} onClick={onClientPlayer}>Join a seat</button>
				<button className={styles.playerTypeButton} onClick={onRobotPlayer}>Robot Player</button>
			</div>
		</dialog>
	);
}