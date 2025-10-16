import { ObjectId } from "@/db";
import { AuthMapping, Schema } from "@/types";

export const AuthMappingSchema: Schema<AuthMapping> = {
	identifier: {
		type: String,
		required: true,
	},
	providerName: {
		type: String,
		required: true,
	},
	providerId: {
		type: String,
		required: true,
	},
	misc: {
		type: String,
		default: "{}",
	},
	user: {
		type: ObjectId,
		ref: "User",
		required: false,
		default: null,
	},
};
