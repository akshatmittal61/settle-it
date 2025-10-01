import { Cache } from "@/cache";
import { cacheParameter, EXPENSE_STATUS, HTTP } from "@/constants";
import { ApiError } from "@/errors";
import { expenseRepo, memberRepo, splitRepo } from "@/repo";
import {
	CreateModel,
	GroupSpread,
	IExpense,
	IMember,
	ISplit,
	UpdateExpenseData,
	UpdateModel,
	UpdateQuery,
} from "@/types";
import { CollectionUtils, isSubset, SafetyUtils, StringUtils } from "@/utils";
import { CacheService } from "./cache.service";
import { GroupService } from "./group.service";
import { MemberService } from "./member.service";
import { Expense, Member, Split } from "@/schema";
import { walletRepo } from "@/repo/wallet.repo";
import { NumberUtils } from "@/utils/number";

export class ExpenseService {
	public static async getExpenseById(id: string): Promise<IExpense | null> {
		return await CacheService.fetch(
			CacheService.getKey(cacheParameter.EXPENSE, { id }),
			() => expenseRepo.findById(id)
		);
	}

	public static async getExpensesForUser(
		userId: string
	): Promise<Array<IExpense>> {
		const expenses = await walletRepo.getExpensesForUser(userId);
		if (!expenses) return [];
		return expenses;
	}

	public static async createExpense({
		body,
		loggedInUserId,
		splits,
	}: {
		body: Omit<CreateModel<Expense>, "author">;
		loggedInUserId: string;
		splits: Array<{ userId: string; amount: number }>;
	}): Promise<IExpense> {
		// if someone enters non-positive amount, in total or in a split, throw error
		if (
			NumberUtils.isNonPositiveNumber(body.amount) ||
			splits
				.map((split) => split.amount)
				.some(NumberUtils.isNonPositiveNumber)
		) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Amount should be greater than 0"
			);
		}
		const totalDistributedAmount = splits
			.map((split) => split.amount)
			.reduce((a, b) => a + b, 0);
		// check if amount distributed among members is equal to expense amount
		if (totalDistributedAmount !== body.amount) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Total amount distributed doesn't match"
			);
		}
		if (StringUtils.isNotEmpty(body.group)) {
			// check if it is a valid group
			const foundGroup = await GroupService.getGroupDetailsById(
				body.group
			);
			if (!foundGroup) {
				throw new ApiError(HTTP.status.NOT_FOUND, "Group not found");
			}
			if (CollectionUtils.isEmpty(splits)) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Please split your expense for group"
				);
			}
			// all members should be a part of that group
			const existingMembersUserIds = foundGroup.members.map(
				(m) => m.user.id
			);
			// current user should be a part of the group
			if (!existingMembersUserIds.includes(loggedInUserId)) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Current user is not a part of the group"
				);
			}
			if (
				splits
					.map((s) => s.userId)
					.some((id) => !existingMembersUserIds.includes(id))
			) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Some members are not in the group"
				);
			}
		}
		const payload = { ...body, author: loggedInUserId };
		const createdExpense = await expenseRepo.create(payload);
		// initially, all members are pending, and they have to pay the expense
		const splitsForCurrentExpense: Array<CreateModel<Split>> = splits.map(
			(split) => ({
				user: split.userId,
				expense: createdExpense.id,
				pending: split.userId === body.sender ? 0 : split.amount,
				completed: split.userId === body.sender ? split.amount : 0,
			})
		);
		await splitRepo.bulkCreate(splitsForCurrentExpense);
		if (StringUtils.isNotEmpty(body.group)) {
			Cache.invalidate(
				CacheService.getKey(cacheParameter.GROUP_EXPENSES, {
					groupId: body.group,
				})
			);
		}
		return createdExpense;
	}

	public static async updateExpense({
		id,
		body,
		splits,
		loggedInUserId,
	}: {
		id: string;
		body: UpdateExpenseData;
		splits: Array<{ userId: string; amount: number }> | null;
		loggedInUserId: string;
	}): Promise<IExpense> {
		const updatedAmount = body.amount;
		if (
			NumberUtils.isNotEmpty(body.amount) &&
			CollectionUtils.isEmpty(splits)
		) {
			// if amount is updated, members should be sent as well for validation
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Please split your expense properly"
			);
		}
		if (
			NumberUtils.isNotEmpty(updatedAmount) &&
			CollectionUtils.isNotEmpty(splits)
		) {
			const totalDistributedAmount = splits!
				.map((split) => split.amount)
				.reduce((a, b) => a + b, 0);
			if (
				NumberUtils.isNonPositiveNumber(updatedAmount) ||
				splits
					.map((split) => split.amount)
					.some(NumberUtils.isNonPositiveNumber)
			) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Amount should be greater than 0"
				);
			}
			// check if amount distributed among members is equal to expense amount
			if (totalDistributedAmount !== body.amount) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Total amount distributed doesn't match"
				);
			}
		}
		const foundExpense = await ExpenseService.getExpenseById(id);
		if (!foundExpense)
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		// the user can only edit expense if
		// - it is created by the user
		// - or it is paid by the user
		if (
			foundExpense.author.id !== loggedInUserId &&
			foundExpense.sender.id !== loggedInUserId
		) {
			throw new ApiError(HTTP.status.FORBIDDEN, "Forbidden");
		}
		let foundGroup: GroupSpread | null = null;
		if (SafetyUtils.isNonNull(foundExpense.group)) {
			const groupId = foundExpense.group.id;
			foundGroup = await GroupService.getGroupDetailsById(groupId);
			if (!SafetyUtils.isNonNull(foundGroup)) {
				throw new ApiError(HTTP.status.NOT_FOUND, "Group not found");
			}
		}
		// for amount change, work with re-distributed splits
		if (
			NumberUtils.isNotEmpty(updatedAmount) &&
			CollectionUtils.isNotEmpty(splits)
		) {
			if (SafetyUtils.isNonNull(foundGroup)) {
				// check if all sent members are in the group
				const userIdsOfMembersOfGroup = foundGroup.members.map(
					(m) => m.user.id
				);
				const userIdsOfSplits = splits.map((s) => s.userId);
				if (
					!CollectionUtils.isSubset(
						userIdsOfSplits,
						userIdsOfMembersOfGroup
					)
				) {
					throw new ApiError(
						HTTP.status.BAD_REQUEST,
						"Some members of splits are not in the group"
					);
				}
			}
			// const currentMembersOfExpense = await memberRepo.find({
			// 	expenseId: id,
			// });
			const currentSplitsOfExpense = await splitRepo.find({
				expense: id,
			});
			if (currentSplitsOfExpense === null) {
				const splitsToCreateForCurrentExpense: Array<
					CreateModel<Split>
				> = splits.map((split) => ({
					user: split.userId,
					expense: id,
					pending:
						split.userId === (body.sender || foundExpense.sender.id)
							? 0
							: split.amount,
					completed:
						split.userId === (body.sender || foundExpense.sender.id)
							? split.amount
							: 0,
				}));
				await splitRepo.bulkCreate(splitsToCreateForCurrentExpense);
			} else {
				const splitsToUpdateForCurrentExpense: Array<
					UpdateQuery<Split>
				> = [];
				const splitsToRemoveForCurrentExpense: Array<Partial<Split>> =
					[];
				currentSplitsOfExpense.forEach((split) => {
					const foundSplit = splits.find(
						(s) => s.userId === split.user.id
					);
					if (foundSplit) {
						splitsToUpdateForCurrentExpense.push({
							id: split.id,
							user: split.user.id,
							expense: split.expense.id,
							pending:
								foundSplit.userId ===
								(body.sender ?? foundExpense.sender.id)
									? 0
									: foundSplit.amount,
							completed:
								foundSplit.userId ===
								(body.sender ?? foundExpense.sender.id)
									? foundSplit.amount
									: 0,
						});
					} else {
						splitsToRemoveForCurrentExpense.push({
							id: split.id,
							user: split.user.id,
							expense: split.expense.id,
						});
					}
				});
				const splitsToCreateForCurrentExpense: Array<
					CreateModel<Split>
				> = splits
					.filter(
						(split) =>
							!currentSplitsOfExpense
								.map((currentSplit) => currentSplit.user.id)
								.includes(split.userId)
					)
					.map((split) => ({
						user: split.userId,
						expense: id,
						pending:
							split.userId ===
							(body.sender ?? foundExpense.sender.id)
								? 0
								: split.amount,
						completed:
							split.userId ===
							(body.sender ?? foundExpense.sender.id)
								? split.amount
								: 0,
					}));
				if (splitsToCreateForCurrentExpense.length > 0) {
					await splitRepo.bulkCreate(splitsToCreateForCurrentExpense);
				}
				if (splitsToRemoveForCurrentExpense.length > 0) {
					await splitRepo.bulkRemove({
						_id: {
							$in: splitsToRemoveForCurrentExpense.map(
								(split) => split.id
							),
						},
					});
				}
				if (splitsToUpdateForCurrentExpense.length > 0) {
					await splitRepo.bulkUpdate(
						splitsToUpdateForCurrentExpense.map((split) => ({
							filter: { _id: split.id },
							update: {
								$set: {
									pending: split.pending,
									completed: split.completed,
								},
							},
						}))
					);
				}
			}
		}
		if (body.sender) {
			// for groups, person who paid should be a part of the group
			if (SafetyUtils.isNonNull(foundGroup)) {
				if (
					!CollectionUtils.isSubset(
						[body.sender],
						foundGroup.members.map((m) => m.user.id)
					)
				) {
					throw new ApiError(
						HTTP.status.BAD_REQUEST,
						"Person who paid should be a part of the group"
					);
				}
			}
		}
		if (body.receiver) {
			// for groups, person who received should be a part of the group
			if (SafetyUtils.isNonNull(foundGroup)) {
				if (
					!CollectionUtils.isSubset(
						[body.receiver],
						foundGroup.members.map((m) => m.user.id)
					)
				) {
					throw new ApiError(
						HTTP.status.BAD_REQUEST,
						"Person who received should be a part of the group"
					);
				}
			}
		}
		/* if (body.status) {
			if (body.status === EXPENSE_STATUS.SETTLED) {
				await memberRepo.settleMany({ expenseId: id });
			}
		} */
		const updatedExpense = await expenseRepo.update({ id }, body);
		if (!SafetyUtils.isNonNull(updatedExpense)) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		}
		if (SafetyUtils.isNonNull(foundGroup)) {
			Cache.invalidate(
				CacheService.getKey(cacheParameter.GROUP_EXPENSES, {
					groupId: foundGroup.id,
				})
			);
		}
		Cache.invalidate(
			CacheService.getKey(cacheParameter.EXPENSE, {
				id: updatedExpense.id,
			})
		);
		return updatedExpense;
	}

	public static async removeExpense({
		expenseId,
		loggedInUserId,
	}: {
		expenseId: string;
		loggedInUserId: string;
	}): Promise<IExpense> {
		const foundExpense = await ExpenseService.getExpenseById(expenseId);
		if (!foundExpense)
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		if (
			foundExpense.author.id !== loggedInUserId &&
			foundExpense.sender.id !== loggedInUserId
		) {
			throw new ApiError(HTTP.status.FORBIDDEN, HTTP.message.FORBIDDEN);
		}
		// remove all splits for the current expense
		await splitRepo.bulkRemove({ expense: expenseId });
		const removedExpense = await expenseRepo.remove({ id: expenseId });
		if (!SafetyUtils.isNonNull(removedExpense)) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		}
		if (SafetyUtils.isNonNull(removedExpense.group)) {
			Cache.invalidate(
				CacheService.getKey(cacheParameter.GROUP_EXPENSES, {
					groupId: removedExpense.group.id,
				})
			);
		}
		Cache.del(
			CacheService.getKey(cacheParameter.EXPENSE, { id: expenseId })
		);
		return removedExpense;
	}

	public static async settleExpense({
		expenseId,
		loggedInUserId,
	}: {
		expenseId: string;
		loggedInUserId: string;
	}): Promise<Array<ISplit>> {
		const foundExpense = await ExpenseService.getExpenseById(expenseId);
		if (!SafetyUtils.isNonNull(foundExpense)) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		}
		if (foundExpense.sender.id !== loggedInUserId) {
			throw new ApiError(
				HTTP.status.FORBIDDEN,
				"Only the person who paid can settle"
			);
		}
		await splitRepo.settleMany({ expense: expenseId });
		if (SafetyUtils.isNonNull(foundExpense.group)) {
			Cache.invalidate(
				CacheService.getKey(cacheParameter.GROUP_EXPENSES, {
					groupId: foundExpense.group.id,
				})
			);
		}
		Cache.invalidate(
			CacheService.getKey(cacheParameter.EXPENSE, { id: expenseId })
		);
		// TODO: See if we can cache splits
		const updatedSplits = await splitRepo.find({ expense: expenseId });
		if (CollectionUtils.isEmpty(updatedSplits)) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Splits not found");
		}
		return updatedSplits;
	}

	public static async memberPaidForExpense({
		memberId,
		loggedInUserId,
		paidAmount,
	}: {
		memberId: string;
		loggedInUserId: string;
		paidAmount: number;
	}): Promise<Array<IMember>> {
		const foundMember = await memberRepo.findById(memberId);
		if (!foundMember) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Member not found");
		}
		const foundExpense = await ExpenseService.getExpenseById(
			foundMember.expense.id
		);
		if (!foundExpense) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		}
		if (foundExpense.paidBy.id !== loggedInUserId) {
			throw new ApiError(
				HTTP.status.FORBIDDEN,
				"Only the person who paid can settle"
			);
		}
		if (foundMember.owed === paidAmount) {
			await memberRepo.settleOne({
				expenseId: foundMember.expense.id,
				id: memberId,
			});
		} else {
			await memberRepo.update(
				{ id: memberId },
				{
					owed: foundMember.owed - paidAmount,
					paid: foundMember.paid + paidAmount,
				}
			);
		}
		Cache.invalidate(
			CacheService.getKey(cacheParameter.GROUP_EXPENSES, {
				groupId: foundExpense.group.id,
			})
		);
		Cache.invalidate(
			CacheService.getKey(cacheParameter.EXPENSE, {
				id: foundExpense?.id,
			})
		);
		return MemberService.getMembersOfExpense(foundMember.expense.id);
	}

	public static async settleMemberInExpense({
		memberId,
		loggedInUserId,
	}: {
		memberId: string;
		loggedInUserId: string;
	}) {
		const foundMember = await memberRepo.findById(memberId);
		if (!foundMember) throw new Error("Member not found");
		const foundExpense = foundMember.expense;
		const expenseId = foundExpense.id;
		if (foundExpense.paidBy.id !== loggedInUserId) {
			throw new ApiError(
				HTTP.status.FORBIDDEN,
				"You did not paid for this expense"
			);
		}
		const settledMember = await memberRepo.settleOne({
			expenseId,
			id: memberId,
		});
		if (!settledMember)
			throw new ApiError(HTTP.status.NOT_FOUND, "Member not found");
		Cache.invalidate(
			CacheService.getKey(cacheParameter.GROUP_EXPENSES, {
				groupId: foundExpense.group.id,
			})
		);
		Cache.invalidate(
			CacheService.getKey(cacheParameter.EXPENSE, { id: foundExpense.id })
		);
		return await MemberService.getMembersOfExpense(expenseId);
	}
}
