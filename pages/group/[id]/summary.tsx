import { GroupApi } from "@/api";
import { withGroupPage } from "@/client";
import {
	Contributions,
	GroupMetaData,
	GroupPlaceholder,
	GroupSummary,
	OwedRecords,
} from "@/components";
import { AppSeo, routes } from "@/constants";
import { useHttpClient } from "@/hooks";
import { Seo } from "@/layouts";
import { Loader, Typography } from "@/library";
import PageNotFound from "@/pages/404";
import { useWalletStore } from "@/store";
import styles from "@/styles/pages/Group.module.scss";
import { GroupSpread, IBalancesSummary, IShare, IUser } from "@/types";
import { Notify, stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const classes = stylesConfig(styles, "group");

type GroupSummaryPageProps = {
	user: IUser;
	group: GroupSpread;
};

type GroupSummaryWindow = "owed" | "summary" | "contributions";

const GroupSummaryPage: React.FC<GroupSummaryPageProps> = (props) => {
	const { getGroups } = useWalletStore();
	const router = useRouter();
	const { trigger: getBalancesSummary, loading } = useHttpClient({
		trigger: GroupApi.getBalancesSummary,
	});
	const [groupDetails, setGroupDetails] = useState(props.group);
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
			const fetchedSummary = await getBalancesSummary(props.group.id);
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
		void getGroupSummaryHelper();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const group = getGroups().find((group) => group.id === props.group.id);
		if (group) setGroupDetails(group);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.group?.id]);

	if (!props.group) {
		return <PageNotFound description={(props as any).error} />;
	}

	return (
		<main className={classes("")}>
			<Seo title={`${groupDetails?.name} - Summary | ${AppSeo.title}`} />
			<GroupMetaData group={groupDetails} />
			{loading ? (
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

export default GroupSummaryPage;

export const getServerSideProps = withGroupPage<GroupSummaryPageProps>(
	(user, group) => ({
		props: { user, group },
	})
);
