import { logger } from "@/log";
import { sendEmailTemplate } from "@/messages";
import { Otp, OtpModel } from "@/models";
import { getNonNullValue, getObjectFromMongoResponse } from "@/utils";
import otpGenerator from "otp-generator";

export const findOne = async (query: Partial<Otp>): Promise<Otp | null> => {
	const res = await OtpModel.findOne(query);
	return getObjectFromMongoResponse<Otp>(res);
};

export const findById = async (id: string): Promise<Otp | null> => {
	const res = await OtpModel.findById(id).catch((error: any) => {
		if (error.kind === "ObjectId") return null;
		return Promise.reject(error);
	});
	return getObjectFromMongoResponse<Otp>(res);
};

export const find = async (query: Partial<Otp>): Promise<Otp[] | null> => {
	const res = await OtpModel.find(query);
	const parsedRes = res
		.map((obj) => getObjectFromMongoResponse<Otp>(obj))
		.filter((obj) => obj !== null) as Otp[];
	if (parsedRes.length > 0) return parsedRes;
	return null;
};

export const findAll = async (): Promise<Array<Otp>> => {
	const res = await OtpModel.find({}).sort({ createdAt: -1 });
	const parsedRes = res
		.map((obj) => getObjectFromMongoResponse<Otp>(obj))
		.filter((obj) => obj !== null) as Otp[];
	if (parsedRes.length > 0) return parsedRes;
	return [];
};

export const create = async (
	body: Omit<Otp, "id" | "createdAt" | "updatedAt">
): Promise<Otp> => {
	const res = await OtpModel.create(body);
	return getNonNullValue(getObjectFromMongoResponse<Otp>(res));
};

export const update = async (
	query: Partial<Otp>,
	update: Partial<Omit<Otp, "id" | "createdAt" | "updatedAt">>
): Promise<Otp | null> => {
	const res = query.id
		? await OtpModel.findByIdAndUpdate(query.id, update, {
				new: true,
			})
		: await OtpModel.findOneAndUpdate(query, update, { new: true });
	return getObjectFromMongoResponse<Otp>(res);
};

export const remove = async (query: Partial<Otp>): Promise<Otp | null> => {
	const res = query.id
		? await OtpModel.findByIdAndDelete(query.id)
		: await OtpModel.findOneAndDelete(query);
	return getObjectFromMongoResponse<Otp>(res);
};

export const generate = () =>
	otpGenerator.generate(6, {
		upperCaseAlphabets: false,
		lowerCaseAlphabets: false,
		specialChars: false,
		digits: true,
	});

export const send = async (email: string, otp: string) => {
	try {
		await sendEmailTemplate(
			email,
			"OTP requested for Login | Settle It",
			"OTP",
			{ otp }
		);
		return Promise.resolve();
	} catch (error: any) {
		logger.error(error);
		return Promise.reject(error);
	}
};
