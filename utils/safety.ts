import { ParserSafetyError } from "@/errors";

export class SafetyUtils {
	public static genericParse<T>(parse: (_: any) => T, input: any): T {
		try {
			return parse(input);
		} catch (e) {
			if (e instanceof ParserSafetyError) {
				throw e;
			}
			throw new ParserSafetyError(
				`Invalid input: ${input}`,
				parse.name,
				input
			);
		}
	}

	public static safeParse<T>(parse: (_: any) => T, input: any): T | null {
		try {
			return parse(input);
		} catch {
			return null;
		}
	}

	public static getNonNullValue<T>(input: T | undefined | null): T {
		if (input === null || input === undefined) {
			throw new ParserSafetyError(
				`${input} is null!`,
				"SafetyUtils.getNonNullValue",
				input
			);
		}
		return input;
	}
}
