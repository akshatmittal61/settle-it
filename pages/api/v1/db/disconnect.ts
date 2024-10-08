import { db } from "@/db";
import { ApiRoute } from "@/server";
import { ApiRequest, ApiResponse } from "@/types";

const disconnectHandler = async (_: ApiRequest, res: ApiResponse) => {
	await db.disconnect();
	return res.status(200).json({ message: "Disconnected from DB" });
};

const api = new ApiRoute({ GET: disconnectHandler });

const handler = api.getHandler();

export default handler;
