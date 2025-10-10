import { authenticatedPage } from "@/client";
import {
	CreateExpense,
	GroupHome,
	GroupMetaData,
	GroupPlaceholder,
	Loader,
	UpdateGroup,
} from "@/components";
import { GroupApi } from "@/connections";
import { AppSeo, routes } from "@/constants";
import { useConfirmationModal, useHttpClient, useStore } from "@/hooks";
import { Seo } from "@/layouts";
import { Button } from "@/library";
import PageNotFound from "@/pages/404";
import styles from "@/styles/pages/Group.module.scss";
import {
	CreateExpenseData,
	IGroup,
	IUser,
	ServerSideResult,
	UpdateGroupData,
} from "@/types";
import { getNonEmptyString, Notify, stylesConfig } from "@/utils";
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
		dispatch,
		updateGroup,
		deleteGroup,
		createExpense,
		groups,
		setGroups,
		expenses,
		setExpenses,
		syncEverything,
	} = useStore();
	const client = useHttpClient();
	const router = useRouter();
	const [openManageGroupPopup, setOpenManageGroupPopup] = useState(false);
	const [openAddExpensePopup, setOpenAddExpensePopup] = useState(false);
	const [groupDetails, setGroupDetails] = useState<IGroup>(props.group);

	const getGroupExpensesHelper = async () => {
		try {
			client.updateId("get-expenses");
			const fetchedExpenses = await client.call(
				GroupApi.getGroupExpenses,
				props.group.id
			);
			const groupExpenses = expenses
				.filter((exp) => exp.group.id !== groupDetails.id)
				.concat(fetchedExpenses);
			dispatch(setExpenses(groupExpenses));
		} catch (error) {
			Notify.error(error);
		}
	};

	const updateGroupHelper = async (
		id: string,
		updatedGroupData: UpdateGroupData
	) => {
		try {
			client.updateId("update");
			const res = await client.dispatch(updateGroup, {
				id,
				data: updatedGroupData,
			});
			if (res) {
				setOpenManageGroupPopup(false);
			}
		} catch (error) {
			Notify.error(error);
		}
	};

	const deleteGroupHelper = async () => {
		try {
			client.updateId("delete");
			const res = await client.dispatch(deleteGroup, groupDetails?.id);
			if (res) {
				router.push(routes.HOME);
			}
		} catch (error) {
			Notify.error(error);
		}
	};

	const createExpenseHelper = async (data: CreateExpenseData) => {
		try {
			client.updateId("create");
			const res = await client.dispatch(createExpense, data);
			syncEverything();
			if (res) {
				setOpenAddExpensePopup(false);
			}
		} catch (error) {
			Notify.error(error);
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
		client.loading && client.id === "delete"
	);

	useEffect(() => {
		getGroupExpensesHelper();
		if (props.group) {
			const group = groups.find((group) => group?.id === props.group?.id);
			if (group) setGroupDetails(group);
			else {
				setGroupDetails(props.group);
				dispatch(setGroups([...groups, props.group]));
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props?.group?.id]);

	if (!props.group)
		return <PageNotFound description={(props as any).error} />;

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
						"-body--center":
							client.loading && client.id === "get-expenses",
					})}
				>
					{client.loading &&
					client.id === "get-expenses" &&
					!expenses.some((a) => a.group.id === props.group.id) ? (
						<Loader.Spinner />
					) : !expenses.some((a) => a.group.id === props.group.id) ? (
						<GroupPlaceholder
							action={() => setOpenAddExpensePopup(true)}
						/>
					) : (
						<GroupHome
							expenses={expenses.filter(
								(exp) => exp.group.id === groupDetails.id
							)}
						/>
					)}
				</section>
				{expenses.some((exp) => exp.group.id === props.group.id) ? (
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
						updateGroupHelper(groupDetails.id, updatedGroupData);
					}}
					onDelete={() => {
						setOpenManageGroupPopup(false);
						deleteGroupConfirmation.openPopup();
					}}
					loading={client.loading && client.id === "update"}
				/>
			) : null}
			{openAddExpensePopup ? (
				<CreateExpense
					groupId={groupDetails.id}
					onClose={() => setOpenAddExpensePopup(false)}
					onSave={createExpenseHelper}
					loading={client.loading && client.id === "create"}
				/>
			) : null}
			{deleteGroupConfirmation.showPopup
				? deleteGroupConfirmation.Modal
				: null}
		</>
	);
};

export default GroupPage;

export const getServerSideProps = (
	context: any
): Promise<ServerSideResult<GroupPageProps>> => {
	return authenticatedPage(context, {
		async onLoggedInAndOnboarded(user, headers) {
			try {
				const id = getNonEmptyString(context.query.id);
				const { data } = await GroupApi.getGroupDetails(id, headers);
				return {
					props: {
						user,
						group: data,
					},
				};
			} catch (error: any) {
				return {
					props: {
						error: error?.response?.data?.message || error?.message,
					},
				};
			}
		},
		onLoggedInAndNotOnboarded() {
			return {
				redirect: {
					destination:
						routes.ONBOARDING +
						`?redirect=/group/${context.query.id}`,
					permanent: false,
				},
			};
		},
		onLoggedOut() {
			return {
				redirect: {
					destination:
						routes.LOGIN + `?redirect=/group/${context.query.id}`,
					permanent: false,
				},
			};
		},
	});
};
