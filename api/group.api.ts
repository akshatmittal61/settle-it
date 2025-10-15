import { http } from "@/client";
import { ApiRequests, ApiRes, ApiResponses } from "@/types";

export class GroupApi {
	public static async getAllGroups(headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.GetGroupsForUser>>(
			"/groups",
			{ headers }
		);
		return response.data;
	}

	public static async getGroupDetails(id: string, headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.GetGroupDetails>>(
			`/group?id=${id}`,
			{ headers }
		);
		return response.data;
	}

	public static async getGroupExpenses(id: string, headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.GetGroupExpenses>>(
			`/group/expenses?groupId=${id}`,
			{ headers }
		);
		return response.data;
	}

	public static async getBalancesSummary(id: string, headers?: any) {
		const response = await http.get<
			ApiRes<ApiResponses.GetBalancesSummary>
		>(`/group/summary?groupId=${id}`, { headers });
		return response.data;
	}

	public static async getTransactions(id: string, headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.GetTransactions>>(
			`/group/transactions?groupId=${id}`,
			{ headers }
		);
		return response.data;
	}

	public static async createGroup(
		data: ApiRequests.CreateGroup,
		headers?: any
	) {
		const response = await http.post<
			ApiRes<ApiResponses.CreateGroup>,
			ApiRequests.CreateGroup
		>("/groups", data, { headers });
		return response.data;
	}

	public static async updateGroup(
		id: string,
		data: ApiRequests.UpdateGroup,
		headers?: any
	) {
		const response = await http.patch<
			ApiRes<ApiResponses.UpdateGroupDetails>,
			ApiRequests.UpdateGroup
		>(`/group?id=${id}`, data, { headers });
		return response.data;
	}

	public static async deleteGroup(id: string, headers?: any) {
		const response = await http.delete<ApiRes<ApiResponses.DeleteGroup>>(
			`/group?id=${id}`,
			{ headers }
		);
		return response.data;
	}
}
