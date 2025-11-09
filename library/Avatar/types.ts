import React from "react";

export interface IAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
	src: string;
	alt?: string;
	fallback?: string;
	shape?: "circle" | "square";
	className?: string;
	onClick?: () => void;
	isClickable?: boolean;
	size?: "small" | "medium" | "large" | number;
}

export interface IAvatarsProps
	extends Omit<IAvatarProps, "src" | "alt" | "children"> {
	children: Array<{ src: string; alt: string }>;
	stack?: boolean;
	limit?: number;
}
