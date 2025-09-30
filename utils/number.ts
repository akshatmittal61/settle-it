export class NumberUtils {
	public static isEmpty(num: number | null | undefined): boolean {
		return num === null || num === undefined;
	}

	public static isNotEmpty(num: number | null | undefined): boolean {
		return !NumberUtils.isEmpty(num);
	}

	public static isNonNegativeNumber(num: number): boolean {
		return NumberUtils.isNotEmpty(num) && num >= 0;
	}

	public static isNegativeNumber(num: number): boolean {
		return NumberUtils.isNotEmpty(num) && num < 0;
	}

	public static isNonPositiveNumber(num: number): boolean {
		return NumberUtils.isNotEmpty(num) && num <= 0;
	}

	public static isPositiveNumber(num: number): boolean {
		return NumberUtils.isNotEmpty(num) && num > 0;
	}
}
