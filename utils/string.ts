import { ParserSafetyError } from "@/errors";

export class StringUtils {
	public static EMPTY = "";

	public static equals(
		str1: string | null | undefined,
		str2: string | null | undefined
	): boolean {
		if (StringUtils.isNotEmpty(str1) && StringUtils.isNotEmpty(str2)) {
			return str1.length === str2.length && str1 === str2;
		} else if (StringUtils.isEmpty(str1) && StringUtils.isEmpty(str2)) {
			return true;
		}
		return false;
	}

	public static notEquals(
		str1: string | null | undefined,
		str2: string | null | undefined
	): boolean {
		return !StringUtils.equals(str1, str2);
	}

	public static equalsIgnoreCase(str1: string, str2: string): boolean {
		return str1.toLowerCase() === str2.toLowerCase();
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
				`${input} is an empty string!`,
				"StringUtils.getNonEmptyString",
				input
			);
		}
		return output;
	}
}
