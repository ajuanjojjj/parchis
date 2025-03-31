import PixiBoard from '../../components/PixiBoard';
import { Player } from '../../components/Player/Player';
import styles from './Game.module.css';

function App() {
	return (
		<div className={styles.game}>
			<Player id={styles.P1} />
			<Player id={styles.P2} />
			<PixiBoard id={styles.Board} />
			<Player id={styles.P3} />
			<Player id={styles.P4} />
		</div>
	);
}





export default App;
