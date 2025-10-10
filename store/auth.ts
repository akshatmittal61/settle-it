import { AuthApi, UserApi } from "@/api";
import { useHttpClient } from "@/hooks";
import { IUser } from "@/types";
import { SafetyUtils, StringUtils } from "@/utils";
import { useEffect } from "react";
import { createBaseStore, Getter, Setter } from "./base";

type State = {
	user: IUser | null;
	isLoading: boolean;
	isLoggedIn: boolean;
};

type Action = {
	getUser: Getter<State, "user">;
	getIsLoading: Getter<State, "isLoading">;
	getIsLoggedIn: Getter<State, "isLoggedIn">;
	setUser: Setter<State, "user">;
	setIsLoading: Setter<State, "isLoading">;
};

type Options = {
	syncOnMount?: boolean;
};

type Extras = {
	sync: () => Promise<void>;
	isUpdating: boolean;
	isLoading: boolean;
	update: (_: Partial<IUser>) => Promise<void>;
	logout: () => Promise<void>;
};

export const useAuthStore = createBaseStore<State, Action, Options, Extras>({
	createState: (set, get) => ({
		user: null,
		isLoading: false,
		isLoggedIn: false,
		getUser: () => get().user,
		getIsLoading: () => get().isLoading,
		getIsLoggedIn: () => get().isLoggedIn,
		setUser: (user) => {
			if (
				SafetyUtils.isNonNull(user) &&
				StringUtils.isNotEmpty(user.id)
			) {
				set({ user, isLoggedIn: true });
			} else {
				set({ user, isLoggedIn: false });
			}
		},
		setIsLoading: (isLoading) => set({ isLoading }),
	}),
	useSetup: ({ store, options }) => {
		const { loading: isUpdating, call: updateApi } = useHttpClient<IUser>();

		const sync = async () => {
			try {
				store.getState().setIsLoading(true);
				const res = await AuthApi.verifyUserIfLoggedIn();
				store.getState().setUser(res.data);
			} catch {
				store.getState().setUser(null);
			} finally {
				store.getState().setIsLoading(false);
			}
		};

		const update = async (body: Partial<IUser>) => {
			const updated = await updateApi(UserApi.updateUser, body);
			store.getState().setUser(updated);
		};

		const logout = async () => {
			await AuthApi.logout();
			store.getState().setUser(null);
		};

		useEffect(() => {
			if (options.syncOnMount) {
				void sync();
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [options.syncOnMount]);

		return {
			sync,
			isUpdating,
			isLoading: store.getState().isLoading,
			update,
			logout,
		};
	},
});
