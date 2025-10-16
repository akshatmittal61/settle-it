import { useUiStore } from "@/store";
import { CollectionUtils, stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React from "react";
import { FiSidebar } from "react-icons/fi";
import styles from "./styles.module.scss";

interface IHeaderProps {}

const classes = stylesConfig(styles, "header");

export const Header: React.FC<IHeaderProps> = () => {
	const router = useRouter();
	const { toggleSidebar, getHeaderNavigation, getHeaderContent } =
		useUiStore();
	return (
		<div className={classes("")}>
			<button onClick={toggleSidebar} className={classes("-button")}>
				<FiSidebar />
			</button>
			{CollectionUtils.isNotEmpty(getHeaderNavigation()) ? (
				<span className={classes("-divider")} />
			) : null}
			{CollectionUtils.isNotEmpty(getHeaderNavigation()) ? (
				<nav className={classes("-navigation")}>
					{getHeaderNavigation().map((item) => (
						<button
							key={`header-navigation-${item.route}`}
							onClick={() => {
								void router.push(item.route);
							}}
							className={classes("-button")}
						>
							{item.icon}
						</button>
					))}
				</nav>
			) : null}
			{getHeaderContent() ? (
				<div className={classes("-content")}>{getHeaderContent()}</div>
			) : null}
		</div>
	);
};
