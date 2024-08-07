import { http } from "@/connections";
import logger from "@/log";
import { IUser } from "@/types/user";

export const verifyUserIfLoggedIn = async (): Promise<{
	message: string;
	data: IUser;
}> => {
	try {
		const response = await http.get("/auth/verify");
		return Promise.resolve(response.data);
	} catch (error: any) {
		logger.error(error);
		return Promise.reject(error.response.data);
	}
};
