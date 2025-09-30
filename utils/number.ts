import { ParserSafetyError } from "@/errors";

export class NumberUtils {
	public static isEmpty(
		num: number | null | undefined
	): num is null | undefined {
		return num === null || num === undefined;
	}

	public static isNotEmpty<T extends number | null | undefined>(
		num: T
	): num is T extends number ? T & number : never {
		return !NumberUtils.isEmpty(num as number | null | undefined);
	}

	public static isNonNegativeNumber(
		num: number | null | undefined
	): num is number {
		return NumberUtils.isNotEmpty(num) && num >= 0;
	}

	public static isNegativeNumber(
		num: number | null | undefined
	): num is number {
		return NumberUtils.isNotEmpty(num) && num < 0;
	}

	public static isNonPositiveNumber(
		num: number | null | undefined
	): num is number {
		return NumberUtils.isNotEmpty(num) && num <= 0;
	}

	public static isPositiveNumber(
		num: number | null | undefined
	): num is number {
		return NumberUtils.isNotEmpty(num) && num > 0;
	}

	public static valueOf(input: any): number {
		if (typeof input !== "string" && typeof input !== "number") {
			throw new ParserSafetyError(
				`${input} of type ${typeof input} is not a valid number!`,
				"NumberUtils.getNumber",
				input
			);
		}

		const int = Number(`${input}`);
		if (isNaN(int)) {
			throw new ParserSafetyError(
				`${input} of type ${typeof input} is not a valid number!`,
				"NumberUtils.getNumber",
				input
			);
		}

		return int;
	}

	public static getNonNegativeNumber(input: any): number {
		const int = NumberUtils.valueOf(input);

		if (NumberUtils.isNegativeNumber(int)) {
			throw new ParserSafetyError(
				`${int} is not a non-negative number!`,
				"NumberUtils.getNonNegativeNumber",
				input
			);
		}

		return int;
	}
}
