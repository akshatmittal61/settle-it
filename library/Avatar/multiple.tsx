import { stylesConfig } from "@/utils";
import React from "react";
import { Avatar } from "./single";
import styles from "./styles.module.scss";
import { IAvatarsProps } from "./types";

const classes = stylesConfig(styles, "avatars");

export const Avatars: React.FC<IAvatarsProps> = ({
	children,
	stack = true,
	className,
	limit = 4,
	...props
}) => {
	return (
		<div
			className={classes("") + ` ${className ?? ""}`}
			title={children.map((c) => c.alt).join(", ")}
		>
			{/* if there are more than limit, show only the first limit and one more cell showing the count */}
			{(children.length > limit
				? children.slice(0, limit)
				: children
			).map((child, index) => (
				<Avatar
					key={`avatars-${index}`}
					src={child.src}
					alt={child.alt}
					{...props}
					style={{
						marginLeft: stack
							? index === 0
								? 0
								: -(props.size || 50) / 3
							: index === 0
								? 0
								: 8,
						...props.style,
					}}
				/>
			))}
			{children.length > limit ? (
				<Avatar
					src={`https://ui-avatars.com/api/?name=%2B${children.length - limit}&background=random`}
					alt={`+${children.length - limit}`}
					size={props.size}
					style={{
						marginLeft: stack ? -(props.size || 50) / 3 : 8,
						...props.style,
					}}
				/>
			) : null}
		</div>
	);
};

export default Avatars;
