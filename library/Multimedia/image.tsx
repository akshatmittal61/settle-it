import React from "react";
import { default as NextImage } from "next/image";
import { WrapperImageProps } from "./types";

export const Image: React.FC<WrapperImageProps> = ({ src, alt, ...props }) => {
	return (
		<NextImage src={src} alt={alt} width={1920} height={1080} {...props} />
	);
};
