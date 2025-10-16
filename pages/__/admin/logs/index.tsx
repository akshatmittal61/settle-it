import { AdminApi } from "@/api";
import { adminPage } from "@/client";
import { redirectToLogin, routes } from "@/constants";
import { useHttpClient } from "@/hooks";
import { Loader, Typography } from "@/library";
import styles from "@/styles/pages/Admin.module.scss";
import { IUser, ServerSideResult } from "@/types";
import { copyToClipboard, stylesConfig } from "@/utils";
import Link from "next/link";
import React, { useEffect } from "react";

type AdminPanelLogsProps = {
	user: IUser;
};

const classes = stylesConfig(styles, "admin");

const AdminPanelLogs: React.FC<AdminPanelLogsProps> = () => {
	const {
		loading,
		data: files,
		trigger,
	} = useHttpClient({
		trigger: AdminApi.getAllLogFiles,
	});
	useEffect(() => {
		void trigger();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return loading ? (
		<Loader.Spinner />
	) : files ? (
		<main className={classes("")}>
			<Typography size="xxl" weight="medium" as="h1">
				Logs ({files.length})
			</Typography>
			<ul>
				{files.map((f) => (
					<li key={f}>
						<Link
							href={routes.LOG_FILE(f)}
							onClick={() => copyToClipboard(f)}
						>
							{f}
						</Link>
					</li>
				))}
			</ul>
		</main>
	) : (
		"No logs found"
	);
};

export default AdminPanelLogs;

export const getServerSideProps = (
	context: any
): Promise<ServerSideResult<AdminPanelLogsProps>> => {
	return adminPage(context, {
		async onAdmin(user) {
			try {
				return {
					props: {
						user,
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
		onNonAdmin() {
			return {
				redirect: {
					destination: routes.HOME,
					permanent: false,
				},
			};
		},
		onLoggedOut() {
			return {
				redirect: {
					destination: redirectToLogin(routes.LOGS),
					permanent: false,
				},
			};
		},
	});
};
