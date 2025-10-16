import { GroupApi } from "@/api";
import { withGroupPage } from "@/client";
import { GroupMetaData, GroupPlaceholder } from "@/components";
import { AppSeo, routes } from "@/constants";
import { useHttpClient } from "@/hooks";
import { Seo } from "@/layouts";
import { Loader } from "@/library";
import PageNotFound from "@/pages/404";
import { useWalletStore } from "@/store";
import styles from "@/styles/pages/Group.module.scss";
import { IGroup, IUser } from "@/types";
import { Notify, stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const classes = stylesConfig(styles, "group");

type GroupTransactionsPageProps = {
	user: IUser;
	group: IGroup;
};

const GroupTransactionsPage: React.FC<GroupTransactionsPageProps> = (props) => {
	const { getGroups } = useWalletStore();
	const router = useRouter();
	const {
		trigger: getGroupTransactions,
		loading,
		data: { transactions },
	} = useHttpClient({
		trigger: GroupApi.getTransactions,
		onError: Notify.error,
	});
	const [groupDetails, setGroupDetails] = useState<IGroup>(props.group);

	useEffect(() => {
		void getGroupTransactions(props.group.id);
		const group = getGroups().find((group) => group.id === props.group.id);
		if (group) setGroupDetails(group);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.group?.id]);

	if (!props.group) {
		return <PageNotFound description={(props as any).error} />;
	}

	return (
		<main className={classes("")}>
			<Seo
				title={`${groupDetails?.name} - Transactions | ${AppSeo.title}`}
			/>
			<GroupMetaData group={groupDetails} />
			{loading ? (
				<section className={classes("-body", "-body--center")}>
					<Loader.Spinner />
				</section>
			) : transactions.length === 0 ? (
				<GroupPlaceholder
					action={() => router.push(routes.GROUP(groupDetails.id))}
				/>
			) : (
				<section className={classes("-body", "-body--table")}>
					<table border={1}>
						<thead>
							<tr>
								<th>S. No.</th>
								<th>Title</th>
								<th>From</th>
								<th>To</th>
								<th>Amount</th>
								<th>Settled</th>
							</tr>
						</thead>
						<tbody>
							{transactions.map((transaction, index) => (
								<tr key={`transaction-${index}`}>
									<td>{index + 1}</td>
									<td>{transaction.title}</td>
									<td>
										{transaction.from.name ||
											transaction.from.email}
									</td>
									<td>
										{transaction.to.name ||
											transaction.to.email}
									</td>
									<td>
										{transaction.owed > 0
											? transaction.owed
											: transaction.paid}
									</td>
									<td>
										{transaction.owed === 0
											? "Yes ✅"
											: "No ❌"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</section>
			)}
		</main>
	);
};

export default GroupTransactionsPage;

export const getServerSideProps = withGroupPage<GroupTransactionsPageProps>(
	(user, group) => ({
		props: { user, group },
	})
);
