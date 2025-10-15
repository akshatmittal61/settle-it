import { IUser } from "@/types";
import { BooleanUtils, SafetyUtils, StringUtils } from "@/utils";
import { fallbackAssets, USER_ROLE, USER_STATUS } from "@/constants";

export class UserUtils {
	public static isUserOnboarded(user: IUser | null) {
		if (SafetyUtils.isNonNull(user)) {
			return (
				StringUtils.equals(user.status, USER_STATUS.JOINED) &&
				StringUtils.isNotEmpty(user.name)
			);
		}
		return BooleanUtils.False.value;
	}

	public static getUserDetails(user: IUser): IUser {
		return {
			...user,
			avatar: user.avatar || fallbackAssets.avatar,
			name: user.name || user.email.split("@")[0],
		};
	}

	public static isAdmin(user: IUser | null) {
		if (SafetyUtils.isNonNull(user)) {
			return StringUtils.equals(user.role, USER_ROLE.ADMIN);
		}
		return BooleanUtils.False.value;
	}
}
