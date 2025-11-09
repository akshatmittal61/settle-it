import { fallbackAssets } from "@/constants";
import { StringUtils } from "@/utils";

export class AvatarUtils {
	public static getAvatarSize(size: string | number): number {
		switch (size) {
			case "small":
				return 100;
			case "medium":
				return 150;
			case "large":
				return 200;
			default:
				return typeof size === "number" ? size : 50;
		}
	}

	public static isValidImageUrl(src: string): boolean {
		if (StringUtils.isEmpty(src)) {
			return false;
		}
		return src.startsWith("https://") || src.startsWith("/");
	}

	public static getFallbackAvatarUrl(
		alt: string | undefined,
		fallback?: string
	): string {
		if (StringUtils.isNotEmpty(alt)) {
			const encodedAlt = encodeURIComponent(alt || "");
			return `https://ui-avatars.com/api/?name=${encodedAlt}&background=random`;
		}
		if (StringUtils.isNotEmpty(fallback)) {
			return fallback;
		}
		return fallbackAssets.avatar;
	}
}
