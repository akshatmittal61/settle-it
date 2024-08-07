import { Home } from "@/components";
import { routes } from "@/constants";
import { authMiddleware } from "@/middlewares";
import styles from "@/styles/pages/Home.module.scss";
import { ServerSideResult } from "@/types/server";
import { stylesConfig } from "@/utils/functions";
import React from "react";

const classes = stylesConfig(styles, "home");

const HomePage: React.FC = () => {
	return (
		<main className={classes("")}>
			<Home.Hero />
		</main>
	);
};

export default HomePage;

export const getServerSideProps = (context: any): Promise<ServerSideResult> => {
	return authMiddleware.page(context, {
		onLoggedInAndOnboarded() {
			return {
				redirect: {
					destination: routes.HOME,
					permanent: false,
				},
			};
		},
		onLoggedInAndNotOnboarded() {
			return {
				redirect: {
					destination: routes.ONBOARDING,
					permanent: false,
				},
			};
		},
		onLoggedOut() {
			return {
				props: {},
			};
		},
	});
};
