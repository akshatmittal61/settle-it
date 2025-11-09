import React from "react";
import styles from "./styles.module.scss";
import { SafetyUtils, StringUtils, stylesConfig } from "@/utils";
import { vectors } from "@/constants";
import { useRouter } from "next/router";
import { Button, Typography } from "@/library";
import Image from "next/image";

const classes = stylesConfig(styles, "placeholder");

type Action = {
	icon?: React.ReactNode;
	label: string;
	onClick: () => void;
};

type PlaceholderProps = {
	id: string;
	image?: string;
	title?: React.ReactNode;
	action?: Action | React.ReactNode;
};

export const Placeholder: React.FC<PlaceholderProps> = (props) => {
	const router = useRouter();
	const defaults: PlaceholderProps = {
		id: "default-placeholder",
		title: "Can't find what you're looking for?",
		image: vectors.emptyRecords,
		action: {
			label: "Contact Us",
			onClick: () => {
				void router.push("/contact");
			},
		},
	};

	if (
		!SafetyUtils.isNonNull(props.title) &&
		StringUtils.isEmpty(props.image) &&
		!SafetyUtils.isNonNull(props.action)
	) {
		props = defaults;
	}

	return (
		<div className={classes("")}>
			{StringUtils.isNotEmpty(props.image) ? (
				<Image
					src={props.image}
					alt={`placholder-${props.id}`}
					width={1920}
					height={1080}
				/>
			) : null}
			{typeof props.title === "string" ? (
				<Typography>{props.title}</Typography>
			) : (
				props.title
			)}
			{SafetyUtils.isNonNull(props.action) ? (
				typeof props.action === "object" &&
				"label" in props.action &&
				"onClick" in props.action ? (
					<Button
						icon={props.action.icon}
						onClick={props.action.onClick}
					>
						{props.action.label}
					</Button>
				) : (
					props.action
				)
			) : null}
		</div>
	);
};
