import { OTP_STATUS } from "@/constants";
import { Otp, Schema } from "@/types";

export const OtpSchema: Schema<Otp> = {
	email: {
		type: String,
		unique: true,
		required: true,
	},
	otp: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		enum: Object.values(OTP_STATUS),
		default: OTP_STATUS.PENDING,
	},
};
