import { useMemo, useSyncExternalStore } from 'react';
import { PixiBoard } from '../../components/Board/PixiBoard';
import { MemoPlayerElement } from '../../components/Player/Player';
import styles from './Game.module.css';
import { Board4x_SVG } from '../../components/Board/Board4x_SVG';
import { Parchis } from '../../ts/Parchis';
import { usePixiApp } from '../../hooks/usePixiApp';

function App() {
	const app = usePixiApp(1000);

	const board = useMemo(() => new Board4x_SVG(1000), []);
	const game = useMemo(() => new Parchis(board), [board]);
	const playersArr = useSyncExternalStore(game.players.subscribe, game.players.values);

	return (
		<div className={styles.game}>
			<PixiBoard id={styles.Board} board={board} app={app} />

			{playersArr.map((player) => (
				<MemoPlayerElement key={player.playerId} player={player} />
			))}
		</div>
	);
}

export default App;
