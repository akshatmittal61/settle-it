import { fallbackAssets } from "@/constants";
import { ObjectId } from "@/db";
import { Group, Schema } from "@/types";

export const GroupSchema: Schema<Group> = {
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
