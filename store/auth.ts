import { AuthApi, UserApi } from "@/api";
import { redirectToLogin } from "@/constants";
import { useHttpClient } from "@/hooks";
import { IUser, UpdateUser } from "@/types";
import { BooleanUtils, Notify, SafetyUtils, UserUtils } from "@/utils";
import { useEffect } from "react";
import { createBaseStore, Getter, Setter } from "./base";
import { useRouter } from "next/router";

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
	// store sync util
	sync: () => Promise<IUser>;
	// loading states
	isUpdatingProfile: boolean;
	isRequestingOtp: boolean;
	isVerifyingOtp: boolean;
	// handlers
	updateProfile: (_body: UpdateUser) => Promise<IUser>;
	requestOtpWithEmail: (_email: string) => Promise<null>;
	verifyOtpWithEmail: (_email: string, _otp: string) => Promise<IUser>;
	continueOAuthWithGoogle: (_token: string) => Promise<IUser>;
	logout: () => Promise<null>;
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
			const isOnboarded = UserUtils.isUserOnboarded(user);
			set({ user, isLoggedIn, isOnboarded });
		},
		setIsSyncing: (isSyncing) => set({ isSyncing }),
	}),
	useSetup: ({ store, options }) => {
		const router = useRouter();
		const { trigger: sync, loading: isSyncing } = useHttpClient({
			trigger: AuthApi.verifyUserIfLoggedIn,
			onSuccess: store.getState().setUser,
			onError: () => {
				store.getState().setUser(null);
				void router.push(redirectToLogin(router.pathname));
			},
		});
		const { trigger: updateProfile, loading: isUpdatingProfile } =
			useHttpClient({
				trigger: UserApi.updateUser,
				onSuccess: store.getState().setUser,
				onError: Notify.error,
			});
		const { trigger: requestOtpWithEmail, loading: isRequestingOtp } =
			useHttpClient({
				trigger: AuthApi.requestOtpWithEmail,
				onError: Notify.error,
			});
		const { trigger: verifyOtpWithEmail, loading: isVerifyingOtp } =
			useHttpClient({
				trigger: AuthApi.verifyOtpWithEmail,
				onSuccess: store.getState().setUser,
				onError: Notify.error,
			});
		const { trigger: continueOAuthWithGoogle } = useHttpClient({
			trigger: AuthApi.continueOAuthWithGoogle,
			onSuccess: store.getState().setUser,
		});
		const { trigger: logout } = useHttpClient({
			trigger: AuthApi.logout,
			onSuccess: () => store.getState().setUser(null),
			onError: Notify.error,
		});

		useEffect(() => {
			if (BooleanUtils.True.equals(options.syncOnMount)) {
				void sync();
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [options.syncOnMount]);

		useEffect(() => {
			// have kept the isSyncing state
			// that is to be accessed outside the hook in root state instead on hook level
			// because it gets reset on hook remount, but not in root state
			store.getState().setIsSyncing(isSyncing);
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [isSyncing]);

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
