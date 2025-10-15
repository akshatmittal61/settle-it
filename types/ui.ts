import React from "react";

export type AppTheme = "light" | "dark";
export type AppNetworkStatus = "online" | "offline";

export type Navigation = {
	id: string;
	title: string;
	icon: React.ReactNode;
	route: string;
};

export type ExtendedNavigation = Navigation & {
	options?: Array<Navigation>;
};

export type Sidebar = {
	expanded: boolean;
	navigation: Array<ExtendedNavigation>;
	options: Array<Navigation>;
};

export type DashboardHeader = {
	content: React.ReactNode;
	navigation: Array<Navigation>;
};
