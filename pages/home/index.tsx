import { authenticatedPage } from "@/client";
import { CreateGroup, Loader } from "@/components";
import { AppSeo, fallbackAssets, routes } from "@/constants";
import { useHttpClient, useStore } from "@/hooks";
import { Responsive, Seo } from "@/layouts";
import { Avatar, Avatars, Button, MaterialIcon, Typography } from "@/library";
import styles from "@/styles/pages/Home.module.scss";
import { CreateGroupData, IUser, ServerSideResult } from "@/types";
import { Notify, stylesConfig } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";

const classes = stylesConfig(styles, "home-page");

type HomePageProps = {
	user: IUser;
};

const HomePage: React.FC<HomePageProps> = (props) => {
	const client = useHttpClient();
	const { getAllGroups, createGroup, groups } = useStore();
	const [openCreateGroupPopup, setOpenCreateGroupPopup] = useState(false);
	const [creatingGroup, setCreatingGroup] = useState(false);

	const getGroups = async () => {
		try {
			await client.dispatch(getAllGroups, undefined);
		} catch (error) {
			Notify.error(error);
		}
	};

	useEffect(() => {
		getGroups();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const createGroupHelper = async (newGroupData: CreateGroupData) => {
		try {
			setCreatingGroup(true);
			const res = await client.dispatch(createGroup, newGroupData);
			if (res) {
				setOpenCreateGroupPopup(false);
			}
		} catch (error) {
			Notify.error(error);
		} finally {
			setCreatingGroup(false);
		}
	};

	return (
		<>
			<Seo title={`${props.user.name} - Home | ${AppSeo.title}`} />
			<main className={classes("")}>
				{client.loading && groups.length === 0 ? (
					<Loader.Spinner />
				) : groups.length > 0 ? (
					<Responsive.Row>
						<Responsive.Col
							key="add-group-tile"
							xlg={33}
							lg={33}
							md={50}
							sm={50}
							xsm={100}
							style={{
								padding: "8px",
								height: "unset",
								flex: "0 1 auto",
							}}
						>
							<div
								className={classes("-tile")}
								onClick={() => setOpenCreateGroupPopup(true)}
							>
								<MaterialIcon icon="add" />
							</div>
						</Responsive.Col>
						{groups.map((group) => (
							<Responsive.Col
								key={group.id}
								xlg={33}
								lg={33}
								md={50}
								sm={50}
								xsm={100}
								style={{
									padding: "8px",
									height: "unset",
									flex: "0 1 auto",
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
											className={classes("-group__name")}
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
	return authenticatedPage(context, {
		onLoggedInAndOnboarded(user) {
			return { props: { user } };
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
