import { AuthConstants, HTTP } from "@/constants";
import { Logger } from "@/log";
import { AuthService, GroupService } from "@/services";
import { ApiController, ApiRequest, ApiResponse } from "@/types";
import { getSearchParam, omitKeys, SafetyUtils, StringUtils } from "@/utils";
import { ApiFailure, ApiSuccess } from "./payload";

export class ServerMiddleware {
	public static authenticatedRoute(next: ApiController): ApiController {
		return async (req: ApiRequest, res: ApiResponse) => {
			try {
				Logger.debug("authRoute -> url, cookies", req.url, req.cookies);
				const accessToken = StringUtils.getNonEmptyString(
					req.cookies[AuthConstants.ACCESS_TOKEN]
				);
				const refreshToken = StringUtils.getNonEmptyString(
					req.cookies[AuthConstants.REFRESH_TOKEN]
				);
				Logger.debug("Authenticating user tokens", {
					accessToken,
					refreshToken,
				});
				const authResponse = await AuthService.getAuthenticatedUser({
					accessToken,
					refreshToken,
				});
				Logger.debug("authResponse", authResponse);
				if (!SafetyUtils.isNonNull(authResponse)) {
					const cookies = AuthService.getCookies({
						accessToken: null,
						refreshToken: null,
						logout: true,
					});
					return new ApiFailure(res)
						.status(HTTP.status.UNAUTHORIZED)
						.message(HTTP.message.UNAUTHORIZED)
						.cookies(cookies)
						.send();
				}
				Logger.debug("Authenticated auth response", authResponse);
				const {
					user,
					accessToken: newAccessToken,
					refreshToken: newRefreshToken,
				} = authResponse;
				const cookies = AuthService.getUpdatedCookies(
					{ accessToken, refreshToken },
					{
						accessToken: newAccessToken,
						refreshToken: newRefreshToken,
					}
				);
				if (cookies.length > 0) {
					new ApiSuccess(res).cookies(cookies);
				}
				req.user = user;
				Logger.debug("Authenticated user", user);
			} catch (error) {
				Logger.error(error);
				const cookies = AuthService.getCookies({
					accessToken: null,
					refreshToken: null,
					logout: true,
				});
				return new ApiFailure(res)
					.status(HTTP.status.UNAUTHORIZED)
					.message(HTTP.message.UNAUTHORIZED)
					.cookies(cookies)
					.send();
			}
			return next(req, res);
		};
	}

	public static adminRoute(next: ApiController): ApiController {
		return async (req: ApiRequest, res: ApiResponse) => {
			try {
				const loggedInUser = req.user;
				if (!SafetyUtils.isNonNull(loggedInUser)) {
					return new ApiFailure(res)
						.status(HTTP.status.UNAUTHORIZED)
						.message(HTTP.message.UNAUTHORIZED)
						.send();
				}
				if (!AuthConstants.admins.includes(loggedInUser.email)) {
					return new ApiFailure(res)
						.status(HTTP.status.FORBIDDEN)
						.message("You are not an admin")
						.send();
				}
				req.user = loggedInUser;
			} catch (error) {
				Logger.error(error);
				return new ApiFailure(res)
					.status(HTTP.status.FORBIDDEN)
					.message(HTTP.message.FORBIDDEN)
					.send();
			}
			return next(req, res);
		};
	}

	public static isGroupMember(next: ApiController): ApiController {
		return async (req: ApiRequest, res: ApiResponse) => {
			try {
				Logger.debug("isGroupMember -> url, user", req.url, req.user);
				const loggedInUser = req.user;
				if (!loggedInUser) {
					return new ApiFailure(res)
						.status(HTTP.status.UNAUTHORIZED)
						.message(HTTP.message.UNAUTHORIZED)
						.send();
				}
				let groupId = SafetyUtils.safeParse(
					StringUtils.getNonEmptyString,
					getSearchParam(req.url, "groupId")
				);
				if (StringUtils.isEmpty(groupId)) {
					groupId = SafetyUtils.safeParse(
						StringUtils.getNonEmptyString,
						getSearchParam(req.url, "id")
					);
				}
				if (StringUtils.isEmpty(groupId)) {
					return new ApiFailure(res)
						.status(HTTP.status.BAD_REQUEST)
						.message("Group ID is required")
						.send();
				}
				const group = await GroupService.getGroupDetailsForUser(
					loggedInUser.id,
					groupId
				).catch(() => null);
				if (!group) {
					return new ApiFailure(res)
						.status(HTTP.status.FORBIDDEN)
						.message("You are not a member of this group")
						.send();
				}
				req.group = omitKeys(group, ["members"]);
			} catch (error) {
				Logger.error(error);
				return new ApiFailure(res)
					.status(HTTP.status.FORBIDDEN)
					.message(HTTP.message.FORBIDDEN)
					.send();
			}
			return next(req, res);
		};
	}
}
