import { http } from "@/client";
import { ApiRequests, ApiRes, ApiResponses } from "@/types";

export class UserApi {
	public static async updateUser(data: ApiRequests.UpdateUser) {
		const response = await http.patch<
			ApiRes<ApiResponses.UpdateUser>,
			ApiRequests.UpdateUser
		>("/users", data);
		return response.data;
	}

	public static async searchForUsers(query: string) {
		const response = await http.post<
			ApiRes<ApiResponses.SearchUsers>,
			ApiRequests.SearchUsers
		>("/users/search", { query });
		return response.data;
	}

	public static async inviteUser(email: string) {
		const response = await http.post<
			ApiRes<ApiResponses.InviteUser>,
			ApiRequests.InviteUser
		>("/users/invite", { email });
		return response.data;
	}
	public static async searchInBulk(query: string) {
		const response = await http.post<
			ApiRes<ApiResponses.BulkUserSearch>,
			ApiRequests.BulkUserSearch
		>("/users/search/bulk", { query });
		return response.data;
	}
}
