import { fallbackAssets } from "@/constants";
import { StringUtils, stylesConfig } from "@/utils";
import React, { useState } from "react";
import styles from "./styles.module.scss";
import { IAvatarProps } from "./types";
import { AvatarUtils } from "./utils";
import Image from "next/image";

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
	const imageUrl = AvatarUtils.getImageUrl(src);

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
				<Image
					src={imageUrl}
					alt={StringUtils.getNonEmptyStringOrElse(
						alt,
						`avatar-${src}`
					)}
					width={AvatarUtils.getAvatarSize(size) * 2}
					height={AvatarUtils.getAvatarSize(size) * 2}
					className={classes("avatar-image")}
					onError={() => {
						setIsImageValid(false);
					}}
				/>
			) : (
				<Image
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
