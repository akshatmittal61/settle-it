import { ObjectId } from "@/db";
import { ExpenseModel, SplitModel } from "@/models";
import {
	Expense,
	IExpense,
	ITransaction,
	IUser,
	Share,
	Split,
	Transaction,
} from "@/types";
import { getObjectFromMongoResponse, NumberUtils, SafetyUtils } from "@/utils";
import { BaseRepo } from "./base";

class WalletRepo extends BaseRepo<Expense, IExpense> {
	model = ExpenseModel;

	/**
	 * Fetches all expenses for a user.
	 * Get all expenses created by the user
	 * Get all expenses where the user is a part of the split
	 * Get all expenses where the user is a part of the group
	 *
	 * @param userId
	 */
	public async getExpensesForUser(userId: string) {
		/*
		SELECT * FROM expenses
		WHERE author = :userId
		OR id IN (SELECT expense FROM splits WHERE user = :userId)
		OR group IN (SELECT group FROM members WHERE user = :userId);
		*/
		const expenses = await ExpenseModel.aggregate([
			// Stage 1: Conditional Lookup for matching Splits
			// Finds any split records for this expense ID where the user is the target user.
			{
				$lookup: {
					from: "splits", // Corresponds to SplitModel
					let: { expenseId: "$_id" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$expense", "$$expenseId"] }, // Join condition: splits.expense == expenses._id
										{ $eq: ["$user", userId] }, // WHERE condition: splits.user == :userId
									],
								},
							},
						},
					],
					as: "splitMatches",
				},
			},

			// Stage 2: Conditional Lookup for matching Group Membership
			// Finds any member records for this expense's group ID where the user is a member.
			{
				$lookup: {
					from: "members", // Corresponds to MemberModel
					let: { groupId: "$group" },
					pipeline: [
						{
							$match: {
								$expr: {
									$and: [
										{ $eq: ["$group", "$$groupId"] }, // Join condition: members.group == expenses.group
										{ $eq: ["$user", userId] }, // WHERE condition: members.user == :userId
									],
								},
							},
						},
					],
					as: "memberMatches",
				},
			},

			// Stage 3: Match the expenses based on the three OR conditions
			{
				$match: {
					$or: [
						// Condition 1: Direct match on author field
						{ author: userId },

						// Condition 2: A matching split record was found (splitMatches is not empty)
						{ splitMatches: { $ne: [] } },

						// Condition 3: A matching group membership record was found (memberMatches is not empty)
						// Note: This check correctly handles expenses with a null/missing 'group' field,
						// as the lookup pipeline won't find a match if 'group' is null/missing.
						{ memberMatches: { $ne: [] } },
					],
				},
			},

			// Stage 4 (Optional but recommended): Clean up the temporary join fields
			{
				$project: {
					splitMatches: 0,
					memberMatches: 0,
				},
			},
		]);
		if (!expenses) return [];
		return expenses;
	}

	public async getSplitsForSomeGroupMembers(
		groupId: string,
		userIds: Array<string>
	): Promise<Array<Split>> {
		const result = await SplitModel.aggregate([
			{
				$match: {
					user: { $in: userIds },
				},
			},
			{
				$lookup: {
					from: "expenses",
					localField: "expense",
					foreignField: "_id",
					as: "expense",
				},
			},
			{
				$unwind: "$expense",
			},
			{
				$match: {
					"expense.group": new ObjectId(groupId),
				},
			},
			{
				$project: {
					_id: 1,
					user: "$user",
					expense: "$expense._id",
					completed: "$completed",
					pending: "$pending",
					createdAt: "$expense.createdAt",
					updatedAt: "$expense.updatedAt",
				},
			},
		]);
		return result
			.map(getObjectFromMongoResponse<Split>)
			.filter(SafetyUtils.isNonNull);
	}

	/**
	 * Computes the total expenditure for a group by summing the `amount` of all expenses in that group.
	 *
	 * Process (MongoDB aggregation pipeline):
	 * - $match: Filter documents by `groupId`.
	 * - $group: Group by `groupId` and sum the `amount` field as `totalAmountSpent`.
	 * - $project: Remove `_id`, expose `groupId` and `totalAmountSpent`.
	 *
	 * Input:
	 * - groupId: string (Mongo ObjectId as string) identifying the group.
	 *
	 * Output:
	 * - number representing the aggregated total amount. Returns 0 when no expenses are found.
	 *
	 * Edge cases:
	 * - If there are no matching expenses, pipeline returns an empty array => we return 0.
	 */
	public async getTotalExpenditureForGroup(groupId: string): Promise<number> {
		const result = await ExpenseModel.aggregate([
			{
				$match: {
					group: new ObjectId(groupId),
				},
			},
			{
				$group: {
					_id: "$group",
					totalAmountSpent: { $sum: "$amount" },
				},
			},
			{
				$project: {
					_id: 0,
					groupId: "$_id",
					totalAmountSpent: 1,
				},
			},
		]);
		if (result.length === 0) {
			return 0;
		}
		return result[0].totalAmountSpent;
	}

	/**
	 * Builds a compact pairwise transaction summary for a group.
	 *
	 * Purpose:
	 * - For each (member -> expense.paidBy) pair, aggregate how much the member still owes and has already paid.
	 * - Output is a list of directed edges suitable for higher-level balance computations.
	 *
	 * Process (MongoDB aggregation pipeline):
	 * 1) $match: limit members by groupId.
	 * 2) $lookup expenses by each member's expenseId.
	 * 3) $unwind: flatten the joined expense array to a single document per member-expense.
	 * 4) $group by { userId, expense.paidBy } and sum owed/paid.
	 *
	 * Post-processing:
	 * - map to { from, to, stillOwes, hasPaid }
	 * - filter out self-edges (from === to)
	 * - filter out edges where both stillOwes and hasPaid are zero
	 * - map to Transaction shape { from, to, owed, paid }
	 *
	 * Input:
	 * - groupId: string (Mongo ObjectId as string)
	 *
	 * Output:
	 * - Array<Transaction> where `from` and `to` are userId strings, and `owed`/`paid` are totals.
	 */
	public async getAllTransactionsSummaryForGroup(
		groupId: string
	): Promise<Array<Transaction>> {
		const result = await this.model.aggregate([
			// get members involved in this group
			{
				$match: {
					groupId: new ObjectId(groupId),
				},
			},
			// populate expenses in every member
			{
				$lookup: {
					from: "expenses",
					localField: "expenseId",
					foreignField: "_id",
					as: "expense",
				},
			},
			// only get first expense from the array
			{
				$unwind: "$expense",
			},
			// group by member.userId and member.expense.paidBy
			{
				$group: {
					_id: {
						userId: "$userId",
						expensePaidBy: "$expense.paidBy",
					},
					totalOwed: { $sum: "$owed" },
					totalPaid: { $sum: "$paid" },
				},
			},
		]);
		// build the summary array of 'from-to-stillOwes-hasPaid'

		return result
			.map((a) => ({
				from: a._id.userId.toString(),
				to: a._id.expensePaidBy.toString(),
				stillOwes: a.totalOwed,
				hasPaid: a.totalPaid,
			}))
			.filter((a) => a.from !== a.to)
			.filter((a) => a.stillOwes > 0 || a.hasPaid > 0)
			.map((a) => ({
				from: a.from,
				to: a.to,
				owed: a.stillOwes,
				paid: a.hasPaid,
			}));
	}
	/**
	 * Returns the full denormalized transaction list for a group with populated users.
	 *
	 * Purpose:
	 * - Provide detailed audit-friendly records: title, from (user), to (paidBy), owed, paid.
	 * - Unlike the summary endpoint, this keeps user objects populated for rich display.
	 *
	 * Process (MongoDB aggregation pipeline):
	 * 1) $match group members by groupId.
	 * 2) $lookup the expense for each member.
	 * 3) $unwind expense.
	 * 4) $lookup the `user` (member.userId) and unwind.
	 * 5) $lookup the `expense.paidBy` and unwind.
	 * 6) $project desired fields and strip _id.
	 *
	 * Post-processing:
	 * - Convert raw user docs to IUser using getObjectFromMongoResponse.
	 * - Cast owed/paid to numbers and drop self-edges (from.id !== to.id).
	 *
	 * Input:
	 * - groupId: string
	 *
	 * Output:
	 * - Array<ITransaction> where `from` and `to` are IUser objects.
	 */
	public async getAllTransactionsForGroup(
		groupId: string
	): Promise<Array<ITransaction>> {
		const result = await this.model.aggregate([
			// get members involved in this group
			{
				$match: {
					groupId: new ObjectId(groupId),
				},
			},
			// populate expenses in every member
			{
				$lookup: {
					from: "expenses",
					localField: "expenseId",
					foreignField: "_id",
					as: "expense",
				},
			},
			// only get first expense from the array
			{
				$unwind: "$expense",
			},
			// populate user
			{
				$lookup: {
					from: "users",
					localField: "userId",
					foreignField: "_id",
					as: "user",
				},
			},
			// only get first user from the array
			{
				$unwind: "$user",
			},
			// populate expense.paidBy
			{
				$lookup: {
					from: "users",
					localField: "expense.paidBy",
					foreignField: "_id",
					as: "expense.paidBy",
				},
			},
			// only get first user from the array
			{
				$unwind: "$expense.paidBy",
			},
			{
				$project: {
					_id: 0,
					title: "$expense.title",
					from: "$user",
					to: "$expense.paidBy",
					owed: "$owed",
					paid: "$paid",
				},
			},
		]);
		return result
			.map((obj: any) => ({
				...obj,
				from: getObjectFromMongoResponse<IUser>(obj.from),
				to: getObjectFromMongoResponse<IUser>(obj.to),
				owed: NumberUtils.valueOf(obj.owed),
				paid: NumberUtils.valueOf(obj.paid),
			}))
			.filter((obj) => obj.from.id !== obj.to.id);
	}
	/**
	 * Aggregates each member's total share (amount) within a group.
	 *
	 * Purpose:
	 * - Compute per-user contribution totals for use in share charts and summaries.
	 *
	 * Process (MongoDB aggregation pipeline):
	 * 1) $match by groupId.
	 * 2) $group by userId and sum `amount`.
	 * 3) $project to { user, amount } with stringified user id.
	 *
	 * Input:
	 * - groupId: string
	 *
	 * Output:
	 * - Array<Share> where each item is { user: string, amount: number }.
	 */
	public async getSharesForGroup(groupId: string): Promise<Array<Share>> {
		const result = await this.model.aggregate([
			// get members involved in this group
			{
				$match: {
					groupId: new ObjectId(groupId),
				},
			},
			// group member by user id
			{
				$group: {
					_id: "$userId",
					amount: { $sum: "$amount" },
				},
			},
			{
				$project: {
					_id: 0,
					user: "$_id",
					amount: 1,
				},
			},
		]);
		return result.map((res) => ({
			user: res.user.toString(),
			amount: res.amount,
		}));
	}
}

export const walletRepo = WalletRepo.getInstance<WalletRepo>();
