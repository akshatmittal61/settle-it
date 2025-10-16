import {
	AuthMappingSchema,
	ExpenseSchema,
	GroupSchema,
	MemberSchema,
	OtpSchema,
	SplitSchema,
	UserSchema,
} from "@/schema";
import { AuthMapping, Expense, Group, Member, Otp, Split, User } from "@/types";
import { ModelFactory } from "./base";

export const AuthMappingModel = new ModelFactory<AuthMapping>(
	"AuthMapping",
	AuthMappingSchema
).model;
export const GroupModel = new ModelFactory<Group>("Group", GroupSchema).model;
export const MemberModel = new ModelFactory<Member>("Member", MemberSchema)
	.model;
export const ExpenseModel = new ModelFactory<Expense>("Expense", ExpenseSchema)
	.model;
export const SplitModel = new ModelFactory<Split>("Split", SplitSchema).model;
export const OtpModel = new ModelFactory<Otp>("Otp", OtpSchema).model;
export const UserModel = new ModelFactory<User>("User", UserSchema).model;
