import { AdminApi } from "@/api";
import { adminPage } from "@/client";
import { fallbackAssets, routes } from "@/constants";
import { useHttpClient } from "@/hooks";
import { Responsive, Seo } from "@/layouts";
import { Avatar, Button, Loader, Typography } from "@/library";
import styles from "@/styles/pages/Admin.module.scss";
import { IUser, ServerSideResult } from "@/types";
import { StringUtils, stylesConfig, UserUtils } from "@/utils";
import dayjs from "dayjs";
import Link from "next/link";
import React, { useEffect } from "react";
import { FiCpu, FiFileText, FiMail, FiPhone } from "react-icons/fi";

type AdminPanelProps = {
	user: IUser;
};

const classes = stylesConfig(styles, "admin");

const AdminPanel: React.FC<AdminPanelProps> = () => {
	const {
		data: users,
		trigger: callUsersApi,
		loading: gettingUsers,
	} = useHttpClient({
		trigger: AdminApi.getAllUsers,
	});
	const {
		data: groups,
		trigger: callGroupsApi,
		loading: gettingGroups,
	} = useHttpClient({
		trigger: AdminApi.getAllGroups,
	});

	useEffect(() => {
		void Promise.all([callUsersApi(), callGroupsApi()]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<main className={classes("")}>
			<Seo title="Admin Panel" description="Admin Panel" />
			<Typography size="xxl" weight="medium" as="h1">
				Admin Panel
			</Typography>
			<div className={classes("-navigation")}>
				<Link href={routes.CACHE}>
					<Button icon={<FiCpu />}>Cache</Button>
				</Link>
				<Link href={routes.LOGS}>
					<Button icon={<FiFileText />}>Logs</Button>
				</Link>
			</div>
			{gettingUsers ? (
				<Loader.Spinner />
			) : (
				<>
					<Typography size="xxl" weight="medium" as="h1">
						Users ({users.length})
					</Typography>
					<Responsive.Row style={{ alignItems: "stretch" }}>
						{users.map((user) => (
							<Responsive.Col
								key={`admin-users-${user.id}`}
								xlg={25}
								lg={25}
								md={33}
								sm={50}
								xsm={100}
								style={{
									flex: "0 1 auto",
									justifyContent: "center",
								}}
							>
								<div className={classes("-user")}>
									<Avatar
										src={
											user.avatar || fallbackAssets.avatar
										}
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
										<div
											className={classes("-user-socials")}
										>
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
				</>
			)}
			{gettingGroups ? (
				<Loader.Spinner />
			) : (
				<>
					<Typography size="xxl" weight="medium" as="h1">
						Groups ({groups.length})
					</Typography>
					<Responsive.Row style={{ alignItems: "stretch" }}>
						{groups.map((group) => (
							<Responsive.Col
								key={`admin-groups-${group.id}`}
								xlg={25}
								lg={25}
								md={33}
								sm={50}
								xsm={100}
								style={{
									flex: "0 1 auto",
									justifyContent: "center",
								}}
							>
								<div className={classes("-user")}>
									<Avatar
										src={
											group.icon ||
											fallbackAssets.groupIcon
										}
										alt={group.name}
										size={96}
										shape="square"
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
											Created at:{" "}
											{dayjs(group.createdAt).format(
												"DD-MM-YYYY HH:mm"
											)}
										</Typography>
										<div
											className={classes("-user-created")}
										>
											Created By:{" "}
											<Avatar
												src={
													UserUtils.getUserDetails(
														group.author
													).avatar ||
													StringUtils.EMPTY
												}
												alt={
													UserUtils.getUserDetails(
														group.author
													).name || StringUtils.EMPTY
												}
												size={24}
											/>
										</div>
										<div
											className={classes("-user-socials")}
										>
											{/* <Avatars size={24}>
												{group.members.map(
													(member) => ({
														src:
															member.avatar ||
															fallbackAssets.avatar,
														alt:
															member.name ||
															member.email,
													})
												)}
											</Avatars> */}
										</div>
									</div>
								</div>
							</Responsive.Col>
						))}
					</Responsive.Row>
				</>
			)}
		</main>
	);
};

export default AdminPanel;

export const getServerSideProps = (
	context: any
): Promise<ServerSideResult<AdminPanelProps>> => {
	return adminPage(context, {
		onAdmin(user) {
			return {
				props: { user },
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
};
