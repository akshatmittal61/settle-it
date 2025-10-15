import { authRouterInterceptor } from "@/client";
import { Auth, Auth as Components } from "@/components";
import { AppSeo, routes } from "@/constants";
import { Seo } from "@/layouts";
import { Typography } from "@/library";
import { Logger } from "@/log";
import { useAuthStore } from "@/store";
import styles from "@/styles/pages/Auth.module.scss";
import { IUser, ServerSideResult } from "@/types";
import { Notify, StringUtils, stylesConfig } from "@/utils";
import { GetServerSidePropsContext } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";

const classes = stylesConfig(styles, "auth");

type T_Auth_Frame = "input" | "otp-verification" | "onboarding";

interface LoginPageProps {
	frame: T_Auth_Frame;
	user?: IUser;
}

const LoginPage: React.FC<LoginPageProps> = (props) => {
	const router = useRouter();
	const {
		requestOtpWithEmail,
		verifyOtpWithEmail,
		updateProfile,
		isRequestingOtp,
		isVerifyingOtp,
		isUpdatingProfile,
		getIsOnboarded,
	} = useAuthStore();
	const [authFrame, setAuthFrame] = useState<T_Auth_Frame>(props.frame);
	const [email, setEmail] = useState(StringUtils.EMPTY);

	const requestOtp = async () => {
		try {
			await requestOtpWithEmail(email);
			setAuthFrame("otp-verification");
		} catch (error: any) {
			Logger.error(error);
		}
	};

	const verifyOtp = async (otp: string) => {
		try {
			await verifyOtpWithEmail(email, otp);
			if (getIsOnboarded()) {
				const redirect = router.query.redirect;
				const redirectPath = StringUtils.getNonEmptyStringOrElse(
					redirect,
					routes.HOME
				);
				void router.push(redirectPath);
			} else {
				setAuthFrame("onboarding");
			}
		} catch (error: any) {
			Logger.error(error);
		}
	};

	const saveUserDetails = async (data: Auth.UserDetails) => {
		try {
			await updateProfile(data);
			if (getIsOnboarded()) {
				const redirect = router.query.redirect;
				const redirectPath = StringUtils.getNonEmptyStringOrElse(
					redirect,
					routes.HOME
				);
				void router.push(redirectPath);
			} else {
				Notify.error("Please enter your name at least!");
			}
		} catch (error: any) {
			Logger.error(error);
		}
	};

	return (
		<>
			<Seo title={`Login | ${AppSeo.title}`} />
			<main className={classes("")}>
				<span />
				<section>
					<Image
						src="/logo-full.png"
						alt={`${AppSeo.title} logo`}
						height={1920}
						width={1080}
						className={classes("-logo")}
					/>
					{authFrame === "input" ? (
						<>
							<Components.Content
								email={email}
								setEmail={(value) => setEmail(value)}
								onContinueWithEmail={requestOtp}
								requestingOtp={isRequestingOtp}
							/>
							<span className={classes("-divider")}>
								<Typography size="md">OR</Typography>
							</span>
							<Components.GoogleOAuthButton
								onClick={() => {
									void router.push("/__/oauth/google");
								}}
							/>
						</>
					) : authFrame === "otp-verification" ? (
						<Components.Verification
							email={email}
							verifyingOtp={isVerifyingOtp}
							onSubmit={verifyOtp}
							onGoBack={() => {
								setAuthFrame("input");
							}}
						/>
					) : authFrame === "onboarding" ? (
						<Components.Onboarding
							loading={isUpdatingProfile}
							onContinue={saveUserDetails}
						/>
					) : null}
				</section>
				<Typography size="sm" className={classes("-footer")} as="p">
					By joining, you agree to the {AppSeo.title} Terms of Service
					and to occasionally receive emails from us. Please read our
					Privacy Policy to learn how we use your personal data.
				</Typography>
			</main>
		</>
	);
};

export default LoginPage;

export const getServerSideProps = (
	context: GetServerSidePropsContext
): Promise<ServerSideResult<LoginPageProps>> => {
	return authRouterInterceptor(context, {
		onLoggedInAndOnboarded() {
			const { redirect } = context.query;
			const redirectPath = StringUtils.getNonEmptyStringOrElse(
				redirect,
				routes.HOME
			);
			return {
				redirect: {
					destination: redirectPath,
					permanent: false,
				},
			};
		},
		onLoggedInAndNotOnboarded(user) {
			return {
				props: {
					frame: "onboarding",
					user,
				},
			};
		},
		onLoggedOut() {
			return {
				props: {
					frame: "input",
				},
			};
		},
	});
};
