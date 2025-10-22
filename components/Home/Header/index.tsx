import { Avatar, Typography } from "@/library";
import { useAuthStore } from "@/store";
import { stylesConfig, UserUtils } from "@/utils";
import { useRouter } from "next/router";
import React from "react";
import styles from "./styles.module.scss";

interface IHeaderProps {}

const classes = stylesConfig(styles, "header");

export const HomeHeader: React.FC<IHeaderProps> = () => {
	const { getUser, getIsLoggedIn } = useAuthStore();
	const user = getUser();
	const router = useRouter();
	if (!getIsLoggedIn() || !user) return null;
	return (
		<header className={classes("")}>
			<Typography size="head-4" as="h1" weight="medium">
				Good{" "}
				{new Date().getHours() < 12
					? "Morning"
					: new Date().getHours() < 18
						? "Afternoon"
						: new Date().getHours() < 24
							? "Evening"
							: "Night"}{" "}
				{UserUtils.getNameOfUser(user)}
			</Typography>
			<button>
				<Avatar
					src={UserUtils.getUserAvatar(user)}
					alt={UserUtils.getNameOfUser(user)}
					size={48}
					onClick={() => router.push("/me")}
				/>
			</button>
		</header>
	);
};
