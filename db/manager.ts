import { DbConnectionError } from "@/errors";
import { Logger } from "@/log";
import { DatabaseManagerConfig, DbContainer } from "./types";
import mongoose from "mongoose";

// Global connection cache that persists across serverless invocations
let cachedConnection: typeof mongoose | null = null;
let connectionPromise: Promise<typeof mongoose> | null = null;

export class DatabaseManager {
	private config: DatabaseManagerConfig;

	constructor(config: DatabaseManagerConfig) {
		if (!config.uri) {
			throw new DbConnectionError("uri", "Database URI not provided");
		}
		this.config = config;
	}

	public static createContainer(uri: string): DbContainer {
		const db = new DatabaseManager({ uri });
		return { db };
	}

	public async connect() {
		try {
			// Return cached connection if available
			if (cachedConnection && mongoose.connection.readyState === 1) {
				Logger.info("MongoDB using cached connection");
				return cachedConnection;
			}

			// If connection is in progress, wait for it
			if (connectionPromise) {
				Logger.info("MongoDB connection in progress, waiting...");
				return await connectionPromise;
			}

			// Create new connection with optimized settings
			Logger.info("Creating new MongoDB connection");
			connectionPromise = mongoose.connect(this.config.uri, {
				// Connection pooling settings for serverless
				maxPoolSize: 5, // Maintain up to 5 socket connections
				serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
				socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
				bufferCommands: false, // Disable mongoose buffering
			});

			cachedConnection = await connectionPromise;
			Logger.info("MongoDB connected successfully");

			// Clear the promise since connection is established
			connectionPromise = null;

			return cachedConnection;
		} catch (error: any) {
			Logger.error("Error connecting to MongoDB", error.message);
			connectionPromise = null; // Reset on error
			throw new DbConnectionError("DB Connection Initiator");
		}
	}

	public async disconnect() {
		try {
			if (mongoose.connection.readyState === 0) {
				Logger.info("MongoDB is already disconnected");
				return;
			}
			Logger.info("Disconnecting from MongoDB");
			await mongoose.disconnect();
			cachedConnection = null;
			connectionPromise = null;
			Logger.info("MongoDB disconnected");
		} catch (error: any) {
			Logger.error("Error disconnecting from MongoDB", error.message);
		}
	}

	public isConnected() {
		return mongoose.connection.readyState === 1;
	}
}
