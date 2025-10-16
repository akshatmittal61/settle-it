import { fallbackAssets, routes } from "@/constants";
import { useOnClickOutside } from "@/hooks";
import { Avatar, MaterialIcon, Typography } from "@/library";
import { GroupSpread } from "@/types";
import { stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import GroupInfo from "./info";
import styles from "./styles.module.scss";

interface IGroupPageMetaProps {
	group: GroupSpread;
	onAddExpense?: () => void;
	onUpdate?: () => void;
}

interface IGroupPageMetaOptionsProps {
	groupId: string;
	onClose: () => void;
	onAddExpense?: () => void;
	onUpdate?: () => void;
}

const classes = stylesConfig(styles, "group-meta");

/* const GroupPageMeta: React.FC<IGroupPageMetaProps> = ({ group, onUpdate }) => {
	const router = useRouter();
	return (
		<>
			<div
				className={classes("-banner")}
				style={{
					backgroundImage: `url(${group.banner || fallbackAssets.banner})`,
				}}
			>
				<button
					onClick={() => router.push(routes.HOME)}
					className={classes("-banner-btn")}
				>
					<FiArrowLeft />
				</button>
				{router.pathname === "/group/[id]" ? (
					<button
						onClick={onUpdate}
						className={classes("-banner-btn")}
					>
						<FiSettings />
					</button>
				) : (
					<button
						onClick={() => router.push(routes.GROUP(group.id))}
						className={classes("-banner-btn")}
					>
						<FiList />
					</button>
				)}
			</div>
			<section className={classes("")}>
				<div className={classes("-details")}>
					<div className={classes("-icon")}>
						<Avatar
							src={group.icon || fallbackAssets.groupIcon}
							fallback={fallbackAssets.groupIcon}
							shape="square"
							alt={group.name}
							size={80}
						/>
					</div>
					<Typography size="xxl" as="h2" weight="medium">
						{group.name}
					</Typography>
					<Avatars size={32}>
						{group.members.map((member) => ({
							src: member.avatar || fallbackAssets.avatar,
							alt: member.name || member.email,
						}))}
					</Avatars>
				</div>
				<div className={classes("-actions")}>
					{router.pathname !== routes.GROUP("[id]") ? (
						<Button
							onClick={() => router.push(routes.GROUP(group.id))}
							theme="info"
						>
							View Group Home
						</Button>
					) : null}
					{router.pathname !== routes.GROUP_SUMMARY("[id]") ? (
						<Button
							onClick={() =>
								router.push(routes.GROUP_SUMMARY(group.id))
							}
							theme="info"
						>
							View summary
						</Button>
					) : null}
					{router.pathname !== routes.GROUP_TRANSACTIONS("[id]") ? (
						<Button
							onClick={() =>
								router.push(routes.GROUP_TRANSACTIONS(group.id))
							}
							theme="info"
						>
							View all Transactions
						</Button>
					) : null}
				</div>
			</section>
		</>
	);
}; */

const GroupPageMetaOptions: React.FC<IGroupPageMetaOptionsProps> = ({
	groupId,
	onClose,
	onAddExpense,
	onUpdate,
}) => {
	const router = useRouter();
	const ref = useRef<HTMLDivElement>(null);
	useOnClickOutside(ref, onClose);
	return (
		<div className={classes("-dropdown")} ref={ref}>
			{router.pathname !== routes.GROUP("[id]") ? (
				<button onClick={() => router.push(routes.GROUP(groupId))}>
					<MaterialIcon icon="home" />
					<Typography>View Group Home</Typography>
				</button>
			) : null}
			{router.pathname !== routes.GROUP_SUMMARY("[id]") ? (
				<button
					onClick={() => router.push(routes.GROUP_SUMMARY(groupId))}
				>
					<MaterialIcon icon="receipt_long" />
					<Typography>View summary</Typography>
				</button>
			) : null}
			{router.pathname !== routes.GROUP_TRANSACTIONS("[id]") ? (
				<button
					onClick={() =>
						router.push(routes.GROUP_TRANSACTIONS(groupId))
					}
				>
					<MaterialIcon icon="receipt_long" />
					<Typography>View all Transactions</Typography>
				</button>
			) : null}
			{onAddExpense ? (
				<button onClick={onAddExpense}>
					<MaterialIcon icon="add" />
					<Typography>Add Expense</Typography>
				</button>
			) : null}
			{onUpdate ? (
				<button onClick={onUpdate}>
					<MaterialIcon icon="settings" />
					<Typography>Update Group</Typography>
				</button>
			) : null}
		</div>
	);
};

const GroupPageMeta: React.FC<IGroupPageMetaProps> = ({
	group,
	onAddExpense,
	onUpdate,
}) => {
	const router = useRouter();
	const [openGroupInfo, setOpenGroupInfo] = useState(false);
	const [openOptions, setOpenOptions] = useState(false);
	return (
		<>
			<div className={classes("")}>
				<div className={classes("-left")}>
					<button
						className={classes("-action")}
						onClick={() => router.push(routes.HOME)}
					>
						<MaterialIcon icon="chevron_left" />
					</button>
					<div
						onClick={() => setOpenGroupInfo(true)}
						className={classes("-info")}
					>
						<div className={classes("-icon")}>
							<Avatar
								src={group.icon || fallbackAssets.groupIcon}
								fallback={fallbackAssets.groupIcon}
								alt={group.name}
								size={50}
							/>
						</div>
						<Typography
							size="xxl"
							as="h2"
							weight="medium"
							className={classes("-name")}
						>
							{group.name}
						</Typography>
					</div>
				</div>
				<div className={classes("-right")}>
					{onUpdate ? (
						<button
							onClick={onUpdate}
							className={classes("-action")}
						>
							<MaterialIcon icon="settings" />
						</button>
					) : null}
					<div className={classes("-options")}>
						<button
							className={classes("-action")}
							onClick={() => setOpenOptions(true)}
						>
							<MaterialIcon icon="more_vert" />
						</button>
						{openOptions ? (
							<GroupPageMetaOptions
								groupId={group.id}
								onClose={() => setOpenOptions(false)}
								onAddExpense={onAddExpense}
								onUpdate={onUpdate}
							/>
						) : null}
					</div>
				</div>
			</div>
			{openGroupInfo ? (
				<GroupInfo
					onClose={() => setOpenGroupInfo(false)}
					onUpdate={onUpdate}
					group={group}
				/>
			) : null}
		</>
	);
};

export default GroupPageMeta;
