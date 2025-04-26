import { useEffect, useRef } from "react";
import { gsap } from "gsap"; // To animate the movement
import "./Dice.css";

export function Dice(props: { value: null | DiceValue; }) {
	const diceRef = useRef<HTMLDivElement>(null);
	const rollingAnimation = useRef<gsap.core.Tween | null>(null);

	useEffect(() => {
		if (!diceRef.current) return;

		if (props.value == null) {
			const rollAmount = 360;// 180 + Math.random() * 180;
			rollingAnimation.current = gsap.to(diceRef.current, {
				rotationX: `+=${rollAmount}`,
				rotationY: `+=${rollAmount}`, // Randomize direction
				rotationZ: (30), // Adds wobble
				duration: 0.6 + Math.random() * 0.1, // Slight variation in speed
				repeat: -1,
				ease: "linear",
			});
		} else {
			rollingAnimation.current?.kill();

			const currX = (gsap.getProperty(diceRef.current, "rotationX") as number) % 360;
			const currY = (gsap.getProperty(diceRef.current, "rotationY") as number) % 360;
			// const currZ = (gsap.getProperty(diceRef.current, "rotationZ") as number) % 360;

			gsap.fromTo(diceRef.current, {
				rotationX: currX,
				rotationY: currY,
			}, {
				duration: 1,
				rotationX: nextClosest(currX, props.value, "x"),
				rotationY: nextClosest(currY, props.value, "y"),
				rotationZ: 0, // Reset Z to avoid weird tilts
				ease: "power2.out",
			});
		}
	}, [props.value]);

	return (
		<div className="container">
			<div className={`cube`} ref={diceRef}>
				<Side side="front" value={SideValues.front} />
				<Side side="back" value={SideValues.back} />
				<Side side="right" value={SideValues.right} />
				<Side side="left" value={SideValues.left} />
				<Side side="top" value={SideValues.top} />
				<Side side="bottom" value={SideValues.bottom} />
			</div>
		</div>
	);
}

function Side(props: { side: SideNames; value: DiceValue; }) {
	let gridAreas;
	switch (props.value) {
		case 1: gridAreas = "    .    "; break;
		case 2: gridAreas = " .     . "; break;
		case 3: gridAreas = " .  .  . "; break;
		case 4: gridAreas = ". .   . ."; break;
		case 5: gridAreas = ". . . . ."; break;
		case 6: gridAreas = ". .. .. ."; break;
	}

	return (
		<div className={`${props.side} side`}>
			{gridAreas.split("").map((col, j) => (
				<div key={j} className={col === "." ? "dot" : ""}></div>
			))}
		</div>
	);
}


const faceRotations = {
	1: { x: 0, y: 0 },
	2: { x: 270, y: 0 },
	3: { x: 0, y: 270 },
	4: { x: 0, y: 90 },
	5: { x: 90, y: 0 },
	6: { x: 180, y: 0 },
} as const;
function nextClosest(current: number, value: DiceValue, axis: "x" | "y"): number {
	const target = faceRotations[value][axis];
	if (current < target) return target;
	else return target + 360;
}

export type DiceValue = 1 | 2 | 3 | 4 | 5 | 6;

const enum SideValues {
	front = 1,
	back = 6,
	right = 4,
	left = 3,
	top = 5,
	bottom = 2,
}
type SideNames = keyof typeof SideValues;