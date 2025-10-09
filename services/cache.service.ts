import { Cache } from "@/cache";
import { Logger } from "@/log";
import { cacheParameter, TTL_SECONDS } from "@/constants";
import { CacheParameter, CachePayloadGenerator, IUser } from "@/types";

export class CacheService {
	/**
	 * Fetches a value from the cache by key,
	 * or executes a callback to retrieve the value if it's not cached
	 * and stores it in the cache for the specified time-to-live.
	 *
	 * @param {string} key - The cache key to fetch the value for.
	 * @param {(_?: any) => Promise<T>} callback - A callback function to execute if the value is not cached.
	 * @param {number} ttl - The time-to-live for the cache entry in seconds.
	 * @return {Promise<T>} The cached or newly retrieved value.
	 */
	public static async fetch<T>(
		key: string,
		callback: () => Promise<T>,
		ttl: number = TTL_SECONDS
	): Promise<T> {
		if (key.length > 0 && key !== "undefined" && key !== "null") {
			const cachedValue = Cache.get<T>(key);
			if (cachedValue) {
				Logger.debug(`Cache hit for ${key}`);
				return cachedValue;
			}
			Logger.debug(`Cache miss for ${key}`);
			const newValue = await callback();
			Cache.set<T>(key, newValue, ttl);
			return newValue;
		} else {
			return callback();
		}
	}

	public static getKey<T extends CacheParameter>(
		parameter: T,
		data: CachePayloadGenerator<T>
	): string {
		if (parameter === cacheParameter.USER) {
			const payload = data as CachePayloadGenerator<"USER">;
			if ("id" in payload) {
				return `user:${payload.id}`;
			} else if ("email" in payload) {
				return `user:${payload.email}`;
			}
			throw new Error("Invalid data: id or email is missing");
		} else if (parameter === cacheParameter.AUTH_MAPPING) {
			const payload = data as CachePayloadGenerator<"AUTH_MAPPING">;
			if ("id" in payload) {
				return `auth-mapping:${payload.id}`;
			} else if ("identifier" in payload && "provider" in payload) {
				return `auth-mapping:${payload.provider}:${payload.identifier}`;
			}
			throw new Error(
				"Invalid data: id or identifier and provider are missing"
			);
		} else if (parameter === cacheParameter.EXPENSE) {
			const payload = data as CachePayloadGenerator<"EXPENSE">;
			return `expense:${payload.id}`;
		} else if (parameter === cacheParameter.GROUP) {
			const payload = data as CachePayloadGenerator<"GROUP">;
			return `group:${payload.id}`;
		} else if (parameter === cacheParameter.GROUP_DETAILS) {
			const payload = data as CachePayloadGenerator<"GROUP_DETAILS">;
			return `group-details:${payload.id}`;
		} else if (parameter === cacheParameter.MEMBER) {
			const payload = data as CachePayloadGenerator<"MEMBER">;
			return `member:${payload.id}`;
		} else if (parameter === cacheParameter.USER_GROUPS) {
			const payload = data as CachePayloadGenerator<"USER_GROUPS">;
			return `user-groups:${payload.userId}`;
		} else if (parameter === cacheParameter.GROUP_EXPENSES) {
			const payload = data as CachePayloadGenerator<"GROUP_EXPENSES">;
			return `group-expenses:${payload.groupId}`;
		} else {
			return `cache:${parameter}:${JSON.stringify(data)}`;
		}
	}

	public static getAllCacheData(): { [key: string]: any } {
		return Cache.getAllKeys().reduce((obj, key) => {
			return {
				...obj,
				[key]: Cache.get(key),
			};
		}, {});
	}

	public static setUser(keyGen: CachePayloadGenerator<"USER">, value: IUser) {
		const key = this.getKey(cacheParameter.USER, keyGen);
		Cache.set(key, value);
	}

	public static async fetchUser(
		keyGen: CachePayloadGenerator<"USER">,
		callback: () => Promise<IUser | null>
	) {
		return await CacheService.fetch(
			this.getKey(cacheParameter.USER, keyGen),
			callback
		);
	}

	public static invalidateUser(keyGen: CachePayloadGenerator<"USER">) {
		Cache.invalidate(this.getKey(cacheParameter.USER, keyGen));
	}

	public static clearAllCacheData() {
		Cache.flushAll();
	}
}
