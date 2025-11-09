import { HTTP } from "@/constants";
import { ApiFailure, ApiSuccess } from "@/server";
import { GroupService, WalletService } from "@/services";
import {
	ApiRequest,
	ApiRequests,
	ApiResponse,
	ApiResponses,
	CreateGroupData,
	Group,
} from "@/types";
import { CollectionUtils, SafetyUtils, StringUtils } from "@/utils";

export class GroupController {
	public static async getGroupsForUser(req: ApiRequest, res: ApiResponse) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const groups =
			await GroupService.getAllGroupsDetailsForUser(loggedInUserId);
		return new ApiSuccess<ApiResponses.GetGroupsForUser>(res).send(groups);
	}
	public static async getGroupDetails(req: ApiRequest, res: ApiResponse) {
		const groupId = StringUtils.getNonEmptyString(req.group?.id);
		const groupDetails = await GroupService.getGroupDetails(groupId);
		return new ApiSuccess<ApiResponses.GetGroupDetails>(res).send(
			groupDetails
		);
	}
	public static async createGroup(
		req: ApiRequest<ApiRequests.CreateGroup>,
		res: ApiResponse
	) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const name = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString,
			req.body.name
		);
		const description = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body.description
		);
		const icon = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body.icon
		);
		const banner = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body.banner
		);
		const tags = SafetyUtils.safeParse(
			CollectionUtils.valueOf<string>,
			req.body.tags
		);
		const members = SafetyUtils.safeParse(
			CollectionUtils.valueOf<string>,
			req.body.members
		) || [loggedInUserId];
		const body: CreateGroupData = { name };
		if (StringUtils.isNotEmpty(description)) {
			body.description = description;
		}
		if (StringUtils.isNotEmpty(icon)) {
			body.icon = icon;
		}
		if (StringUtils.isNotEmpty(banner)) {
			body.banner = banner;
		}
		if (CollectionUtils.isNotEmpty(tags)) {
			body.tags = tags;
		}
		const createdGroup = await GroupService.createGroup({
			loggedInUserId,
			body,
			members,
		});
		return new ApiSuccess<ApiResponses.CreateGroup>(res)
			.status(HTTP.status.CREATED)
			.send(createdGroup);
	}
	public static async updateGroupDetails(
		req: ApiRequest<ApiRequests.UpdateGroup>,
		res: ApiResponse
	) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const groupId = StringUtils.getNonEmptyString(req.group?.id);
		const name = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body.name
		);
		const icon = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body.icon
		);
		const banner = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body.banner
		);
		const tags = SafetyUtils.safeParse(
			CollectionUtils.valueOf<string>,
			req.body.tags
		);
		const members = SafetyUtils.safeParse(
			CollectionUtils.valueOf<string>,
			req.body.members
		);
		const body: Partial<Group> = {};
		if (name) body.name = name;
		if (icon) body.icon = icon;
		if (banner) body.banner = banner;
		if (tags) body.tags = tags;
		const updatedGroup = await GroupService.updateGroupDetails({
			groupId,
			loggedInUserId,
			body,
			members,
		});
		if (updatedGroup == null) {
			return new ApiFailure(res)
				.status(HTTP.status.BAD_REQUEST)
				.message("Nothing to update")
				.send();
		}
		return new ApiSuccess<ApiResponses.UpdateGroupDetails>(res).send(
			updatedGroup
		);
	}
	public static async deleteGroup(
		req: ApiRequest<ApiRequests.DeleteGroup>,
		res: ApiResponse
	) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const groupId = StringUtils.getNonEmptyString(req.group?.id);
		const deletedGroup = await GroupService.deleteGroup({
			groupId,
			loggedInUserId,
		});
		if (deletedGroup == null) {
			return new ApiFailure(res)
				.status(HTTP.status.NOT_FOUND)
				.message("Group not found")
				.send();
		}
		return new ApiSuccess<ApiResponses.DeleteGroup>(res).send(deletedGroup);
	}
	public static async getGroupExpenses(req: ApiRequest, res: ApiResponse) {
		const groupId = StringUtils.getNonEmptyString(req.group?.id);
		const groupExpenses = await GroupService.getGroupExpenses(groupId);
		return new ApiSuccess<ApiResponses.GetGroupExpenses>(res).send(
			groupExpenses
		);
	}
	public static async getBalancesSummary(req: ApiRequest, res: ApiResponse) {
		const groupId = StringUtils.getNonEmptyString(req.group?.id);
		const groupSummary = await WalletService.getGroupSummary(groupId);
		return new ApiSuccess<ApiResponses.GetBalancesSummary>(res).send(
			groupSummary
		);
	}
	public static async getAllTransactions(req: ApiRequest, res: ApiResponse) {
		const groupId = StringUtils.getNonEmptyString(req.group?.id);
		const allTransactionsForGroup =
			await WalletService.getAllGroupTransactions(groupId);
		return new ApiSuccess<ApiResponses.GetTransactions>(res).send(
			allTransactionsForGroup
		);
	}
	public static async updateMembers(
		req: ApiRequest<ApiRequests.AddMembers>,
		res: ApiResponse
	) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const groupId = StringUtils.getNonEmptyString(req.group?.id);
		const members = SafetyUtils.genericParse(
			CollectionUtils.valueOf<string>,
			req.body.members
		);
		const updatedGroup = await GroupService.updateMembersInGroup({
			loggedInUserId,
			groupId,
			members,
		});
		if (updatedGroup == null) {
			return new ApiFailure(res)
				.status(HTTP.status.NOT_FOUND)
				.message("Group not found")
				.send();
		}
		return new ApiSuccess<ApiResponses.AddMembers>(res).send(updatedGroup);
	}
}
