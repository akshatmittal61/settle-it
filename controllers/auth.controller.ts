import { HTTP } from "@/constants";
import { ApiFailure, ApiSuccess } from "@/server";
import { AuthService, OAuthService, OtpService } from "@/services";
import { ApiRequest, ApiRequests, ApiResponse, ApiResponses } from "@/types";
import { SafetyUtils, StringUtils } from "@/utils";

export class AuthController {
	public static async verifyLoggedInUser(
		req: ApiRequest<ApiRequests.VerifyUser>,
		res: ApiResponse
	) {
		const user = req.user;
		if (!user) {
			return new ApiFailure(res)
				.message("Please login to continue")
				.send();
		}
		return new ApiSuccess<ApiResponses.VerifyUser>(res).send(user);
	}
	public static async logout(
		_: ApiRequest<ApiRequests.Logout>,
		res: ApiResponse
	) {
		const cookies = AuthService.getCookies({
			accessToken: null,
			refreshToken: null,
			logout: true,
		});
		return new ApiSuccess<ApiResponses.Logout>(res).cookies(cookies).send();
	}
	public static async requestOtp(
		req: ApiRequest<ApiRequests.RequestOtp>,
		res: ApiResponse
	) {
		const email = StringUtils.getNonEmptyString(req.body.email);
		await OtpService.requestOtpForEmail(email);
		return new ApiSuccess<ApiResponses.RequestOtp>(res)
			.message("OTP sent successfully")
			.send(null);
	}
	public static async verifyOtp(
		req: ApiRequest<ApiRequests.VerifyOtp>,
		res: ApiResponse
	) {
		const email = StringUtils.getNonEmptyString(req.body.email);
		const otp = StringUtils.getNonEmptyString(req.body.otp);
		const { cookies, user, isNew } = await OtpService.verifyOtpForEmail(
			email,
			otp
		);
		const responseStatus = isNew
			? HTTP.status.CREATED
			: HTTP.status.SUCCESS;
		return new ApiSuccess<ApiResponses.VerifyOtp>(res)
			.status(responseStatus)
			.cookies(cookies)
			.data(user)
			.send();
	}
	public static async verifyOAuthSignIn(
		req: ApiRequest<ApiRequests.VerifyGoogleOAuth>,
		res: ApiResponse
	) {
		const code = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString,
			req.body.code
		);
		const data = await OAuthService.verifyOAuthSignIn(code);
		return new ApiSuccess<ApiResponses.VerifyGoogleOAuth>(res).send(data);
	}
	public static async continueOAuthWithGoogle(
		req: ApiRequest<ApiRequests.ContinueGoogleOAuth>,
		res: ApiResponse
	) {
		const validatorToken = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString,
			req.body.token
		);
		const { user, cookies } =
			await OAuthService.continueOAuthWithGoogle(validatorToken);
		return new ApiSuccess<ApiResponses.ContinueGoogleOAuth>(res)
			.cookies(cookies)
			.data(user)
			.send();
	}
}
