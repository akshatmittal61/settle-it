import { EXPENSE_STATUS, HTTP } from "@/constants";
import { ExpenseService } from "@/services";
import { ApiSuccess } from "@/server";
import {
	ApiRequest,
	ApiRequests,
	ApiResponse,
	ApiResponses,
	CreateModel,
	T_EXPENSE_METHOD,
	T_EXPENSE_STATUS,
	T_EXPENSE_TYPE,
} from "@/types";
import {
	CollectionUtils,
	getSearchParam,
	NumberUtils,
	SafetyUtils,
	StringUtils,
} from "@/utils";
import { Expense } from "@/schema";

export class ExpenseController {
	public static async getUsersExpenses(req: ApiRequest, res: ApiResponse) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const expenses =
			await ExpenseService.getExpensesForUser(loggedInUserId);
		return new ApiSuccess<ApiResponses.GetUsersExpenses>(res).send(
			expenses
		);
	}

	public static async createExpense(
		req: ApiRequest<ApiRequests.CreateExpense>,
		res: ApiResponse
	) {
		const loggedInUserId = StringUtils.getNonEmptyString(req.user?.id);
		const title = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString,
			req.body.title
		);
		const amount = SafetyUtils.genericParse(
			NumberUtils.valueOf,
			req.body.amount
		);
		const sender = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString,
			req.body.sender
		);
		const receiver = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body.receiver
		);
		const type = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString<T_EXPENSE_TYPE>,
			req.body.type
		);
		const method = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString<T_EXPENSE_METHOD>,
			req.body.method
		);
		const timestamp = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString,
			req.body.timestamp
		);
		const description = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body.description
		);
		const group = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body?.group
		);
		const tags = SafetyUtils.safeParse(
			CollectionUtils.valueOf<string>,
			req.body.tags
		);
		const icon = SafetyUtils.safeParse(
			StringUtils.getNonEmptyString,
			req.body.icon
		);
		const splits = SafetyUtils.safeParse(
			CollectionUtils.valueOf<{ userId: string; amount: number }>,
			req.body.splits
		);
		const body: Omit<CreateModel<Expense>, "author"> = {
			title,
			amount,
			sender,
			type,
			method,
			timestamp,
		};
		if (StringUtils.isNotEmpty(receiver)) {
			body.receiver = receiver;
		}
		if (StringUtils.isNotEmpty(description)) {
			body.description = description;
		}
		if (StringUtils.isNotEmpty(group)) {
			body.group = group;
		}
		if (CollectionUtils.isNotEmpty(tags)) {
			body.tags = tags;
		}
		if (StringUtils.isNotEmpty(icon)) {
			body.icon = icon;
		}
		const createdExpense = await ExpenseService.createExpense({
			body,
			loggedInUserId,
			splits,
		});
		return new ApiSuccess<ApiResponses.CreateExpense>(res)
			.status(HTTP.status.CREATED)
			.send(createdExpense);
	}

	public static async updateExpense(
		req: ApiRequest<ApiRequests.UpdateExpense>,
		res: ApiResponse
	) {
		const loggedInUserId = genericParse(getNonEmptyString, req.user?.id);
		const expenseId = genericParse(
			getNonEmptyString,
			getSearchParam(req.url, "expenseId")
		);
		const title = safeParse(getNonEmptyString, req.body.title);
		const amount = safeParse(getNonNegativeNumber, req.body.amount);
		const paidBy = safeParse(getNonEmptyString, req.body.paidBy);
		const paidOn = safeParse(getNonEmptyString, req.body.paidOn);
		const description = safeParse(getNonEmptyString, req.body.description);
		const status = safeParse(
			(s: T_EXPENSE_STATUS) => EXPENSE_STATUS[s],
			req.body.status
		);
		const members = safeParse(
			getArray<{ userId: string; amount: number }>,
			req.body.members
		);
		const updatedExpense = await ExpenseService.updateExpense({
			id: expenseId,
			loggedInUserId,
			title,
			amount,
			paidBy,
			paidOn,
			description,
			status,
			members,
		});
		return new ApiSuccess<ApiResponses.UpdateExpense>(res).send(
			updatedExpense
		);
	}

	public static async removeExpense(
		req: ApiRequest<ApiRequests.RemoveExpense>,
		res: ApiResponse
	) {
		const loggedInUserId = genericParse(getNonEmptyString, req.user?.id);
		const expenseId = genericParse(
			getNonEmptyString,
			getSearchParam(req.url, "expenseId")
		);
		const removedExpense = await ExpenseService.removeExpense({
			expenseId,
			loggedInUserId,
		});
		return new ApiSuccess<ApiResponses.RemoveExpense>(res).send(
			removedExpense!
		);
	}

	public static async settleExpense(
		req: ApiRequest<ApiRequests.SettleExpense>,
		res: ApiResponse
	) {
		const loggedInUserId = genericParse(getNonEmptyString, req.user?.id);
		const expenseId = genericParse(
			getNonEmptyString,
			getSearchParam(req.url, "expenseId")
		);
		const updatedMembersInfo = await ExpenseService.settleExpense({
			expenseId,
			loggedInUserId,
		});
		return new ApiSuccess<ApiResponses.SettleExpense>(res).send(
			updatedMembersInfo
		);
	}

	public static async memberPaidAmount(
		req: ApiRequest<ApiRequests.MemberPaidAmount>,
		res: ApiResponse
	) {
		const loggedInUserId = genericParse(getNonEmptyString, req.user?.id);
		const memberId = genericParse(
			getNonEmptyString,
			getSearchParam(req.url, "memberId")
		);
		const paidAmount = genericParse(
			getNonNegativeNumber,
			req.body.paidAmount
		);
		const updatedMembersInfo = await ExpenseService.memberPaidForExpense({
			memberId,
			loggedInUserId,
			paidAmount,
		});
		return new ApiSuccess<ApiResponses.MemberPaidAmount>(res).send(
			updatedMembersInfo
		);
	}
}
