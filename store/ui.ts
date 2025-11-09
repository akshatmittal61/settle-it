import {
	appNetworkStatus,
	appTheme,
	sideBarNavigationLinks,
} from "@/constants";
import { AppNetworkStatus, AppTheme, DashboardHeader, Sidebar } from "@/types";
import {
	BooleanUtils,
	CollectionUtils,
	hexToRgb,
	Notify,
	StringUtils,
} from "@/utils";
import { useEffect } from "react";
import { createBaseStore, Getter, Setter } from "./base";

type State = {
	vh: number;
	theme: AppTheme;
	accentColor: string;
	networkStatus: AppNetworkStatus;
	sidebar: Sidebar;
	header: DashboardHeader;
};

type Actions = {
	getTheme: Getter<State, "theme">;
	setTheme: Setter<State, "theme">;
	getAccentColor: Getter<State, "accentColor">;
	setAccentColor: Setter<State, "accentColor">;
	getNetworkStatus: Getter<State, "networkStatus">;
	setNetworkStatus: Setter<State, "networkStatus">;
	getSidebar: Getter<State, "sidebar">;
	setSidebar: Setter<State, "sidebar">;
	getSidebarExpanded: Getter<State["sidebar"], "expanded">;
	setSidebarExpanded: Setter<State["sidebar"], "expanded">;
	getSidebarNavigation: Getter<State["sidebar"], "navigation">;
	setSidebarNavigation: Setter<State["sidebar"], "navigation">;
	getSidebarOptions: Getter<State["sidebar"], "options">;
	setSidebarOptions: Setter<State["sidebar"], "options">;
	getHeader: Getter<State, "header">;
	setHeader: Setter<State, "header">;
	getHeaderContent: Getter<State["header"], "content">;
	setHeaderContent: Setter<State["header"], "content">;
	getHeaderNavigation: Getter<State["header"], "navigation">;
	setHeaderNavigation: Setter<State["header"], "navigation">;
};

export type Options = {
	syncOnMount?: boolean;
};

export type Extras = {
	sync: () => void;
	syncTheme: () => void;
	syncNetworkStatus: () => void;
	toggleTheme: () => void;
	openSidebar: () => void;
	closeSidebar: () => void;
	toggleSidebar: () => void;
};

export const useUiStore = createBaseStore<State, Actions, Options, Extras>({
	createState: (set, get) => ({
		vh: 0,
		theme: appTheme.light,
		accentColor: "0, 0, 0",
		networkStatus: appNetworkStatus.online,
		sidebar: {
			// since we are working with mobile-first UI
			// we have to consider initially sidebar is closed
			expanded: BooleanUtils.False.value,
			navigation: sideBarNavigationLinks,
			options: CollectionUtils.EMPTY,
		},
		header: {
			content: null,
			navigation: CollectionUtils.EMPTY,
		},
		getTheme: () => get().theme,
		setTheme: (theme) => {
			set({ theme });
			localStorage.setItem("theme", theme);
			document.body.dataset.theme = theme;
		},
		getAccentColor: () => get().accentColor,
		setAccentColor: (accentColor) => set({ accentColor }),
		getNetworkStatus: () => get().networkStatus,
		setNetworkStatus: (networkStatus) => set({ networkStatus }),
		getSidebar: () => get().sidebar,
		setSidebar: (sidebar) => set({ sidebar }),
		getSidebarExpanded: () => get().getSidebar().expanded,
		setSidebarExpanded: (expanded) =>
			set({ sidebar: { ...get().getSidebar(), expanded } }),
		getSidebarNavigation: () => get().getSidebar().navigation,
		setSidebarNavigation: (navigation) =>
			set({ sidebar: { ...get().getSidebar(), navigation } }),
		getSidebarOptions: () => get().getSidebar().options,
		setSidebarOptions: (options) =>
			set({ sidebar: { ...get().getSidebar(), options } }),
		getHeader: () => get().header,
		setHeader: (header) => set({ header }),
		getHeaderContent: () => get().getHeader().content,
		setHeaderContent: (content) =>
			set({ header: { ...get().getHeader(), content } }),
		getHeaderNavigation: () => get().getHeader().navigation,
		setHeaderNavigation: (navigation) =>
			set({ header: { ...get().getHeader(), navigation } }),
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
			if (
				StringUtils.equals(store.getState().getTheme(), appTheme.light)
			) {
				store.getState().setTheme(appTheme.dark);
			} else {
				store.getState().setTheme(appTheme.light);
			}
		};

		const toggleSidebar = () => {
			const stateToSet = BooleanUtils.invert(
				store.getState().getSidebarExpanded()
			);
			if (BooleanUtils.True.equals(stateToSet)) {
				document.body.style.setProperty(
					"--side-width",
					"var(--side-width-expanded)"
				);
			} else {
				document.body.style.setProperty(
					"--side-width",
					"var(--side-width-collapsed)"
				);
			}
			store.getState().setSidebarExpanded(stateToSet);
		};

		const openSidebar = () => {
			const currentState = store.getState().getSidebarExpanded();
			if (BooleanUtils.False.equals(currentState)) {
				toggleSidebar();
			}
		};

		const closeSidebar = () => {
			const currentState = store.getState().getSidebarExpanded();
			if (BooleanUtils.True.equals(currentState)) {
				toggleSidebar();
			}
		};

		useEffect(() => {
			if (BooleanUtils.True.equals(options.syncOnMount)) {
				sync();
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [options.syncOnMount]);

		return {
			sync,
			syncTheme,
			syncNetworkStatus,
			toggleTheme,
			openSidebar,
			closeSidebar,
			toggleSidebar,
		};
	},
});
