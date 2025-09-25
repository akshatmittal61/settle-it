import { ObjectId } from "@/types";
import { MEMBER_ROLE, MEMBER_STATUS } from "@/constants";

export const MemberSchema = {
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
