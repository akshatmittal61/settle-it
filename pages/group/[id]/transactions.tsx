import { authenticatedPage } from "@/client";
import { GroupMetaData, GroupPlaceholder, Loader } from "@/components";
import { GroupApi } from "@/connections";
import { AppSeo, routes } from "@/constants";
import { useHttpClient, useStore } from "@/hooks";
import { Seo } from "@/layouts";
import PageNotFound from "@/pages/404";
import styles from "@/styles/pages/Group.module.scss";
import { IGroup, ITransaction, IUser, ServerSideResult } from "@/types";
import { getNonEmptyString, Notify, stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const classes = stylesConfig(styles, "group");

type GroupPageProps = {
	user: IUser;
	group: IGroup;
};

const GroupPage: React.FC<GroupPageProps> = (props) => {
	const { groups } = useStore();
	const router = useRouter();
	const client = useHttpClient();
	const [groupDetails, setGroupDetails] = useState<IGroup>(props.group);
	const [transactions, setTransactions] = useState<Array<ITransaction>>([]);

	const getGroupTransactionsHelper = async () => {
		try {
			const fetchedTransactions = await client.call(
				GroupApi.getTransactions,
				props.group.id
			);
			setTransactions(fetchedTransactions.transactions);
		} catch (error) {
			Notify.error(error);
		}
	};

	useEffect(() => {
		getGroupTransactionsHelper();
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
			<Seo
				title={`${groupDetails?.name} - Transactions | ${AppSeo.title}`}
			/>
			<GroupMetaData group={groupDetails} />
			{client.loading ? (
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
						`?redirect=/group/${context.query.id}/transactions`,
					permanent: false,
				},
			};
		},
		onLoggedOut() {
			return {
				redirect: {
					destination:
						routes.LOGIN +
						`?redirect=/group/${context.query.id}/transactions`,
					permanent: false,
				},
			};
		},
	});
};
