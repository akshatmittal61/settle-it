import { IGroup, Navigation } from "@/types";
import { routes } from "./routes";

const loggedOutSideBarLinks: Array<Navigation> = [
	{
		id: "home",
		title: "Home",
		icon: "home",
		route: routes.ROOT,
	},
	{
		id: "about",
		title: "About",
		icon: "info",
		route: routes.ABOUT,
	},
	{
		id: "help",
		title: "Help",
		icon: "help",
		route: routes.HELP,
	},
	{
		id: "privacy-policy",
		title: "Privacy Policy",
		icon: "receipt",
		route: routes.PRIVACY_POLICY,
	},
	{
		id: "report-bug",
		title: "Report A Bug",
		icon: "report",
		route: routes.REPORT,
	},
	{
		id: "contact-us",
		title: "Contact Us",
		icon: "call",
		route: routes.CONTACT,
	},
];

const loggedInSideBarLinks = (_groups: Array<IGroup>): Array<Navigation> => [
	{
		id: "my-groups",
		title: "My Groups",
		icon: "groups",
		route: routes.HOME,
		// options: groups.map((group) => ({
		// 	title: group.name,
		// 	icon: "group",
		// 	route: routes.GROUP(group.id),
		// })),
	},
	{
		id: "profile",
		title: "Your Profile",
		icon: "account_circle",
		route: routes.PROFILE,
	},
	{
		id: "help",
		title: "Help",
		icon: "help",
		route: routes.HELP,
	},
	{
		id: "privacy-policy",
		title: "Privacy Policy",
		icon: "receipt",
		route: routes.PRIVACY_POLICY,
	},
	{
		id: "report-bug",
		title: "Report A Bug",
		icon: "report",
		route: routes.REPORT,
	},
	{
		id: "contact-us",
		title: "Contact Us",
		icon: "call",
		route: routes.CONTACT,
	},
];

export const getSideBarLinks = ({
	loggedIn,
	groups,
}: {
	loggedIn: boolean;
	groups?: Array<IGroup>;
}) =>
	loggedIn && groups ? loggedInSideBarLinks(groups) : loggedOutSideBarLinks;
