import { ParserSafetyError } from "@/errors";
import { StringUtils } from "./string";
import { NumberUtils } from "./number";

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
		if (SafetyUtils.isNonNull(input)) {
			return input;
		}
		throw new ParserSafetyError(
			`${input} is null!`,
			"SafetyUtils.getNonNullValue",
			input
		);
	}

	public static isNonNull<T>(input: T): input is NonNullable<T> {
		if (input === null || input === undefined) return false;
		if (typeof input === "undefined") return false;
		if (typeof input === "string") return StringUtils.isNotEmpty(input);
		if (typeof input === "number") return NumberUtils.isNotEmpty(input);
		return true;
	}

	public static getNonNullValueOrElse<T>(
		input: T | undefined | null,
		fallback: T
	): T {
		try {
			const value = SafetyUtils.getNonNullValue<T>(input);
			return value;
		} catch (e) {
			if (e instanceof ParserSafetyError) {
				return fallback;
			}
			throw e;
		}
	}
}
