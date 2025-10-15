import { ApiRes } from "@/types";
import { SafetyUtils, StringUtils } from "@/utils";
import { useCallback, useState } from "react";

type DataOfApiCall<
	T,
	F extends (..._args: any[]) => Promise<ApiRes<T>>,
> = Promise<Awaited<ReturnType<F>>["data"]>;

type Options<T, F extends (..._args: any[]) => Promise<ApiRes<T>>> = {
	trigger?: F; // F is the type of the trigger function
	data?: T;
	id?: string;
	onSuccess?: (_data: T) => void | Promise<void>;
	onError?: (_error: unknown) => void | Promise<void>;
};

// The Return type infers its argument array U from the Parameters of the trigger function F
type Return<T, F extends (..._args: any[]) => Promise<ApiRes<T>>> = {
	data: T;
	loading: boolean;
	error: unknown;
	// U is inferred as Parameters<F>
	call: (_cb: F, ..._args: Parameters<F>) => DataOfApiCall<T, F>;
	trigger: (..._args: Parameters<F>) => DataOfApiCall<T, F>;
	id: string;
	updateId: (_id: string) => void;
};

export const useHttpClient = <
	T,
	F extends (..._args: any[]) => Promise<ApiRes<T>>,
>(
	options: Options<T, F> = {}
): Return<T, F> => {
	const [identifier, setIdentifier] = useState(
		StringUtils.getNonEmptyStringOrElse(options?.id, StringUtils.EMPTY)
	);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<unknown>();
	const [data, setData] = useState<T>(
		SafetyUtils.getNonNullValueOrElse(options?.data, null as T)
	);
	// --- Core Logic ---
	const executeCallLogic = useCallback(
		async (cb: F, ...args: Parameters<F>): Promise<T> => {
			setLoading(true);
			setError(undefined);
			try {
				// Note: We cast args to the correct tuple type U for spread
				const response = await cb(...(args as Parameters<F>));
				// Assuming ApiRes<T> has a data property
				const { data: responseData } = response;
				setData(responseData);
				if (options.onSuccess) {
					await options.onSuccess(responseData);
				}
				return responseData;
			} catch (err) {
				setError(err);
				if (options.onError) {
					await options.onError(err);
				}
				throw err;
			} finally {
				setLoading(false);
			}
		},
		[setData, setLoading, setError, options]
	);

	// 'call' function uses the inferred F type for its parameters
	const call = executeCallLogic as unknown as Return<T, F>["call"];

	// 'trigger' function uses the inferred F type for its parameters
	const trigger = useCallback(
		(...args: Parameters<F>) => {
			// return options.trigger ? executeCallLogic(options.trigger, ...(args as Parameters<F>));
			if (options.trigger) {
				return executeCallLogic(
					options.trigger,
					...(args as Parameters<F>)
				);
			} else {
				throw new Error("No trigger function provided");
			}
		},
		[executeCallLogic, options]
	) as unknown as Return<T, F>["trigger"];
	return {
		data,
		error,
		call,
		trigger,
		id: identifier,
		loading,
		updateId: setIdentifier,
	};
};
