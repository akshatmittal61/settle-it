import { api } from "@/connections";
import { fallbackAssets, routes } from "@/constants";
import { useStore } from "@/hooks";
import { Responsive } from "@/layouts";
import { Avatar, Avatars, Typography } from "@/library";
import { adminMiddleware } from "@/middlewares";
import styles from "@/styles/pages/Admin.module.scss";
import { IGroup } from "@/types/group";
import { IUser } from "@/types/user";
import { stylesConfig } from "@/utils/functions";
import React, { useEffect } from "react";
import { FiMail, FiPhone } from "react-icons/fi";

type AdminPanelProps = {
	user: IUser;
	users: Array<IUser>;
	groups: Array<IGroup>;
};

const classes = stylesConfig(styles, "admin");

const AdminPanel: React.FC<AdminPanelProps> = (props) => {
	const { user, setUser, dispatch } = useStore();

	useEffect(() => {
		if (!user) dispatch(setUser(props.user));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<main className={classes("")}>
			<Typography size="xxl" weight="medium" as="h1">
				Users ({props.users.length})
			</Typography>
			<Responsive.Row style={{ alignItems: "stretch" }}>
				{props.users.map((user) => (
					<Responsive.Col
						key={`admin-users-${user.id}`}
						xlg={25}
						lg={25}
						md={33}
						sm={50}
						xsm={100}
						style={{ flex: "0 1 auto", justifyContent: "center" }}
					>
						<div className={classes("-user")}>
							<Avatar
								src={user.avatar || fallbackAssets.avatar}
								alt={user.name || user.email}
								size={64}
							/>
							<div className={classes("-user-content")}>
								<Typography
									size="lg"
									as="h3"
									className={classes("-user-name")}
								>
									{user.name || user.email}
								</Typography>
								<Typography
									size="sm"
									className={classes("-user-status")}
								>
									{user.status}
								</Typography>
								<div className={classes("-user-socials")}>
									<a
										href={`mailto:${user.email}`}
										target="_blank"
										rel="noreferrer"
									>
										<FiMail />
									</a>
									{user.phone ? (
										<a
											href={`tel:${user.phone}`}
											target="_blank"
											rel="noreferrer"
										>
											<FiPhone />
										</a>
									) : null}
								</div>
							</div>
						</div>
					</Responsive.Col>
				))}
			</Responsive.Row>
			<Typography size="xxl" weight="medium" as="h1">
				Groups ({props.groups.length})
			</Typography>
			<Responsive.Row style={{ alignItems: "stretch" }}>
				{props.groups.map((group) => (
					<Responsive.Col
						key={`admin-groups-${group.id}`}
						xlg={25}
						lg={25}
						md={33}
						sm={50}
						xsm={100}
						style={{ flex: "0 1 auto", justifyContent: "center" }}
					>
						<div className={classes("-user")}>
							<Avatar
								src={group.icon || fallbackAssets.groupIcon}
								alt={group.name}
								size={96}
							/>
							<div className={classes("-user-content")}>
								<Typography
									size="lg"
									as="h3"
									className={classes("-user-name")}
								>
									{group.name}
								</Typography>
								<Typography
									size="sm"
									className={classes("-user-status")}
								>
									{group.type}
								</Typography>
								<div className={classes("-user-created")}>
									Created By:{" "}
									<Avatar
										src={
											group.createdBy?.avatar ||
											fallbackAssets.avatar
										}
										alt={
											group.createdBy?.name ||
											group.createdBy?.email
										}
										size={24}
									/>
								</div>
								<div className={classes("-user-socials")}>
									<Avatars size={24}>
										{group.members.map((member) => ({
											src:
												member.avatar ||
												fallbackAssets.avatar,
											alt: member.name || member.email,
										}))}
									</Avatars>
								</div>
							</div>
						</div>
					</Responsive.Col>
				))}
			</Responsive.Row>
		</main>
	);
};

export default AdminPanel;

export const getServerSideProps = async (context: any) => {
	try {
		return await adminMiddleware.page(context, {
			async onAdmin(user, headers) {
				const usersRes = await api.admin.getAllUsers(headers);
				const groupsRes = await api.admin.getAllGroups(headers);
				return {
					props: {
						user,
						users: usersRes.data,
						groups: groupsRes.data,
					},
				};
			},
			onNonAdmin() {
				return {
					redirect: {
						destination: routes.HOME,
						permanent: false,
					},
				};
			},
			onLoggedOut() {
				return {
					redirect: {
						destination: routes.LOGIN + "?redirect=/__/admin",
						permanent: false,
					},
				};
			},
		});
	} catch (error: any) {
		return {
			props: {
				error: error.message,
			},
		};
	}
};
