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

	// only show top bar loader when route is changing
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
		// if server side props have sent user -> update auth store
		// else if user visits a protected route, but store is in logged out state
		// try to sync, if it fails, user will be redirected to LOGIN page
		// for handling of redirecting to LOGIN page, ref: client/http.ts
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
		// when a dev intentionally switches to mobile device, close sidebar
		if (device === "mobile") {
			closeSidebar();
		} else {
			openSidebar();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [device]);

	useEffect(() => {
		// in mobiles, whenever user switches to different page, close sidebar
		if (device === "mobile") {
			closeSidebar();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.pathname, device]);

	useEffect(() => {
		// check for network state every 10 seconds
		const interval = setInterval(() => {
			syncNetworkStatus();
		}, 10 * 1000);
		return () => clearInterval(interval);
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
