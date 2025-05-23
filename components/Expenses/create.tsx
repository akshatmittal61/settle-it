import { useStore } from "@/hooks";
import { Responsive } from "@/layouts";
import { Button, Input, Pane } from "@/library";
import { CreateExpenseData } from "@/types";
import { getUserDetails, stylesConfig } from "@/utils";
import React, { useState } from "react";
import {
	distributionMethods,
	DistributionsBase,
	ExpenseUser,
} from "./distribution";
import styles from "./styles.module.scss";

interface ICreateExpenseProps {
	groupId: string;
	onClose: () => void;
	onSave: (_: CreateExpenseData) => void;
	loading: boolean;
}

const classes = stylesConfig(styles, "create-expense");

const CreateExpense: React.FC<ICreateExpenseProps> = ({
	groupId,
	onClose,
	onSave,
	loading,
}) => {
	const { user: loggedInuser, groups } = useStore();
	const group = groups.find((group) => group.id === groupId)!;
	const [fields, setFields] = useState<CreateExpenseData>({
		title: "",
		amount: 0,
		description: "",
		paidOn: new Date().toISOString(),
		groupId,
		paidBy: loggedInuser.id,
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
			if (value.startsWith("0") && value.length > 1) {
				setFields({ ...fields, [name]: +value.slice(1) });
			} else {
				setFields({ ...fields, [name]: +value });
			}
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

	if (!group) return null;

	return (
		<Pane onClose={onClose} title="Add Expense" className={classes("")}>
			<form className={classes("-form")} onSubmit={handleSubmit}>
				<Responsive.Row>
					<Responsive.Col xlg={33} lg={33} md={50} sm={100} xsm={100}>
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
					<Responsive.Col xlg={33} lg={33} md={50} sm={100} xsm={100}>
						<Input
							label="Amount"
							name="amount"
							placeholder="Amount e.g. 100"
							size="small"
							required
							value={fields.amount}
							onChange={handleChange}
						/>
					</Responsive.Col>
					<Responsive.Col xlg={33} lg={33} md={50} sm={100} xsm={100}>
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
									setFields({ ...fields, paidBy: user.id });
								},
							}}
						/>
					</Responsive.Col>
					<Responsive.Col xlg={33} lg={33} md={50} sm={100} xsm={100}>
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
								defaultMethod={distributionMethods.equal}
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
						if (loading) return "Creating...";
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
								.reduce((a, b) => a + b, 0) !== fields.amount
						)
							return "Enter Amount for all members";
						return "Create";
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
					Create
				</Button>
			</form>
		</Pane>
	);
};

export default CreateExpense;
