import React from "react";
import styles from "./styles.module.scss";
import { GroupUtils, StringUtils, stylesConfig, UserUtils } from "@/utils";
import { GroupSpread } from "@/types";
import Link from "next/link";
import { routes } from "@/constants";
import { Avatar, Avatars, Typography } from "@/library";
import { useDevice } from "@/hooks";

const classes = stylesConfig(styles, "home-groups-group");

type GroupProps = {
	group: GroupSpread;
};

export const Group: React.FC<GroupProps> = ({ group }) => {
	const { device } = useDevice();
	return (
		<Link href={routes.GROUP(group.id)} className={classes("")}>
			<Avatar
				shape={
					StringUtils.equals(device, "mobile") ? "square" : "circle"
				}
				size={StringUtils.equals(device, "mobile") ? 100 : 40}
				src={GroupUtils.getGroupIcon(group)}
				alt={group.name}
			/>
			<div className={classes("-details")}>
				<Typography
					size={StringUtils.equals(device, "mobile") ? "xxl" : "lg"}
					as="h2"
					weight="medium"
					className={classes("-name")}
				>
					{group.name}
				</Typography>
				<Avatars size={36} limit={4} className={classes("-members")}>
					{group.members.map((member) => ({
						src: UserUtils.getUserAvatar(member.user),
						alt: UserUtils.getNameOfUser(member.user),
					}))}
				</Avatars>
			</div>
		</Link>
	);
};
