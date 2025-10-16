import { http } from "@/client";
import { ApiRequests, ApiRes, ApiResponses } from "@/types";

export class MemberApi {
	public static async settleMemberInExpense(
		{
			// groupId,
			expenseId,
			memberId,
		}: {
			// groupId: string;
			expenseId: string;
			memberId: string;
		},
		headers?: any
	) {
		const response = await http.patch<
			ApiRes<ApiResponses.SettleMemberInExpense>,
			ApiRequests.SettleMemberInExpense
		>(
			`/group/expense/members/settle?expenseId=${expenseId}&memberId=${memberId}`,
			null,
			{ headers }
		);
		return response.data;
	}

	public static async settleOwedMembersInGroup(
		groupId: string,
		userA: string,
		userB: string
	) {
		const response = await http.patch<
			ApiRes<ApiResponses.SettleOwedMembersInGroup>,
			ApiRequests.SettleOwedMembersInGroup
		>(`/group/members/settle?groupId=${groupId}`, {
			userA,
			userB,
		});
		return response.data;
	}
}
