import { CreateGroup, HomeHeader } from "@/components";
import { api } from "@/connections";
import { fallbackAssets, routes } from "@/constants";
import { useStore } from "@/hooks";
import { Responsive, Seo } from "@/layouts";
import { Avatar, Avatars, Button, Typography } from "@/library";
import { notify } from "@/messages";
import { authMiddleware } from "@/middlewares";
import PageNotFound from "@/pages/404";
import styles from "@/styles/pages/Home.module.scss";
import { CreateGroupData, IGroup } from "@/types/group";
import { ServerSideResult } from "@/types/server";
import { IUser } from "@/types/user";
import { stylesConfig } from "@/utils/functions";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";

const classes = stylesConfig(styles, "home-page");

type HomePageProps = {
	user: IUser;
	groups: Array<IGroup>;
};

const HomePage: React.FC<HomePageProps> = (props) => {
	const { setUser, setGroups, dispatch, createGroup, groups } = useStore();
	const [openCreateGroupPopup, setOpenCreateGroupPopup] = useState(false);
	const [creatingGroup, setCreatingGroup] = useState(false);

	useEffect(() => {
		dispatch(setUser(props.user));
		dispatch(setGroups(props.groups));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!props.groups) return <PageNotFound />;

	const createGroupHelper = async (newGroupData: CreateGroupData) => {
		try {
			setCreatingGroup(true);
			const res = await dispatch(createGroup(newGroupData)).unwrap();
			if (res) {
				setOpenCreateGroupPopup(false);
			}
		} catch (error) {
			notify.error(error);
		} finally {
			setCreatingGroup(false);
		}
	};

	return (
		<>
			<Seo title={`${props.user.name} - Home | Settle It`} />
			<HomeHeader />
			<main className={classes("")}>
				{(groups || props.groups).length > 0 ? (
					<Responsive.Row>
						{(groups || props.groups).map((group) => (
							<Responsive.Col
								key={group.id}
								xlg={25}
								lg={33}
								md={50}
								sm={50}
								xsm={100}
								style={{
									padding: "8px",
									height: "unset",
									flex: "0 1 auto",
									margin: "6px auto",
								}}
							>
								<Link
									className={classes("-group")}
									href={routes.GROUP(group.id)}
								>
									<Avatar
										src={
											group.icon ||
											fallbackAssets.groupIcon
										}
										fallback={fallbackAssets.groupIcon}
										shape="square"
										alt={group.name}
										size={100}
									/>
									<div>
										<Typography
											size="xl"
											as="h2"
											weight="medium"
										>
											{group.name}
										</Typography>
										<Avatars size={36}>
											{group.members.map((member) => ({
												src:
													member.avatar ||
													fallbackAssets.avatar,
												alt:
													member.name ||
													member.email.slice(0, 7) +
														"...",
											}))}
										</Avatars>
									</div>
								</Link>
							</Responsive.Col>
						))}
					</Responsive.Row>
				) : (
					<div className={classes("-placeholder")}>
						<Image
							src="/vectors/empty-records.svg"
							alt="empty-records"
							width={1920}
							height={1080}
						/>
						<Typography>
							You&apos;re not part of any groups yet.
							<br />
							Plan a trip or an outing to get started.
						</Typography>
						<Button
							size="large"
							onClick={() => setOpenCreateGroupPopup(true)}
						>
							<FiPlus /> Create Group
						</Button>
					</div>
				)}
				{groups.length > 0 ? (
					<Button
						onClick={() => setOpenCreateGroupPopup(true)}
						className={classes("-add-fab")}
						size="large"
					>
						<FiPlus /> Create Group
					</Button>
				) : null}
			</main>
			{openCreateGroupPopup ? (
				<CreateGroup
					loading={creatingGroup}
					onClose={() => setOpenCreateGroupPopup(false)}
					onSave={createGroupHelper}
				/>
			) : null}
		</>
	);
};

export default HomePage;

export const getServerSideProps = (
	context: any
): Promise<ServerSideResult<HomePageProps>> => {
	return authMiddleware.page(context, {
		async onLoggedInAndOnboarded(user, headers) {
			try {
				const groupsRes = await api.group.getAllGroups(headers);
				return {
					props: {
						user,
						groups: groupsRes.data,
					},
				};
			} catch (error: any) {
				return {
					props: {
						error: error.message,
					},
				};
			}
		},
		onLoggedInAndNotOnboarded() {
			return {
				redirect: {
					destination: routes.ONBOARDING + "?redirect=/home",
					permanent: false,
				},
			};
		},
		onLoggedOut() {
			return {
				redirect: {
					destination: routes.LOGIN + "?redirect=/home",
					permanent: false,
				},
			};
		},
	});
};
