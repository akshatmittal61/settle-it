import { SplitModel } from "@/models";
import { Expense, Split, User } from "@/schema";
import { CreateModel, ISplit } from "@/types";
import {
	CollectionUtils,
	getObjectFromMongoResponse,
	SafetyUtils,
} from "@/utils";
import { FilterQuery, UpdateQuery } from "mongoose";
import { BaseRepo } from "./base";
import { expenseRepo } from "./expense.repo";
import { userRepo } from "./user.repo";

class SplitRepo extends BaseRepo<Split, ISplit> {
	protected model = SplitModel;

	public parser(input: Split | null): ISplit | null {
		const parsed = super.parser(input);
		if (!parsed) return null;
		const expense = SafetyUtils.getNonNullValue(
			expenseRepo.parser(
				getObjectFromMongoResponse<Expense>(parsed.expense)
			)
		);
		const user = SafetyUtils.getNonNullValue(
			userRepo.parser(getObjectFromMongoResponse<User>(parsed.user))
		);
		return {
			...parsed,
			expense,
			user,
		};
	}

	public async findOne(query: FilterQuery<Split>): Promise<ISplit | null> {
		const res = await this.model
			.findOne<Split>(query)
			.populate("expense user")
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "author sender receiver",
					model: "User",
				},
			})
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "group",
					model: "Group",
					populate: {
						path: "author",
						model: "User",
					},
				},
			});
		return this.parser(res);
	}

	public async findById(id: string): Promise<ISplit | null> {
		const res = await this.model
			.findById<Split>(id)
			.populate("expense user")
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "author sender receiver",
					model: "User",
				},
			})
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "group",
					model: "Group",
					populate: {
						path: "author",
						model: "User",
					},
				},
			});
		return this.parser(res);
	}

	public async find(query: FilterQuery<Split>): Promise<ISplit[] | null> {
		const res = await this.model
			.find<Split>(query)
			.sort({ createdAt: -1 })
			.populate("expense user")
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "author sender receiver",
					model: "User",
				},
			})
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "group",
					model: "Group",
					populate: {
						path: "author",
						model: "User",
					},
				},
			});
		const parsedRes = res.map(this.parser).filter((obj) => obj !== null);
		if (parsedRes.length > 0) return parsedRes;
		return null;
	}

	public async findAll(): Promise<Array<ISplit>> {
		const res = await this.model
			.find<Split>()
			.sort({ createdAt: -1 })
			.populate("expense user")
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "author sender receiver",
					model: "User",
				},
			})
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "group",
					model: "Group",
					populate: {
						path: "author",
						model: "User",
					},
				},
			});
		const parsedRes = res.map(this.parser).filter((obj) => obj !== null);
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}

	public async create(body: CreateModel<Split>): Promise<ISplit> {
		const res = await this.model.create<CreateModel<Split>>(body);
		return SafetyUtils.getNonNullValue(await this.findById(res.id));
	}

	public async update(
		query: FilterQuery<Split>,
		body: UpdateQuery<Split>
	): Promise<ISplit | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndUpdate<Split>(filter, body, { new: true })
			.populate("expense user")
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "author sender receiver",
					model: "User",
				},
			})
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "group",
					model: "Group",
					populate: {
						path: "author",
						model: "User",
					},
				},
			});
		return this.parser(res);
	}

	public async remove(query: FilterQuery<Split>): Promise<ISplit | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model
			.findOneAndDelete<Split>(filter)
			.populate("expense user")
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "author sender receiver",
					model: "User",
				},
			})
			.populate({
				path: "expense",
				model: "Expense",
				populate: {
					path: "group",
					model: "Group",
					populate: {
						path: "author",
						model: "User",
					},
				},
			});
		return this.parser(res);
	}

	public async bulkCreate(
		body: Array<CreateModel<Split>>
	): Promise<Array<ISplit>> {
		const res = await this.model.insertMany<CreateModel<Split>>(body);
		const idsOfCreatedSplits = res.map((split) => split.id);
		const createdSplits = await this.find({
			_id: { $in: idsOfCreatedSplits },
		});
		return SafetyUtils.getNonNullValue(createdSplits);
	}

	public async bulkUpdate(
		body: Array<FilterQuery<Split> & UpdateQuery<Split>>
	): Promise<any> {
		return await this.model.bulkWrite<Split>(
			body.map((obj) => ({
				updateOne: {
					filter: obj.filter,
					update: obj.update,
				},
			}))
		);
	}

	public async bulkRemove(query: FilterQuery<Split>): Promise<number> {
		const res = await this.model.deleteMany(query);
		return res.deletedCount;
	}

	public async settleOne(splitId: string): Promise<ISplit | null> {
		return this.update({ id: splitId }, [
			{
				$set: {
					pending: 0,
					completed: { $add: ["$pending", "$completed"] },
				},
			},
		]);
	}

	public async settleMany(query: FilterQuery<Split>): Promise<number> {
		const splits = await this.find(query);
		if (CollectionUtils.isEmpty(splits)) {
			return 0;
		}
		const res = await this.model.bulkWrite(
			splits.map((split) => ({
				updateOne: {
					filter: { _id: split.id },
					update: {
						$set: {
							pending: 0,
							completed: { $add: ["$pending", "$completed"] },
						},
					},
				},
			}))
		);
		return res.modifiedCount;
	}

	public async removeSplitsForGroup(groupId: string): Promise<number> {
		const expenses = await expenseRepo.find({ group: groupId });
		if (CollectionUtils.isEmpty(expenses)) {
			return 0;
		}
		const expenseIds = expenses!.map((expense) => expense.id);
		return await this.bulkRemove({ expense: { $in: expenseIds } });
	}
}

export const splitRepo = SplitRepo.getInstance<SplitRepo>();
