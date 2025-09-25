import { ObjectId } from "@/types";

export const SplitSchema = {
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
};
