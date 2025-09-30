export class CollectionUtils {
	public static EMPTY = [];

	public static isEmpty<T>(
		collection: T[] | null | undefined
	): collection is null | undefined | [] {
		return (
			collection === null ||
			collection === undefined ||
			!Array.isArray(collection) ||
			collection.length === 0
		);
	}

	public static isNotEmpty<T>(
		collection: T[] | null | undefined
	): collection is T[] {
		return !CollectionUtils.isEmpty(collection);
	}

	public static valueOf<T>(input: any): T[] {
		if (!Array.isArray(input)) {
			throw new Error(
				`${input} of type ${typeof input} is not a valid array!`
			);
		}
		return input;
	}

	public static getSingletonValue<T>(input: T[]): T {
		if (input.length !== 1) {
			throw new Error(`${input} is not a singleton array!`);
		}
		return input[0];
	}
}
