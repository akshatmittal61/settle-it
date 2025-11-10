import { ParserSafetyError } from "@/errors";

export class StringUtils {
	public static EMPTY = "";

	public static equals<T extends string | null | undefined>(
		str1: T,
		str2: T
	): boolean {
		if (StringUtils.isNotEmpty(str1) && StringUtils.isNotEmpty(str2)) {
			return str1.length === str2.length && str1 === str2;
		} else if (StringUtils.isEmpty(str1) && StringUtils.isEmpty(str2)) {
			return true;
		}
		return false;
	}

	public static notEquals<T extends string | null | undefined>(
		str1: T,
		str2: T
	): boolean {
		return !StringUtils.equals(str1, str2);
	}

	public static equalsIgnoreCase<T extends string | null | undefined>(
		str1: T,
		str2: T
	): boolean {
		if (this.equals(str1, str2)) {
			return true;
		}
		if (StringUtils.isNotEmpty(str1) && StringUtils.isNotEmpty(str2)) {
			return (
				str1.length === str2.length &&
				str1.toLowerCase() === str2.toLowerCase()
			);
		} else if (StringUtils.isEmpty(str1) && StringUtils.isEmpty(str2)) {
			return true;
		} else {
			return false;
		}
	}

	public static isEmpty(
		str: string | null | undefined
	): str is null | undefined | "" {
		return (
			str === null ||
			str === undefined ||
			str.trim() === StringUtils.EMPTY
		);
	}

	public static isNotEmpty<T extends string | null | undefined>(
		str: T
	): str is T extends string ? T & string : never {
		return !this.isEmpty(str);
	}

	public static valueOf<T extends string>(input: any): T {
		// TODO: Replace with zod
		if (typeof input !== "string") {
			throw new ParserSafetyError(
				`${input} of type ${typeof input} is not a valid string!`,
				"StringUtils.getString",
				input
			);
		}
		return input as T;
	}

	public static getNonEmptyString<T extends string>(input: any): T {
		const output = StringUtils.valueOf<T>(input);
		if (StringUtils.isEmpty(output)) {
			throw new ParserSafetyError(
				`'${output}' is an empty string!`,
				"StringUtils.getNonEmptyString",
				input
			);
		}
		return output;
	}

	public static getNonEmptyStringOrElse<T extends string>(
		input: any,
		fallback: T
	): T {
		try {
			const value = StringUtils.valueOf<T>(input);
			if (StringUtils.isNotEmpty(value)) {
				return value;
			} else {
				return fallback;
			}
		} catch (e) {
			if (e instanceof ParserSafetyError) {
				return fallback;
			}
			throw e;
		}
	}
}
