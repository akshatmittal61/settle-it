import { adminPage } from "@/client";
import { AdminApi } from "@/connections";
import { routes } from "@/constants";
import { Typography } from "@/library";
import styles from "@/styles/pages/Admin.module.scss";
import { IUser, ServerSideResult } from "@/types";
import { copyToClipboard, stylesConfig } from "@/utils";
import Link from "next/link";
import React from "react";

type AdminPanelLogsProps = {
	user: IUser;
	files: string[];
};

const classes = stylesConfig(styles, "admin");

const AdminPanelLogs: React.FC<AdminPanelLogsProps> = (props) => {
	return props.files ? (
		<main className={classes("")}>
			<Typography size="xxl" weight="medium" as="h1">
				Logs ({props.files.length})
			</Typography>
			<ul>
				{props.files.map((f) => (
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
		async onAdmin(user, headers) {
			try {
				const res = await AdminApi.getAllLogFiles(headers);
				return {
					props: {
						user,
						files: res.data,
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
					destination: routes.LOGIN + `?redirect=${routes.LOGS}`,
					permanent: false,
				},
			};
		},
	});
};
