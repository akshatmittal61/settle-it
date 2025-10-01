import { ParserSafetyError } from "@/errors";

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
			throw new ParserSafetyError(
				`${input} of type ${typeof input} is not a valid array!`,
				"CollectionUtils.valueOf",
				input
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

	public static getUniqueValues<T>(input: T[]): T[] {
		return Array.from(new Set(input));
	}

	public static isSubset<T = any>(
		subset: Array<T>,
		superset: Array<T>
	): boolean {
		return subset.every((value) => superset.includes(value));
	}
}
