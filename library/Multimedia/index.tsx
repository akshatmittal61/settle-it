import { StringUtils } from "@/utils";
import { Image as WrapperImageComponent } from "./image";
import React from "react";
import { InvalidDataFormatException } from "@/errors";
import { ImageProps } from "./types";

export class Multimedia {
	private url: string;
	private readonly alt: string;
	private readonly fallback: string;

	constructor(init?: string | Multimedia, alt?: string, fallback?: string) {
		if (typeof init === "string") {
			this.url = StringUtils.getNonEmptyStringOrElse(
				init,
				StringUtils.EMPTY
			);
		} else if (init instanceof Multimedia) {
			this.url = init.url;
			this.alt = init.alt;
		} else {
			this.url = StringUtils.EMPTY;
		}
		this.alt = StringUtils.getNonEmptyStringOrElse(alt, StringUtils.EMPTY);
		this.fallback = StringUtils.getNonEmptyStringOrElse(
			fallback,
			StringUtils.EMPTY
		);
	}

	public getUrl() {
		return this.url;
	}

	/**
	 * Takes a Google Drive link and returns a URL that can be used as an image
	 * src. If the link is not a valid Google Drive link, the original link is
	 * returned.
	 * @param {string} link The Google Drive link to convert.
	 * @returns {string} A URL that can be used as an image src.
	 */
	private getAssetUrlFromDriveLink(link: string): string {
		// eslint-disable-next-line no-useless-escape
		const regex = /^https:\/\/drive\.google\.com\/file\/d\/([^\/]+)(\/|$)/;
		const match = link.match(regex);
		if (match && StringUtils.isNotEmpty(match[1])) {
			return `https://lh3.googleusercontent.com/d/${match[1]}=w1000`;
		} else {
			throw new InvalidDataFormatException(link, "Google Drive link");
		}
	}

	private resolve(): Multimedia {
		if (StringUtils.isNotEmpty(this.url)) {
			try {
				this.url = this.getAssetUrlFromDriveLink(this.url);
			} catch (e) {
				if (!(e instanceof InvalidDataFormatException)) {
					throw e;
				}
			}
		} else {
			this.url = this.fallback;
		}
		return this;
	}

	public static resolve(
		url: string,
		{ alt, fallback }: { alt?: string; fallback?: string } = {}
	): Multimedia {
		return new Multimedia(url, alt, fallback).resolve();
	}

	public static Image = ({
		src,
		alt,
		fallback,
		onError,
		...props
	}: ImageProps) => {
		return (
			<WrapperImageComponent
				src={
					typeof src === "string"
						? Multimedia.resolve(src, { alt, fallback }).getUrl()
						: src
				}
				alt={alt}
				onError={(e) => {
					if (StringUtils.isNotEmpty(fallback)) {
						e.currentTarget.src =
							Multimedia.resolve(fallback).getUrl();
					}
					if (onError) {
						onError(e);
					}
				}}
				{...props}
			/>
		);
	};
}
