import { AppSeo, routes } from "@/constants";
import { Button, Multimedia, Typography } from "@/library";
import { stylesConfig } from "@/utils";
import { useRouter } from "next/router";
import React from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import styles from "./styles.module.scss";

interface IHomeHeroProps {}

const classes = stylesConfig(styles, "home-hero");

export const HomeHero: React.FC<IHomeHeroProps> = () => {
	const router = useRouter();
	return (
		<section className={classes("")}>
			<div className={classes("-container")}>
				<div className={classes("-logo")}>
					<Multimedia.Image
						className={classes("-container__logo")}
						src="/favicon-transparent.svg"
						alt="logo"
						width={512}
						height={512}
					/>
				</div>
				<div className={classes("-content")}>
					<Typography
						className={classes("-container__heading")}
						size="head-1"
						weight="bold"
						as="h1"
					>
						{AppSeo.title} ✨
					</Typography>
					<Typography
						className={classes("-container__subheading")}
						size="xl"
						as="p"
					>
						Blend in the fun and let us handle your expenses.
					</Typography>
					<Button
						size="large"
						icon={<AiOutlineArrowRight />}
						iconPosition="right"
						onClick={() => {
							void router.push(routes.LOGIN);
						}}
					>
						Get Started Today
					</Button>
				</div>
			</div>
			<Multimedia.Image
				src="/images/chaotic-parade.png"
				alt="chaotic-parade"
				width={1920}
				height={1080}
				className={classes("-image")}
			/>
		</section>
	);
};
