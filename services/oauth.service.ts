import { Cache } from "@/cache";
import { jwtSecret, oauth_google } from "@/config";
import {
	AuthConstants,
	authMappingProvider,
	cacheParameter,
	fallbackAssets,
	HTTP,
	USER_ROLE,
	USER_STATUS,
} from "@/constants";
import { ApiError } from "@/errors";
import { Logger } from "@/log";
import { authRepo } from "@/repo";
import { CacheService } from "@/services/cache.service";
import { AuthResponse } from "@/types";
import { BooleanUtils, SafetyUtils, StringUtils } from "@/utils";
import axios from "axios";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { AuthService } from "./auth.service";
import { UserService } from "./user.service";

export class OAuthService {
	private static client: OAuth2Client;

	static {
		OAuthService.client = new OAuth2Client();
	}

	public static async verifyOAuthSignIn(code: string): Promise<string> {
		Logger.debug("Verifying OAuth sign in", code);
		const oAuthResponse = await OAuthService.verifyOAuthRequestByCode(code);
		const id_token = StringUtils.getNonEmptyString(oAuthResponse.id_token);
		Logger.debug("Verified OAuth id token", id_token);
		const userFromOAuth = await OAuthService.fetchUserFromIdToken(id_token);
		if (!SafetyUtils.isNonNull(userFromOAuth)) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Auth failed, please try again or contact support"
			);
		}
		Logger.debug("User from OAuth", userFromOAuth);
		// const email = genericParse(getNonEmptyString, userFromOAuth.email);
		// const name = safeParse(getNonEmptyString, userFromOAuth.name) || "";
		const email = StringUtils.getNonEmptyString(userFromOAuth.email);
		const name = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			userFromOAuth.name
		);
		const picture = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			userFromOAuth.picture
		);
		const { user, isNew } = await UserService.findOrCreateUser({
			name: name || StringUtils.EMPTY,
			email,
			avatar: picture || fallbackAssets.avatar,
			status: USER_STATUS.JOINED,
			role: USER_ROLE.MEMBER,
		});
		Logger.debug("Found or created user", { user, isNew });
		const authMapping = await AuthService.findOrCreateAuthMapping(
			email,
			{ id: userFromOAuth.sub, name: authMappingProvider.google },
			user.id,
			{ name, avatar: picture }
		);
		Logger.debug("Found or created auth mapping", authMapping);
		if (
			BooleanUtils.True.equals(isNew) ||
			!SafetyUtils.isNonNull(authMapping.user) ||
			StringUtils.notEquals(authMapping.user.id, user.id)
		) {
			await authRepo.update({ id: authMapping.id }, { user: user.id });
			Cache.set(
				CacheService.getKey(cacheParameter.AUTH_MAPPING, {
					identifier: email,
					provider: authMappingProvider.google,
				}),
				authMapping
			);
			Cache.set(
				CacheService.getKey(cacheParameter.AUTH_MAPPING, {
					id: authMapping.id,
				}),
				authMapping
			);
		}
		const oauthValidatorToken = jwt.sign(
			{ id: authMapping.id },
			jwtSecret.oauthValidator,
			{ expiresIn: AuthConstants.OAUTH_TOKEN_EXPIRY }
		);
		Logger.debug("Generated validator token", oauthValidatorToken);
		return oauthValidatorToken;
	}
	public static async continueOAuthWithGoogle(
		validatorToken: string
	): Promise<AuthResponse> {
		const decodedToken: any = jwt.verify(
			validatorToken,
			jwtSecret.oauthValidator
		);
		Logger.debug("Decoded validator token", decodedToken);
		const authMappingId = StringUtils.getNonEmptyString(decodedToken.id);
		Logger.debug("Decoded auth mapping id", authMappingId);
		const foundAuthMapping = await CacheService.fetch(
			CacheService.getKey(cacheParameter.AUTH_MAPPING, {
				id: authMappingId,
			}),
			() => authRepo.findById(authMappingId)
		);
		Logger.debug("Found auth mapping", foundAuthMapping);
		if (
			!SafetyUtils.isNonNull(foundAuthMapping) ||
			!SafetyUtils.isNonNull(foundAuthMapping.user)
		) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Auth failed, please try again or contact support"
			);
		}
		const tokens = AuthService.generateTokens(`${foundAuthMapping.id}`);
		const cookies = AuthService.getCookies(tokens);
		return { cookies, user: foundAuthMapping.user };
	}
	private static async verifyOAuthRequestByCode(auth_code: string) {
		const oauthRequest = {
			url: new URL("https://oauth2.googleapis.com/token"),
			params: {
				client_id: oauth_google.client_id,
				client_secret: oauth_google.client_secret,
				code: auth_code,
				grant_type: "authorization_code",
				redirect_uri: oauth_google.redirect_uri,
			},
		};
		const oauthResponse = await axios.post(
			oauthRequest.url.toString(),
			null,
			{ params: oauthRequest.params }
		);
		return oauthResponse.data;
	}
	private static async fetchUserFromIdToken(idToken: string) {
		const ticket = await OAuthService.client.verifyIdToken({
			idToken,
			audience: oauth_google.client_id,
		});
		return ticket.getPayload();
	}
}
