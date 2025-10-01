import { AuthConstants, HTTP } from "@/constants";
import { DatabaseManager } from "@/db";
import { ApiFailure, ApiSuccess } from "@/server";
import { AuthService } from "@/services";
import { ApiRequest, ApiResponse, IUser } from "@/types";
import { SafetyUtils, StringUtils } from "@/utils";

type HealthPayload = {
	identity: number;
	uptime: number;
	timestamp: string;
	database: boolean;
};

type HeartbeatPayload = HealthPayload & {
	user: IUser | null;
};

export class ServerController {
	public static health =
		(db: DatabaseManager) => (_: ApiRequest, res: ApiResponse) => {
			if (!db.isConnected()) {
				return new ApiFailure(res)
					.status(HTTP.status.SERVICE_UNAVAILABLE)
					.message(HTTP.message.DB_CONNECTION_ERROR)
					.send();
			}
			const payload: HealthPayload = {
				identity: process.pid,
				uptime: process.uptime(),
				timestamp: new Date().toISOString(),
				database: db.isConnected(),
			};
			return new ApiSuccess<HealthPayload>(res)
				.message(HTTP.message.HEALTHY_API)
				.send(payload);
		};

	public static heartbeat =
		(db: DatabaseManager) => async (req: ApiRequest, res: ApiResponse) => {
			const payload: HeartbeatPayload = {
				identity: process.pid,
				uptime: process.uptime(),
				timestamp: new Date().toISOString(),
				database: db.isConnected(),
				user: null,
			};
			const accessToken = SafetyUtils.safeParse(
				StringUtils.getNonEmptyString,
				req.cookies[AuthConstants.ACCESS_TOKEN]
			);
			const refreshToken = SafetyUtils.safeParse(
				StringUtils.getNonEmptyString,
				req.cookies[AuthConstants.REFRESH_TOKEN]
			);
			if (
				StringUtils.isNotEmpty(accessToken) &&
				StringUtils.isNotEmpty(refreshToken)
			) {
				const authResponse = await AuthService.getAuthenticatedUser({
					accessToken,
					refreshToken,
				}).catch(() => null);
				if (!SafetyUtils.isNonNull(authResponse)) {
					const cookies = AuthService.getCookies({
						accessToken: null,
						refreshToken: null,
						logout: true,
					});
					return new ApiSuccess<HeartbeatPayload>(res)
						.message(HTTP.message.HEARTBEAT)
						.cookies(cookies)
						.data(payload)
						.send();
				}
				const {
					user,
					accessToken: newAccessToken,
					refreshToken: newRefreshToken,
				} = authResponse;
				payload.user = user;
				const cookies = AuthService.getUpdatedCookies(
					{ accessToken, refreshToken },
					{
						accessToken: newAccessToken,
						refreshToken: newRefreshToken,
					}
				);
				if (cookies.length > 0) {
					return new ApiSuccess<HeartbeatPayload>(res)
						.message(HTTP.message.HEARTBEAT)
						.cookies(cookies)
						.data(payload)
						.send();
				}
			}
			return new ApiSuccess<HeartbeatPayload>(res)
				.message(HTTP.message.HEARTBEAT)
				.data(payload)
				.send();
		};
}
