import React from "react";
import { Group } from "./group";
import styles from "./styles.module.scss";
import { CollectionUtils, stylesConfig } from "@/utils";
import { vectors } from "@/constants";
import { Loader, Placeholder, Typography } from "@/library";
import { useWalletStore } from "@/store";
import { FiPlus } from "react-icons/fi";

const classes = stylesConfig(styles, "home-groups");

type HomeGroupsProps = {
	onOpenCreateGroupModal: () => void;
};

export const HomeGroups: React.FC<HomeGroupsProps> = ({
	onOpenCreateGroupModal,
}) => {
	const { groups, isGettingGroups } = useWalletStore();
	return (
		<section className={classes("")}>
			{isGettingGroups && CollectionUtils.isEmpty(groups) ? (
				<>
					{/* Initial Load, getting groups */}
					<Loader.Spinner />
				</>
			) : CollectionUtils.isNotEmpty(groups) ? (
				<>
					{/* Groups are present in store, syncing or not */}
					<div className={classes("-groups")}>
						<div
							onClick={onOpenCreateGroupModal}
							className={classes("-tile")}
						>
							<FiPlus />
						</div>
						{groups.map((group) => (
							<Group
								key={`home-all-groups-${group.id}`}
								group={group}
							/>
						))}
					</div>
				</>
			) : (
				<>
					{/* Already fetched the groups, and nothing is found */}
					<Placeholder
						id="home-empty-groups"
						image={vectors.emptyRecords}
						title={
							<Typography>
								You&apos;re not part of any group yet.
								<br />
								Plan a trip, make a girlfriend, live a little!
							</Typography>
						}
						action={{
							label: "Create Group",
							onClick: onOpenCreateGroupModal,
						}}
					/>
				</>
			)}
		</section>
	);
};
