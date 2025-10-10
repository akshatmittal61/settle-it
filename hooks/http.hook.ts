import { http } from "@/connections";
import { ApiRes } from "@/types";
import { AxiosRequestConfig } from "axios";
import { useState } from "react";

export const useHttpClient = <Type extends any = any>(
	initialData: Type = {} as Type,
	initialIdentifier: string = ""
) => {
	const [identifier, setIdentifier] = useState(initialIdentifier);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<unknown>();
	const [data, setData] = useState<Type>(initialData);

	const client = {
		get: async <T = any>(
			url: string,
			config?: AxiosRequestConfig
		): Promise<T> => {
			try {
				setLoading(true);
				const response = await http.get(url, config);
				const { data } = response;
				setData(data);
				return data;
			} catch (error) {
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		post: async <T = any, U = any>(
			url: string,
			body: U,
			config?: AxiosRequestConfig
		): Promise<T> => {
			try {
				setLoading(true);
				const response = await http.post(url, body, config);
				const { data } = response;
				setData(data);
				return data;
			} catch (error) {
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		put: async <T = any, U = any>(
			url: string,
			body: U,
			config?: AxiosRequestConfig
		): Promise<T> => {
			try {
				setLoading(true);
				const response = await http.put(url, body, config);
				const { data } = response;
				setData(data);
				return data;
			} catch (error) {
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		patch: async <T = any, U = any>(
			url: string,
			body: U,
			config?: AxiosRequestConfig
		): Promise<T> => {
			try {
				setLoading(true);
				const response = await http.patch(url, body, config);
				const { data } = response;
				setData(data);
				return data;
			} catch (error) {
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
		delete: async <T = any, U = any>(
			url: string,
			body: U,
			config?: AxiosRequestConfig
		): Promise<T> => {
			try {
				setLoading(true);
				const response = await http.delete(url, config);
				const { data } = response;
				setData(data);
				return data;
			} catch (error) {
				setError(error);
				throw error;
			} finally {
				setLoading(false);
			}
		},
	};

	const call = async <T extends Type, U extends Array<any> = []>(
		callback: (..._: U) => Promise<ApiRes<T>>,
		...args: U
	): Promise<T> => {
		try {
			setLoading(true);
			const response = await callback(...args);
			if (response === null) throw new Error("No data found");
			const { data } = response;
			setData(data);
			return data;
		} catch (err) {
			setError(err);
			throw err;
		} finally {
			setLoading(false);
		}
	};

	const updateId = (id: string) => {
		setIdentifier(id);
	};

	return {
		id: identifier,
		updateId,
		http: client,
		call,
		loading,
		data,
		error,
	};
};
