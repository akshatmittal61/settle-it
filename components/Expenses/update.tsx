import { ExpenseApi } from "@/connections";
import { useStore } from "@/hooks";
import { Responsive } from "@/layouts";
import { Button, Input, Pane } from "@/library";
import { UpdateExpenseData } from "@/types";
import { getNonNullValue, getUserDetails, Notify, stylesConfig } from "@/utils";
import React, { useEffect, useState } from "react";
import {
	distributionMethods,
	DistributionsBase,
	ExpenseUser,
} from "./distribution";
import styles from "./styles.module.scss";

interface IUpdateExpenseProps {
	id: string;
	groupId: string;
	onClose: () => void;
	onSave: (_: UpdateExpenseData) => void;
	loading: boolean;
}

const classes = stylesConfig(styles, "update-expense");

const UpdateExpense: React.FC<IUpdateExpenseProps> = ({
	id,
	groupId,
	onClose,
	onSave,
	loading,
}) => {
	const { user: loggedInuser, groups, expenses } = useStore();
	const originalExpense = getNonNullValue(
		expenses.find((expense) => expense.id === id)
	);
	const group = groups.find((group) => group.id === groupId)!;
	const [gettingMembers, setGettingMembers] = useState(false);
	const [fields, setFields] = useState<UpdateExpenseData>({
		title: originalExpense.title,
		amount: originalExpense.amount,
		groupId,
		paidBy: originalExpense.paidBy.id,
		paidOn: originalExpense.paidOn,
		description: originalExpense.description,
		members: [],
	});
	const [members, setMembers] = useState<Array<ExpenseUser>>(
		group.members.map((member) => ({
			...member,
			amount: 0,
			value: 0,
			selected: true,
		}))
	);
	const handleChange = (e: any) => {
		const { name, value } = e.target;
		if (name === "amount") {
			setFields({ ...fields, [name]: +value });
		} else {
			setFields({ ...fields, [name]: value });
		}
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();
		onSave({
			...fields,
			members: members
				.filter((user) => user.selected)
				.map((user) => ({
					userId: user.id,
					amount: user.amount,
				})),
		});
	};

	useEffect(() => {
		const getMembersForExpense = async () => {
			setGettingMembers(true);
			try {
				const res = await ExpenseApi.getMembersOfExpense({
					groupId,
					expenseId: id,
				});
				const newMembers = res.data.map((member) => ({
					...member.user,
					selected: true,
					amount: member.amount,
					value: member.amount,
				}));
				const nonExpenseGroupMembers: Array<ExpenseUser> = group.members
					.filter(
						(m) => !newMembers.map((mem) => mem.id).includes(m.id)
					)
					.map((m) => ({
						...m,
						selected: false,
						amount: 0,
						value: 0,
					}));
				setMembers([...newMembers, ...nonExpenseGroupMembers]);
			} catch (error) {
				Notify.error(error);
			} finally {
				setGettingMembers(false);
			}
		};
		getMembersForExpense();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id]);

	if (!group) return null;

	return (
		<Pane
			onClose={onClose}
			title={`Update Expense - ${originalExpense.title}`}
			className={classes("")}
		>
			{gettingMembers ? (
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
								<span className={classes("-skeleton")} />
							</Responsive.Col>
						))}
				</Responsive.Row>
			) : (
				<form className={classes("-form")} onSubmit={handleSubmit}>
					<Responsive.Row>
						<Responsive.Col
							xlg={33}
							lg={33}
							md={50}
							sm={100}
							xsm={100}
						>
							<Input
								label="Title"
								name="title"
								placeholder="Title e.g. Food"
								type="text"
								size="small"
								required
								value={fields.title}
								onChange={handleChange}
							/>
						</Responsive.Col>
						<Responsive.Col
							xlg={33}
							lg={33}
							md={50}
							sm={100}
							xsm={100}
						>
							<Input
								label="Amount"
								name="amount"
								placeholder="Amount e.g. 100"
								type="number"
								size="small"
								required
								value={fields.amount}
								onChange={handleChange}
							/>
						</Responsive.Col>
						<Responsive.Col
							xlg={33}
							lg={33}
							md={50}
							sm={100}
							xsm={100}
						>
							<Input
								label="Paid By"
								name="paidBy"
								placeholder={loggedInuser.name}
								size="small"
								required
								value={(() => {
									const foundMember = group.members.find(
										(user) => user.id === fields.paidBy
									);
									if (foundMember) {
										if (foundMember.name) {
											return foundMember.name;
										}
										return foundMember.email;
									}
									return loggedInuser.name;
								})()}
								dropdown={{
									enabled: true,
									options: group.members.map((user) => ({
										id: user.id,
										label: getUserDetails(user).name || "",
										value: user.id,
									})),
									onSelect(user) {
										setFields({
											...fields,
											paidBy: user.id,
										});
									},
								}}
							/>
						</Responsive.Col>
						<Responsive.Col
							xlg={33}
							lg={33}
							md={50}
							sm={100}
							xsm={100}
						>
							<Input
								label="Paid On"
								name="paidOn"
								type="datetime-local"
								size="small"
								value={fields.paidOn}
								onChange={handleChange}
								style={{
									width: "100%",
								}}
							/>
						</Responsive.Col>
						<Responsive.Col
							xlg={100}
							lg={100}
							md={100}
							sm={100}
							xsm={100}
						>
							<Input
								label="Description"
								name="description"
								placeholder="Description"
								size="small"
								value={fields.description}
								onChange={handleChange}
							/>
						</Responsive.Col>
						{fields.amount > 0 ? (
							<Responsive.Col
								xlg={100}
								lg={100}
								md={100}
								sm={100}
								xsm={100}
							>
								<DistributionsBase
									defaultMethod={distributionMethods.custom}
									totalAmount={fields.amount}
									members={members}
									setMembers={(newMembers) => {
										setMembers(newMembers);
									}}
								/>
							</Responsive.Col>
						) : null}
					</Responsive.Row>
					<Button
						className={classes("-submit")}
						type="submit"
						loading={loading}
						title={(() => {
							if (loading) return "Saving...";
							if (fields.amount <= 0) return "Enter Amount";
							if (
								members
									.filter((user) => user.selected)
									.some((member) => member.amount === 0)
							)
								return "Enter Amount for all members";
							if (
								members
									.filter((user) => user.selected)
									.map((user) => user.amount)
									.reduce((a, b) => a + b, 0) !==
								fields.amount
							)
								return "Enter Amount for all members";
							return "Save";
						})()}
						disabled={
							loading ||
							fields.amount <= 0 ||
							members
								.filter((user) => user.selected)
								.some((member) => member.amount === 0) ||
							members
								.filter((user) => user.selected)
								.map((user) => user.amount)
								.reduce((a, b) => a + b, 0) !== fields.amount
						}
					>
						Save
					</Button>
				</form>
			)}
		</Pane>
	);
};

export default UpdateExpense;
