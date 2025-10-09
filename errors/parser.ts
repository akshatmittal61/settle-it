export class ParserSafetyError extends Error {
	public method: string;
	public found: any;

	constructor(message: string, method: string, found: any) {
		super(message);
		this.method = method;
		this.found = found;
		this.name = "ParserSafetyError";
	}
}
