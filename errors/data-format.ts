export class InvalidDataFormatException extends Error {
	found: string;
	expected: string;

	constructor(found: string, excepted: string) {
		super("Invalid data format");
		this.found = found;
		this.expected = excepted;
		this.message = `InvalidDataFormatException: Found: ${found}, Excepted: ${excepted}`;
	}
}
