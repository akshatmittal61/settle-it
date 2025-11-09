import React from "react";

type AssetProps = {
	src: string;
	alt?: string;
};

type AvatarComponentProps = {
	fallback?: string;
	shape?: "circle" | "square";
	className?: string;
	onClick?: () => void;
	isClickable?: boolean;
	size?: "small" | "medium" | "large" | number;
};

export type IAvatarProps = React.HTMLAttributes<HTMLDivElement> &
	AvatarComponentProps &
	AssetProps;

export type IAvatarsProps = Omit<IAvatarProps, "src" | "alt" | "children"> & {
	children: Array<AssetProps>;
	stack?: boolean;
	limit?: number;
};
