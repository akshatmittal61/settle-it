import { Responsive } from "@/layouts";
import { Button, Input, Pane } from "@/library";
import { useAuthStore } from "@/store";
import { CreateGroupData, IUser } from "@/types";
import { Notify, stylesConfig } from "@/utils";
import React, { useState } from "react";
import Members from "./members";
import styles from "./styles.module.scss";

interface ICreateGroupProps {
	onClose: () => void;
	onSave: (_: CreateGroupData & { members: Array<string> }) => void;
	loading: boolean;
}

const classes = stylesConfig(styles, "create-group");

const CreateGroup: React.FC<ICreateGroupProps> = ({
	onClose,
	loading,
	onSave,
}) => {
	const { getUser } = useAuthStore();
	const loggedInUser = getUser()!;
	const [members, setMembers] = useState([loggedInUser.id]);
	const [fields, setFields] = useState<CreateGroupData>({
		name: "",
		icon: "",
		banner: "",
		// type: "",
		tags: [],
	});
	const [selectedMembers, setSelectedMembers] = useState<Array<IUser>>([
		loggedInUser,
	]);
	const handleChange = (e: any) => {
		setFields({ ...fields, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();
		if (
			selectedMembers.length === 0 ||
			(selectedMembers.length === 1 &&
				selectedMembers[0].id === loggedInUser.id)
		) {
			return Notify.error("Please select at least 1 member");
		}
		if (selectedMembers.map((user) => user.id).includes(loggedInUser.id)) {
			onSave({ ...fields, members });
		} else {
			onSave({
				...fields,
				members: [...members, loggedInUser.id],
			});
		}
	};

	return (
		<Pane onClose={onClose} className={classes("")} title="Create Group">
			<form className={classes("-form")} onSubmit={handleSubmit}>
				<Responsive.Row>
					<Responsive.Col xlg={50} lg={50} md={50} sm={100} xsm={100}>
						<Input
							label="Name"
							name="name"
							type="text"
							placeholder="Group Name. eg. Trip to NYC"
							required
							size="small"
							value={fields.name}
							onChange={handleChange}
						/>
					</Responsive.Col>
					<Responsive.Col xlg={50} lg={50} md={50} sm={100} xsm={100}>
						<Input
							label="Icon URL (optional)"
							name="icon"
							placeholder="https://example.com/icon.png"
							size="small"
							value={fields.icon}
							onChange={handleChange}
						/>
					</Responsive.Col>
					<Responsive.Col xlg={50} lg={50} md={50} sm={100} xsm={100}>
						<Input
							label="Banner URL (optional)"
							name="banner"
							placeholder="https://example.com/banner.png"
							size="small"
							value={fields.banner}
							onChange={handleChange}
						/>
					</Responsive.Col>
					{/* <Responsive.Col xlg={50} lg={50} md={50} sm={100} xsm={100}>
						<Input
							label="Type"
							name="type"
							size="small"
							value={fields.type}
							onChange={handleChange}
							dropdown={{
								enabled: true,
								options: [
									{
										id: "Trip",
										label: "Trip",
										value: "Trip",
									},
									{
										id: "Outing",
										label: "Outing",
										value: "Outing",
									},
									{
										id: "Other",
										label: "Other",
										value: "Other",
									},
								],
								onSelect(option) {
									setFields({
										...fields,
										type: option.value,
									});
								},
							}}
						/>
					</Responsive.Col> */}
					<Responsive.Col
						xlg={100}
						lg={100}
						md={100}
						sm={100}
						xsm={100}
						className={classes("-members-col", "-manage-col")}
					>
						<Members
							selectedMembers={selectedMembers}
							setSelectedMembers={(users) => {
								setSelectedMembers(users);
								setMembers(users.map((user) => user.id));
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
						<Button
							className={classes("-form-submit")}
							type="submit"
							loading={loading}
						>
							Create
						</Button>
					</Responsive.Col>
				</Responsive.Row>
			</form>
		</Pane>
	);
};

export default CreateGroup;
