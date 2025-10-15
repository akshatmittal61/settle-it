import { stylesConfig } from "@/utils";
import React from "react";
import styles from "./styles.module.scss";

interface ILoaderProps {}

const classes = stylesConfig(styles, "loader-circle");

export const Circle: React.FC<ILoaderProps> = () => {
	return (
		<div className={classes("")}>
			<span className={classes("-bar")} />
			<span className={classes("-bar")} />
			<span className={classes("-bar")} />
			<span className={classes("-bar")} />
		</div>
	);
};
