import { ExpenseModel } from "@/models";
import { Expense, Group, User } from "@/schema";
import { CreateModel, IExpense } from "@/types";
import { getNonNullValue, getObjectFromMongoResponse, omitKeys } from "@/utils";
import { FilterQuery, UpdateQuery } from "mongoose";
import { BaseRepo } from "./base";
import { groupRepo } from "./group.repo";
import { userRepo } from "./user.repo";

export class ExpenseRepo extends BaseRepo<Expense, IExpense> {
	protected model = ExpenseModel;

	public parser(expense: Expense | null): IExpense | null {
		if (!expense) return null;
		const parsed = getObjectFromMongoResponse<Expense>(expense);
		if (!parsed) return null;
		const group = parsed.group
			? groupRepo.parser(getObjectFromMongoResponse<Group>(parsed.group))
			: null;
		const author = getNonNullValue(
			userRepo.parser(getObjectFromMongoResponse<User>(parsed.author))
		);
		const sender = getNonNullValue(
			userRepo.parser(getObjectFromMongoResponse<User>(parsed.sender))
		);
		const receiver = parsed.receiver
			? userRepo.parser(getObjectFromMongoResponse<User>(parsed.receiver))
			: null;
		return {
			...omitKeys(parsed, ["groupId"]),
			group,
			author,
			sender,
			receiver,
		};
	}

	public async findOne(
		query: FilterQuery<Expense>
	): Promise<IExpense | null> {
		const res = await this.model
			.findOne<Expense>(query)
			.populate("group author sender receiver")
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

	public async findById(id: string): Promise<IExpense | null> {
		return await this.model
			.findById<Expense>(id)
			.populate("group author sender receiver")
			.populate({
				path: "group",
				model: "Group",
				populate: {
					path: "author",
					model: "User",
				},
			})
			.then(this.parser)
			.catch((error: any) => {
				if (error.kind === "ObjectId") return null;
				throw error;
			});
	}

	public async find(query: FilterQuery<Expense>): Promise<IExpense[] | null> {
		const res = await this.model
			.find<Expense>(query)
			.sort({ createdAt: -1 })
			.populate("group author sender receiver")
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

	public async findAll(): Promise<Array<IExpense>> {
		const res = await this.model
			.find<Expense>()
			.sort({ createdAt: -1 })
			.populate("group author sender receiver")
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

	public async create(body: CreateModel<Expense>): Promise<IExpense> {
		const res = await this.model.create<CreateModel<Expense>>(body);
		return getNonNullValue(await this.findById(res.id));
	}

	public async update(
		query: FilterQuery<Expense>,
		update: UpdateQuery<Expense>
	): Promise<IExpense | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndUpdate<Expense>(filter, update, { new: true })
			.populate("group author sender receiver")
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

	public async remove(query: FilterQuery<Expense>): Promise<IExpense | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndDelete<Expense>(filter)
			.populate("group author sender receiver")
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

	public async removeMultiple(query: FilterQuery<Expense>): Promise<number> {
		const res = await this.model.deleteMany(query);
		return res.deletedCount;
	}

	public async getExpensesForGroup(
		groupId: string
	): Promise<Array<IExpense>> {
		const res = await this.model
			.find<Expense>({ groupId })
			.sort({ paidOn: -1 })
			.populate("group author sender receiver")
			.populate({
				path: "group",
				model: "Group",
				populate: {
					path: "author",
					model: "User",
				},
			});

		return res.map(this.parser).map(getNonNullValue);
	}

	public async getExpensesForGroups(
		groupIds: Array<string>
	): Promise<Array<IExpense>> {
		const res = await this.model
			.find<Expense>({ groupId: { $in: groupIds } })
			.sort({ paidOn: -1 })
			.populate("group author sender receiver")
			.populate({
				path: "group",
				model: "Group",
				populate: {
					path: "author",
					model: "User",
				},
			});

		return res.map(this.parser).map(getNonNullValue);
	}
}

export const expenseRepo = ExpenseRepo.getInstance<ExpenseRepo>();
