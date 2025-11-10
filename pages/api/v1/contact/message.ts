import { ApiRoute } from "@/server";
import { GodownController } from "@/controllers";

const apiRoute = new ApiRoute({ POST: GodownController.sendMessage });

export default apiRoute.getHandler();
