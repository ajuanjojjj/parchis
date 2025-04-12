import { useEffect, useState } from 'react';
import PixiBoard from '../../components/Board/PixiBoard';
import { Player } from '../../components/Player/Player';
import styles from './Game.module.css';
import type { PlayerInstance } from '../../components/Player/PlayerInstance';
import type { BoardInterface } from '../../components/Board/BoardInterface';
import { Board4x_SVG } from '../../components/Board/Board4x_SVG';

function App() {
	const [players, setPlayers] = useState(new Array<PlayerInstance>(4));
	const [board, setBoard] = useState<BoardInterface | null>(null);

	useEffect(() => {
		// Initialize players here if needed
		const playerInstances: PlayerInstance[] = [
			{
				type: 'local',
				id: 1,
				triggerDiceRoll: () => { },
				movePiece: (pieceId: number, newPosition: number) => { },
				canDiceRoll: true,
			},
			{
				type: 'local',
				id: 2,
				triggerDiceRoll: () => { },
				movePiece: (pieceId: number, newPosition: number) => { },
				canDiceRoll: true,
			},
			{
				type: 'local',
				id: 3,
				triggerDiceRoll: () => { },
				movePiece: (pieceId: number, newPosition: number) => { },
				canDiceRoll: true,
			},
			{
				type: 'local',
				id: 4,
				triggerDiceRoll: () => { },
				movePiece: (pieceId: number, newPosition: number) => { },
				canDiceRoll: true,
			},
		];
		setPlayers(playerInstances);
	}, []);

	useEffect(() => {
		// Initialize board here if needed
		setBoard(new Board4x_SVG(1000));
	}, []);

	return (
		<div className={styles.game}>
			<PixiBoard id={styles.Board} board={board} />

			{players.map((player) => (
				<Player key={player.id} player={player} />
			))}
		</div>
	);
}

export default App;
