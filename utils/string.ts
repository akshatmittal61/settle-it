export class StringUtils {
	public static isEmpty(str: string | null | undefined): boolean {
		return str === null || str === undefined || str.trim().length === 0;
	}

	public static isNotEmpty(str: string | null | undefined): boolean {
		return !StringUtils.isEmpty(str);
	}
}
