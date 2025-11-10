export type T_AUTH_MAPPING_PROVIDER = "otp" | "google";
export type T_USER_STATUS = "JOINED" | "INVITED";
export type T_USER_ROLE = "ADMIN" | "MEMBER" | "GUEST";
export type T_OTP_STATUS = "PENDING" | "EXPIRED";
export type T_EXPENSE_TYPE = "PAID" | "RECEIVED" | "SELF" | "SETTLE";
export type T_EXPENSE_METHOD = "UPI" | "CASH" | "CARD" | "NETBANKING";
export type T_EXPENSE_STATUS = "PENDING" | "SETTLED";
export type T_MEMBER_ROLE = "ADMIN" | "MEMBER";
export type T_MEMBER_STATUS = "JOINED" | "INVITED" | "LEFT";
export type T_SPLIT_STATUS = "PENDING" | "CONFIRMATION_PENDING" | "SETTLED";

export type T_EMAIL_TEMPLATE =
	| "OTP"
	| "NEW_USER_ONBOARDED"
	| "USER_INVITED"
	| "USER_ADDED_TO_GROUP"
	| "CONTACT_MESSAGE";

export type CacheParameter =
	| "USER"
	| "AUTH_MAPPING"
	| "EXPENSE"
	| "GROUP"
	| "GROUP_DETAILS"
	| "MEMBER"
	| "USER_GROUPS"
	| "GROUP_EXPENSES";
