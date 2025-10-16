import { ExpenseApi } from "@/api";
import { useHttpClient } from "@/hooks";
import { Avatar, Pane, Typography } from "@/library";
import { useAuthStore, useWalletStore } from "@/store";
import { IExpense, IMember } from "@/types";
import { stylesConfig, UserUtils } from "@/utils";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";

interface IViewExpenseProps {
	id: string;
	onClose: () => void;
	onSwitchToEdit: () => void;
	onDelete: () => void;
}

interface ExpenseMemberProps extends IMember {
	expense: IExpense;
	onUpdateMembers: (_: Array<IMember>) => void;
}

const classes = stylesConfig(styles, "view-expense");

export const ExpenseMember: React.FC<ExpenseMemberProps> = ({ user }) => {
	// const { getUser } = useAuthStore();
	// const loggedInUser = getUser()!;
	const [settling] = useState(false);
	/* const settleMember = async () => {
		try {
			setSettling(true);
			const updatedMembersRes = await MemberApi.settleMemberInExpense({
				// groupId: expense.group.id,
				expenseId: expense.id,
				memberId: id,
			});
			onUpdateMembers(updatedMembersRes.data);
		} catch (error) {
			Notify.error(error);
		} finally {
			setSettling(false);
		}
	}; */
	return (
		<div
			className={classes("-member", {
				// "-member--owed": owed > 0,
				"-member--settling": settling,
				// "-member--settled": owed === 0 || expense.paidBy.id === user.id,
			})}
		>
			<Avatar
				src={UserUtils.getUserAvatar(user)}
				alt={UserUtils.getNameOfUser(user)}
				size={36}
			/>
			{/* (() => {
				if (expense.sender.id === user.id) {
					return (
						<Typography size="sm">
							{`${getUserDetails(expense.sender).name} paid ${roundOff(paid, 2)} for this expense`}
						</Typography>
					);
				} else {
					if (owed === 0) {
						return (
							<Typography size="sm">
								{`${getUserDetails(user).name} has paid ${roundOff(paid, 2)} to ${getUserDetails(expense.paidBy).name}`}
							</Typography>
						);
					} else {
						return (
							<Typography size="sm">
								{`${getUserDetails(user).name} owes ${roundOff(owed, 2)} to ${getUserDetails(expense.paidBy).name}`}
							</Typography>
						);
					}
				}
			})() */}
			{/* expense.paidBy.id === loggedInUser.id ? (
				<button
					disabled={owed === 0 || settling}
					className={classes("-btn", {
						"-ben--settled": owed === 0,
					})}
					onClick={settleMember}
				>
					{owed === 0 ? (
						"Settled"
					) : settling ? (
						<span className={classes("-btn--loader")} />
					) : (
						"Settle"
					)}
				</button>
			) : owed === 0 ? (
				<Typography
					size="sm"
					style={{
						color: owed === 0 ? "green" : "red",
					}}
					className={classes("-btn", "-btn--disabled")}
				>
					Settled
				</Typography>
			) : null */}
		</div>
	);
};

const ViewExpense: React.FC<IViewExpenseProps> = ({
	id,
	onClose,
	onSwitchToEdit,
	onDelete,
}) => {
	const { getUser } = useAuthStore();
	const { getExpenses } = useWalletStore();
	const loggedInUser = getUser()!;
	const {
		// loading: gettingMembers,
		trigger: getMembersForExpense,
		// data: members,
	} = useHttpClient({ trigger: ExpenseApi.getMembersOfExpense });
	/* const { loading: settlingExpense, trigger: settleExpense } = useHttpClient({
		trigger: ExpenseApi.settleExpense,
		onSuccess: () => {
			void getMembersForExpense(id);
		},
		onError: Notify.error,
	}); */
	const expense = getExpenses().find((exp) => exp.id === id);

	/* const settleExpense = async () => {
		try {
			setSettlingExpense(true);
			const updatedMembersRes = await ExpenseApi.settleExpense(id);
			setMembers(updatedMembersRes.data);
			Notify.success("This expense has been settled");
		} catch (error) {
			Notify.error(error);
		} finally {
			setSettlingExpense(false);
		}
	}; */

	useEffect(() => {
		if (expense) {
			void getMembersForExpense(id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [expense, id]);

	if (!expense) return null;

	return (
		<Pane
			onClose={onClose}
			onEdit={
				expense.author.id === loggedInUser.id ||
				expense.sender.id === loggedInUser.id
					? onSwitchToEdit
					: undefined
			}
			onDelete={
				expense.author.id === loggedInUser.id ||
				expense.sender.id === loggedInUser.id
					? onDelete
					: undefined
			}
			title={expense.title}
			width="40%"
		>
			<div className={classes("")}>
				<div className={classes("-card")}>
					<div className={classes("-card-details")}>
						<Typography className={classes("-card-title")}>
							{expense.title}
						</Typography>
						<Typography size="sm">
							{dayjs(
								expense.timestamp ?? expense.createdAt
							).format("MMM DD, YYYY")}
						</Typography>
					</div>
					<div className={classes("-card-paid")}>
						{UserUtils.getNameOfUser(expense.sender)}
						<Typography size="sm">paid {expense.amount}</Typography>
					</div>
				</div>
				{expense.description ? (
					<Typography
						as="p"
						size="sm"
						className={classes("-description")}
					>
						{expense.description}
					</Typography>
				) : null}
				<div className={classes("-members")}>
					{/* gettingMembers ? (
						<Responsive.Row>
							{Array(6)
								.fill(0)
								.map((_, index) => (
									<Responsive.Col
										key={`expense-${id}-member-${index}`}
										xlg={50}
										lg={50}
										md={100}
										sm={100}
										xsm={100}
									>
										<span
											className={classes("-skeleton")}
										/>
									</Responsive.Col>
								))}
						</Responsive.Row>
					) : (
						members.map((member, index) => (
							<ExpenseMember
								key={`expense-${id}-member-${index}`}
								{...member}
								expense={expense}
								onUpdateMembers={(newMembers) => {
									setMembers(newMembers);
								}}
							/>
						))
					) */}
				</div>
				{/* gettingMembers ? null : (
					<div className={classes("-status")}>
						{members
							.map((mem) => mem.owed)
							.every((val) => val === 0) ? (
							<Typography>
								<IoCheckmarkOutline />
								Settled
							</Typography>
						) : expense.sender.id === loggedInUser.id ? (
							<Button
								onClick={() => settleExpense(id)}
								loading={settlingExpense}
							>
								Settle
							</Button>
						) : null}
					</div>
				) */}
			</div>
		</Pane>
	);
};

export default ViewExpense;
