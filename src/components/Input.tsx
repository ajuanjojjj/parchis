import { useState } from "react";


export function Input(props: { title: string, onComplete: (result: string) => (void | Promise<void>); }) {
	const [answer, setAnswer] = useState("");
	const onComplete = () => {
		if (answer) {
			props.onComplete(answer);
		} else {
			alert("Please enter a valid answer.");
		}
	};

	return (
		<div>
			<h3>{props.title}</h3>
			<textarea onChange={(e) => setAnswer(e.target.value)} placeholder="Paste answer here"></textarea>
			<br />
			<button onClick={onComplete}>Set Answer</button>
		</div>
	);
}