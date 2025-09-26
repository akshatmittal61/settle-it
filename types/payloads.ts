import { CacheParameter, T_EMAIL_TEMPLATE } from "./enum";

type CachePayloadMap = {
	USER: { id: string } | { email: string };
	AUTH_MAPPING: { id: string } | { identifier: string; provider: string };
	EXPENSE: { id: string };
	GROUP: { id: string };
	GROUP_DETAILS: { id: string };
	MEMBER: { id: string };
	USER_GROUPS: { userId: string };
	GROUP_EXPENSES: { groupId: string };
};
export type CachePayloadGenerator<T extends CacheParameter> =
	CachePayloadMap[T];

type EmailTemplateDataMap = {
	OTP: { otp: string };
	USER_INVITED: { invitedBy: { name: string; email: string } };
	USER_ADDED_TO_GROUP: {
		invitedBy: { name: string; email: string };
		group: { id: string; name: string };
	};
	NEW_USER_ONBOARDED: never;
};
export type EmailTemplateGenerator<T extends T_EMAIL_TEMPLATE> =
	EmailTemplateDataMap[T];
