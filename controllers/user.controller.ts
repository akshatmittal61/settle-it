import { ApiSuccess } from "@/server";
import { UserService } from "@/services";
import {
	ApiRequest,
	ApiRequests,
	ApiResponse,
	ApiResponses,
	UpdateUser,
} from "@/types";
import { SafetyUtils, StringUtils } from "@/utils";

export class UserController {
	public static async updateUserProfile(
		req: ApiRequest<ApiRequests.UpdateUser>,
		res: ApiResponse
	) {
		const userId = StringUtils.getNonEmptyString(req.user?.id);
		const name = SafetyUtils.safeParse(StringUtils.valueOf, req.body.name);
		const phone = SafetyUtils.safeParse(
			StringUtils.valueOf,
			req.body.phone
		);
		const avatar = SafetyUtils.safeParse(
			StringUtils.valueOf,
			req.body.avatar
		);
		const body: UpdateUser = {};
		if (StringUtils.isNotEmpty(name)) body["name"] = name;
		if (StringUtils.isNotEmpty(phone)) body["phone"] = phone;
		if (StringUtils.isNotEmpty(avatar)) body["avatar"] = avatar;
		const user = await UserService.updateUserDetails(userId, body);
		return new ApiSuccess<ApiResponses.UpdateUser>(res).send(user);
	}

	public static async inviteUser(
		req: ApiRequest<ApiRequests.InviteUser>,
		res: ApiResponse
	) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const invitee = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString,
			req.body.email
		);
		const invitedUser = await UserService.inviteUser(
			loggedInUserId,
			invitee
		);
		return new ApiSuccess<ApiResponses.InviteUser>(res).send(invitedUser);
	}

	public static async searchForUsers(
		req: ApiRequest<ApiRequests.SearchUsers>,
		res: ApiResponse
	) {
		const query = StringUtils.getNonEmptyString(req.body.query);
		const users = await UserService.searchByEmail(query);
		return new ApiSuccess<ApiResponses.SearchUsers>(res).send(users);
	}

	public static async searchInBulk(
		req: ApiRequest<ApiRequests.BulkUserSearch>,
		res: ApiResponse
	) {
		const query = StringUtils.getNonEmptyString(req.body.query);
		const invitee = SafetyUtils.getNonNullValue(req.user);
		const users = await UserService.searchInBulk(query, invitee);
		return new ApiSuccess<ApiResponses.BulkUserSearch>(res).send(users);
	}
}
