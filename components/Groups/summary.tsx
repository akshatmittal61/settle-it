import { Avatar, Typography } from "@/library";
import { IBalance } from "@/types";
import { stylesConfig, UserUtils } from "@/utils";
import React from "react";
import styles from "./styles.module.scss";

interface IGroupSummaryProps {
	data: Array<IBalance>;
}

const classes = stylesConfig(styles, "group-summary");

const GroupSummary: React.FC<IGroupSummaryProps> = ({ data }) => {
	return (
		<div className={classes("")}>
			{data.map((balance, blId) => (
				<div
					className={classes("-person", "-person--block", {
						"-person--gives": balance.gives > 0,
						"-person--gets": balance.gets > 0,
					})}
					key={`group-summary-person-${blId}`}
				>
					<div className={classes("-person-details")}>
						<Avatar
							src={UserUtils.getUserAvatar(balance.user)}
							alt={UserUtils.getNameOfUser(balance.user)}
							size={56}
						/>
						<div className={classes("-person-details__text")}>
							<Typography size="lg">
								{UserUtils.getNameOfUser(balance.user)}
							</Typography>
							<Typography size="s">
								{balance.gives > 0
									? `gives ${balance.gives.toFixed(2)} in total`
									: balance.gets > 0
										? `gets ${balance.gets.toFixed(2)} in total`
										: null}
							</Typography>
						</div>
					</div>
					{balance.transactions.map((transaction, trId) => (
						<Typography
							className={classes(
								"-person",
								"-person--sub",
								"-person--details"
							)}
							key={`group-summary-person-${trId}-transaction-${trId}`}
							size="sm"
						>
							{balance.gives > 0
								? `${UserUtils.getNameOfUser(balance.user)} gives ${transaction.gives.toFixed(2)} to ${UserUtils.getNameOfUser(transaction.user)}`
								: balance.gets > 0
									? `${UserUtils.getNameOfUser(balance.user)} gets ${transaction.gets.toFixed(2)} from ${UserUtils.getNameOfUser(transaction.user)}`
									: null}
						</Typography>
					))}
				</div>
			))}
		</div>
	);
};

export default GroupSummary;
