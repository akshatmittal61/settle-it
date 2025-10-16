import mongoose from "mongoose";
import { FilterQuery, UpdateQuery } from "@/db";
import { CreateModel } from "@/types";
import { getObjectFromMongoResponse, SafetyUtils } from "@/utils";

export abstract class BaseRepo<T = any, P = T> {
	protected abstract model: mongoose.Model<T>;

	/**
	 * A static map to hold instances of the repository classes.
	 * This allows for singleton-like behavior, ensuring that only one
	 * instance of each repository class is created.
	 */
	private static _instances = new Map<Function, any>();

	/**
	 * Get an instance of the repository class.
	 * @param this The class to get an instance of.
	 * @returns The instance of the repository class.
	 */
	public static getInstance<TRepo extends BaseRepo<any>>(
		// eslint-disable-next-line no-unused-vars
		this: new () => TRepo
	): TRepo {
		if (!BaseRepo._instances.has(this)) {
			BaseRepo._instances.set(this, new this());
		}
		return BaseRepo._instances.get(this);
	}

	constructor() {}

	/**
	 * Takes a raw model object and parses it into a typed object.
	 * This is a utility function that can be used to parse responses
	 * from the database before returning them.
	 * @param input The raw model object to parse.
	 * @returns The parsed object, or null if the input is null or
	 * invalid.
	 */
	protected parser(input: T | null): P | null {
		if (!input) return null;
		const res = getObjectFromMongoResponse<T>(input);
		if (!res) return null;
		return res as P;
	}

	/**
	 * Find a single document in the database that matches the given query.
	 * @param query The query to filter documents by.
	 * @returns The matching document, or null if no document was found.
	 */
	public async findOne(query: FilterQuery<T>): Promise<P | null> {
		const res = await this.model.findOne<T>(query);
		return this.parser(res);
	}

	/**
	 * Find a single document in the database by its id.
	 * @param id The id of the document to find.
	 * @returns The matching document, or null if no document was found.
	 * or the id is invalid.
	 */
	public async findById(id: string): Promise<P | null> {
		try {
			const res = await this.model.findById<T>(id);
			return this.parser(res);
		} catch (error: any) {
			if (error.kind === "ObjectId") return null;
			throw error;
		}
	}

	/**
	 * Find all documents in the database that match the given query.
	 * @param query The query to filter documents by.
	 * @returns An array of matching documents, or null if no documents were found.
	 */
	public async find(query: FilterQuery<T>): Promise<Array<P> | null> {
		const res = await this.model.find<T>(query);
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length === 0) return null;
		return parsedRes;
	}

	/**
	 * Retrieve all documents from the database, sorted by creation date in descending order.
	 * @returns An array of parsed documents. Returns an empty array if no documents are found.
	 */
	public async findAll(): Promise<Array<P>> {
		const res = await this.model.find<T>().sort({ createdAt: -1 });
		const parsedRes = res.map(this.parser).filter((obj) => obj != null);
		if (parsedRes.length > 0) return parsedRes;
		return [];
	}

	/**
	 * Creates a new document in the database.
	 * @param body The data to use in creating the document.
	 * @returns The newly created document, parsed into the desired type.
	 * @throws {ApiError} If the document creation fails, this will throw an
	 * ApiError with a status code of 400 (Bad Request).
	 */
	public async create(body: CreateModel<T>): Promise<P> {
		const res = await this.model.create<CreateModel<T>>(body);
		return SafetyUtils.getNonNullValue(this.parser(res));
	}

	/**
	 * Update a single document in the database that matches the given query.
	 * @param query The query to filter documents by.
	 * @param update The update to apply to the matched document.
	 * @returns The updated document, parsed into the desired type,
	 * or null if no document was found.
	 */
	public async update(
		query: FilterQuery<T>,
		update: UpdateQuery<T>
	): Promise<P | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model.findOneAndUpdate<T>(filter, update, {
			new: true,
		});
		return this.parser(res);
	}

	/**
	 * Deletes a single document in the database that matches the given query.
	 * @param query The query to filter documents by.
	 * @returns The deleted document, parsed into the desired type,
	 * or null if no document was found.
	 */
	public async remove(query: FilterQuery<T>): Promise<P | null> {
		const filter = query.id ? { _id: query.id } : query;
		const res = await this.model.findOneAndDelete<T>(filter);
		return this.parser(res);
	}
}
