import { MemberModel } from "@/models";
import { groupRepo } from "@/repo/group.repo";
import { userRepo } from "@/repo/user.repo";
import { Group, Member, User } from "@/schema";
import { CreateModel, IMember } from "@/types";
import { getObjectFromMongoResponse, SafetyUtils } from "@/utils";
import { FilterQuery, UpdateQuery } from "mongoose";
import { BaseRepo } from "./base";

export class MemberRepo extends BaseRepo<Member, IMember> {
	protected model = MemberModel;
	public parser(member: Member | null): IMember | null {
		if (!member) return null;
		const parsed = getObjectFromMongoResponse<Member>(member);
		if (!parsed) return null;
		const user = SafetyUtils.getNonNullValue(
			userRepo.parser(getObjectFromMongoResponse<User>(parsed.user))
		);
		const group = SafetyUtils.getNonNullValue(
			groupRepo.parser(getObjectFromMongoResponse<Group>(parsed.group))
		);
		return {
			...parsed,
			user,
			group,
		};
	}

	public async findOne(query: Partial<Member>): Promise<IMember | null> {
		const res = await this.model
			.findOne<Member>(query)
			.populate("user group")
			.populate({
				path: "group",
				model: "Group",
				populate: {
					path: "author",
					model: "User",
				},
			});
		return this.parser(res);
	}

	public async findById(id: string): Promise<IMember | null> {
		const res = await this.model
			.findById<Member>(id)
			.populate("user group")
			.populate({
				path: "group",
				model: "Group",
				populate: {
					path: "author",
					model: "User",
				},
			})
			.catch((error: any) => {
				if (error.kind === "ObjectId") return null;
				throw error;
			});
		return this.parser(res);
	}

	public async find(
		query: FilterQuery<Member>
	): Promise<Array<IMember> | null> {
		const res = await this.model
			.find<Member>(query)
			.populate("user group")
			.populate({
				path: "group",
				model: "Group",
				populate: {
					path: "author",
					model: "User",
				},
			});
		const parsedRes = res.map(this.parser).filter((obj) => obj !== null);
		if (parsedRes.length > 0) return parsedRes;
		return null;
	}

	public async findAll(): Promise<Array<IMember>> {
		const res = await this.model
			.find<Member>({})
			.sort({ createdAt: -1 })
			.populate("user group")
			.populate({
				path: "group",
				model: "Group",
				populate: {
					path: "author",
					model: "User",
				},
			});
		const parsedRes = res.map(this.parser).filter((obj) => obj !== null);
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}

	public async create(body: CreateModel<Member>): Promise<IMember> {
		const res = await this.model.create<CreateModel<Member>>(body);
		return SafetyUtils.getNonNullValue(await this.findById(res.id));
	}

	public async update(
		query: FilterQuery<Member>,
		update: UpdateQuery<Member>
	): Promise<IMember | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndUpdate<Member>(filter, update, { new: true })
			.populate("user group")
			.populate({
				path: "group",
				model: "Group",
				populate: {
					path: "author",
					model: "User",
				},
			});
		return this.parser(res);
	}

	public async remove(query: Partial<Member>): Promise<IMember | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndDelete<Member>(filter)
			.populate("user group")
			.populate({
				path: "group",
				model: "Group",
				populate: {
					path: "author",
					model: "User",
				},
			});
		return this.parser(res);
	}

	public async bulkCreate(
		body: Array<CreateModel<Member>>
	): Promise<Array<IMember>> {
		const res = await this.model.insertMany<CreateModel<Member>>(body);
		const idsOfCreated = res.map((obj) => obj.id);
		const created = await this.find({ _id: { $in: idsOfCreated } });
		return SafetyUtils.getNonNullValue(created);
	}

	public async bulkRemove(query: FilterQuery<Member>): Promise<number> {
		const res = await this.model.deleteMany(query);
		return res.deletedCount;
	}
}

export const memberRepo = MemberRepo.getInstance<MemberRepo>();
