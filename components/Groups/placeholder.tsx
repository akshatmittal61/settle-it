import { Button, Multimedia, Typography } from "@/library";
import { stylesConfig } from "@/utils";
import React from "react";
import styles from "./styles.module.scss";

interface IGroupPlaceholderProps {
	action: () => void;
}

const classes = stylesConfig(styles, "group-placeholder");

const GroupPlaceholder: React.FC<IGroupPlaceholderProps> = ({ action }) => {
	return (
		<div className={classes("")}>
			<Multimedia.Image
				src="/vectors/empty-records.svg"
				alt="empty-records"
				width={1920}
				height={1080}
			/>
			<Typography>
				No expenses yet <br />
				Add one to get this party started
			</Typography>
			<Button size="large" onClick={action}>
				Add expense
			</Button>
		</div>
	);
};

export default GroupPlaceholder;
