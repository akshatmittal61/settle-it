import { AuthApi, UserApi } from "@/api";
import { redirectToLogin, USER_STATUS } from "@/constants";
import { useHttpClient } from "@/hooks";
import { IUser, UpdateUser } from "@/types";
import { BooleanUtils, Notify, SafetyUtils, StringUtils } from "@/utils";
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
	isRequestingOtp: boolean;
	isVerifyingOtp: boolean;
	updateProfile: (_body: UpdateUser) => Promise<void>;
	requestOtpWithEmail: (_email: string) => Promise<void>;
	verifyOtpWithEmail: (_email: string, _otp: string) => Promise<void>;
	continueOAuthWithGoogle: (_token: string) => Promise<void>;
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
		const { loading: isUpdatingProfile, trigger: updateApi } =
			useHttpClient({
				trigger: UserApi.updateUser,
				onError: Notify.error,
			});
		const { loading: isRequestingOtp, trigger: requestOtpApi } =
			useHttpClient({
				trigger: AuthApi.requestOtpWithEmail,
				onError: Notify.error,
			});
		const { loading: isVerifyingOtp, trigger: verifyOtpApi } =
			useHttpClient({
				trigger: AuthApi.verifyOtpWithEmail,
				onError: Notify.error,
			});
		const { trigger: continueOAuthWithGoogleApi } = useHttpClient({
			trigger: AuthApi.continueOAuthWithGoogle,
		});

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
			const updated = await updateApi(body);
			store.getState().setUser(updated);
		};

		const requestOtpWithEmail = async (email: string) => {
			await requestOtpApi(email);
		};

		const verifyOtpWithEmail = async (email: string, otp: string) => {
			const updated = await verifyOtpApi(email, otp);
			store.getState().setUser(updated);
		};

		const continueOAuthWithGoogle = async (token: string) => {
			const loggedInUser = await continueOAuthWithGoogleApi(token);
			store.getState().setUser(loggedInUser);
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
			isRequestingOtp,
			isVerifyingOtp,
			updateProfile,
			requestOtpWithEmail,
			verifyOtpWithEmail,
			continueOAuthWithGoogle,
			logout,
		};
	},
});
