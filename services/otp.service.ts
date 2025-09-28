import otpGenerator from "otp-generator";
import { AuthService, EmailService } from "@/services";
import {
	AppSeo,
	AuthConstants,
	emailTemplates,
	HTTP,
	OTP_STATUS,
	USER_STATUS,
} from "@/constants";
import { AuthResponse } from "@/types";
import { otpRepo, userRepo } from "@/repo";
import { ApiError } from "@/errors";
import { UserService } from "@/services";
import { Otp } from "@/schema";

export class OtpService {
	public static async requestOtpForEmail(email: string) {
		const foundOtp = await otpRepo.findOne({ email });
		const newOtp = OtpService.generate();
		if (foundOtp != null) {
			otpRepo.update(
				{ email },
				{ otp: newOtp, status: OTP_STATUS.PENDING }
			);
		} else {
			otpRepo.create({
				email,
				otp: newOtp,
				status: OTP_STATUS.PENDING,
			});
		}
		await OtpService.send(email, newOtp);
	}

	public static async verifyOtpForEmail(
		email: string,
		otp: string
	): Promise<AuthResponse> {
		const foundOtp = await otpRepo.findOne({ email });
		if (foundOtp == null) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"No OTP was requested from this email"
			);
		}
		// If OTP was already expired, return failure
		if (foundOtp.status === OTP_STATUS.EXPIRED) {
			throw new ApiError(HTTP.status.BAD_REQUEST, "OTP Expired");
		}
		// If greater than 5 minutes have passed, consider the OTP expired
		if (OtpService.isExpired(foundOtp)) {
			otpRepo.update({ email }, { status: OTP_STATUS.EXPIRED });
			throw new ApiError(HTTP.status.BAD_REQUEST, "OTP Expired");
		}
		if (foundOtp.otp !== otp) {
			throw new ApiError(HTTP.status.BAD_REQUEST, "Invalid OTP");
		}
		// If OTP was valid, consider it valid, and mark that as expired
		otpRepo.update({ email }, { status: OTP_STATUS.EXPIRED });
		const { user, isNew } = await UserService.findOrCreateUser({
			email,
			status: USER_STATUS.JOINED,
		});
		if (user.status === USER_STATUS.INVITED) {
			// If an Invited user logs in, mark the user as Joined
			userRepo.update({ email }, { status: USER_STATUS.JOINED });
		}
		const authMapping = await AuthService.findOrCreateAuthMapping(
			email,
			{ id: user.id, name: "otp" },
			user.id
		);
		const tokens = AuthService.generateTokens(`${authMapping.id}`);
		const cookies = AuthService.getCookies(tokens);
		return { cookies, user, isNew };
	}

	public static generate(): string {
		return otpGenerator.generate(6, {
			upperCaseAlphabets: false,
			lowerCaseAlphabets: false,
			specialChars: false,
			digits: true,
		});
	}

	public static async send(email: string, otp: string) {
		await EmailService.sendByTemplate(
			email,
			`OTP Requested for ${AppSeo.title}`,
			emailTemplates.OTP,
			{ otp }
		);
	}

	// if time difference between updated_at and current time is greater than 5 minutes, OTP is expired
	public static isExpired(otp: Otp): boolean {
		return (
			new Date().getTime() - new Date(otp.updatedAt).getTime() >
			AuthConstants.OTP_EXPIRY
		);
	}
}
