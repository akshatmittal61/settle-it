import { UserModel } from "@/models";
import { User } from "@/schema";
import { CreateModel, IUser } from "@/types";
import { BaseRepo } from "./base";
import { SafetyUtils } from "@/utils";

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
