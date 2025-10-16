import { AuthMapping, Expense, Group, Member, Split, User } from "@/types";
import { CreateModel, UpdateModel } from "./parser";

// User
export type IUser = User;
export type UpdateUser = Omit<UpdateModel<User>, "email">;
export type IAuthMapping = Omit<AuthMapping, "user"> & { user: IUser | null };

// Group
export type IGroup = Omit<Group, "author"> & { author: IUser };
export type CreateGroupData = CreateModel<Omit<Group, "author">>;
export type UpdateGroupData = UpdateModel<Omit<Group, "author">>;

// Members
export type IMember = Omit<Member, "user" | "group"> & {
	user: IUser;
	group: IGroup;
};

// Expense
export type IExpense = Omit<
	Expense,
	"group" | "author" | "sender" | "receiver"
> & {
	group?: IGroup;
	author: IUser;
	sender: IUser;
	receiver?: IUser;
};
export type CreateExpenseData = Omit<CreateModel<Expense>, "author"> & {
	splits?: Array<{ user: string; amount: number }>;
};
export type UpdateExpenseData = UpdateModel<
	Omit<Expense, "group" | "author"> & {
		splits: Array<{ user: string; amount: number }>;
	}
>;

// Splits
export type ISplit = Omit<Split, "expense" | "user"> & {
	expense: IExpense;
	user: IUser;
};

// Wallet
export type GroupSpread = IGroup & { members: Array<Omit<IMember, "group">> };
export type Share = {
	user: string;
	amount: number;
};
export type ExpenseSpread = IExpense & {
	splits: Array<Omit<ISplit, "expense">>;
};
export type IShare = {
	user: IUser;
	amount: number;
	percentage: number;
	fraction: string;
	opacity: number;
};

// Extra Aggregated Collections
export type Transaction = {
	from: string;
	to: string;
	owed: number;
	paid: number;
};
export type ITransaction = {
	title: string;
	from: IUser;
	to: IUser;
	owed: number;
	paid: number;
};
export type IBalance = {
	user: IUser;
	gives: number;
	gets: number;
	transactions: Array<Omit<IBalance, "transactions">>;
};
export type IOwedRecord = {
	user: IUser;
	amount: number;
	transactions: Array<Omit<IOwedRecord, "transactions">>;
};
export type IBalancesSummary = {
	owes: Array<IOwedRecord>;
	balances: Array<IBalance>;
};
