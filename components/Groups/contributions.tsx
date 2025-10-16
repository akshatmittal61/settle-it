import { Responsive } from "@/layouts";
import { Avatar, Typography } from "@/library";
import { useUiStore } from "@/store";
import { IShare } from "@/types";
import { getUserDetails, stylesConfig } from "@/utils";
import React from "react";
import styles from "./styles.module.scss";

interface IGroupContributionsProps {
	shares: Array<IShare>;
}

const classes = stylesConfig(styles, "group-contributions");

const GroupContributions: React.FC<IGroupContributionsProps> = ({ shares }) => {
	const { getAccentColor, getTheme } = useUiStore();
	return (
		<div className={classes("")}>
			<div className={classes("-bar")}>
				{shares.map((share) => (
					<div
						className={classes("-bar__item")}
						key={`group-contributions-bar-${share.user.id}`}
						style={{
							width: `${share.percentage}%`,
							backgroundColor: `rgba(${getAccentColor()}, ${share.opacity})`,
						}}
					>
						<div className={classes("-bar__item--user")}>
							<Typography
								className={classes("-bar__item--user__name")}
								size="s"
							>
								{getUserDetails(share.user).name || ""}
							</Typography>
							<Typography
								className={classes("-bar__item--user__share")}
								size="xs"
							>
								{share.percentage}%
							</Typography>
						</div>
					</div>
				))}
			</div>
			<Responsive.Row className={classes("-cards")}>
				{shares.map((record, recId) => (
					<Responsive.Col
						xlg={50}
						lg={50}
						md={50}
						sm={100}
						xsm={100}
						key={`owed-record-person-${recId}`}
						className={classes("-person--col")}
					>
						<div
							className={classes("-person", "-person--block")}
							style={{
								backgroundColor: `rgba(${getAccentColor()}, ${record.opacity})`,
							}}
						>
							<div
								className={classes("-person-details")}
								style={{
									color:
										record.opacity > 0.5 ||
										getTheme() === "dark"
											? "var(--theme-white)"
											: "var(--theme-black)",
								}}
							>
								<Avatar
									src={
										getUserDetails(record.user).avatar || ""
									}
									alt={getUserDetails(record.user).name || ""}
									size={56}
								/>
								<div
									className={classes("-person-details__text")}
								>
									<Typography size="lg">
										{getUserDetails(record.user).name || ""}
									</Typography>
									<Typography size="s">
										{record.percentage.toFixed(2)}%
									</Typography>
									<Typography size="s">
										{new Intl.NumberFormat("en-US", {
											style: "currency",
											currency: "INR",
										}).format(record.amount)}
									</Typography>
								</div>
							</div>
						</div>
					</Responsive.Col>
				))}
			</Responsive.Row>
		</div>
	);
};

export default GroupContributions;
