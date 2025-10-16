import { DatabaseManager } from "@/db";
import mongoose from "mongoose";

export interface DatabaseManagerConfig {
	uri: string;
}

export interface DbContainer {
	db: DatabaseManager;
}

export type { FilterQuery, UpdateQuery } from "mongoose";

export const ObjectId = mongoose.Types.ObjectId;
