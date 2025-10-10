import { AuthApi } from "@/connections";
import { routes } from "@/constants";
import { useStore } from "@/hooks";
import { Logger } from "@/log";
import styles from "@/styles/pages/Auth.module.scss";
import { genericParse, getNonEmptyString, Notify, stylesConfig } from "@/utils";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const classes = stylesConfig(styles, "oauth");

type GoogleOAuthRedirectedPageProps = React.FC<{ token: string }>;

const GoogleOAuthRedirectedPage: GoogleOAuthRedirectedPageProps = (props) => {
	const router = useRouter();
	const { initStore } = useStore();
	const continueWithGoogle = async () => {
		try {
			const res = await AuthApi.continueOAuthWithGoogle(props.token);
			initStore(res.data);
			if (res.data.name) {
				router.push(routes.HOME);
			} else {
				router.push(routes.ONBOARDING);
			}
		} catch {
			Notify.error("Something went wrong, please try again");
			router.push(routes.HOME);
		}
	};
	useEffect(() => {
		continueWithGoogle();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<main className={classes("")}>
			<Image
				src="/favicon.svg"
				alt="logo"
				width={400}
				height={400}
				className={classes("-loader")}
			/>
		</main>
	);
};

export default GoogleOAuthRedirectedPage;

export const getServerSideProps = async (context: any) => {
	const { query } = context;
	try {
		const code = genericParse(getNonEmptyString, query.code);
		const verificationRes = await AuthApi.verifyOAuthSignIn(code);
		return { props: { token: verificationRes.data } };
	} catch (error) {
		Logger.error(error);
		return {
			redirect: {
				destination: routes.HOME,
				permanent: false,
			},
		};
	}
};
