import React from "react";
import { default as NextImage } from "next/image";

export type WrapperImageProps = React.ComponentProps<typeof NextImage>;
export type ImageProps = WrapperImageProps & {
	fallback?: string;
};
