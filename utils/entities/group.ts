import { IGroup } from "@/types";
import { fallbackAssets } from "@/constants";
import { StringUtils } from "@/utils";

export class GroupUtils {
	public static getGroupIcon(group: IGroup): string {
		if (StringUtils.isEmpty(group.icon)) {
			return fallbackAssets.groupIcon;
		}
		return group.icon;
	}
}
