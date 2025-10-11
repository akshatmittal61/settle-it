import { appNetworkStatus, appTheme } from "@/constants";
import { AppNetworkStatus, AppTheme } from "@/types";
import { hexToRgb, Notify, StringUtils } from "@/utils";
import { useEffect } from "react";
import { createBaseStore, Getter, Setter } from "./base";

type State = {
	vh: number;
	theme: AppTheme;
	accentColor: string;
	networkStatus: AppNetworkStatus;
};

export type Actions = {
	getTheme: Getter<State, "theme">;
	setTheme: Setter<State, "theme">;
	getAccentColor: Getter<State, "accentColor">;
	setAccentColor: Setter<State, "accentColor">;
	getNetworkStatus: Getter<State, "networkStatus">;
	setNetworkStatus: Setter<State, "networkStatus">;
};

export type Options = {
	syncOnMount?: boolean;
};

export type Extras = {
	sync: () => void;
	syncTheme: () => void;
	syncNetworkStatus: () => void;
	toggleTheme: () => void;
};

export const useUiStore = createBaseStore<State, Actions, Options, Extras>({
	createState: (set, get) => ({
		vh: 0,
		theme: appTheme.light,
		accentColor: "0, 0, 0",
		networkStatus: appNetworkStatus.online,
		getTheme: () => get().theme,
		setTheme: (theme) => set({ theme }),
		getAccentColor: () => get().accentColor,
		setAccentColor: (accentColor) => set({ accentColor }),
		getNetworkStatus: () => get().networkStatus,
		setNetworkStatus: (networkStatus) => set({ networkStatus }),
	}),
	defaults: { syncOnMount: true },
	useSetup: ({ store, options }) => {
		const syncTheme = () => {
			const theme = localStorage.getItem("theme");
			if (
				StringUtils.equalsIgnoreCase(theme, appTheme.light) ||
				StringUtils.equalsIgnoreCase(theme, appTheme.dark)
			) {
				store.getState().setTheme(theme as AppTheme);
			} else {
				const h = window.matchMedia("(prefers-color-scheme: dark)");
				if (h.matches) {
					store.getState().setTheme(appTheme.dark);
				} else {
					store.getState().setTheme(appTheme.light);
				}
			}
			const accentColor = getComputedStyle(document.documentElement)
				.getPropertyValue("--accent-color")
				.trim();
			const accentColorRgb = hexToRgb(accentColor);
			store.getState().setAccentColor(accentColorRgb);
		};

		const syncNetworkStatus = () => {
			const status = navigator.onLine
				? appNetworkStatus.online
				: appNetworkStatus.offline;
			store.getState().setNetworkStatus(status);
			if (StringUtils.equals(status, appNetworkStatus.offline)) {
				Notify.error("You are offline");
			}
		};

		const sync = () => {
			syncTheme();
			syncNetworkStatus();
		};

		const toggleTheme = () => {
			if (store.getState().theme === appTheme.light) {
				localStorage.setItem("theme", appTheme.dark);
				store.getState().setTheme(appTheme.dark);
			} else {
				localStorage.setItem("theme", appTheme.light);
				store.getState().setTheme(appTheme.light);
			}
		};

		useEffect(() => {
			if (!options.syncOnMount) return;
			if (typeof window === "undefined") return;
			sync();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [options.syncOnMount]);

		return {
			sync,
			syncTheme,
			syncNetworkStatus,
			toggleTheme,
		};
	},
});
