import { UserModel } from "@/models";
import { CreateModel, IUser, User } from "@/types";
import { SafetyUtils } from "@/utils";
import { BaseRepo } from "./base";

class UserRepo extends BaseRepo<User, IUser> {
	protected model = UserModel;

	public parser(input: User | null) {
		return super.parser(input);
	}

	public async bulkCreate(
		body: Array<CreateModel<User>>
	): Promise<Array<IUser>> {
		const res = await this.model.insertMany<CreateModel<User>>(body);
		return res.map(this.parser).map(SafetyUtils.getNonNullValue<IUser>);
	}
}

export const userRepo = UserRepo.getInstance<UserRepo>();
