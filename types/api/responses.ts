import {
	GroupSpread,
	IBalancesSummary,
	IExpense,
	IGroup,
	IMember,
	IOwedRecord,
	IShare,
	ISplit,
	ITransaction,
	IUser,
} from "@/types";

// Auth
export type VerifyUser = IUser;
export type VerifyGoogleOAuth = string;
export type ContinueGoogleOAuth = IUser;
export type RequestOtp = null;
export type VerifyOtp = IUser;
export type Logout = null;

// User
export type UpdateUser = IUser;
export type SearchUsers = Array<IUser>;
export type InviteUser = IUser;
export type BulkUserSearch = {
	users: Array<IUser>;
	message: string;
};

// Admin
export type GetAllUsers = Array<IUser>;
export type GetAllGroups = Array<IGroup>;
export type GetAllCacheData = { [key: string]: any };
export type ClearCacheData = null;
export type GetAllLogFiles = Array<string>;
export type GetLogFileByName = string;

// Group
export type GetGroupsForUser = Array<GroupSpread>;
export type GetGroupDetails = GroupSpread;
export type GetGroupExpenses = Array<IExpense>;
export type CreateGroup = GroupSpread;
export type UpdateGroupDetails = GroupSpread;
export type DeleteGroup = IGroup;
export type AddMembers = GroupSpread;
export type RemoveMembers = GroupSpread;

// Expense
export type GetUsersExpenses = Array<IExpense>;
export type CreateExpense = IExpense;
export type UpdateExpense = IExpense;
export type RemoveExpense = IExpense;
export type SettleExpense = Array<ISplit>;
export type MemberPaidAmount = Array<ISplit>;

// Member
export type GetMembersForExpense = Array<IMember>;
export type SettleMemberInExpense = Array<IMember>;
export type SettleOwedMembersInGroup = Array<IOwedRecord>;

// Wallet
export type GetBalancesSummary = {
	expenditure: number;
	balances: IBalancesSummary;
	shares: Array<IShare>;
};
export type GetTransactions = {
	expenditure: number;
	transactions: Array<ITransaction>;
};
