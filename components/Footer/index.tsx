import { AppSeo, routes, socials } from "@/constants";
import { Multimedia } from "@/library";
import { stylesConfig } from "@/utils";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import styles from "./styles.module.scss";

const classes = stylesConfig(styles, "footer");

export const Footer: React.FC = () => {
	const router = useRouter();
	return (
		<footer className={classes("")}>
			<div className={classes("-top")}>
				<div className={classes("-logo")}>
					<Multimedia.Image
						src="/logo-full.png"
						alt={AppSeo.title || ""}
						onClick={() => {
							void router.push("/");
						}}
						width={1920}
						height={1080}
					/>
				</div>
				<nav className={classes("-navigation")}>
					<Link href={routes.PRIVACY_POLICY}>Privacy Policy</Link>
				</nav>
			</div>
			<hr className={classes("-divider")} />
			<div className={classes("-base")}>
				<ul className={classes("-socials")}>
					{socials.map((social) => (
						<li key={social.name}>
							<a
								href={social.href}
								target="_blank"
								rel="noreferrer"
								aria-label={social.name}
							>
								{social.icon}
							</a>
						</li>
					))}
				</ul>
				<div className={classes("-copyright")}>
					<p>
						© {new Date().getFullYear()} {AppSeo.title}. All rights
						reserved.
					</p>
				</div>
			</div>
		</footer>
	);
};
