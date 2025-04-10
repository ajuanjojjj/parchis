import { InvalidSquareError, type BoardInterface } from "./BoardInterface";

export class Board4x_SVG implements BoardInterface {
	private boardSize: number; // Size of the board in pixels

	constructor(boardSize: number) {
		this.boardSize = boardSize; // Set the size of each square
	}

	getCoordinates(square: number, memberCount: number, nthMember: number): { x: number; y: number; } {
		if (Board_Positions[square] == null) throw new InvalidSquareError(`Invalid square: ${square}.`);
		if (memberCount < 0 || nthMember < 0) {
			throw new RangeError(`Invalid member count or nth member: ${memberCount}, ${nthMember}. Must be positive numbers.`);
		}

		const { x, y, orientation } = Board_Positions[square];
		const cellWidth = (7 / 63) * 1000;
		const cellHeight = (3 / 63) * 1000;
		const offsetWide = (cellWidth / (memberCount + 1)) * (nthMember + 1);
		const offsetTall = cellHeight / 2;
		if (orientation == "N") return { x: x + offsetWide, y: y + offsetTall };
		if (orientation == "S") return { x: x - offsetWide, y: y - offsetTall };
		if (orientation == "E") return { x: x - offsetTall, y: y + offsetWide };
		if (orientation == "W") return { x: x + offsetTall, y: y - offsetWide };
		if (orientation == "HOME") return { x: x, y: y };

		return { x: x, y: y };
	}

	getSquare(coordinates: { x: number; y: number; }, wiggleRoom: number): number | null {
		const actualNearest = Board_Positions_Values
			.filter((a) => {
				const aDist = this.distance(a, coordinates.x, coordinates.y);
				return aDist <= (wiggleRoom / 100) * this.boardSize; // Check if within wiggle room
			})
			.sort((a, b) => {
				const aDist = this.distance(a, coordinates.x, coordinates.y);
				const bDist = this.distance(b, coordinates.x, coordinates.y);
				return aDist - bDist;
			})[0];

		if (actualNearest) {
			return actualNearest.id; // Return the square id
		} else {
			return null; // No square found within wiggle room
		}
	}


	get startsAtRelative(): number {
		return 5; // Starting square index
	}

	get endsTravelAfter(): number {
		return 64; // Last square index
	}

	get endsTubeAfter(): number {
		return 8; // Assuming no special tube logic
	}


	private distance(a: ISquare, x: number, y: number) {
		const centered = this.centerOf(a);
		return Math.abs(centered.x - x) + Math.abs(centered.y - y);
	}
	private centerOf(square: ISquare): { x: number; y: number; } {
		const { x, y, orientation } = square;
		const cellWidth = (3.5 / 63) * 1000;
		const cellHeight = (1.5 / 63) * 1000;

		if (orientation == "N") return { x: x + cellWidth, y: y + cellHeight };
		if (orientation == "S") return { x: x - cellWidth, y: y - cellHeight };
		if (orientation == "E") return { x: x - cellHeight, y: y + cellWidth };
		if (orientation == "W") return { x: x + cellHeight, y: y - cellWidth };
		if (orientation == "HOME") return { x: x, y: y };

		throw new Error("Invalid orientation: " + orientation); // This should never happen
	}

}


const convert = (val: number) => (1000 / 63) * (val);
const Board_Positions_SVG: Record<number, ISquare> = {
	"1": { x: 35, y: 60, id: 1, orientation: "N" },
	"2": { x: 35, y: 57, id: 2, orientation: "N" },
	"3": { x: 35, y: 54, id: 3, orientation: "N" },
	"4": { x: 35, y: 51, id: 4, orientation: "N" },
	"5": { x: 35, y: 48, id: 5, orientation: "N" },
	"6": { x: 35, y: 45, id: 6, orientation: "N" },
	"7": { x: 35, y: 42, id: 7, orientation: "N" },
	"8": { x: 35, y: 39, id: 8, orientation: "N" },
	"9": { x: 39, y: 42, id: 9, orientation: "W" },
	"10": { x: 42, y: 42, id: 10, orientation: "W" },
	"11": { x: 45, y: 42, id: 11, orientation: "W" },
	"12": { x: 48, y: 42, id: 12, orientation: "W" },
	"13": { x: 51, y: 42, id: 13, orientation: "W" },
	"14": { x: 54, y: 42, id: 14, orientation: "W" },
	"15": { x: 57, y: 42, id: 15, orientation: "W" },
	"16": { x: 60, y: 42, id: 16, orientation: "W" },
	"17": { x: 60, y: 35, id: 17, orientation: "W" },
	"18": { x: 60, y: 28, id: 18, orientation: "W" },
	"19": { x: 57, y: 28, id: 19, orientation: "W" },
	"20": { x: 54, y: 28, id: 20, orientation: "W" },
	"21": { x: 51, y: 28, id: 21, orientation: "W" },
	"22": { x: 48, y: 28, id: 22, orientation: "W" },
	"23": { x: 45, y: 28, id: 23, orientation: "W" },
	"24": { x: 42, y: 28, id: 24, orientation: "W" },
	"25": { x: 39, y: 28, id: 25, orientation: "W" },
	"26": { x: 42, y: 24, id: 26, orientation: "S" },
	"27": { x: 42, y: 21, id: 27, orientation: "S" },
	"28": { x: 42, y: 18, id: 28, orientation: "S" },
	"29": { x: 42, y: 15, id: 29, orientation: "S" },
	"30": { x: 42, y: 12, id: 30, orientation: "S" },
	"31": { x: 42, y: 9, id: 31, orientation: "S" },
	"32": { x: 42, y: 6, id: 32, orientation: "S" },
	"33": { x: 42, y: 3, id: 33, orientation: "S" },
	"34": { x: 35, y: 3, id: 34, orientation: "S" },
	"35": { x: 28, y: 3, id: 35, orientation: "S" },
	"36": { x: 28, y: 6, id: 36, orientation: "S" },
	"37": { x: 28, y: 9, id: 37, orientation: "S" },
	"38": { x: 28, y: 12, id: 38, orientation: "S" },
	"39": { x: 28, y: 15, id: 39, orientation: "S" },
	"40": { x: 28, y: 18, id: 40, orientation: "S" },
	"41": { x: 28, y: 21, id: 41, orientation: "S" },
	"42": { x: 28, y: 24, id: 42, orientation: "S" },
	"43": { x: 24, y: 21, id: 43, orientation: "E" },
	"44": { x: 21, y: 21, id: 44, orientation: "E" },
	"45": { x: 18, y: 21, id: 45, orientation: "E" },
	"46": { x: 15, y: 21, id: 46, orientation: "E" },
	"47": { x: 12, y: 21, id: 47, orientation: "E" },
	"48": { x: 9, y: 21, id: 48, orientation: "E" },
	"49": { x: 6, y: 21, id: 49, orientation: "E" },
	"50": { x: 3, y: 21, id: 50, orientation: "E" },
	"51": { x: 3, y: 28, id: 51, orientation: "E" },
	"52": { x: 3, y: 35, id: 52, orientation: "E" },
	"53": { x: 6, y: 35, id: 53, orientation: "E" },
	"54": { x: 9, y: 35, id: 54, orientation: "E" },
	"55": { x: 12, y: 35, id: 55, orientation: "E" },
	"56": { x: 15, y: 35, id: 56, orientation: "E" },
	"57": { x: 18, y: 35, id: 57, orientation: "E" },
	"58": { x: 21, y: 35, id: 58, orientation: "E" },
	"59": { x: 24, y: 35, id: 59, orientation: "E" },
	"60": { x: 21, y: 39, id: 60, orientation: "N" },
	"61": { x: 21, y: 42, id: 61, orientation: "N" },
	"62": { x: 21, y: 45, id: 62, orientation: "N" },
	"63": { x: 21, y: 48, id: 63, orientation: "N" },
	"64": { x: 21, y: 51, id: 64, orientation: "N" },
	"65": { x: 21, y: 54, id: 65, orientation: "N" },
	"66": { x: 21, y: 57, id: 66, orientation: "N" },
	"67": { x: 21, y: 60, id: 67, orientation: "N" },
	"68": { x: 28, y: 60, id: 68, orientation: "N" },










	"1001": { x: 7, y: 7, id: 1001, orientation: "HOME" },
	"1002": { x: 7, y: 14, id: 1002, orientation: "HOME" },
	"1003": { x: 14, y: 7, id: 1003, orientation: "HOME" },
	"1004": { x: 14, y: 14, id: 1004, orientation: "HOME" },
	"2001": { x: 49, y: 49, id: 2001, orientation: "HOME" },
	"2002": { x: 49, y: 56, id: 2002, orientation: "HOME" },
	"2003": { x: 56, y: 49, id: 2003, orientation: "HOME" },
	"2004": { x: 56, y: 56, id: 2004, orientation: "HOME" },
	"3001": { x: 49, y: 7, id: 3001, orientation: "HOME" },
	"3002": { x: 49, y: 14, id: 3002, orientation: "HOME" },
	"3003": { x: 56, y: 7, id: 3003, orientation: "HOME" },
	"3004": { x: 56, y: 14, id: 3004, orientation: "HOME" },
	"4001": { x: 7, y: 49, id: 4001, orientation: "HOME" },
	"4002": { x: 14, y: 49, id: 4002, orientation: "HOME" },
	"4003": { x: 7, y: 56, id: 4003, orientation: "HOME" },
	"4004": { x: 14, y: 56, id: 4004, orientation: "HOME" },

	"1101": { x: 28, y: 57, id: 1101, orientation: "N" },
	"1102": { x: 28, y: 54, id: 1102, orientation: "N" },
	"1103": { x: 28, y: 51, id: 1103, orientation: "N" },
	"1104": { x: 28, y: 48, id: 1104, orientation: "N" },
	"1105": { x: 28, y: 45, id: 1105, orientation: "N" },
	"1106": { x: 28, y: 42, id: 1106, orientation: "N" },
	"1107": { x: 28, y: 39, id: 1107, orientation: "N" },
	// "1501": { x: 31, y: 25.25, id: 1501, orientation: "N" },
	// "1502": { x: 28, y: 25.25, id: 1502, orientation: "N" },
	// "1503": { x: 34, y: 25.25, id: 1503, orientation: "N" },
	// "1504": { x: 31, y: 28.5, id: 1504, orientation: "N" },
	"2101": { x: 57, y: 35, id: 2101, orientation: "W" },
	"2102": { x: 54, y: 35, id: 2102, orientation: "W" },
	"2103": { x: 51, y: 35, id: 2103, orientation: "W" },
	"2104": { x: 48, y: 35, id: 2104, orientation: "W" },
	"2105": { x: 45, y: 35, id: 2105, orientation: "W" },
	"2106": { x: 42, y: 35, id: 2106, orientation: "W" },
	"2107": { x: 39, y: 35, id: 2107, orientation: "W" },
	// "2501": { x: 31, y: 36.75, id: 2501, orientation: "W" },
	// "2502": { x: 28, y: 36.75, id: 2502, orientation: "W" },
	// "2503": { x: 34, y: 36.75, id: 2503, orientation: "W" },
	// "2504": { x: 31, y: 33.5, id: 2504, orientation: "W" },
	"3101": { x: 35, y: 24, id: 3101, orientation: "S" },
	"3102": { x: 35, y: 21, id: 3102, orientation: "S" },
	"3103": { x: 35, y: 18, id: 3103, orientation: "S" },
	"3104": { x: 35, y: 15, id: 3104, orientation: "S" },
	"3105": { x: 35, y: 12, id: 3105, orientation: "S" },
	"3106": { x: 35, y: 9, id: 3106, orientation: "S" },
	"3107": { x: 35, y: 6, id: 3107, orientation: "S" },
	// "3501": { x: 36.75, y: 31, id: 3501, orientation: "S" },
	// "3502": { x: 36.75, y: 27.75, id: 3502, orientation: "S" },
	// "3503": { x: 36.75, y: 34.25, id: 3503, orientation: "S" },
	// "3504": { x: 33.5, y: 31, id: 3504, orientation: "S" },
	"4101": { x: 24, y: 28, id: 4101, orientation: "E" },
	"4102": { x: 21, y: 28, id: 4102, orientation: "E" },
	"4103": { x: 18, y: 28, id: 4103, orientation: "E" },
	"4104": { x: 15, y: 28, id: 4104, orientation: "E" },
	"4105": { x: 12, y: 28, id: 4105, orientation: "E" },
	"4106": { x: 9, y: 28, id: 4106, orientation: "E" },
	"4107": { x: 6, y: 28, id: 4107, orientation: "E" },
	// "4501": { x: 25.25, y: 31, id: 4501, orientation: "E" },
	// "4502": { x: 25.25, y: 27.75, id: 4502, orientation: "E" },
	// "4503": { x: 25.25, y: 34.25, id: 4503, orientation: "E" },
	// "4504": { x: 28.5, y: 31, id: 4504, orientation: "E" },
};
const Board_Positions = Object.entries(Board_Positions_SVG).reduce((acc, [_key, value]) => {
	value.x = convert(value.x); // Convert x to the new scale
	value.y = convert(value.y); // Convert y to the new scale
	acc[value.id] = value; // Convert x and y to the new scale
	return acc;
}, {} as Record<number, ISquare>);
const Board_Positions_Values = Object.values(Board_Positions);
interface ISquare {
	x: number;
	y: number;
	id: number;
	orientation: "N" | "S" | "E" | "W" | "HOME";
}