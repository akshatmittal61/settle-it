import { ApiSuccess } from "@/server";
import {
	CacheService,
	FilesService,
	GroupService,
	UserService,
} from "@/services";
import { ApiRequest, ApiResponse, ApiResponses } from "@/types";
import { StringUtils } from "@/utils";

export class AdminController {
	public static async getAllGroups(_: ApiRequest, res: ApiResponse) {
		const groups = await GroupService.getAllGroups();
		return new ApiSuccess<ApiResponses.GetAllGroups>(res)
			.data(groups)
			.send();
	}

	public static async getAllUsers(_: ApiRequest, res: ApiResponse) {
		const users = await UserService.getAllUsers();
		return new ApiSuccess<ApiResponses.GetAllUsers>(res).data(users).send();
	}

	public static getAllCacheData(_: ApiRequest, res: ApiResponse) {
		const cacheData = CacheService.getAllCacheData();
		return new ApiSuccess<ApiResponses.GetAllCacheData>(res)
			.data(cacheData)
			.send();
	}

	public static clearAllCacheData(_: ApiRequest, res: ApiResponse) {
		CacheService.clearAllCacheData();
		return new ApiSuccess<ApiResponses.ClearCacheData>(res).send();
	}

	public static getAllLogFiles(_: ApiRequest, res: ApiResponse) {
		const files = FilesService.getLogFiles();
		return new ApiSuccess<ApiResponses.GetAllLogFiles>(res)
			.data(files)
			.send();
	}

	public static async getLogFileByName(req: ApiRequest, res: ApiResponse) {
		const name = StringUtils.getNonEmptyString(req.body.name);
		const fileContent = FilesService.getLogFileByName(name);
		return new ApiSuccess<ApiResponses.GetLogFileByName>(res)
			.data(fileContent)
			.send();
	}
}
