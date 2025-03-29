import PixiBoard from '../../components/PixiBoard';
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



//
function Player(props: { id: string; }) {
	return (
		<div id={props.id}>
			<img src="/assets/Player_H.PNG" className={styles.portrait} alt="" />
			<img src="/assets/Player_V.PNG" className={styles.landscape} alt="" />
		</div>
	);
}


export default App;
