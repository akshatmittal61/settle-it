import { ApiRoute } from "@/server";
import { GodownController } from "@/controllers";

const apiRoute = new ApiRoute(
	{ POST: GodownController.sendMessage },
	{ db: true }
);

export default apiRoute.getHandler();
