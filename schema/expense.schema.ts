import { EXPENSE_METHOD, EXPENSE_TYPE } from "@/constants";
import { ObjectId } from "@/db";
import { Expense, Schema } from "@/types";

export const ExpenseSchema: Schema<Expense> = {
	title: {
		type: String,
		required: true,
	},
	amount: {
		type: Number,
		required: true,
	},
	author: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
	sender: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
	receiver: {
		type: ObjectId,
		ref: "User",
		required: false,
	},
	type: {
		type: String,
		enum: Object.values(EXPENSE_TYPE),
		default: EXPENSE_TYPE.PAID,
	},
	method: {
		type: String,
		enum: Object.values(EXPENSE_METHOD),
		default: EXPENSE_METHOD.CASH,
	},
	timestamp: {
		type: Date,
		default: Date.now,
		required: false,
	},
	description: {
		type: String,
	},
	group: {
		type: ObjectId,
		ref: "Group",
		required: false,
	},
	tags: {
		type: [
			{
				type: String,
				trim: true,
				lowercase: true,
				validate: {
					validator: (tag: string) => tag.length > 0,
					message: "Tag cannot be empty",
				},
			},
		],
		validate: {
			validator: (v: string[]) => v.length <= 5,
			message: "Tags can't exceed 5",
		},
		required: false,
		default: [],
	},
	icon: {
		type: String,
		required: false,
	},
};
