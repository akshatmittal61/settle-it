import { authRouterInterceptor } from "@/client";
import { Home } from "@/components";
import { routes } from "@/constants";
import styles from "@/styles/pages/Home.module.scss";
import { stylesConfig } from "@/utils";
import { GetServerSidePropsContext } from "next";
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

export const getServerSideProps = (context: GetServerSidePropsContext) => {
	return authRouterInterceptor(context, {
		onLoggedIn() {
			return {
				redirect: {
					destination: routes.HOME,
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
