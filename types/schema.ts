import {
	Model,
	T_EXPENSE_METHOD,
	T_EXPENSE_TYPE,
	T_MEMBER_ROLE,
	T_MEMBER_STATUS,
	T_OTP_STATUS,
	T_SPLIT_STATUS,
	T_USER_ROLE,
	T_USER_STATUS,
} from "@/types";

/**
 * AuthMapping model
 * @param {string} identifier - Identifier of the user
 * @param {string} providerId - Provider id of auth service
 * @param {string} providerName - Provider name of auth service
 * @param {Object} misc - Misc data of the user (optional)
 * @param {string} user - User id (References User model) (optional - for non-onboarded users)
 */
export type AuthMapping = Model<{
	identifier: string;
	providerId: string;
	providerName: string;
	misc?: any;
	user: string | null;
}>;

/**
 * User model
 * @param {string} name - Name of the user (optional - defaults to email prefix)
 * @param {string} email - Email of the user
 * @param {string} role - Role of the user - ADMIN | MEMBER | GUEST
 * @param {string} phone - Phone number of the user (optional)
 * @param {string} avatar - Avatar of the user (optional)
 * @param {string} status - Status of the user (Joined, Invited)
 * @param {string} role - Role of the user (Member, Admin, Guest)
 * @param {string} invitedBy - ID of the user who invited the user (References User model) (optional - for invited users)
 */
export type User = Model<{
	name?: string;
	email: string;
	phone?: string;
	avatar?: string;
	status: T_USER_STATUS;
	role: T_USER_ROLE;
	invitedBy?: string;
}>;

/**
 * Otp model
 * @param {string} email - Email of the user
 * @param {string} otp - Otp of the user
 * @param {string} status - Status of the otp (Pending, Verified)
 */
export type Otp = Model<{
	email: string;
	otp: string;
	status: T_OTP_STATUS;
}>;

/**
 * Group model
 * @param {string} name - Name of the group
 * @param {string} icon - Icon of the group (optional)
 * @param {string} banner - Banner of the group (optional)
 * @param {string[]} tags - Array of tags (optional)
 * @param {string} author - ID of the user who created the group (References User model)
 */
export type Group = Model<{
	name: string;
	description?: string;
	icon?: string;
	banner?: string;
	tags?: Array<string>;
	author: string;
}>;

/**
 * Member model
 * @param {string} user - ID of the user (References User model)
 * @param {string} group - ID of the group (References Group model)
 * @param {string} status - Status of the member (Joined, Invited)
 * @param {string} role - Role of the member (Member, Admin)
 */
export type Member = Model<{
	user: string;
	group: string;
	status: T_MEMBER_STATUS;
	role: T_MEMBER_ROLE;
}>;

/**
 * Expense model
 * @param {string} title - Title of the expense
 * @param {number} amount - Amount of the expense
 * @param {string} author - ID of the user who created the expense (References User model)
 * @param {string} sender - ID of the user who paid for the expense (References User model)
 * @param {string} receiver - ID of the user who received the expense (References User model)
 * @param {string} type - Type of the expense (Paid, Received, Self, Settle)
 * @param {string} method - Method of the expense (UPI, Cash, Card, NetBanking)
 * @param {string} timestamp - Timestamp of the expense
 * @param {string} description - Description of the expense (optional)
 * @param {string} group - ID of the group (References Group model)
 * @param {string[]} tags - Set of tags (optional)
 * @param {string} icon - Icon for the expense (optional)
 */
export type Expense = Model<{
	title: string;
	amount: number;
	author: string;
	sender: string;
	receiver?: string;
	type: T_EXPENSE_TYPE;
	method: T_EXPENSE_METHOD;
	timestamp: string;
	description?: string;
	group?: string;
	tags?: Array<string>;
	icon?: string;
}>;

/**
 * Split model
 * @param {string} expense - ID of the expense (References Expense model)
 * @param {string} user - ID of the user (References User model)
 * @param {number} pending - Pending amount
 * @param {number} completed - Completed amount
 * @param {string} status - Status of the split (Pending, Confirmation Pending, Settled)
 */
export type Split = Model<{
	expense: string;
	user: string;
	pending: number;
	completed: number;
	status: T_SPLIT_STATUS;
}>;
