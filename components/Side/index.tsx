import { appTheme, redirectToLogin, routes } from "@/constants";
import { useOnClickOutside } from "@/hooks";
import { Avatar, Typography } from "@/library";
import { useAuthStore, useUiStore, useWalletStore } from "@/store";
import {
	BooleanUtils,
	SafetyUtils,
	StringUtils,
	stylesConfig,
	UserUtils,
} from "@/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import {
	FiChevronDown,
	FiLogOut,
	FiMoon,
	FiRefreshCw,
	FiSun,
	FiUser,
} from "react-icons/fi";
import styles from "./styles.module.scss";

interface ISideBarProps {}

const classes = stylesConfig(styles, "side-bar");

export const SideBar: React.FC<ISideBarProps> = () => {
	const router = useRouter();
	const {
		getUser,
		getIsLoggedIn,
		sync: syncAuthState,
		logout,
	} = useAuthStore();
	const { sync: syncWalletState } = useWalletStore();
	const {
		getTheme,
		openSidebar,
		getSidebarNavigation,
		getSidebarExpanded,
		toggleTheme,
		sync: syncUiState,
	} = useUiStore();
	const bottomContainerRef = useRef<HTMLDivElement>(null);
	const [expandOptionsMenu, setExpandOptionsMenu] = useState(false);
	const [isSyncing, setIsSyncing] = useState(false);
	useOnClickOutside(bottomContainerRef, () => setExpandOptionsMenu(false));
	const sync = async () => {
		setIsSyncing(true);
		await Promise.all([syncAuthState(), syncWalletState(), syncUiState()]);
		setIsSyncing(false);
		syncUiState();
	};

	const logoutUser = async () => {
		await logout();
		const routeToNavigate = redirectToLogin(router.pathname);
		void router.push(routeToNavigate);
	};

	useEffect(() => {
		setExpandOptionsMenu(false);
	}, [router.pathname]);

	return (
		<>
			<aside
				className={classes("", {
					"--expanded": BooleanUtils.valueOf(getSidebarExpanded()),
					"--collapsed": BooleanUtils.invert(getSidebarExpanded()),
				})}
			>
				<div className={classes("-top")}>
					<Link
						className={classes("-logo")}
						href={
							BooleanUtils.True.equals(getIsLoggedIn())
								? routes.HOME
								: routes.ROOT
						}
					>
						<Image
							className={classes("-logo__image")}
							src={
								BooleanUtils.True.equals(getSidebarExpanded())
									? "/logo-full.png"
									: "/favicon.svg"
							}
							alt="logo"
							width={512}
							height={512}
						/>
					</Link>
					<nav className={classes("-nav")}>
						<ul className={classes("-list")}>
							{getSidebarNavigation().map((item) => (
								<li
									key={`side-bar-item-${item.title}`}
									className={classes("-list__item")}
								>
									<Link
										href={item.route}
										className={classes("-link", {
											"-link--active":
												item.route === router.pathname,
										})}
									>
										<span
											className={classes("-link__icon")}
										>
											{item.icon}
										</span>
										<Typography
											className={classes("-link__title")}
											size="sm"
										>
											{item.title}
										</Typography>
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
				<div ref={bottomContainerRef} className={classes("-bottom")}>
					{expandOptionsMenu ? (
						<>
							<div className={classes("-option")} onClick={sync}>
								<FiRefreshCw
									className={classes("-option-icon", {
										"-option-icon--loading":
											BooleanUtils.valueOf(isSyncing),
									})}
								/>
								<Typography
									size="sm"
									className={classes("-option-title")}
								>
									Sync
								</Typography>
							</div>
							<div
								className={classes("-option", "-theme")}
								onClick={toggleTheme}
							>
								{StringUtils.equals(
									getTheme(),
									appTheme.light
								) ? (
									<FiMoon
										className={classes("-option-icon")}
									/>
								) : (
									<FiSun
										className={classes("-option-icon")}
									/>
								)}
								<Typography
									size="sm"
									className={classes("-option-title")}
								>
									{StringUtils.equals(
										getTheme(),
										appTheme.light
									)
										? "Dark Mode"
										: "Light Mode"}
								</Typography>
							</div>
							{router.pathname !== routes.PROFILE ? (
								<div
									className={classes("-option")}
									onClick={() => {
										void router.push(routes.PROFILE);
									}}
								>
									<FiUser
										className={classes("-option-icon")}
									/>
									<Typography
										size="sm"
										className={classes("-option-title")}
									>
										My profile
									</Typography>
								</div>
							) : null}
							<div
								className={classes("-option")}
								onClick={logoutUser}
							>
								<FiLogOut className={classes("-option-icon")} />
								<Typography
									size="sm"
									className={classes("-option-title")}
								>
									Logout
								</Typography>
							</div>
						</>
					) : null}
					{BooleanUtils.True.equals(getIsLoggedIn()) &&
					SafetyUtils.isNonNull(getUser()) ? (
						<div
							className={classes("-option", "-user")}
							onClick={() => {
								if (
									BooleanUtils.True.equals(
										getSidebarExpanded()
									)
								) {
									setExpandOptionsMenu(BooleanUtils.invert);
								} else {
									void router.push(routes.PROFILE);
								}
							}}
						>
							<Avatar
								src={UserUtils.getUserAvatar(
									SafetyUtils.getNonNullValue(getUser())
								)}
								alt={UserUtils.getNameOfUser(
									SafetyUtils.getNonNullValue(getUser())
								)}
								size={
									BooleanUtils.valueOf(getSidebarExpanded())
										? 24
										: 36
								}
							/>
							<Typography
								size="sm"
								className={classes(
									"-option-title",
									"-user-name"
								)}
							>
								{UserUtils.getNameOfUser(
									SafetyUtils.getNonNullValue(getUser())
								)}
							</Typography>
							<FiChevronDown
								className={classes(
									"-option-action",
									"-user-action",
									{
										"-user-action--expanded":
											expandOptionsMenu,
									}
								)}
							/>
						</div>
					) : null}
				</div>
			</aside>
			<div
				className={classes("-overlay")}
				onClick={() => openSidebar()}
			/>
		</>
	);
};
