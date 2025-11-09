import { fallbackAssets } from "@/constants";
import { StringUtils, stylesConfig } from "@/utils";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import { IAvatarProps } from "./types";
import { AvatarUtils } from "./utils";
import { Multimedia } from "@/library";

const classes = stylesConfig(styles);

export const Avatar: React.FC<IAvatarProps> = ({
	src,
	alt,
	fallback = fallbackAssets.avatar,
	shape = "circle",
	className,
	onClick,
	size = "medium",
	isClickable,
	...props
}) => {
	const [isImageValid, setIsImageValid] = useState(
		AvatarUtils.isValidImageUrl(src)
	);

	return (
		<div
			className={
				classes("avatar", `avatar-shape--${shape}`, {
					"avatar--clickable":
						typeof onClick === "function" || isClickable === true,
				}) + ` ${className ?? ""}`
			}
			onClick={onClick}
			title={alt}
			{...props}
			style={{
				width: AvatarUtils.getAvatarSize(size),
				height: AvatarUtils.getAvatarSize(size),
				cursor:
					onClick && typeof onClick === "function"
						? "pointer"
						: "auto",
				...props.style,
			}}
		>
			{isImageValid ? (
				<Multimedia.Image
					src={src}
					alt={StringUtils.getNonEmptyStringOrElse(
						alt,
						`avatar-${src}`
					)}
					width={AvatarUtils.getAvatarSize(size) * 2}
					height={AvatarUtils.getAvatarSize(size) * 2}
					className={classes("avatar-image")}
					fallback={fallbackAssets.avatar}
					onError={() => {
						setIsImageValid(false);
					}}
				/>
			) : (
				<Multimedia.Image
					src={AvatarUtils.getFallbackAvatarUrl(alt, fallback)}
					alt={StringUtils.getNonEmptyStringOrElse(
						alt,
						`avatar-${src}`
					)}
					width={AvatarUtils.getAvatarSize(size) * 2}
					height={AvatarUtils.getAvatarSize(size) * 2}
					className={classes("avatar-image")}
				/>
			)}
		</div>
	);
};
