import { Model, T_OTP_STATUS, T_USER_ROLE, T_USER_STATUS } from "@/types";
import { ObjectId } from "mongoose";

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
 * @param {string} type - Type of the group (optional)
 * @param {string[]} members - Array of user ids (References User model)
 * @param {string} createdBy - ID of the user who created the group (References User model)
 */
export type Group = Model<{
	name: string;
	icon?: string;
	banner?: string;
	type?: string;
	members: string[];
	createdBy: string | ObjectId;
}>;

/**
 * Expense model
 * @param {string} title - Title of the expense
 * @param {number} amount - Amount of the expense
 * @param {string} groupId - ID of the group (References Group model)
 * @param {string} paidBy - ID of the user who paid the expense (References User model)
 * @param {string} createdBy - ID of the user who created the expense (References User model)
 * @param {string} description - Description of the expense (optional)
 * @param {string} paidOn - Date when the expense was paid (optional)
 */
export type Expense = Model<{
	title: string;
	amount: number;
	groupId: string | ObjectId;
	paidBy: string | ObjectId;
	createdBy: string | ObjectId;
	description?: string;
	paidOn?: string;
}>;

/**
 * Member model
 * @param {string} userId - ID of the user (References User model)
 * @param {string} groupId - ID of the group (References Group model)
 * @param {string} expenseId - ID of the expense (References Expense model)
 * @param {number} amount - Amount of the expense
 * @param {number} owed - Amount owed by the user
 * @param {number} paid - Amount paid by the user
 */
export type Member = Model<{
	userId: string;
	groupId: string;
	expenseId: string;
	amount: number;
	owed: number;
	paid: number;
}>;
