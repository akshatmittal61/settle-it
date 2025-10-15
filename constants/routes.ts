export const routes = Object.freeze({
	ROOT: "/",
	ABOUT: "/about",
	HOME: "/home",
	HELP: "/help",
	REPORT: "/report",
	CONTACT: "/contact",
	LOGIN: "/login",
	EXPENSES: "/expenses",
	ONBOARDING: "/login",
	PROFILE: "/me",
	ERROR: "/500",
	GROUP: (id: string) => `/group/${id}`,
	GROUP_SUMMARY: (id: string) => `/group/${id}/summary`,
	GROUP_TRANSACTIONS: (id: string) => `/group/${id}/transactions`,
	ADMIN: "/__/admin",
	CACHE: "/__/admin/cache",
	LOGS: "/__/admin/logs",
	LOG_FILE: (file: string) => `/__/admin/logs/${file}`,
	PRIVACY_POLICY: "/privacy-policy",
});

export const protectedRoutes: Array<String | Function> = [
	routes.GROUP,
	routes.GROUP_SUMMARY,
	routes.GROUP_TRANSACTIONS,
	routes.ADMIN,
	routes.CACHE,
	routes.LOGS,
	routes.LOG_FILE,
	routes.PROFILE,
];

export const routesSupportingContainer: Array<string | Function> = [
	routes.GROUP,
	routes.GROUP_SUMMARY,
	routes.GROUP_TRANSACTIONS,
	routes.ADMIN,
	routes.CACHE,
	routes.EXPENSES,
	routes.PROFILE,
];

export const redirectToLogin = (currentPath: string) => {
	return routes.LOGIN + `?redirect=${currentPath}`;
};
