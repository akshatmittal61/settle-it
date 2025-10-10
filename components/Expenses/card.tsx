import { UpdateExpense, ViewExpense } from "@/components";
import { useConfirmationModal, useHttpClient, useStore } from "@/hooks";
import { Typography } from "@/library";
import { IExpense, UpdateExpenseData } from "@/types";
import { getUserDetails, Notify, stylesConfig } from "@/utils";
import moment from "moment";
import React, { useState } from "react";
import styles from "./styles.module.scss";

interface IExpenseProps extends IExpense {}

const classes = stylesConfig(styles, "expense");

const Expense: React.FC<IExpenseProps> = ({
	id,
	title,
	paidOn,
	createdAt,
	paidBy,
	amount,
	group,
}) => {
	const { updateExpense, removeExpense, syncEverything } = useStore();
	const client = useHttpClient();
	const [openViewExpensePopup, setOpenViewExpensePopup] = useState(false);
	const [openEditExpensePopup, setOpenEditExpensePopup] = useState(false);
	const [updating, setUpdating] = useState(false);
	const [deleting, setDeleting] = useState(false);

	const updateExpenseHelper = async (data: UpdateExpenseData) => {
		setUpdating(true);
		try {
			await client.dispatch(updateExpense, {
				groupId: group.id,
				expenseId: id,
				data,
			});
			await syncEverything();
			setOpenEditExpensePopup(false);
			setOpenViewExpensePopup(true);
		} catch (error) {
			Notify.error(error);
		} finally {
			setUpdating(false);
		}
	};

	const deleteExpenseHelper = async () => {
		setDeleting(true);
		try {
			await client.dispatch(removeExpense, {
				groupId: group.id,
				expenseId: id,
			});
			await syncEverything();
			setOpenEditExpensePopup(false);
			setOpenViewExpensePopup(false);
		} catch (error) {
			Notify.error(error);
		} finally {
			setDeleting(false);
		}
	};

	const deleteExpenseConfirmation = useConfirmationModal(
		`Delete Expense ${title}`,
		<>
			Are you sure you want to delete this expense?
			<br />
			This action cannot be undone
		</>,
		async () => {
			await deleteExpenseHelper();
		},
		() => {
			setOpenEditExpensePopup(false);
			setOpenViewExpensePopup(false);
		},
		deleting
	);

	return (
		<>
			<div
				className={classes("")}
				onClick={() => setOpenViewExpensePopup(true)}
			>
				<Typography className={classes("-date")}>
					{moment(paidOn ?? createdAt).format("MMM DD, YYYY")}
				</Typography>
				<Typography className={classes("-title")}>{title}</Typography>
				<Typography className={classes("-amount")}>
					{getUserDetails(paidBy).name}
					{" paid "}
					{amount}
				</Typography>
			</div>
			{openViewExpensePopup ? (
				<ViewExpense
					id={id}
					onClose={() => setOpenViewExpensePopup(false)}
					onSwitchToEdit={() => {
						setOpenViewExpensePopup(false);
						setOpenEditExpensePopup(true);
					}}
					onDelete={() => {
						setOpenViewExpensePopup(false);
						deleteExpenseConfirmation.openPopup();
					}}
				/>
			) : null}
			{openEditExpensePopup ? (
				<UpdateExpense
					id={id}
					loading={updating}
					groupId={group.id}
					onClose={() => setOpenEditExpensePopup(false)}
					onSave={updateExpenseHelper}
				/>
			) : null}
			{deleteExpenseConfirmation.showPopup
				? deleteExpenseConfirmation.Modal
				: null}
		</>
	);
};

export default Expense;
