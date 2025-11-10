import React, { useState } from "react";
import { Notify, StringUtils, stylesConfig } from "@/utils";
import { useAuthStore } from "@/store";
import { Button, Input, Textarea, Typography } from "@/library";
import { ContactMessage } from "@/types";
import { useHttpClient } from "@/hooks";
import { GodownApi } from "@/api";
import styles from "@/styles/pages/Contact.module.scss";
import { reachingMethods, socials } from "@/constants";

const classes = stylesConfig(styles, "contact");

type ContactUsPageProps = {};

const ContactUsPage: React.FC<ContactUsPageProps> = () => {
	const { isLoggedIn } = useAuthStore({ syncOnMount: true });
	const [fields, setFields] = useState<ContactMessage>({
		name: "",
		email: "",
		message: "",
	});
	const { trigger: sendMessage, loading: sendingMessage } = useHttpClient({
		trigger: GodownApi.sendContactMessage,
		onSuccess: Notify.success,
		onError: Notify.error,
	});

	const handleChange = (e: any) => {
		if (
			StringUtils.equals(e.target.name, "message") &&
			e.target.value.length > 1000
		) {
			return;
		}
		setFields({ ...fields, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		void sendMessage(fields);
	};

	return (
		<main
			className={classes("", {
				"--boxed": isLoggedIn,
			})}
		>
			<form onSubmit={handleSubmit} className={classes("-form")}>
				<Typography as="h1" size="xxl">
					Send us a Message
				</Typography>
				<Input
					type="text"
					name="name"
					value={fields.name}
					placeholder="Name"
					variant="box"
					required={true}
					onChange={handleChange}
					className={classes("-input")}
				/>
				<Input
					type="email"
					name="email"
					value={fields.email}
					placeholder="Email"
					variant="box"
					required={true}
					onChange={handleChange}
					className={classes("-input")}
				/>
				<Textarea
					type="text"
					name="message"
					value={fields.message}
					placeholder="Message"
					variant="box"
					required={true}
					rows={5}
					error={fields.message.length > 1000}
					errorMessage="Message too long!"
					onChange={handleChange}
					className={classes("-input")}
				/>
				<Typography
					size="sm"
					className={classes("-input__message", {
						"-input__message--invalid":
							fields.message.length >= 1000,
					})}
				>
					{fields.message.length}/1000
				</Typography>
				<Button type="submit" loading={sendingMessage}>
					Send Message
				</Button>
			</form>
			<div className={classes("-info")}>
				<Typography as="h1" size="xxl">
					Let&apos;s get in Touch
				</Typography>
				<ul className={classes("-methods")}>
					{reachingMethods.map((method) => (
						<li key={method.name}>
							<a
								href={method.href}
								target="_blank"
								rel="noreferrer"
								aria-label={method.name}
							>
								{method.icon}
								{method.title}
							</a>
						</li>
					))}
				</ul>
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
			</div>
		</main>
	);
};

export default ContactUsPage;
