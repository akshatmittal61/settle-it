import { HTTP } from "@/constants";
import { cacheControllers } from "@/controllers";
import { db } from "@/db";
import logger from "@/log";
import { adminMiddleware } from "@/middlewares";
import { ApiRequest, ApiResponse } from "@/types/api";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req: ApiRequest, res: ApiResponse) => {
	try {
		await db.connect();
		const { method } = req;

		switch (method) {
			case "GET":
				return adminMiddleware.apiRoute(
					cacheControllers.getAllCacheData
				)(req, res);
			case "DELETE":
				return adminMiddleware.apiRoute(
					cacheControllers.clearCacheData
				)(req, res);
			default:
				res.setHeader("Allow", ["GET"]);
				return res
					.status(405)
					.json({ message: "Method " + method + " Not Allowed" });
		}
	} catch (error: any) {
		logger.error(error);
		return res.status(500).json({
			message: error.message || HTTP.message.INTERNAL_SERVER_ERROR,
		});
	}
};

export default handler;
