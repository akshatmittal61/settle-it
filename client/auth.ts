import { AuthApi } from "@/connections";
import { AuthConstants, cacheParameter } from "@/constants";
import { Logger } from "@/log";
import { ServerSideAdminMiddleware, ServerSideAuthMiddleware } from "@/types";
import { CacheService } from "@/services";

export const authenticatedPage: ServerSideAuthMiddleware = async (
	context: any,
	{ onLoggedInAndNotOnboarded, onLoggedInAndOnboarded, onLoggedOut }
) => {
	const { req } = context;
	Logger.debug("ssr cookies", req.headers.cookie, req.cookies);
	const cookies = req.cookies;
	if (!cookies.accessToken && !cookies.refreshToken) {
		return onLoggedOut();
	}
	try {
		const headers = { cookie: req.headers.cookie };
		// TODO: Optimize it without caching on access token
		/* const user = await CacheService.fetch(
			CacheService.getKey(cacheParameter.USER, {
				id: cookies.accessToken,
			}),
			() => AuthApi.verifyUserIfLoggedIn(headers).then((res) => res.data),
			AuthConstants.ACCESS_TOKEN_EXPIRY
		); */
		const user = await AuthApi.verifyUserIfLoggedIn(headers).then(
			(res) => res.data
		);
		Logger.debug("authenticatedPage -> user", user);
		if (user.name) {
			return onLoggedInAndOnboarded(user, headers);
		} else {
			return onLoggedInAndNotOnboarded(user, headers);
		}
	} catch (error: any) {
		Logger.error(error.message);
		return onLoggedOut();
	}
};

export const adminPage: ServerSideAdminMiddleware = async (
	context: any,
	{ onAdmin, onNonAdmin, onLoggedOut }
) => {
	const { req } = context;
	const cookies = req.cookies;
	if (!cookies.accessToken && !cookies.refreshToken) {
		return onLoggedOut();
	}
	try {
		const headers = { cookie: req.headers.cookie };
		const user = await CacheService.fetch(
			CacheService.getKey(cacheParameter.USER, {
				id: cookies.accessToken,
			}),
			() => AuthApi.verifyUserIfLoggedIn(headers).then((res) => res.data),
			AuthConstants.ACCESS_TOKEN_EXPIRY
		);
		if (AuthConstants.admins.includes(user.email)) {
			return onAdmin(user, headers);
		} else {
			return onNonAdmin(user, headers);
		}
	} catch (error: any) {
		Logger.error(error.message);
		return onLoggedOut();
	}
};
