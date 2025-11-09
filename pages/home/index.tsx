import React, { useState } from "react";
import styles from "@/styles/pages/Home.module.scss";
import { BooleanUtils, StringUtils, stylesConfig } from "@/utils";
import { IUser } from "@/types";
import { withAuthPage } from "@/client";
import { Home } from "@/components";
import { Responsive } from "@/layouts";
import { useGodownStore, useWalletStore } from "@/store";
import { useDevice } from "@/hooks";

const classes = stylesConfig(styles, "home-page");

type HomePageProps = {
	user: IUser;
};

const HomePage: React.FC<HomePageProps> = () => {
	const [, setOpenGroupModal] = useState(BooleanUtils.False.value);
	const { device } = useDevice();
	useWalletStore({ syncOnMount: true });
	useGodownStore({ syncOnMount: StringUtils.notEquals(device, "mobile") });
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
						<Home.Groups
							onOpenCreateGroupModal={() => {
								setOpenGroupModal(BooleanUtils.True.value);
							}}
						/>
					</Responsive.Col>
					<Responsive.Col
						xlg={25}
						lg={25}
						md={25}
						sm={100}
						xsm={100}
						className={classes("-col", "-col__right")}
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
