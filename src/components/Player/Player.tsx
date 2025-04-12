import { useCallback, useState } from 'react';
import { Dice, type DiceValue } from '../Dice/Dice';
import styles from './Player.module.css';
import type { PlayerInstance } from './PlayerInstance';

export function Player(props: { id?: string; className?: string; player: PlayerInstance; }) {
	return (
		<div id={props.id} className={props.className}>
			<PlayerLandscape player={props.player} />
			<PlayerPortrait player={props.player} />
		</div>
	);
}

function PlayerLandscape(props: { player: PlayerInstance; }) {
	const [value1, setValue1] = useState<DiceValue | null>(1);
	const [value2, setValue2] = useState<DiceValue | null>(1);

	const onClickDices = useCallback(async () => {
		setValue1(null);
		setValue2(null);
		await new Promise((resolve) => setTimeout(resolve, 1000));
		setValue1(RollDice());
		setValue2(RollDice());
	}, []);

	const inverted = (props.player.id == 2 || props.player.id == 4) ? styles.inverted : '';
	return (
		<div className={`${styles.landscape} ${styles.player} ${inverted}`}>
			<div className={styles.playerName}>Player {props.player.id}</div>
			<img src="/assets/defaultPFP.png" alt="Avatar" className={styles.avatar} />
			<div onClick={onClickDices} className={styles.dicesContainer}>
				<Dice value={value1} />
				<Dice value={value2} />
			</div>
		</div>
	);
}
function PlayerPortrait(props: { player: PlayerInstance; }) {
	return (
		<div className={styles.portrait}>
			<img src="/assets/Player_H.PNG" alt="" />
		</div>
	);
}

function RollDice() {
	return (Math.floor(Math.random() * 6) + 1) as DiceValue;
}