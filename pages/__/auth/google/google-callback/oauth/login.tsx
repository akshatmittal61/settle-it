import { AuthApi } from "@/api";
import { routes } from "@/constants";
import { Multimedia } from "@/library";
import { Logger } from "@/log";
import { useAuthStore } from "@/store";
import styles from "@/styles/pages/Auth.module.scss";
import { Notify, StringUtils, stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

const classes = stylesConfig(styles, "oauth");

type GoogleOAuthRedirectedPageProps = React.FC<{ token: string }>;

const GoogleOAuthRedirectedPage: GoogleOAuthRedirectedPageProps = (props) => {
	const router = useRouter();
	const { continueOAuthWithGoogle, getIsOnboarded } = useAuthStore();
	const continueWithGoogle = async () => {
		try {
			await continueOAuthWithGoogle(props.token);
			if (getIsOnboarded()) {
				void router.push(routes.HOME);
			} else {
				void router.push(routes.ONBOARDING);
			}
		} catch {
			Notify.error("Something went wrong, please try again");
			void router.push(routes.HOME);
		}
	};
	useEffect(() => {
		void continueWithGoogle();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<main className={classes("")}>
			<Multimedia.Image
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
		const code = StringUtils.getNonEmptyString(query.code);
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
