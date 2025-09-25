import { fallbackAssets } from "@/constants";
import { ObjectId } from "@/types";

export const GroupSchema = {
	name: {
		type: String,
		required: true,
	},
	icon: {
		type: String,
		default: fallbackAssets.groupIcon,
	},
	banner: {
		type: String,
		default: fallbackAssets.banner,
	},
	type: {
		type: String,
		default: "Other",
	},
	tags: {
		type: [
			{
				type: String,
				trim: true,
				lowercase: true,
				validate: {
					validator: (tag: string) => tag.length > 0,
					message: "Tag cannot be empty",
				},
			},
		],
		validate: {
			validator: (v: string[]) => v.length <= 5,
			message: "Tags can't exceed 5",
		},
		required: false,
		default: [],
	},
	author: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
};
