import { memo, useCallback, useState } from 'react';
import { Dice, type DiceValue } from '../Dice/Dice';
import styles from './PlayerBanner.module.css';
import { AddPlayerDialog } from './AddPlayerDialog';
import type { AddPlayer, PlayerInterface } from '../../ts/Player';
import type { Application } from 'pixi.js';

export function PlayerBanner(props: { player: PlayerInterface | AddPlayer; app: Application | null; }) {
	const playerId = props.player.playerId;
	const colors = [
		"#e94738",
		"#fac51d",
		"#1e91fe",
		"#23ca58",
	];

	const playerStyle = {
		"gridArea": "P" + playerId,
		"--color": colors[playerId - 1],

		"--dice-color": colors[playerId - 1],
		// "--dice-border-color": "hsl(46, 96%, 40%)",
		"--dice-dot-color": "#2b2b2b",
	} as React.CSSProperties;

	if (props.player.type == "none") {
		return (
			<div style={playerStyle}>
				<ConnectPlayer player={props.player as AddPlayer} app={props.app} />
			</div>
		);
	}


	return (
		<div style={playerStyle}>
			<PlayerLandscape player={props.player} />
		</div>
	);
}

function PlayerLandscape(props: { player: PlayerInterface; }) {
	const [value1, setValue1] = useState<DiceValue | null>(1);
	const [value2, setValue2] = useState<DiceValue | null>(1);

	props.player.onRollDices = (values) => {
		setValue1(values[0]);
		setValue2(values[1]);
	};

	const onClickDices = useCallback(() => {
		if (props.player.type == "local")
			props.player.triggerDiceRoll();
	}, [props.player]);

	const cursorStyle = props.player.canDiceRoll && props.player.type == "local" ? { cursor: "pointer" } : { cursor: "default" };

	const vertical = (props.player.playerId == 4 || props.player.playerId == 2) ? styles.south : styles.north;
	const horizontal = (props.player.playerId == 3 || props.player.playerId == 2) ? styles.east : styles.west;
	return (
		<div className={`${styles.player} ${vertical} ${horizontal}`}>
			<div className={styles.playerName}>
				<span>Player {props.player.playerId}</span>
			</div>

			<img src={getAvatar(props.player)} alt="Avatar" className={styles.avatar} />

			<div onClick={onClickDices} className={styles.dicesContainer} style={cursorStyle}>
				<Dice value={value1} />
				<Dice value={value2} />
			</div>
		</div>
	);
}

function ConnectPlayer(props: { player: AddPlayer; app: Application | null; }) {
	const [isDialogOpen, setDialogOpen] = useState(false);

	const onClickAdd = useCallback(() => setDialogOpen(true), []);
	const onCloseDialog = useCallback(() => setDialogOpen(false), []);

	const avatar = import.meta.env.BASE_URL + "assets/avatars/addUser.svg";

	const vertical = (props.player.playerId == 4 || props.player.playerId == 2) ? styles.south : styles.north;
	const horizontal = (props.player.playerId == 3 || props.player.playerId == 2) ? styles.east : styles.west;
	return (
		<div className={`${styles.player} ${vertical} ${horizontal}`} onClick={onClickAdd}>
			<AddPlayerDialog open={isDialogOpen} onClose={onCloseDialog} player={props.player} app={props.app} />

			<div className={styles.playerName}>
				<span>Player {props.player.playerId}</span>
			</div>
			<img src={avatar} alt="Avatar" className={styles.avatar} />
			<div style={{ flex: 1 }}></div>
		</div>
	);
}

function getAvatar(player: PlayerInterface) {
	const base = import.meta.env.BASE_URL + "assets/avatars/";
	if (player.type == "local") {
		return base + "local.svg";
	} else if (player.type == "remote") {
		return base + "remote.svg";
	} else if (player.type == "robot") {
		return base + "robot.svg";
	}
	return base + "addUser.svg";
}

export const MemoPlayerElement = memo(PlayerBanner);