import { http } from "@/connections";
import { ApiRequests, ApiRes, ApiResponses } from "@/types";

export class AdminApi {
	public static async getAllUsers(headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.GetAllUsers>>(
			"/admin/users",
			{ headers }
		);
		return response.data;
	}

	public static async getAllGroups(headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.GetAllGroups>>(
			"/admin/groups",
			{ headers }
		);
		return response.data;
	}

	public static async getAllCacheData(headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.GetAllCacheData>>(
			"/admin/cache",
			{ headers }
		);
		return response.data;
	}

	public static async clearCacheData(headers?: any) {
		const response = await http.delete<ApiRes<ApiResponses.ClearCacheData>>(
			"/admin/cache",
			{ headers }
		);
		return response.data;
	}

	public static async getAllLogFiles(headers?: any) {
		const response = await http.get<ApiRes<ApiResponses.GetAllLogFiles>>(
			"/admin/logs",
			{ headers }
		);
		return response.data;
	}

	public static async getLogFileByName(name: string, headers?: any) {
		const response = await http.post<
			ApiRes<ApiResponses.GetLogFileByName>,
			ApiRequests.GetLogFileByName
		>("/admin/logs", { name }, { headers });
		return response.data;
	}
}
