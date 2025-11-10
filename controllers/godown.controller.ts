import { ApiRequest, ApiRequests, ApiResponse, ApiResponses } from "@/types";
import { ApiSuccess } from "@/server";
import { NotificationService } from "@/services";

export class GodownController {
	public static async sendMessage(
		req: ApiRequest<ApiRequests.SendMessage>,
		res: ApiResponse
	) {
		const payload = req.body;
		const message = await NotificationService.sendContactMessage(payload);
		return new ApiSuccess<ApiResponses.SendMessage>(res).send(message);
	}
}
