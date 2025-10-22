import React from "react";
import styles from "./styles.module.scss";
import { FiArrowRight } from "react-icons/fi";
import { Avatar, Button, Typography } from "@/library";
import { useAuthStore } from "@/store";
import { stylesConfig, UserUtils } from "@/utils";
import { useRouter } from "next/router";
import { routes } from "@/constants";

const classes = stylesConfig(styles, "home-profile");

type HomeProfileProps = {};

export const HomeProfile: React.FC<HomeProfileProps> = () => {
	const { user } = useAuthStore();
	const router = useRouter();
	return (
		<section className={classes("")}>
			<div className={classes("-header")}>
				{user ? (
					<Avatar
						src={UserUtils.getUserAvatar(user)}
						alt={UserUtils.getNameOfUser(user)}
						size={42}
					/>
				) : (
					<div className={classes("-skeleton", "-skeleton-circle")} />
				)}
				<Typography
					size="lg"
					weight="medium"
					className={classes("-header__name")}
				>
					{user ? (
						`Good ${
							new Date().getHours() < 12
								? "Morning"
								: new Date().getHours() < 18
									? "Afternoon"
									: new Date().getHours() < 24
										? "Evening"
										: "Night"
						} ${UserUtils.getFirstNameOfUser(user)}`
					) : (
						<div
							className={classes(
								"-skeleton",
								"-skeleton-rectangle"
							)}
						/>
					)}
				</Typography>
			</div>
			<Button
				variant="filled"
				className={classes("-btn")}
				onClick={() => {
					void router.push(routes.PROFILE);
				}}
			>
				View my Profile
				<FiArrowRight />
			</Button>
		</section>
	);
};
