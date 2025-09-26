import { CacheParameter } from "@/types";
import { getEnumeration } from "@/utils";

// Maximum TTL for cache in seconds - 24 hours
export const TTL_SECONDS = 60 * 60 * 24;

export const CHECK_INTERVAL = 2 * TTL_SECONDS;

export const MAX_KEYS = 20000;

export const cacheParameter = getEnumeration<CacheParameter>([
	"USER",
	"AUTH_MAPPING",
	"EXPENSE",
	"GROUP",
	"GROUP_DETAILS",
	"MEMBER",
	"USER_GROUPS",
	"GROUP_EXPENSES",
]);
