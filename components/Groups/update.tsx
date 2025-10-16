import { fallbackAssets } from "@/constants";
import { Responsive } from "@/layouts";
import { Avatar, Button, Input, Pane } from "@/library";
import { useAuthStore, useWalletStore } from "@/store";
import { IUser, UpdateGroupData } from "@/types";
import { CollectionUtils, stylesConfig } from "@/utils";
import React, { useState } from "react";
import { FiSave, FiTrash2 } from "react-icons/fi";
import Members from "./members";
import styles from "./styles.module.scss";

interface IUpdateGroupProps {
	id: string;
	onClose: () => void;
	onSave: (_: UpdateGroupData & { members: Array<string> }) => void;
	onDelete: () => void;
	isUpdatingGroup: boolean;
	isDeletingGroup: boolean;
}

const classes = stylesConfig(styles, "create-group");

const UpdateGroup: React.FC<IUpdateGroupProps> = ({
	id,
	onClose,
	isUpdatingGroup,
	isDeletingGroup,
	onSave,
	onDelete,
}) => {
	const { getGroups } = useWalletStore();
	const { getUser } = useAuthStore();
	const loggedInUser = getUser()!;
	const isLoggedInUserAuthorOfGroup =
		getGroups().find((group) => group.id === id)?.author.id ===
		loggedInUser.id;
	const [fields, setFields] = useState<UpdateGroupData>(() => {
		const group = getGroups().find((group) => group.id === id);
		if (group) {
			return {
				name: group.name,
				icon: group.icon,
				banner: group.banner,
				tags: group.tags,
				members: group.members.map((member) => member.id),
			};
		}
		return {
			name: "",
			icon: "",
			banner: "",
			type: "",
			members: [],
		};
	});
	const [selectedMembers, setSelectedMembers] = useState<Array<IUser>>(() => {
		const group = getGroups().find((group) => group.id === id);
		if (CollectionUtils.isNotEmpty(group?.members)) {
			return group.members.map((m) => m.user);
		} else {
			return CollectionUtils.EMPTY;
		}
	});
	const handleChange = (e: any) => {
		setFields({ ...fields, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: any) => {
		e.preventDefault();
		if (selectedMembers.map((user) => user.id).includes(loggedInUser.id)) {
			onSave({
				...fields,
				members: selectedMembers.map((u) => u.id),
			});
		} else {
			onSave({
				...fields,
				members: [...selectedMembers.map((u) => u.id), loggedInUser.id],
			});
		}
	};

	return (
		<Pane onClose={onClose} className={classes("")} title="Update Group">
			<form className={classes("-form")} onSubmit={handleSubmit}>
				<Responsive.Row>
					<Responsive.Col>
						<div
							className={classes("-banner")}
							style={{
								backgroundImage: `url(${fields.banner})`,
							}}
						>
							<Avatar
								src={fields.icon || fallbackAssets.groupIcon}
								alt={fields.name || "Group Icon"}
								className={classes("-banner__icon")}
								fallback={fallbackAssets.groupIcon}
								shape="square"
								style={{
									height: "80%",
									width: "auto",
								}}
							/>
						</div>
					</Responsive.Col>
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
							}}
						/>
					</Responsive.Col>
					{isLoggedInUserAuthorOfGroup ? (
						<Responsive.Col
							xlg={50}
							lg={50}
							md={50}
							sm={50}
							xsm={50}
						>
							<Button
								className={classes("-form-submit")}
								type="button"
								theme="error"
								variant="outlined"
								loading={isDeletingGroup}
								icon={<FiTrash2 />}
								onClick={onDelete}
							>
								Delete Group
							</Button>
						</Responsive.Col>
					) : (
						<Responsive.Col xlg={25} lg={25} md={25} sm={0} xsm={0}>
							<span />
						</Responsive.Col>
					)}
					<Responsive.Col xlg={50} lg={50} md={50} sm={50} xsm={50}>
						<Button
							className={classes("-form-submit")}
							type="submit"
							loading={isUpdatingGroup}
							icon={<FiSave />}
						>
							Update
						</Button>
					</Responsive.Col>
					{isLoggedInUserAuthorOfGroup ? null : (
						<Responsive.Col xlg={25} lg={25} md={25} sm={0} xsm={0}>
							<span />
						</Responsive.Col>
					)}
				</Responsive.Row>
			</form>
		</Pane>
	);
};

export default UpdateGroup;
