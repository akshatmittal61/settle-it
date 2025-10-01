import { Cache } from "@/cache";
import {
	cacheParameter,
	HTTP,
	MEMBER_ROLE,
	MEMBER_STATUS,
	USER_ROLE,
} from "@/constants";
import { ApiError } from "@/errors";
import { Logger } from "@/log";
import {
	expenseRepo,
	groupRepo,
	memberRepo,
	splitRepo,
	userRepo,
} from "@/repo";
import { walletRepo } from "@/repo/wallet.repo";
import { Group } from "@/schema";
import { EmailService } from "@/services/email";
import {
	CreateGroupData,
	CreateModel,
	GroupSpread,
	IExpense,
	IGroup,
	IMember,
} from "@/types";
import { CollectionUtils, getUserDetails, SafetyUtils } from "@/utils";
import { CacheService } from "./cache.service";
import { UserService } from "./user.service";

export class GroupService {
	public static async getAllGroups(): Promise<Array<IGroup>> {
		return await groupRepo.findAll();
	}

	public static async getGroupById(id: string): Promise<IGroup | null> {
		return await CacheService.fetch(
			CacheService.getKey(cacheParameter.GROUP, { id }),
			() => groupRepo.findById(id)
		);
	}

	public static async getGroupDetailsById(
		id: string
	): Promise<GroupSpread | null> {
		return await CacheService.fetch(
			CacheService.getKey(cacheParameter.GROUP_DETAILS, { id }),
			() => groupRepo.findByIdWithMembers(id)
		);
	}

	private static async addMembers(
		groupId: string,
		newMembers: Array<string>
	): Promise<Array<IMember>> {
		return await memberRepo.bulkCreate(
			newMembers.map((member) => ({
				group: groupId,
				user: member,
				role: MEMBER_ROLE.MEMBER,
				status: MEMBER_STATUS.INVITED,
			}))
		);
	}

	private static async removeMembers(
		groupId: string,
		members: Array<string>
	): Promise<number> {
		return await memberRepo.bulkRemove({
			group: groupId,
			user: { $in: members },
		});
	}

	public static async getGroupsUserIsPartOf(
		userId: string
	): Promise<Array<IGroup>> {
		const membersForUser = await memberRepo.find({ user: userId });
		if (CollectionUtils.isEmpty(membersForUser)) return [];
		return membersForUser.map((member) => member.group);
	}

	public static async getAllGroupsDetailsForUser(
		userId: string
	): Promise<Array<GroupSpread>> {
		const groups = await GroupService.getGroupsUserIsPartOf(userId);
		// TODO: Implement this by Aggregate Queries
		// TODO: Cache this
		return Promise.all(
			groups.map((group) => group.id).map(GroupService.getGroupDetails)
		);
	}

	public static async getGroupDetails(groupId: string): Promise<GroupSpread> {
		const group = await GroupService.getGroupById(groupId);
		if (!SafetyUtils.isNonNull(group)) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Group not found");
		}
		const members = await memberRepo.find({ group: groupId });
		if (CollectionUtils.isEmpty(members)) {
			throw new ApiError(
				HTTP.status.NOT_FOUND,
				"Group members not found"
			);
		}
		return { ...group, members };
	}

	public static async getGroupDetailsForUser(
		userId: string,
		groupId: string
	): Promise<GroupSpread> {
		const groupSpread = await GroupService.getGroupDetails(groupId);
		if (
			!groupSpread.members
				.map((member) => member.user.id)
				.includes(userId)
		) {
			throw new ApiError(
				HTTP.status.FORBIDDEN,
				"User is not a member of this group"
			);
		}
		return groupSpread;
	}

	public static async getGroupDetailsForGroupAdmin(
		userId: string,
		groupId: string
	): Promise<GroupSpread> {
		const group = await GroupService.getGroupDetails(groupId);
		const members = await memberRepo.find({ group: groupId });
		if (CollectionUtils.isEmpty(members)) {
			throw new ApiError(
				HTTP.status.NOT_FOUND,
				"Group members not found"
			);
		}
		const admin = CollectionUtils.getSingletonValue(
			members.filter((member) => member.role === USER_ROLE.ADMIN)
		);
		if (admin.user.id !== userId) {
			throw new ApiError(
				HTTP.status.FORBIDDEN,
				"User is not an admin of this group"
			);
		}
		return group;
	}

	public static async sendInvitationToUsers(
		group: IGroup,
		users: Array<string>,
		invitedBy: string
	): Promise<void> {
		const invitedByUser = await UserService.getUserById(invitedBy);
		const allUsers = await userRepo.find({ _id: { $in: users } });
		if (
			CollectionUtils.isEmpty(allUsers) ||
			!SafetyUtils.isNonNull(invitedByUser)
		) {
			throw new ApiError(
				HTTP.status.NOT_FOUND,
				"Could not send invitation to users"
			);
		}
		const emailPromises = allUsers.map((user) =>
			EmailService.sendByTemplate(
				user.email,
				`${invitedByUser.name} has added you to ${group.name}`,
				"USER_ADDED_TO_GROUP",
				{
					invitedBy: {
						email: getUserDetails(invitedByUser).email,
						name: getUserDetails(invitedByUser).name || "",
					},
					group: {
						id: group.id,
						name: group.name,
					},
				}
			)
		);
		const emailsSent = await Promise.allSettled(emailPromises);
		const failedEmails = emailsSent.filter(
			(email) => email.status === "rejected"
		);
		if (CollectionUtils.isNotEmpty(failedEmails)) {
			Logger.warn(
				"Failed to send invitation to some users",
				failedEmails
			);
			throw new ApiError(
				HTTP.status.INTERNAL_SERVER_ERROR,
				"Could not send invitation to some users"
			);
		}
	}

	public static async createGroup({
		body,
		loggedInUserId,
		members,
	}: {
		body: CreateGroupData;
		loggedInUserId: string;
		members: Array<string>;
	}): Promise<GroupSpread> {
		members = CollectionUtils.getUniqueValues(members);
		if (!members.includes(loggedInUserId)) {
			members.push(loggedInUserId);
		}
		if (members.length <= 1) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"Group must have at least 2 members"
			);
		}
		Cache.invalidate(
			CacheService.getKey(cacheParameter.USER_GROUPS, {
				userId: loggedInUserId,
			})
		);
		const payload: CreateModel<Group> = { ...body, author: loggedInUserId };
		const createdGroup = await groupRepo.create(payload);
		try {
			await GroupService.sendInvitationToUsers(
				createdGroup,
				members.filter((m) => m !== loggedInUserId),
				loggedInUserId
			);
		} catch (e: any) {
			if (!(e instanceof ApiError)) {
				throw e;
			}
		}
		return GroupService.getGroupDetails(createdGroup.id);
	}

	public static async updateGroupDetails({
		groupId,
		loggedInUserId,
		body,
		members,
	}: {
		groupId: string;
		loggedInUserId: string;
		body: Partial<Group>;
		members: Array<string> | null;
	}): Promise<GroupSpread> {
		const foundGroup = await GroupService.getGroupDetailsForUser(
			loggedInUserId,
			groupId
		);
		if (CollectionUtils.isNotEmpty(members)) {
			if (!members.includes(loggedInUserId)) {
				members.push(loggedInUserId);
			}
			// get added members list
			const addedMembers = members.filter(
				(member) =>
					!foundGroup.members
						.map((member) => member.user.id)
						.includes(member)
			);
			if (addedMembers.length > 0) {
				await GroupService.addMembers(groupId, addedMembers);
			}
			// get removed members list
			const removedMembers = foundGroup.members
				.map((member) => member.user.id)
				.filter((memberUserId) => !members.includes(memberUserId));
			if (CollectionUtils.isNotEmpty(removedMembers)) {
				// check if removed user have any pending transactions
				const pendingTransactions = (
					await walletRepo.getSplitsForSomeGroupMembers(
						groupId,
						removedMembers
					)
				).filter((split) => split.pending > 0);
				if (CollectionUtils.isEmpty(pendingTransactions)) {
					const removedCount = await GroupService.removeMembers(
						groupId,
						removedMembers
					);
					if (removedCount !== removedMembers.length) {
						throw new ApiError(
							HTTP.status.BAD_REQUEST,
							"Could not remove members"
						);
					}
				} else {
					throw new ApiError(
						HTTP.status.BAD_REQUEST,
						"One (or more) removed users have pending transactions"
					);
				}
			}
		}
		Cache.invalidate(
			CacheService.getKey(cacheParameter.USER_GROUPS, {
				userId: loggedInUserId,
			})
		);
		Cache.invalidate(
			CacheService.getKey(cacheParameter.GROUP, { id: groupId })
		);
		await groupRepo.update({ id: groupId }, body);
		return GroupService.getGroupDetails(groupId);
	}

	public static async deleteGroup({
		groupId,
		loggedInUserId,
	}: {
		groupId: string;
		loggedInUserId: string;
	}) {
		await GroupService.getGroupDetailsForGroupAdmin(
			loggedInUserId,
			groupId
		);
		await Promise.all([
			splitRepo.removeSplitsForGroup(groupId),
			expenseRepo.bulkRemove({ group: groupId }),
			memberRepo.bulkRemove({ group: groupId }),
		]);
		const deletedGroup = await groupRepo.remove({ id: groupId });
		Cache.invalidate(
			CacheService.getKey(cacheParameter.USER_GROUPS, {
				userId: loggedInUserId,
			})
		);
		Cache.del(CacheService.getKey(cacheParameter.GROUP, { id: groupId }));
		Cache.del(
			CacheService.getKey(cacheParameter.GROUP_EXPENSES, { groupId })
		);
		return deletedGroup;
	}

	public static async updateMembersInGroup({
		groupId,
		loggedInUserId,
		members,
	}: {
		groupId: string;
		loggedInUserId: string;
		members: Array<string>;
	}) {
		const foundGroup = await GroupService.getGroupDetailsForGroupAdmin(
			loggedInUserId,
			groupId
		);
		if (
			CollectionUtils.isEmpty(members) ||
			(members.length === 1 && members.includes(loggedInUserId))
		) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"No members to update in group"
			);
		}
		if (!members.includes(loggedInUserId)) {
			members.push(loggedInUserId);
		}
		const existingMemberUserIds = foundGroup.members.map(
			(member) => member.user.id
		);
		const membersToAdd = members.filter(
			(member) => !existingMemberUserIds.includes(member)
		);
		const membersToRemove = existingMemberUserIds.filter(
			(member) => !members.includes(member)
		);
		if (
			CollectionUtils.isEmpty(membersToAdd) &&
			CollectionUtils.isEmpty(membersToRemove)
		) {
			throw new ApiError(
				HTTP.status.BAD_REQUEST,
				"No members to update in group"
			);
		}
		if (CollectionUtils.isNotEmpty(membersToAdd)) {
			await GroupService.addMembers(groupId, membersToAdd);
		}
		if (CollectionUtils.isNotEmpty(membersToRemove)) {
			await GroupService.removeMembers(groupId, membersToRemove);
		}
		Cache.invalidate(
			CacheService.getKey(cacheParameter.GROUP_EXPENSES, { groupId })
		);
		Cache.invalidate(
			CacheService.getKey(cacheParameter.USER_GROUPS, {
				userId: loggedInUserId,
			})
		);
		Cache.invalidate(
			CacheService.getKey(cacheParameter.GROUP, { id: groupId })
		);
		return GroupService.getGroupDetailsById(groupId);
	}

	public static async getGroupExpenses(
		groupId: string
	): Promise<Array<IExpense>> {
		const expenses = await CacheService.fetch(
			CacheService.getKey(cacheParameter.GROUP_EXPENSES, { groupId }),
			() => expenseRepo.getExpensesForGroup(groupId)
		);
		if (!expenses) return [];
		return expenses;
	}
}
