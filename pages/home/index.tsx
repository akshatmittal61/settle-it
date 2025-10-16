import { withAuthPage } from "@/client";
import { CreateGroup } from "@/components";
import { AppSeo, fallbackAssets, routes } from "@/constants";
import { useHttpClient } from "@/hooks";
import { Responsive, Seo } from "@/layouts";
import {
	Avatar,
	Avatars,
	Button,
	Loader,
	MaterialIcon,
	Typography,
} from "@/library";
import { useWalletStore } from "@/store";
import styles from "@/styles/pages/Home.module.scss";
import { CreateGroupData, IUser } from "@/types";
import { CollectionUtils, stylesConfig, UserUtils } from "@/utils";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { FiPlus } from "react-icons/fi";

const classes = stylesConfig(styles, "home-page");

type HomePageProps = {
	user: IUser;
};

const HomePage: React.FC<HomePageProps> = (props) => {
	const client = useHttpClient();
	const { createGroup, getGroups, isAddingGroup } = useWalletStore({
		syncOnMount: true,
	});
	const [openCreateGroupPopup, setOpenCreateGroupPopup] = useState(false);

	const createGroupHelper = async (
		newGroupData: CreateGroupData & { members: Array<string> }
	) => {
		await createGroup(newGroupData);
		setOpenCreateGroupPopup(false);
	};

	return (
		<>
			<Seo title={`${props.user.name} - Home | ${AppSeo.title}`} />
			<main className={classes("")}>
				{client.loading && CollectionUtils.isEmpty(getGroups()) ? (
					<Loader.Spinner />
				) : CollectionUtils.isNotEmpty(getGroups()) ? (
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
						{getGroups().map((group) => (
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
											{group.members.map(({ user }) => ({
												src: UserUtils.getUserAvatar(
													user
												),
												alt: UserUtils.getNameOfUser(
													user
												),
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
				{CollectionUtils.isNotEmpty(getGroups()) ? (
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
					loading={isAddingGroup}
					onClose={() => setOpenCreateGroupPopup(false)}
					onSave={createGroupHelper}
				/>
			) : null}
		</>
	);
};

export default HomePage;

export const getServerSideProps = withAuthPage((user) => ({
	props: { user },
}));
