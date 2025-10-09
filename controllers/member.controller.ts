import { ApiSuccess } from "@/server";
import { ApiRequest, ApiRequests, ApiResponse, ApiResponses } from "@/types";

export class MemberController {
	public static async getMembersForExpense(
		req: ApiRequest,
		res: ApiResponse
	) {
		// Logger.debug("getMembersForExpense -> url", req.url);
		// const expenseId = genericParse(
		// 	getNonEmptyString,
		// 	getSearchParam(req.url, "expenseId")
		// );
		// const members = await MemberService.getMembersOfExpense(expenseId);
		return new ApiSuccess<ApiResponses.GetMembersForExpense>(res)
			.send
			// members
			();
	}
	public static async settleMemberInExpense(
		req: ApiRequest<ApiRequests.SettleMemberInExpense>,
		res: ApiResponse
	) {
		// const loggedInUserId = genericParse(getNonEmptyString, req.user?.id);
		// const memberId = genericParse(
		// 	getNonEmptyString,
		// 	getSearchParam(req.url, "memberId")
		// );
		// const members = await ExpenseService.settleMemberInExpense({
		// 	memberId,
		// 	loggedInUserId,
		// });
		return new ApiSuccess<ApiResponses.SettleMemberInExpense>(res)
			.send
			// members
			();
	}
	public static async settleOwedMembersInGroup(
		req: ApiRequest<ApiRequests.SettleOwedMembersInGroup>,
		res: ApiResponse
	) {
		// const loggedInUserId = genericParse(getNonEmptyString, req.user?.id);
		// const userA = genericParse(getNonEmptyString, req.body.userA);
		// const userB = genericParse(getNonEmptyString, req.body.userB);
		// const groupId = genericParse(getNonEmptyString, req.group?.id);
		// const owedBalances = await MemberService.settleOwedMembersInGroup({
		// 	loggedInUserId,
		// 	groupId,
		// 	userA,
		// 	userB,
		// });
		return new ApiSuccess<ApiResponses.SettleOwedMembersInGroup>(res)
			.send
			// owedBalances
			();
	}
}
