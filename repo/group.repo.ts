import { GroupModel } from "@/models";
import { Group, Member, User } from "@/schema";
import { CreateModel, GroupSpread, IGroup } from "@/types";
import {
	CollectionUtils,
	getObjectFromMongoResponse,
	omitKeys,
	SafetyUtils,
} from "@/utils";
import { FilterQuery, UpdateQuery } from "mongoose";
import { BaseRepo } from "./base";
import { userRepo } from "./user.repo";

export class GroupRepo extends BaseRepo<Group, IGroup> {
	protected model = GroupModel;
	public parser(group: Group | null): IGroup | null {
		const parsed = super.parser(group);
		if (!parsed) return null;
		const author = SafetyUtils.getNonNullValue(
			userRepo.parser(getObjectFromMongoResponse<User>(parsed.author))
		);
		return {
			...parsed,
			author,
		};
	}

	public async findOne(query: Partial<Group>): Promise<IGroup | null> {
		const res = await this.model.findOne<Group>(query).populate("author");
		return this.parser(res);
	}

	public async findById(id: string): Promise<IGroup | null> {
		return await this.model
			.findById<Group>(id)
			.populate("author")
			.then(this.parser)
			.catch((error: any) => {
				if (error.kind === "ObjectId") return null;
				throw error;
			});
	}

	public async find(query: FilterQuery<Group>): Promise<IGroup[] | null> {
		const res = await this.model
			.find<Group>(query)
			.sort({ createdAt: -1 })
			.populate("author");
		const parsedRes = res.map(this.parser).filter((obj) => obj !== null);
		if (parsedRes.length > 0) return parsedRes;
		return null;
	}

	public async findAll(): Promise<Array<IGroup>> {
		const res = await this.model
			.find<Group>()
			.sort({ createdAt: -1 })
			.populate("author");

		return res.map(this.parser).filter((obj) => obj !== null);
	}

	public async create(body: CreateModel<Group>): Promise<IGroup> {
		const res = await this.model.create<CreateModel<Group>>(body);
		await res.populate("author");
		return SafetyUtils.getNonNullValue(this.parser(res));
	}

	public async update(
		query: FilterQuery<Group>,
		update: UpdateQuery<Group>
	): Promise<IGroup | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndUpdate(filter, update, { new: true })
			.populate("author");
		return this.parser(res);
	}

	public async remove(query: Partial<Group>): Promise<IGroup | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndDelete(filter)
			.populate("author");
		return this.parser(res);
	}

	public async findWithMembers(
		query: FilterQuery<Group>
	): Promise<Array<GroupSpread>> {
		const res = await this.model.aggregate([
			{
				$match: query,
			},
			{
				$lookup: {
					from: "members",
					localField: "_id",
					foreignField: "group",
					as: "members",
				},
			},
			{
				$project: {
					_id: 1,
					name: 1,
					icon: 1,
					banner: 1,
					tags: 1,
					author: 1,
					members: 1,
					createdAt: 1,
					updatedAt: 1,
				},
			},
		]);
		if (CollectionUtils.isEmpty(res)) return [];
		return res.map((obj) => ({
			...obj,
			members: obj.members.map((member: Member) =>
				omitKeys(member, ["group"])
			),
		}));
	}

	public async findOneWithMembers(
		query: FilterQuery<Group>
	): Promise<GroupSpread | null> {
		const groups = await this.findWithMembers(query);
		if (CollectionUtils.isEmpty(groups)) return null;
		return groups[0];
	}

	public async findByIdWithMembers(id: string): Promise<GroupSpread | null> {
		return await this.findOneWithMembers({ _id: id });
	}
}

export const groupRepo = GroupRepo.getInstance<GroupRepo>();
