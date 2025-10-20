import { Header, Seo, SideBar } from "@/components";
import {
	AppSeo,
	protectedRoutes,
	routesSupportingContainer,
} from "@/constants";
import { useDevice } from "@/hooks";
import { Loader } from "@/library";
import { useAuthStore, useUiStore } from "@/store";
import { IUser } from "@/types";
import { BooleanUtils, stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import styles from "./styles.module.scss";

interface WrapperProps {
	children: React.ReactNode;
	user?: IUser;
}

const classes = stylesConfig(styles, "wrapper");

export const Wrapper: React.FC<WrapperProps> = ({ children, user }) => {
	const router = useRouter();
	const [showLoader, setShowLoader] = useState(false);
	const { sync: syncAuth, setUser, getIsLoggedIn } = useAuthStore();
	const { closeSidebar, openSidebar, syncNetworkStatus } = useUiStore({
		syncOnMount: true,
	});
	const { device } = useDevice();

	// only show router when route is changing
	useEffect(() => {
		router.events.on("routeChangeStart", () => {
			setShowLoader(true);
		});
		router.events.on("routeChangeComplete", () => {
			setShowLoader(false);
		});
		router.events.on("routeChangeError", () => {
			setShowLoader(false);
		});
	}, [router.events]);

	useEffect(() => {
		if (user) {
			setUser(user);
		} else {
			if (
				BooleanUtils.False.equals(getIsLoggedIn()) &&
				protectedRoutes.includes(router.pathname)
			) {
				void syncAuth();
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, router.pathname]);

	useEffect(() => {
		if (device === "mobile") {
			closeSidebar();
		} else {
			openSidebar();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [device, router.pathname]);

	useEffect(() => {
		setInterval(() => {
			syncNetworkStatus();
		}, 5000);
	}, [syncNetworkStatus]);

	return (
		<>
			<Seo
				title={AppSeo.title}
				description={AppSeo.description}
				image={AppSeo.image}
				canonical={AppSeo.canonical}
				themeColor={AppSeo.themeColor}
				icons={AppSeo.icons}
				twitter={AppSeo.twitter}
				og={AppSeo.og}
			/>
			{routesSupportingContainer.includes(router.pathname) ? (
				<>
					<Header />
					<SideBar />
				</>
			) : null}
			{showLoader ? <Loader.Bar /> : null}
			<main
				className={
					routesSupportingContainer.includes(router.pathname)
						? classes("")
						: ""
				}
			>
				{children}
			</main>
			{/*<ActionBar />*/}
			<Toaster position="top-center" />
		</>
	);
};
