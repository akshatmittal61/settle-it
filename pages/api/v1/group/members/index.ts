import { ApiRoute } from "@/server";
import { GroupController } from "@/controllers";

const apiRoute = new ApiRoute(
	{ PATCH: GroupController.updateMembers },
	{ db: true, auth: true, groupMember: true }
);

export default apiRoute.getHandler();
