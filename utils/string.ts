export class StringUtils {
	public static isEmpty(str: string): boolean {
		return str === null || str === undefined || str.trim().length === 0;
	}

	public static isNotEmpty(str: string): boolean {
		return !StringUtils.isEmpty(str);
	}
}
