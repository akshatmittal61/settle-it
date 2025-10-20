import { AuthApi, GroupApi } from "@/api";
import { redirectToLogin, routes } from "@/constants";
import { Logger } from "@/log";
import {
	GroupSpread,
	IUser,
	ServerSideAdminInterceptor,
	ServerSideAuthInterceptor,
	ServerSideResult,
} from "@/types";
import { StringUtils, UserUtils } from "@/utils";
import { GetServerSidePropsContext } from "next";

export const authRouterInterceptor: ServerSideAuthInterceptor = async (
	context,
	actions
) => {
	const { req } = context;
	const cookies = req.cookies;
	if (!cookies.accessToken || !cookies.refreshToken) {
		return actions.onLoggedOut();
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
		if ("onLoggedIn" in actions) {
			return actions.onLoggedIn(user, headers);
		} else {
			if (UserUtils.isUserOnboarded(user)) {
				return actions.onLoggedInAndOnboarded(user, headers);
			} else {
				return actions.onLoggedInAndNotOnboarded(user, headers);
			}
		}
	} catch (error: any) {
		return actions.onLoggedOut();
	}
};

export const withAuthPage = <T = any>(
	handler: (
		_user: IUser,
		_context: GetServerSidePropsContext
	) => ServerSideResult<T> | Promise<ServerSideResult<T>>
) => {
	return async (context: GetServerSidePropsContext) =>
		authRouterInterceptor<ServerSideResult<T>>(context, {
			onLoggedIn: (user) => handler(user, context),
			onLoggedOut: () => ({
				redirect: {
					destination: redirectToLogin(context.req.url),
					permanent: false,
				},
			}),
		});
};

export const withGroupPage = <T = any>(
	handler: (
		_user: IUser,
		_group: GroupSpread,
		context: GetServerSidePropsContext
	) => ServerSideResult<T> | Promise<ServerSideResult<T>>
) => {
	return async (context: GetServerSidePropsContext) =>
		authRouterInterceptor<ServerSideResult<T>>(context, {
			onLoggedIn: async (user) => {
				try {
					const groupId = StringUtils.getNonEmptyString(
						context.query.id
					);
					const { data: group } =
						await GroupApi.getGroupDetails(groupId);
					return handler(user, group, context);
				} catch (e: any) {
					return {
						props: {
							error: StringUtils.valueOf(
								e?.response?.data?.message ||
									e?.message ||
									StringUtils.EMPTY
							),
						},
					};
				}
			},
			onLoggedOut: () => ({
				redirect: {
					destination: redirectToLogin(context.req.url),
					permanent: false,
				},
			}),
		});
};

export const withAuthOnboardingPage = <T = any>(
	handler: (_: IUser) => ServerSideResult<T>
) => {
	return async (context: GetServerSidePropsContext) =>
		authRouterInterceptor<ServerSideResult<T>>(context, {
			onLoggedInAndOnboarded: (user) => handler(user),
			onLoggedInAndNotOnboarded: (user) => handler(user),
			onLoggedOut: () => ({
				redirect: { destination: routes.LOGIN, permanent: false },
			}),
		});
};

export const adminPage: ServerSideAdminInterceptor = async (
	context: any,
	actions
) => {
	const { req } = context;
	const cookies = req.cookies;
	if (!cookies.accessToken && !cookies.refreshToken) {
		return actions.onLoggedOut();
	}
	try {
		const headers = { cookie: req.headers.cookie };
		const user = await AuthApi.verifyUserIfLoggedIn(headers).then(
			(res) => res.data
		);
		if (UserUtils.isAdmin(user)) {
			return actions.onAdmin(user, headers);
		} else {
			return actions.onNonAdmin(user, headers);
		}
	} catch (error: any) {
		Logger.error(error.message);
		return actions.onLoggedOut();
	}
};
