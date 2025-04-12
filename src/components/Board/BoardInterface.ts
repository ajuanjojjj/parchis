export interface BoardInterface {
	/**
	 * Gets the coordinates for a given square.
	 * @param square The square number to get the coordinates for.
	 * @param memberCount The number of members in the square.
	 * @param nthMember The 0-indexed id of the member in the square.
	 * @returns The coordinates for the center of a piece.
	 * 
	 * @throws {InvalidSquareError} if the square does not exist on the board that the class represents.
	 * @throws {TypeError} If any parameter does not match the expected type.
	 * @throws {RangeError} if memberCount or nthMember are not positive numbers.
	 */
	getCoordinates(square: number, memberCount: number, nthMember: number): { x: number, y: number; };

	/**
	 * Gets the square number from the coordinates. 
	 * @param coordinates The coordinates being checked.
	 * @param wiggleRoom Percentage of wiggle room to allow when checking the coordinates. Too few pixels, and players need to be precise. Too much, and theres no way of "canceling" a move. Negative values will throw a RangeError.
	 * @returns The square id, or null if there's no square within the wiggle room.
	 * 
	 * @safe This function only throws an error if called incorrectly, throwing RangeError or TypeError.
	 */
	getSquare(coordinates: { x: number, y: number; }, wiggleRoom: number): number | null;

	/** 
	 * The position to which the piece will move when leaving "home".
	 * @description On normal 4 player parchis, this is **5**: Yellow will drop its piece at square 5.
	 */
	get startsAtRelative(): number;

	/** 
	 * The number of squares to move before reaching the tube. 
	 * @description On normal 4 player parchis, this is **64**: There are 64 "moves" from square 5 to square 68.
	 */
	get endsTravelAfter(): number;

	/** 
	 * The number of squares to move before reaching the tube. 
	 * @description On normal 4 player parchis, this is **8**: There are 8 "moves" from square 68 to the win square.
	 */
	get endsTubeAfter(): number;

	get backgroundURL(): string;
}

export class InvalidSquareError extends Error {
	name = "InvalidSquareError" as const;
	constructor(message: string) {
		super(message);
	}
}