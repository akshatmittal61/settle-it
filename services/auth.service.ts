import { jwtSecret } from "@/config";
import { AuthConstants, cacheParameter } from "@/constants";
import { Logger } from "@/log";
import { authRepo } from "@/repo";
import { AuthResponse, Cookie, IAuthMapping, IUser, Tokens } from "@/types";
import { BooleanUtils, SafetyUtils, StringUtils } from "@/utils";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { CacheService } from "./cache.service";

export class AuthService {
	public static async findOrCreateAuthMapping(
		email: string,
		provider: { id: string; name: string },
		user: string | null = null,
		misc: any = {}
	): Promise<IAuthMapping> {
		const foundAuthMapping = await CacheService.fetch(
			CacheService.getKey(cacheParameter.AUTH_MAPPING, {
				identifier: email,
				provider: provider.name,
			}),
			() =>
				authRepo.findOne({
					identifier: email,
					providerName: provider.name,
				})
		);
		if (SafetyUtils.isNonNull(foundAuthMapping)) {
			return foundAuthMapping;
		}
		return await authRepo.create({
			identifier: email,
			providerName: provider.name,
			providerId: provider.id,
			misc: JSON.stringify(misc || {}),
			user,
		});
	}

	public static async getUserByAuthMappingId(
		authMappingId: string
	): Promise<IUser | null> {
		// TODO: Find a better way to optimize this instead of caching on auth mapping id
		/* const foundAuthMapping = await CacheService.fetch(
			CacheService.getKey(cacheParameter.AUTH_MAPPING, {
				id: authMappingId,
			}),
			() => authRepo.findById(authMappingId)
		); */
		const foundAuthMapping = await authRepo.findById(authMappingId);
		if (!foundAuthMapping) return null;
		Logger.debug("foundAuthMapping", foundAuthMapping);
		return foundAuthMapping.user;
	}

	/**
	 * Authenticates a user and manages token refresh flow.
	 * This method handles two main scenarios:
	 * 1. Valid access token: Returns the user directly
	 * 2. Expired access token but valid refresh token: Issues new tokens and returns them with the user
	 *
	 * @param {Tokens} params - Object containing access and refresh tokens
	 * @param {string} params.accessToken - JWT access token for authentication
	 * @param {string} params.refreshToken - JWT refresh token for obtaining new access tokens
	 *
	 * @returns {Promise<(AuthResponse & Tokens) | null>}
	 *   - If successful: Returns user data, new tokens, and cookies
	 *   - If authentication fails: Returns null
	 *
	 * @description
	 * The authentication flow works as follows:
	 * 1. First, it attempts to verify the access token:
	 *    - If valid: Fetches and returns the user with current tokens
	 *    - If expired: Proceeds to refresh token flow
	 *    - If invalid: Returns null (authentication failed)
	 *
	 * 2. If access token is expired, it verifies the refresh token:
	 *    - If valid: Generates new access and refresh tokens
	 *    - Updates the user's session with new tokens
	 *    - Returns user data with new tokens and cookies
	 *    - If invalid: Returns null (authentication failed)
	 *
	 * 3. The method includes debug logging at each major step for troubleshooting.
	 */
	public static async getAuthenticatedUser({
		accessToken,
		refreshToken,
	}: Tokens): Promise<(AuthResponse & Tokens) | null> {
		// First, try to verify the access token
		try {
			const decodedAccessToken: any = jwt.verify(
				accessToken,
				jwtSecret.authAccess
			);
			const authMappingId = StringUtils.getNonEmptyString(
				decodedAccessToken.id
			);
			Logger.debug(
				"getAuthenticatedUser -> authMappingId by accessToken",
				authMappingId
			);

			// Get user by auth mapping ID
			const user =
				await AuthService.getUserByAuthMappingId(authMappingId);
			if (!SafetyUtils.isNonNull(user)) return null;

			Logger.debug("getAuthenticatedUser -> user by accessToken", user);

			// If we get here, access token is valid - return user with current tokens
			const tokens: Tokens = { accessToken, refreshToken };
			const cookies = AuthService.getCookies(tokens);

			return {
				user,
				cookies,
				...tokens,
			};
		} catch (error) {
			// If error is not related to token expiration, fail authentication
			if (
				!(error instanceof TokenExpiredError) &&
				!(error instanceof JsonWebTokenError)
			) {
				return null;
			}
		}

		// If we get here, access token is invalid/expired - try to refresh using refresh token
		try {
			// Verify the refresh token
			const decodedRefreshToken: any = jwt.verify(
				refreshToken,
				jwtSecret.authRefresh
			);
			const authMappingId = StringUtils.getNonEmptyString(
				decodedRefreshToken.id
			);
			Logger.debug(
				"getAuthenticatedUser -> authMappingId by refreshToken",
				authMappingId
			);

			// Get user by auth mapping ID from refresh token
			const user =
				await AuthService.getUserByAuthMappingId(authMappingId);
			if (!SafetyUtils.isNonNull(user)) return null;

			Logger.debug("getAuthenticatedUser -> user by refreshToken", user);

			// Generate new tokens (both access and refresh)
			const newAccessToken =
				AuthService.generateAccessToken(authMappingId);
			const newRefreshToken =
				AuthService.generateRefreshToken(authMappingId);

			const tokens: Tokens = {
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
			};

			// Generate new cookies with the fresh tokens
			const cookies = AuthService.getCookies(tokens);

			// Return user data with new tokens and cookies
			return {
				user,
				cookies,
				...tokens,
			};
		} catch {
			// If refresh token is invalid/expired or any other error occurs, authentication fails
			return null;
		}
	}

	public static generateRefreshToken(id: string) {
		return jwt.sign({ id }, jwtSecret.authRefresh, {
			expiresIn: AuthConstants.REFRESH_TOKEN_EXPIRY,
		});
	}

	public static generateAccessToken(id: string) {
		return jwt.sign({ id }, jwtSecret.authAccess, {
			expiresIn: AuthConstants.ACCESS_TOKEN_EXPIRY,
		});
	}

	public static generateTokens(id: string): {
		refreshToken: string;
		accessToken: string;
	} {
		return {
			refreshToken: AuthService.generateRefreshToken(id),
			accessToken: AuthService.generateAccessToken(id),
		};
	}

	public static getCookies({
		accessToken,
		refreshToken,
		logout,
	}: {
		accessToken: string | null;
		refreshToken: string | null;
		logout?: boolean;
	}): Array<Cookie> {
		const cookiesToSet: Array<Cookie> = [];
		if (BooleanUtils.True.equals(logout)) {
			cookiesToSet.push({
				name: AuthConstants.ACCESS_TOKEN,
				value: "",
				maxAge: -1,
			});
			cookiesToSet.push({
				name: AuthConstants.REFRESH_TOKEN,
				value: "",
				maxAge: -1,
			});
			return cookiesToSet;
		}
		if (accessToken) {
			cookiesToSet.push({
				name: AuthConstants.ACCESS_TOKEN,
				value: accessToken,
				maxAge: AuthConstants.COOKIES_EXPIRY,
			});
		}
		if (refreshToken) {
			cookiesToSet.push({
				name: AuthConstants.REFRESH_TOKEN,
				value: refreshToken,
				maxAge: AuthConstants.COOKIES_EXPIRY,
			});
		}
		return cookiesToSet;
	}

	public static getUpdatedCookies(old: Tokens, newTokens: Tokens) {
		const cookiesToSet = [];
		if (StringUtils.notEquals(old.accessToken, newTokens.accessToken)) {
			cookiesToSet.push({
				name: AuthConstants.ACCESS_TOKEN,
				value: newTokens.accessToken,
				maxAge: AuthConstants.COOKIES_EXPIRY,
			});
		}
		if (StringUtils.notEquals(old.refreshToken, newTokens.refreshToken)) {
			cookiesToSet.push({
				name: AuthConstants.REFRESH_TOKEN,
				value: newTokens.refreshToken,
				maxAge: AuthConstants.COOKIES_EXPIRY,
			});
		}
		return cookiesToSet;
	}
}
