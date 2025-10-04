import { MEMBER_ROLE, MEMBER_STATUS } from "@/constants";
import { ObjectId, Schema } from "@/types";
import { Member } from "./types";

export const MemberSchema: Schema<Member> = {
	user: {
		type: ObjectId,
		ref: "User",
		required: true,
	},
	group: {
		type: ObjectId,
		ref: "Group",
		required: true,
	},
	status: {
		type: String,
		enum: Object.values(MEMBER_STATUS),
		default: MEMBER_STATUS.JOINED,
	},
	role: {
		type: String,
		enum: Object.values(MEMBER_ROLE),
		default: MEMBER_ROLE.MEMBER,
	},
};
