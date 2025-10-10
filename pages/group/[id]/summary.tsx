import { authenticatedPage } from "@/client";
import {
	Contributions,
	GroupMetaData,
	GroupPlaceholder,
	GroupSummary,
	Loader,
	OwedRecords,
} from "@/components";
import { GroupApi } from "@/connections";
import { AppSeo, routes } from "@/constants";
import { useHttpClient, useStore } from "@/hooks";
import { Seo } from "@/layouts";
import { Typography } from "@/library";
import PageNotFound from "@/pages/404";
import styles from "@/styles/pages/Group.module.scss";
import {
	IBalancesSummary,
	IGroup,
	IShare,
	IUser,
	ServerSideResult,
} from "@/types";
import { getNonEmptyString, Notify, stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const classes = stylesConfig(styles, "group");

type GroupPageProps = {
	user: IUser;
	group: IGroup;
};

type GroupSummaryWindow = "owed" | "summary" | "contributions";

const GroupPage: React.FC<GroupPageProps> = (props) => {
	const { groups } = useStore();
	const router = useRouter();
	const client = useHttpClient();
	const [groupDetails, setGroupDetails] = useState<IGroup>(props.group);
	const [expenditure, setExpenditure] = useState(0);
	const [balances, setBalances] = useState<IBalancesSummary>({
		owes: [],
		balances: [],
	});
	const [shares, setShares] = useState<Array<IShare>>([]);
	const [activeTab, setActiveTab] = useState<GroupSummaryWindow>(
		balances.owes.length > 0 ? "owed" : "summary"
	);

	const getGroupSummaryHelper = async () => {
		try {
			client.updateId("get-summary");
			const fetchedSummary = await client.call(
				GroupApi.getBalancesSummary,
				props.group.id
			);
			setBalances(fetchedSummary.balances);
			setExpenditure(fetchedSummary.expenditure);
			setShares(fetchedSummary.shares);
			if (fetchedSummary.balances.owes.length > 0) {
				setActiveTab("owed");
			} else {
				setActiveTab("summary");
			}
		} catch (error) {
			Notify.error(error);
		}
	};

	useEffect(() => {
		getGroupSummaryHelper();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const group = groups.find((group) => group.id === props.group.id);
		if (group) setGroupDetails(group);
	}, [groups, props.group?.id]);

	if (!props.group)
		return <PageNotFound description={(props as any).error} />;

	return (
		<main className={classes("")}>
			<Seo title={`${groupDetails?.name} - Summary | ${AppSeo.title}`} />
			<GroupMetaData group={groupDetails} />
			{client.loading ? (
				<section className={classes("-body", "-body--center")}>
					<Loader.Spinner />
				</section>
			) : balances.owes.length === 0 && balances.balances.length === 0 ? (
				<GroupPlaceholder
					action={() => router.push(routes.GROUP(groupDetails.id))}
				/>
			) : (
				<section className={classes("-body")}>
					<Typography size="xl" weight="medium">
						Total Expenditure:{" "}
						{new Intl.NumberFormat("en-US", {
							style: "currency",
							currency: "INR",
						}).format(expenditure)}
					</Typography>
					<div className={classes("-tabs")}>
						<button
							className={classes("-tab", {
								"-tab--active": activeTab === "contributions",
							})}
							onClick={() => setActiveTab("contributions")}
						>
							<Typography>Contributions</Typography>
						</button>
						{balances.owes.length > 0 ? (
							<button
								className={classes("-tab", {
									"-tab--active": activeTab === "owed",
								})}
								onClick={() => setActiveTab("owed")}
							>
								<Typography>Owed Amount</Typography>
							</button>
						) : null}
						<button
							className={classes("-tab", {
								"-tab--active": activeTab === "summary",
							})}
							onClick={() => setActiveTab("summary")}
						>
							<Typography>Summary</Typography>
						</button>
					</div>
					{activeTab === "contributions" ? (
						<Contributions shares={shares} />
					) : activeTab === "owed" ? (
						<OwedRecords
							groupId={props.group?.id}
							data={balances.owes}
							sync={getGroupSummaryHelper}
						/>
					) : activeTab === "summary" ? (
						<GroupSummary data={balances.balances} />
					) : null}
				</section>
			)}
		</main>
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
						error: error.message,
					},
				};
			}
		},
		onLoggedInAndNotOnboarded() {
			return {
				redirect: {
					destination:
						routes.ONBOARDING +
						`?redirect=/group/${context.query.id}/summary`,
					permanent: false,
				},
			};
		},
		onLoggedOut() {
			return {
				redirect: {
					destination:
						routes.LOGIN +
						`?redirect=/group/${context.query.id}/summary`,
					permanent: false,
				},
			};
		},
	});
};
