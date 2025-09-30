import { Cache } from "@/cache";
import { cacheParameter, EXPENSE_STATUS, HTTP } from "@/constants";
import { ApiError } from "@/errors";
import { expenseRepo, memberRepo, splitRepo } from "@/repo";
import {
	CreateModel,
	IExpense,
	IMember,
	T_EXPENSE_STATUS,
	UpdateModel,
	UpdateQuery,
} from "@/types";
import { CollectionUtils, isSubset, StringUtils } from "@/utils";
import { CacheService } from "./cache.service";
import { GroupService } from "./group.service";
import { MemberService } from "./member.service";
import { Expense, Member, Split } from "@/schema";
import { walletRepo } from "@/repo/wallet.repo";

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
			body.amount <= 0 ||
			splits.map((split) => split.amount).some((amount) => amount <= 0)
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
			const groupId = body.group!;
			// check if it is a valid group
			const foundGroup = await GroupService.getGroupDetailsById(groupId);
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
					groupId: body.group!.toString(),
				})
			);
		}
		return createdExpense;
	}

	public static async updateExpense({
		id,
		loggedInUserId,
	}: {
		body: UpdateModel<Expense>;
		loggedInUserId;
	}): Promise<IExpense> {
		// if amount is updated, members should be sent as well for validation
		if (amount !== null && members === null) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				HTTP.message.BAD_REQUEST
			);
		}
		if (amount !== null && members !== null && members !== undefined) {
			const totalDistributedAmount = members
				.map((member) => member.amount)
				.reduce((a, b) => a + b, 0);
			// check if amount distributed among members is equal to expense amount
			if (totalDistributedAmount !== amount) {
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
			foundExpense.createdBy.id !== loggedInUserId &&
			foundExpense.paidBy.id !== loggedInUserId
		) {
			throw new ApiError(HTTP.status.FORBIDDEN, "Forbidden");
		}
		const groupId = foundExpense.group.id;
		const foundGroup = await GroupService.getGroupById(groupId);
		if (!foundGroup) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Group not found");
		}
		if (amount !== null && members !== null && members !== undefined) {
			// check if all sent members are in the group
			if (
				!isSubset(
					members.map((m) => m.userId),
					foundGroup.members.map((m) => m.id)
				)
			) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Some members are not in the group"
				);
			}
			const currentMembersOfExpense = await memberRepo.find({
				expenseId: id,
			});
			if (currentMembersOfExpense === null) {
				if (members.length > 0) {
					const membersToCreateForCurrentExpense: Array<
						CreateModel<Member>
					> = members.map((member) => ({
						userId: member.userId,
						groupId,
						expenseId: id,
						amount: member.amount,
						owed:
							member.userId === (paidBy || foundExpense.paidBy.id)
								? 0
								: member.amount,
						paid:
							member.userId === (paidBy || foundExpense.paidBy.id)
								? member.amount
								: 0,
					}));
					await memberRepo.bulkCreate(
						membersToCreateForCurrentExpense
					);
				}
			} else {
				const membersToUpdateForCurrentExpense: Array<
					UpdateQuery<Member>
				> = [];
				const membersToRemoveForCurrentExpense: Array<Partial<Member>> =
					[];
				currentMembersOfExpense.forEach((member) => {
					const foundMember = members.find(
						(m) => m.userId === member.user.id
					);
					if (foundMember) {
						membersToUpdateForCurrentExpense.push({
							id: member.id,
							userId: member.user.id,
							groupId: member.group.id,
							expenseId: member.expense.id,
							amount: foundMember.amount,
							owed:
								foundMember.userId ===
								(paidBy ?? foundExpense.paidBy.id)
									? 0
									: foundMember.amount,
							paid:
								foundMember.userId ===
								(paidBy ?? foundExpense.paidBy.id)
									? foundMember.amount
									: 0,
						});
					} else {
						membersToRemoveForCurrentExpense.push({
							id: member.id,
							userId: member.user.id,
							groupId: member.group.id,
							expenseId: member.expense.id,
						});
					}
				});
				const membersToCreateForCurrentExpense: Array<
					CreateModel<Member>
				> = members
					.filter(
						(m) =>
							!currentMembersOfExpense
								.map((m) => m.user.id)
								.includes(m.userId)
					)
					.map((member) => ({
						userId: member.userId,
						groupId,
						expenseId: id,
						amount: member.amount,
						owed:
							member.userId === (paidBy ?? foundExpense.paidBy.id)
								? 0
								: member.amount,
						paid:
							member.userId === (paidBy ?? foundExpense.paidBy.id)
								? member.amount
								: 0,
					}));
				if (membersToCreateForCurrentExpense.length > 0) {
					await memberRepo.bulkCreate(
						membersToCreateForCurrentExpense
					);
				}
				if (membersToRemoveForCurrentExpense.length > 0) {
					await memberRepo.bulkRemove({
						_id: {
							$in: membersToRemoveForCurrentExpense.map(
								(m) => m.id
							),
						},
					});
				}
				if (membersToUpdateForCurrentExpense.length > 0) {
					await memberRepo.bulkUpdate(
						membersToUpdateForCurrentExpense.map((m) => ({
							filter: { _id: m.id },
							update: {
								$set: {
									amount: m.amount,
									owed: m.owed,
									paid: m.paid,
								},
							},
						}))
					);
				}
			}
		}
		const updatedExpenseBody: Partial<Expense> = {};
		if (title) updatedExpenseBody.title = title;
		if (amount) updatedExpenseBody.amount = amount;
		if (description) updatedExpenseBody.description = description;
		if (paidOn) updatedExpenseBody.paidOn = paidOn;
		if (paidBy) {
			// person who paid should be a part of the group
			if (
				!isSubset(
					[paidBy],
					foundGroup.members.map((m) => m.id)
				)
			) {
				throw new ApiError(
					HTTP.status.BAD_REQUEST,
					"Person who paid should be a part of the group"
				);
			}
			updatedExpenseBody.paidBy = paidBy;
		}
		if (status) {
			if (status === EXPENSE_STATUS.SETTLED) {
				await memberRepo.settleMany({ expenseId: id });
			}
		}
		const updatedExpense = await expenseRepo.update(
			{ id },
			updatedExpenseBody
		);
		if (!updatedExpense) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		}
		Cache.invalidate(
			CacheService.getKey(cacheParameter.GROUP_EXPENSES, {
				groupId: updatedExpense?.group.id,
			})
		);
		Cache.invalidate(
			CacheService.getKey(cacheParameter.EXPENSE, {
				id: updatedExpense?.id,
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
	}) {
		const foundExpense = await ExpenseService.getExpenseById(expenseId);
		if (!foundExpense)
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		if (
			foundExpense.createdBy.id !== loggedInUserId &&
			foundExpense.paidBy.id !== loggedInUserId
		) {
			throw new ApiError(HTTP.status.FORBIDDEN, HTTP.message.FORBIDDEN);
		}
		// remove all members for the current expense
		await memberRepo.bulkRemove({ expenseId });
		const removedExpense = await expenseRepo.remove({ id: expenseId });
		Cache.invalidate(
			CacheService.getKey(cacheParameter.GROUP_EXPENSES, {
				groupId: foundExpense.group.id,
			})
		);
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
	}): Promise<Array<IMember>> {
		const foundExpense = await ExpenseService.getExpenseById(expenseId);
		if (!foundExpense) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Expense not found");
		}
		if (foundExpense.paidBy.id !== loggedInUserId)
			throw new ApiError(
				HTTP.status.FORBIDDEN,
				"Only the person who paid can settle"
			);
		await memberRepo.settleMany({ expenseId });
		Cache.invalidate(
			CacheService.getKey(cacheParameter.GROUP_EXPENSES, {
				groupId: foundExpense.group.id,
			})
		);
		Cache.invalidate(
			CacheService.getKey(cacheParameter.EXPENSE, { id: expenseId })
		);
		return MemberService.getMembersOfExpense(expenseId);
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
