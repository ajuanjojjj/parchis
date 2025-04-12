import { useEffect, useState } from 'react';
import { PixiBoard } from '../../components/Board/PixiBoard';
import { PlayerElement } from '../../components/Player/Player';
import styles from './Game.module.css';
import { Board4x_SVG } from '../../components/Board/Board4x_SVG';
import { AddPlayer, type PlayerInterface } from '../../ts/Parchis';

function App() {
	const [players, setPlayers] = useState(new Array<PlayerInterface>(4));
	const board = new Board4x_SVG(1000);

	useEffect(() => {
		// Initialize players here if needed
		const playerInstances: PlayerInterface[] = [
			new AddPlayer(1),
			new AddPlayer(2),
			new AddPlayer(3),
			new AddPlayer(4),
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		];
		setPlayers(playerInstances);
	}, []);

	return (
		<div className={styles.game}>
			<PixiBoard id={styles.Board} board={board} setPlayers={setPlayers} />

			{players.map((player) => (
				<PlayerElement key={player.playerId} playerId={player.playerId} player={player} />
			))}
		</div>
	);
}

export default App;
