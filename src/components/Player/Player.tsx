import styles from './Player.module.css';

export function Player(props: { id: string; className?: string; }) {
	return (
		<div id={props.id}>
			<PlayerLandscape />
			<PlayerPortrait />
		</div>
	);
}

function PlayerLandscape() {
	return (
		<div className={styles.landscape}>
			<img src="/assets/Player_V.PNG" alt="" />
		</div>
	);
}
function PlayerPortrait() {
	return (
		<div className={styles.portrait}>
			<img src="/assets/Player_H.PNG" alt="" />
		</div>
	);
}	