import React from "react";
import styles from "./styles.module.scss";
import { CollectionUtils, stylesConfig } from "@/utils";
import { useGodownStore } from "@/store";
import { Button, Typography } from "@/library";
import Image from "next/image";
import { animations } from "@/constants";

const classes = stylesConfig(styles, "home-friends");

export const HomeFriends: React.FC = () => {
	const { getFriends } = useGodownStore({ syncOnMount: true });
	return (
		<section className={classes("")}>
			{CollectionUtils.isNotEmpty(getFriends()) ? (
				<>
					<Typography
						size="xxl"
						weight="medium"
						className={classes("-header")}
					>
						Friends
					</Typography>
				</>
			) : (
				<>
					<Image
						src={animations.alone}
						alt="Alone"
						width={512}
						height={512}
					/>
					<Typography size="lg">You&apos;re so alone...</Typography>
					<a href="https://instagram.com" className={classes("-btn")}>
						<Button className={classes("-btn")}>
							Tip: Make Friends
						</Button>
					</a>
					<Typography size="sm">
						Create groups / split expenses to make friends
					</Typography>
				</>
			)}
		</section>
	);
};
