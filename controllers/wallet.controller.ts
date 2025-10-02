import { ApiRequest, ApiRequests, ApiResponse, ApiResponses } from "@/types";
import { getSearchParam, StringUtils } from "@/utils";
import { ExpenseService, WalletService } from "@/services";
import { ApiSuccess } from "@/server";

export class WalletController {
	public static async getSplitsForExpense(req: ApiRequest, res: ApiResponse) {
		const expenseId = StringUtils.getNonEmptyString(
			getSearchParam(req.url, "expenseId")
		);
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const splits = await ExpenseService.getSplitsForExpense({
			expenseId,
			loggedInUserId,
		});
		return new ApiSuccess<ApiResponses.GetSplitsForExpense>(res).send(
			splits
		);
	}

	public static async settleSplitInExpense(
		req: ApiRequest<ApiRequests.SettleSplitInExpense>,
		res: ApiResponse
	) {
		const splitId = StringUtils.getNonEmptyString(
			getSearchParam(req.url, "splitId")
		);
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const updatedSplits = await ExpenseService.settleSplitInExpense({
			splitId,
			loggedInUserId,
		});
		return new ApiSuccess<ApiResponses.SettleSplitInExpense>(res).send(
			updatedSplits
		);
	}

	public static async settleExpense(
		req: ApiRequest<ApiRequests.SettleExpense>,
		res: ApiResponse
	) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const expenseId = StringUtils.getNonEmptyString(
			getSearchParam(req.url, "expenseId")
		);
		const updatedSplits = await ExpenseService.settleExpense({
			expenseId,
			loggedInUserId,
		});
		return new ApiSuccess<ApiResponses.SettleExpense>(res).send(
			updatedSplits
		);
	}

	public static async settleMemberInGroup(
		req: ApiRequest<ApiRequests.SettleMemberInGroup>,
		res: ApiResponse
	) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const groupId = StringUtils.getNonEmptyString(
			getSearchParam(req.url, "groupId")
		);
		// const sender = req.body.sender
		const sender = StringUtils.getNonEmptyString(req.body.sender);
		const receiver = StringUtils.getNonEmptyString(req.body.receiver);
		const settledMember = await WalletService.settleMemberInGroup({
			memberId: member,
			groupId,
			loggedInUserId,
		});
		return new ApiSuccess<ApiResponses.SettleMemberInGroup>(res).send(
			settledMember
		);
	}
}
