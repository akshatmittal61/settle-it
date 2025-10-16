import { MemberApi } from "@/api";
import { Masonry } from "@/layouts";
import { Avatar, Typography } from "@/library";
import { useAuthStore } from "@/store";
import { IOwedRecord } from "@/types";
import { Notify, stylesConfig, UserUtils } from "@/utils";
import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";
import { IoChevronDown } from "react-icons/io5";
import styles from "./styles.module.scss";

interface IGroupOwedDataProps {
	groupId: string;
	data: Array<IOwedRecord>;
	sync: () => Promise<void>;
}

interface GroupOwedDataPersonProps {
	groupId: string;
	record: IOwedRecord;
	transaction: Omit<IOwedRecord, "transactions">;
	onUpdate: (_: Array<IOwedRecord>) => Promise<void>;
}

const classes = stylesConfig(styles, "group-owed-data");

const GroupOwedDataPerson: React.FC<GroupOwedDataPersonProps> = ({
	groupId,
	record,
	transaction,
	onUpdate,
}) => {
	const { getUser } = useAuthStore();
	const loggedInUser = getUser()!;
	const [settling, setSettling] = useState(false);
	const settleTwoUsers = async (userA: string, userB: string) => {
		try {
			setSettling(true);
			const res = await MemberApi.settleOwedMembersInGroup(
				groupId,
				userA,
				userB
			);
			await onUpdate(res.data);
		} catch (error) {
			Notify.error(error);
		} finally {
			setSettling(false);
		}
	};
	return (
		<>
			<div className={classes("-person", "-person--sub")}>
				<Avatar
					src={UserUtils.getUserAvatar(transaction.user)}
					alt={UserUtils.getNameOfUser(transaction.user)}
					size={32}
					className={classes("-person", "-person--sub__avatar")}
				/>
				<Typography
					size="s"
					className={classes("-person", "-person--details")}
				>
					{`owes ${transaction.amount.toFixed(2)} to ${UserUtils.getNameOfUser(transaction.user)}`}
				</Typography>
				{transaction.user.id === loggedInUser.id ? (
					<button
						disabled={settling}
						className={classes("-person", "-person--sub__button", {
							"-person--sub__button--loading": settling,
						})}
						onClick={() => {
							void settleTwoUsers(
								record.user.id,
								transaction.user.id
							);
						}}
					>
						{settling ? (
							<span
								className={classes(
									"-person--sub__button--loader"
								)}
							/>
						) : (
							<FiCheck />
						)}
					</button>
				) : (
					<span
						className={classes(
							"-person",
							"-person--sub__button",
							"-person--sub__button--placeholder"
						)}
					/>
				)}
			</div>
		</>
	);
};

const GroupOwedData: React.FC<IGroupOwedDataProps> = ({
	groupId,
	data,
	sync,
}) => {
	const [expanded, setExpanded] = useState<string | null>(null);

	return (
		<Masonry xlg={2} lg={2} md={2} sm={1} xsm={1} className={classes("")}>
			{data
				.sort((a, b) => b.amount - a.amount)
				.map((record, recId) => (
					<React.Fragment key={`owed-record-person-${recId}`}>
						<div
							className={classes("-person", "-person--block", {
								"-person--block__active":
									expanded === record.user.id,
							})}
						>
							<div
								className={classes("-person-details")}
								onClick={() => {
									setExpanded((prev) =>
										prev === record.user.id
											? null
											: record.user.id
									);
								}}
							>
								<Avatar
									src={UserUtils.getUserAvatar(record.user)}
									alt={UserUtils.getNameOfUser(record.user)}
									size={56}
								/>
								<div
									className={classes("-person-details__text")}
								>
									<Typography size="lg">
										{UserUtils.getNameOfUser(record.user)}
									</Typography>
									<Typography size="s">
										{`owes ${record.amount.toFixed(2)} in total`}
									</Typography>
								</div>
								<button
									onClick={() => {
										setExpanded((prev) =>
											prev === record.user.id
												? null
												: record.user.id
										);
									}}
									className={classes(
										"-person-details__button"
									)}
								>
									<IoChevronDown
										style={{
											transform:
												expanded === record.user.id
													? "rotate(180deg)"
													: "rotate(0deg)",
										}}
									/>
								</button>
							</div>
						</div>
						{expanded === record.user.id
							? record.transactions.map((tr, trId) => (
									<GroupOwedDataPerson
										key={`owed-record-person-${recId}-transaction-${trId}`}
										groupId={groupId}
										record={record}
										transaction={tr}
										onUpdate={sync}
									/>
								))
							: null}
					</React.Fragment>
				))}
		</Masonry>
	);
};

export default GroupOwedData;
