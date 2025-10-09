import { admin_access_emails } from "@/config";

export class AuthConstants {
	static readonly ACCESS_TOKEN = "accessToken";
	static readonly REFRESH_TOKEN = "refreshToken";
	static readonly ACCESS_TOKEN_EXPIRY = 24 * 60 * 60; // 1 day
	static readonly REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days
	static readonly OAUTH_TOKEN_EXPIRY = 60 * 60; // 1 minute
	static readonly OTP_EXPIRY = 5 * 60 * 1000; // 5 minutes
	static readonly COOKIES_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
	static readonly admins = admin_access_emails;
}
