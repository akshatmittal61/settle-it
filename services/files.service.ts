import { fileBasedStorage } from "@/utils";
import { HTTP, logsBaseUrl } from "@/constants";
import { ApiError } from "@/errors";

export class FilesService {
	private static fs: any;

	static {
		FilesService.fs = fileBasedStorage();
	}

	public static getLogFiles(): Array<string> {
		const dir = logsBaseUrl;
		if (!FilesService.fs) {
			throw new ApiError(
				HTTP.status.SERVICE_UNAVAILABLE,
				"File based storage not available"
			);
		}
		if (!FilesService.fs.existsSync(dir)) {
			throw new ApiError(HTTP.status.NOT_FOUND, "No log files found");
		}
		const files = FilesService.fs.readdirSync(dir);
		if (files.length === 0) {
			throw new ApiError(HTTP.status.NOT_FOUND, "No log files found");
		}
		return files;
	}

	public static getLogFileByName(name: string): string {
		const filePath = `${logsBaseUrl}/${name}`;
		if (!FilesService.fs) {
			throw new ApiError(
				HTTP.status.SERVICE_UNAVAILABLE,
				"File based storage not available"
			);
		}
		if (!FilesService.fs.existsSync(filePath)) {
			throw new ApiError(HTTP.status.NOT_FOUND, "Log file not found");
		}
		return FilesService.fs.readFileSync(filePath, "utf-8");
	}
}
