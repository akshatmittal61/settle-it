import { ApiRoute } from "@/server";
import { WalletController } from "@/controllers";

const apiRoute = new ApiRoute(
	{ PATCH: WalletController.settleExpense },
	{ db: true, auth: true, groupMember: true }
);

export default apiRoute.getHandler();
