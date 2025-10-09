import {
	T_API_METHODS,
	T_AUTH_MAPPING_PROVIDER,
	T_EMAIL_TEMPLATE,
	T_EXPENSE_METHOD,
	T_EXPENSE_STATUS,
	T_EXPENSE_TYPE,
	T_MEMBER_ROLE,
	T_MEMBER_STATUS,
	T_OTP_STATUS,
	T_SPLIT_STATUS,
	T_USER_ROLE,
	T_USER_STATUS,
} from "@/types";
import { getEnumeration } from "@/utils";

export const USER_STATUS = getEnumeration<T_USER_STATUS>(["INVITED", "JOINED"]);
export const USER_ROLE = getEnumeration<T_USER_ROLE>([
	"ADMIN",
	"MEMBER",
	"GUEST",
]);
export const OTP_STATUS = getEnumeration<T_OTP_STATUS>(["PENDING", "EXPIRED"]);

export const EXPENSE_TYPE = getEnumeration<T_EXPENSE_TYPE>([
	"PAID",
	"RECEIVED",
	"SELF",
	"SETTLE",
]);
export const EXPENSE_METHOD = getEnumeration<T_EXPENSE_METHOD>([
	"UPI",
	"CASH",
	"CARD",
	"NETBANKING",
]);
export const EXPENSE_STATUS = getEnumeration<T_EXPENSE_STATUS>([
	"PENDING",
	"SETTLED",
]);

export const MEMBER_ROLE = getEnumeration<T_MEMBER_ROLE>(["ADMIN", "MEMBER"]);
export const MEMBER_STATUS = getEnumeration<T_MEMBER_STATUS>([
	"JOINED",
	"INVITED",
	"LEFT",
]);

export const SPLIT_STATUS = getEnumeration<T_SPLIT_STATUS>([
	"PENDING",
	"CONFIRMATION_PENDING",
	"SETTLED",
]);

export const authMappingProvider = getEnumeration<T_AUTH_MAPPING_PROVIDER>([
	"otp",
	"google",
]);

export const apiMethods = getEnumeration<T_API_METHODS>([
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
]);

export const emailTemplates = getEnumeration<T_EMAIL_TEMPLATE>([
	"OTP",
	"NEW_USER_ONBOARDED",
	"USER_INVITED",
	"USER_ADDED_TO_GROUP",
]);

const message = Object.freeze({
	SUCCESS: "Success",
	ERROR: "Error",
	NOT_FOUND: "Not Found",
	BAD_REQUEST: "Bad Request",
	UNAUTHORIZED: "Please login to continue",
	FORBIDDEN: "Forbidden",
	INTERNAL_SERVER_ERROR: "Internal Server Error",
	SERVICE_UNAVAILABLE: "Service Unavailable",
	HEALTHY_API: "API is healthy",
	HEALTHY_DB: "DB is healthy",
	DB_CONNECTION_ERROR: "Unable to connect to database",
	HEARTBEAT: "Heartbeat success",
});

const status = Object.freeze({
	SUCCESS: 200,
	CREATED: 201,
	REMOVED: 204,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	GONE: 410,
	CONFLICT: 409,
	INTERNAL_SERVER_ERROR: 500,
	SERVICE_UNAVAILABLE: 503,
});

export const HTTP = {
	status,
	message,
};
