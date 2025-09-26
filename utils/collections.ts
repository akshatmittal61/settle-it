export class CollectionUtils {
	public static isEmpty<T>(collection: Array<T> | null | undefined): boolean {
		return (
			collection === null ||
			collection === undefined ||
			collection.length === 0
		);
	}

	public static isNotEmpty<T>(collection: Array<T>): boolean {
		return !CollectionUtils.isEmpty(collection);
	}
}
