import { AdminApi } from "@/api";
import { adminPage } from "@/client";
import { redirectToLogin, routes } from "@/constants";
import { useHttpClient } from "@/hooks";
import { Button, Loader, Typography } from "@/library";
import styles from "@/styles/pages/Admin.module.scss";
import { IUser, ServerSideResult } from "@/types";
import { saveFile, StringUtils, stylesConfig } from "@/utils";
import React, { useEffect } from "react";
import { FiDownload } from "react-icons/fi";

type AdminPanelLogPageProps = {
	user: IUser;
	file: string;
};

const classes = stylesConfig(styles, "admin");

const AdminPanelLogPage: React.FC<AdminPanelLogPageProps> = (props) => {
	const { loading, data, trigger } = useHttpClient({
		trigger: AdminApi.getLogFileByName,
	});
	useEffect(() => {
		void trigger(props.file);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [props.file]);
	return loading ? (
		<Loader.Spinner />
	) : data ? (
		<main className={classes("")}>
			<Typography size="xxl" weight="medium" as="h1">
				Logs for {props.file}
			</Typography>
			<Button
				onClick={() => {
					saveFile(data, props.file, "log");
				}}
				icon={<FiDownload />}
			>
				Download file
			</Button>
			<pre style={{ width: "100%", overflowX: "auto" }}>{data}</pre>
		</main>
	) : (
		"No logs found"
	);
};

export default AdminPanelLogPage;

export const getServerSideProps = (
	context: any
): Promise<ServerSideResult<AdminPanelLogPageProps>> => {
	return adminPage(context, {
		async onAdmin(user) {
			try {
				const fileName = StringUtils.getNonEmptyString(
					context.query.id
				);
				return {
					props: {
						user,
						file: fileName,
					},
				};
			} catch (error: any) {
				return {
					redirect: {
						destination: routes.LOGS,
						permanent: false,
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
