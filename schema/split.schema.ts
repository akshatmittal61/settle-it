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
	amount: {
		type: Number,
		default: 0,
		required: true,
	},
};
