import PixiBoard from '../../components/Board/PixiBoard';
import { Player } from '../../components/Player/Player';
import styles from './Game.module.css';

function App() {
	return (
		<div className={styles.game}>
			<Player id={styles.P1} player={1} />
			<Player id={styles.P2} player={2} />
			<PixiBoard id={styles.Board} />
			<Player id={styles.P3} player={3} />
			<Player id={styles.P4} player={4} />
		</div>
	);
}





export default App;
