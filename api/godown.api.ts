import { ApiRequests, ApiRes, ApiResponses } from "@/types";
import { http } from "@/client";

export class GodownApi {
	public static async sendContactMessage(
		data: ApiRequests.SendMessage
	): Promise<ApiRes<ApiResponses.SendMessage>> {
		const response = await http.post<
			ApiRes<ApiResponses.SendMessage>,
			ApiRequests.SendMessage
		>("/contact/message", data);
		return response.data;
	}
}
