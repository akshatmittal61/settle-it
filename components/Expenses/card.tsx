import { UpdateExpense, ViewExpense } from "@/components";
import { useConfirmationModal } from "@/hooks";
import { Typography } from "@/library";
import { useWalletStore } from "@/store";
import { IExpense, UpdateExpenseData } from "@/types";
import { Notify, stylesConfig, UserUtils } from "@/utils";
import dayjs from "dayjs";
import React, { useState } from "react";
import styles from "./styles.module.scss";

interface IExpenseProps extends IExpense {}

const classes = stylesConfig(styles, "expense");

const Expense: React.FC<IExpenseProps> = ({
	id,
	title,
	timestamp,
	createdAt,
	sender,
	amount,
}) => {
	// const { updateExpense, removeExpense, syncEverything } = useStore();
	const {
		updateExpense,
		deleteExpense,
		sync: syncWallet,
		isUpdatingExpense,
		isDeletingExpense,
	} = useWalletStore();
	const [openViewExpensePopup, setOpenViewExpensePopup] = useState(false);
	const [openEditExpensePopup, setOpenEditExpensePopup] = useState(false);

	const updateExpenseHelper = async (data: UpdateExpenseData) => {
		try {
			await updateExpense(id, data);
			await syncWallet();
			setOpenEditExpensePopup(false);
			setOpenViewExpensePopup(true);
		} catch (error) {
			Notify.error(error);
		}
	};

	const deleteExpenseHelper = async () => {
		try {
			await deleteExpense(id);
			await syncWallet();
			setOpenEditExpensePopup(false);
			setOpenViewExpensePopup(false);
		} catch (error) {
			Notify.error(error);
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
		isDeletingExpense
	);

	return (
		<>
			<div
				className={classes("")}
				onClick={() => setOpenViewExpensePopup(true)}
			>
				<Typography className={classes("-date")}>
					{dayjs(timestamp ?? createdAt).format("MMM DD, YYYY")}
				</Typography>
				<Typography className={classes("-title")}>{title}</Typography>
				<Typography className={classes("-amount")}>
					{UserUtils.getNameOfUser(sender)}
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
					loading={isUpdatingExpense}
					// groupId={group.id}
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
