import { http } from "@/connections";
import { ApiRequests, ApiRes, ApiResponses } from "@/types";

export class AuthApi {
	public static async requestOtpWithEmail(email: string) {
		const response = await http.post<
			ApiRes<ApiResponses.RequestOtp>,
			ApiRequests.RequestOtp
		>("/auth/otp/request", { email });
		return response.data;
	}

	public static async verifyOtpWithEmail(email: string, otp: string) {
		const response = await http.post<
			ApiRes<ApiResponses.VerifyOtp>,
			ApiRequests.VerifyOtp
		>("/auth/otp/verify", { email, otp });
		return response.data;
	}

	public static async verifyOAuthSignIn(code: string) {
		const res = await http.post<
			ApiRes<ApiResponses.VerifyGoogleOAuth>,
			ApiRequests.VerifyGoogleOAuth
		>("/oauth/google/verify", { code });
		return res.data;
	}

	public static async continueOAuthWithGoogle(token: string) {
		const res = await http.post<
			ApiRes<ApiResponses.ContinueGoogleOAuth>,
			ApiRequests.ContinueGoogleOAuth
		>("/oauth/google/continue", { token });
		return res.data;
	}

	public static async verifyUserIfLoggedIn(headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.VerifyUser>>(
			"/auth/verify",
			{ headers }
		);
		return response.data;
	}

	public static async logout(headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.Logout>>(
			"/auth/logout",
			{ headers }
		);
		return response.data;
	}
}
