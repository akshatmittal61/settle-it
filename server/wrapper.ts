import { apiMethods, dbUri, HTTP } from "@/constants";
import { DatabaseManager, DbContainer } from "@/db";
import { ApiError, DbConnectionError, ParserSafetyError } from "@/errors";
import { Logger } from "@/log";
import { ApiFailure, ServerMiddleware } from "@/server";
import {
	ApiController,
	ApiControllers,
	ApiRequest,
	ApiResponse,
	ApiWrapperOptions,
	T_API_METHODS,
} from "@/types";
import { MongooseError } from "mongoose";
import { NextApiHandler } from "next";

export class ApiRoute {
	// Options for API Wrapper
	private readonly useDatabase: boolean = false;
	private readonly isAdmin: boolean = false;
	private readonly isAuthenticated: boolean = false;
	private readonly isGroupMember: boolean = false;
	private dbContainer: DbContainer;

	// API Controllers
	GET: ApiController | undefined;
	POST: ApiController | undefined;
	PUT: ApiController | undefined;
	PATCH: ApiController | undefined;
	DELETE: ApiController | undefined;

	// Allowed Methods
	allowedMethods: Array<T_API_METHODS>;

	/**
	 * Initializes a new instance of the ApiRouteHandler class.
	 *
	 * @param {ApiControllers} controllers - An object containing API controllers for different HTTP methods.
	 * @param {ApiWrapperOptions} [options={}] - Options for the API wrapper.
	 * @param {boolean} options.db - Whether to use the database.
	 * @param {boolean} options.auth - Whether to require authentication.
	 * @param {boolean} options.admin - Whether to require admin privileges.
	 */
	constructor(
		{ GET, POST, PUT, PATCH, DELETE }: ApiControllers,
		{ db, auth, admin, groupMember }: ApiWrapperOptions = {}
	) {
		this.allowedMethods = [];
		this.dbContainer = DatabaseManager.createContainer(dbUri);
		if (db === true) {
			this.useDatabase = true;
		}

		if (auth === true) {
			this.useDatabase = true;
			this.isAuthenticated = true;
		}

		if (admin === true) {
			this.useDatabase = true;
			this.isAuthenticated = true;
			this.isAdmin = true;
		}

		if (groupMember === true) {
			this.useDatabase = true;
			this.isAuthenticated = true;
			this.isGroupMember = true;
		}

		if (GET) {
			this.GET = GET;
			this.allowedMethods.push(apiMethods.GET);
		}

		if (POST) {
			this.POST = POST;
			this.allowedMethods.push(apiMethods.POST);
		}

		if (PUT) {
			this.PUT = PUT;
			this.allowedMethods.push(apiMethods.PUT);
		}

		if (PATCH) {
			this.PATCH = PATCH;
			this.allowedMethods.push(apiMethods.PATCH);
		}

		if (DELETE) {
			this.DELETE = DELETE;
			this.allowedMethods.push(apiMethods.DELETE);
		}
	}

	/**
	 * Wraps the provided controller with the appropriate middleware based on the authentication status.
	 *
	 * @param {ApiController} controller - The controller to be wrapped with middleware.
	 * @return {ApiController} The wrapped controller with the applied middleware.
	 */
	private wrapper(controller: ApiController): ApiController {
		// controller = ServerMiddleware.responseBodyPopulator(controller);
		if (this.isAdmin) {
			return ServerMiddleware.authenticatedRoute(
				ServerMiddleware.adminRoute(controller)
			);
		} else if (this.isGroupMember) {
			return ServerMiddleware.authenticatedRoute(
				ServerMiddleware.isGroupMember(controller)
			);
		} else if (this.isAuthenticated) {
			return ServerMiddleware.authenticatedRoute(controller);
		} else {
			return controller;
		}
	}
	/**
	 * Logs the details of the request and response, including method, URI, headers, body, and execution time.
	 *
	 * @param {ApiRequest} req - The API request object.
	 * @param {ApiResponse} res - The API response object.
	 * @param {number} startTime - The start time of the request execution.
	 */
	private log(req: ApiRequest, res: ApiResponse, startTime: number): void {
		const executionTime = Date.now() - startTime;
		const request = {
			method: req.method,
			uri: req.url,
			body: req.body,
			headers: req.headers,
		};
		const response = {
			status: res.statusCode,
			headers: res.getHeaders ? res.getHeaders() : {}, // Assuming `getHeaders` exists
			time: executionTime,
		};
		Logger.info(
			`${request.method} ${response.status} ${request.uri} - ${response.time}ms`
		);
		Logger.debug("Request", request);
		Logger.debug("Response", response);
	}

	/**
	 * Returns a Next.js API handler function that wraps the provided API controllers with middleware
	 * based on the authentication status and handles database connections.
	 *
	 * @return {NextApiHandler} A Next.js API handler function.
	 */
	public getHandler(): NextApiHandler {
		return async (req: ApiRequest, res: ApiResponse) => {
			const startTime = Date.now();
			try {
				if (this.useDatabase) {
					await this.dbContainer.db.connect();
				}

				const { method } = req;
				// We need the handler to run by async/await to catch errors
				let result: void;

				Logger.debug(
					"method and handler",
					method,
					typeof this.GET,
					typeof this.POST,
					typeof this.PUT,
					typeof this.PATCH,
					typeof this.DELETE
				);
				if (method === apiMethods.GET && this.GET !== undefined) {
					result = await this.wrapper(this.GET)(req, res);
				} else if (
					method === apiMethods.POST &&
					this.POST !== undefined
				) {
					result = await this.wrapper(this.POST)(req, res);
				} else if (
					method === apiMethods.PUT &&
					this.PUT !== undefined
				) {
					result = await this.wrapper(this.PUT)(req, res);
				} else if (
					method === apiMethods.PATCH &&
					this.PATCH !== undefined
				) {
					result = await this.wrapper(this.PATCH)(req, res);
				} else if (
					method === apiMethods.DELETE &&
					this.DELETE !== undefined
				) {
					result = await this.wrapper(this.DELETE)(req, res);
				} else {
					return new ApiFailure(res)
						.headers("Allow", this.allowedMethods)
						.status(HTTP.status.METHOD_NOT_ALLOWED)
						.message(`Method ${method} Not Allowed`)
						.send();
				}
				this.log(req, res, startTime);
				return result;
			} catch (error: any) {
				this.log(req, res, startTime);
				if (error instanceof ApiError) {
					return new ApiFailure(res)
						.status(error.status)
						.message(error.message)
						.send();
				} else if (
					error instanceof DbConnectionError ||
					error instanceof MongooseError
				) {
					return new ApiFailure(res)
						.status(HTTP.status.SERVICE_UNAVAILABLE)
						.message(
							error.message || HTTP.message.DB_CONNECTION_ERROR
						)
						.send();
				} else if (error instanceof ParserSafetyError) {
					return new ApiFailure(res)
						.status(HTTP.status.BAD_REQUEST)
						.message(error.message || HTTP.message.BAD_REQUEST)
						.send();
				} else {
					return new ApiFailure(res)
						.status(HTTP.status.INTERNAL_SERVER_ERROR)
						.message(
							error.message || HTTP.message.INTERNAL_SERVER_ERROR
						)
						.send();
				}
			}
		};
	}
}
