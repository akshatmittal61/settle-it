import React from "react";
import styles from "@/styles/pages/Home.module.scss";
import { stylesConfig } from "@/utils";
import { IUser } from "@/types";
import { withAuthPage } from "@/client";
import { Home } from "@/components";
import { Responsive } from "@/layouts";

const classes = stylesConfig(styles, "home-page");

type HomePageProps = {
	user: IUser;
};

const HomePage: React.FC<HomePageProps> = () => {
	return (
		<>
			<main className={classes("")}>
				<Responsive.Row className={classes("-row")}>
					<Responsive.Col
						xlg={75}
						lg={75}
						md={75}
						sm={100}
						xsm={100}
						className={classes("-col")}
					>
						Groups and Activity Placeholder
					</Responsive.Col>
					<Responsive.Col
						xlg={25}
						lg={25}
						md={25}
						sm={100}
						xsm={100}
						className={classes("-col")}
					>
						<Home.Profile />
						<Home.Friends />
					</Responsive.Col>
				</Responsive.Row>
			</main>
		</>
	);
};

export default HomePage;

export const getServerSideProps = withAuthPage<HomePageProps>((user) => ({
	props: { user },
}));
