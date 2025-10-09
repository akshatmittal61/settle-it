import { SPLIT_STATUS } from "@/constants";
import { ObjectId, Schema } from "@/types";
import { Split } from "./types";

export const SplitSchema: Schema<Split> = {
	expense: {
		type: ObjectId,
		ref: "Expense",
		required: true,
	},
	user: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
	pending: {
		type: Number,
		default: 0,
		required: true,
	},
	completed: {
		type: Number,
		default: 0,
		required: true,
	},
	status: {
		type: String,
		enum: Object.values(SPLIT_STATUS),
		default: SPLIT_STATUS.PENDING,
	},
};
