import { AuthApi, UserApi } from "@/api";
import { USER_STATUS } from "@/constants";
import { useHttpClient } from "@/hooks";
import { IUser, UpdateUser } from "@/types";
import { BooleanUtils, SafetyUtils, StringUtils } from "@/utils";
import { useEffect } from "react";
import { createBaseStore, Getter, Setter } from "./base";

type State = {
	user: IUser | null;
	// user will be marked as onboarded if he has joined the application and saved the name
	isOnboarded: boolean;
	isSyncing: boolean;
	isLoggedIn: boolean;
};

type Action = {
	getUser: Getter<State, "user">;
	getIsOnboarded: Getter<State, "isOnboarded">;
	getIsSyncing: Getter<State, "isSyncing">;
	getIsLoggedIn: Getter<State, "isLoggedIn">;
	setUser: Setter<State, "user">;
	setIsSyncing: Setter<State, "isSyncing">;
};

type Options = {
	syncOnMount?: boolean;
};

type Extras = {
	sync: () => Promise<void>;
	isUpdatingProfile: boolean;
	updateProfile: (_: UpdateUser) => Promise<void>;
	logout: () => Promise<void>;
};

export const useAuthStore = createBaseStore<State, Action, Options, Extras>({
	createState: (set, get) => ({
		user: null,
		isOnboarded: false,
		isSyncing: false,
		isLoggedIn: false,
		getUser: () => get().user,
		getIsOnboarded: () => get().isOnboarded,
		getIsSyncing: () => get().isSyncing,
		getIsLoggedIn: () => get().isLoggedIn,
		setUser: (user) => {
			const isLoggedIn = SafetyUtils.isNonNull(user);
			const isOnboarded =
				isLoggedIn &&
				StringUtils.equals(user.status, USER_STATUS.JOINED) &&
				StringUtils.isNotEmpty(user.name);
			set({ user, isLoggedIn, isOnboarded });
		},
		setIsSyncing: (isSyncing) => set({ isSyncing }),
	}),
	useSetup: ({ store, options }) => {
		const { loading: isUpdatingProfile, call: updateApi } =
			useHttpClient<IUser>();

		const sync = async () => {
			try {
				store.getState().setIsSyncing(true);
				const res = await AuthApi.verifyUserIfLoggedIn();
				store.getState().setUser(res.data);
			} catch {
				store.getState().setUser(null);
			} finally {
				store.getState().setIsSyncing(false);
			}
		};

		const updateProfile = async (body: UpdateUser) => {
			const updated = await updateApi(UserApi.updateUser, body);
			store.getState().setUser(updated);
		};

		const logout = async () => {
			await AuthApi.logout();
			store.getState().setUser(null);
		};

		useEffect(() => {
			if (BooleanUtils.True.equals(options.syncOnMount)) {
				void sync();
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [options.syncOnMount]);

		return {
			sync,
			isUpdatingProfile,
			updateProfile,
			logout,
		};
	},
});
