import { server } from "@/connections";
import { apiMethods, HTTP } from "@/constants";
import { Logger } from "@/log";
import { ApiRequest, ApiResponse, T_API_METHODS } from "@/types";
import { NextApiHandler } from "next";
import { SafetyUtils, StringUtils } from "@/utils";

const getCallMethod = (method: T_API_METHODS) => {
	switch (method) {
		case apiMethods.GET:
			return server.get;
		case apiMethods.POST:
			return server.post;
		case apiMethods.PUT:
			return server.put;
		case apiMethods.PATCH:
			return server.patch;
		case apiMethods.DELETE:
			return server.delete;
		default:
			return server.get;
	}
};

const callApi = async (
	method: T_API_METHODS,
	endpoint: string,
	body: any,
	{ headers }: { headers: any }
) => {
	const callMethod = getCallMethod(method);
	if (method === apiMethods.GET || method === apiMethods.DELETE) {
		return callMethod(endpoint, { headers });
	} else {
		return callMethod(endpoint, body, { headers });
	}
};

const getCookiesToSet = (endpoint: string, headers: any) => {
	const cookiesToSet = [];
	if (endpoint === "/auth/logout") {
		cookiesToSet.push({
			name: "accessToken",
			value: "",
			maxAge: -1,
		});
		cookiesToSet.push({
			name: "refreshToken",
			value: "",
			maxAge: -1,
		});
	} else {
		const accessToken = headers["x-auth-access-token"];
		const refreshToken = headers["x-auth-refresh-token"];
		if (accessToken) {
			cookiesToSet.push({
				name: "accessToken",
				value: accessToken,
				maxAge: 1 * 60 * 1000,
			});
		}
		if (refreshToken) {
			cookiesToSet.push({
				name: "refreshToken",
				value: refreshToken,
				maxAge: 7 * 24 * 60 * 60 * 1000,
			});
		}
	}
	return cookiesToSet;
};

const handler: NextApiHandler = async (req: ApiRequest, res: ApiResponse) => {
	try {
		const headers = { cookie: req.headers.cookie };
		const method = SafetyUtils.genericParse(
			StringUtils.getNonEmptyString<T_API_METHODS>,
			req.method
		);
		const endpoint = StringUtils.getNonEmptyString(
			req.headers["x-endpoint"]
		);
		const body = req.body || {};
		Logger.debug("proxy route", method, endpoint, body, headers);
		const response = await callApi(method, endpoint, body, { headers });
		const cookiesToSet = getCookiesToSet(endpoint, response.headers);
		if (cookiesToSet.length > 0) {
			res.setHeader(
				"Set-Cookie",
				cookiesToSet.map(
					(cookie) =>
						`${cookie.name}=${cookie.value}; HttpOnly; Max-Age=${cookie.maxAge}; Path=/; SameSite=None; Secure=true;`
				)
			);
		}
		return res.status(response.status).json(response.data);
	} catch (err: any) {
		Logger.error(err);
		if (
			[HTTP.status.UNAUTHORIZED, HTTP.status.FORBIDDEN].includes(
				err?.response?.status
			)
		) {
			res.setHeader(
				"Set-Cookie",
				["accessToken", "refreshToken"].map(
					(cookie) =>
						`${cookie}=; HttpOnly; Max-Age=-1; Path=/; SameSite=None; Secure=true;`
				)
			);
		}
		return res
			.status(err?.response?.status || HTTP.status.INTERNAL_SERVER_ERROR)
			.json(
				err?.response?.data || {
					message: HTTP.message.INTERNAL_SERVER_ERROR,
				}
			);
	}
};

export default handler;
