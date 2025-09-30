import { ApiFailure, ApiSuccess } from "@/server";
import { UserService } from "@/services";
import {
	ApiRequest,
	ApiRequests,
	ApiResponse,
	ApiResponses,
	UpdateUser,
} from "@/types";
import {
	genericParse,
	getNonEmptyString,
	getNonNullValue,
	getString,
	safeParse,
} from "@/utils";

export class UserController {
	public static async updateUserProfile(
		req: ApiRequest<ApiRequests.UpdateUser>,
		res: ApiResponse
	) {
		const userId = genericParse(getNonEmptyString, req.user?.id);
		const name = safeParse(getString, req.body.name);
		const phone = safeParse(getString, req.body.phone);
		const avatar = safeParse(getString, req.body.avatar);
		const body: UpdateUser = {};
		if (name !== null) body["name"] = name;
		if (phone != null) body["phone"] = phone;
		if (avatar !== null) body["avatar"] = avatar;
		const user = await UserService.updateUserDetails(userId, body);
		if (user == null) {
			return new ApiFailure(res).send();
		}
		return new ApiSuccess<ApiResponses.UpdateUser>(res).send(user);
	}

	public static async inviteUser(
		req: ApiRequest<ApiRequests.InviteUser>,
		res: ApiResponse
	) {
		const loggedInUserId = genericParse(getNonEmptyString, req.user?.id);
		const invitee = genericParse(getNonEmptyString, req.body.email);
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
		const query = genericParse(getNonEmptyString, req.body.query);
		const users = await UserService.searchByEmail(query);
		return new ApiSuccess<ApiResponses.SearchUsers>(res).send(users);
	}

	public static async searchInBulk(
		req: ApiRequest<ApiRequests.BulkUserSearch>,
		res: ApiResponse
	) {
		const query = genericParse(getNonEmptyString, req.body.query);
		const invitee = getNonNullValue(req.user);
		const users = await UserService.searchInBulk(query, invitee);
		return new ApiSuccess<ApiResponses.BulkUserSearch>(res).send(users);
	}
}
