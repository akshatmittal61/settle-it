import { withGroupPage } from "@/client";
import {
	CreateExpense,
	GroupHome,
	GroupMetaData,
	GroupPlaceholder,
	UpdateGroup,
} from "@/components";
import { AppSeo, routes } from "@/constants";
import { useConfirmationModal } from "@/hooks";
import { Seo } from "@/layouts";
import { Button, Loader } from "@/library";
import PageNotFound from "@/pages/404";
import { useWalletStore } from "@/store";
import styles from "@/styles/pages/Group.module.scss";
import { CreateExpenseData, IGroup, IUser, UpdateGroupData } from "@/types";
import { CollectionUtils, Notify, StringUtils, stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";

const classes = stylesConfig(styles, "group");

type GroupPageProps = {
	user: IUser;
	group: IGroup;
};

const GroupPage: React.FC<GroupPageProps> = (props) => {
	const {
		sync: syncWallet,
		getGroups,
		getExpenses,
		getGroupExpenses,
		updateGroup,
		deleteGroup,
		createExpense,
		isGettingGroupExpenses,
		isUpdatingGroup,
		isDeletingGroup,
		isCreatingExpense,
		isDeletingExpense,
	} = useWalletStore();
	const router = useRouter();
	const [openManageGroupPopup, setOpenManageGroupPopup] = useState(false);
	const [openAddExpensePopup, setOpenAddExpensePopup] = useState(false);
	const [groupDetails, setGroupDetails] = useState<IGroup>(props.group);

	const updateGroupHelper = async (
		id: string,
		updatedGroupData: UpdateGroupData & { members: Array<string> }
	) => {
		const res = await updateGroup(id, updatedGroupData);
		if (res) {
			setOpenManageGroupPopup(false);
		}
	};

	const deleteGroupHelper = async () => {
		const res = await deleteGroup(groupDetails?.id);
		if (res) {
			void router.push(routes.HOME);
		}
	};

	const createExpenseHelper = async (data: CreateExpenseData) => {
		const res = await createExpense(data);
		if (res) {
			setOpenAddExpensePopup(false);
		}
	};

	const deleteGroupConfirmation = useConfirmationModal(
		`Delete ${groupDetails?.name}?`,
		<>
			Are you sure you want to delete <b>{groupDetails?.name}</b> group?
			<br />
			This action cannot be undone
		</>,
		async () => {
			await deleteGroupHelper();
		},
		() => {
			deleteGroupConfirmation.closePopup();
		},
		isDeletingExpense
	);

	useEffect(() => {
		if (props.group) {
			setGroupDetails(props.group);
			void getGroupExpenses(props.group.id);
			if (CollectionUtils.isEmpty(getGroups())) {
				void syncWallet();
			}
		} else {
			Notify.error("No group found.");
			void router.push(routes.HOME);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.group?.id]);

	if (!props.group) {
		return <PageNotFound description={(props as any).error} />;
	}

	return (
		<>
			<Seo title={`${groupDetails?.name} - ${AppSeo.title}`} />
			<main className={classes("")}>
				<GroupMetaData
					group={groupDetails}
					onAddExpense={() => setOpenAddExpensePopup(true)}
					onUpdate={() => setOpenManageGroupPopup(true)}
				/>
				<section
					className={classes("-body", {
						"-body--center": isGettingGroupExpenses,
					})}
				>
					{isGettingGroupExpenses &&
					!getExpenses().some((a) =>
						StringUtils.equals(a.group?.id, props.group.id)
					) ? (
						<Loader.Spinner />
					) : !getExpenses().some(
							(a) =>
								StringUtils.equals(a.group?.id, props.group.id)
							// eslint-disable-next-line no-mixed-spaces-and-tabs
					  ) ? (
						<GroupPlaceholder
							action={() => setOpenAddExpensePopup(true)}
						/>
					) : (
						<GroupHome
							expenses={getExpenses().filter((exp) =>
								StringUtils.equals(
									exp.group?.id,
									groupDetails?.id
								)
							)}
						/>
					)}
				</section>
				{getExpenses().some((exp) =>
					StringUtils.equals(exp.group?.id, props.group.id)
				) ? (
					<Button
						onClick={() => setOpenAddExpensePopup(true)}
						className={classes("-add-fab")}
						size="large"
					>
						<FiPlus /> Add expense
					</Button>
				) : null}
			</main>
			{openManageGroupPopup ? (
				<UpdateGroup
					id={groupDetails.id}
					onClose={() => setOpenManageGroupPopup(false)}
					onSave={(updatedGroupData) => {
						void updateGroupHelper(
							groupDetails.id,
							updatedGroupData
						);
					}}
					onDelete={() => {
						setOpenManageGroupPopup(false);
						deleteGroupConfirmation.openPopup();
					}}
					isUpdatingGroup={isUpdatingGroup}
					isDeletingGroup={isDeletingGroup}
				/>
			) : null}
			{openAddExpensePopup ? (
				<CreateExpense
					groupId={groupDetails.id}
					onClose={() => setOpenAddExpensePopup(false)}
					onSave={createExpenseHelper}
					loading={isCreatingExpense}
				/>
			) : null}
			{deleteGroupConfirmation.showPopup
				? deleteGroupConfirmation.Modal
				: null}
		</>
	);
};

export default GroupPage;

export const getServerSideProps = withGroupPage<GroupPageProps>(
	(user, group) => ({
		props: { user, group },
	})
);
