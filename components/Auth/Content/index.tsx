import { regex } from "@/constants";
import { Button, Input } from "@/library";
import { Notify, stylesConfig } from "@/utils";
import React from "react";
import { IoMailOutline } from "react-icons/io5";
import styles from "./styles.module.scss";

interface IAuthContentProps {
	email: string;
	setEmail: (_: string) => void;
	onContinueWithEmail: () => void;
	requestingOtp: boolean;
}

const classes = stylesConfig(styles, "auth-content");

const AuthContent: React.FC<IAuthContentProps> = ({
	email,
	setEmail,
	onContinueWithEmail,
	requestingOtp,
}) => {
	return (
		<form
			className={classes("-form")}
			onSubmit={(e) => {
				e.preventDefault();
				if (!regex.email.test(email))
					return Notify.error("Invalid email");
				onContinueWithEmail();
			}}
		>
			<Input
				placeholder="name@example.com"
				value={email}
				onChange={(e: any) => setEmail(e.target.value)}
				name="email"
				type="email"
				required
				autoFocus
			/>
			<Button
				icon={<IoMailOutline />}
				iconPosition="left"
				size="large"
				type="submit"
				loading={requestingOtp}
			>
				Continue with Email
			</Button>
		</form>
	);
};

export default AuthContent;
