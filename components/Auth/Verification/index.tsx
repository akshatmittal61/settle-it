import { Button, Typography } from "@/library";
import { Notify, stylesConfig } from "@/utils";
import React, { useState } from "react";
import styles from "./styles.module.scss";

interface IAuthVerificationProps {
	email: string;
	verifyingOtp: boolean;
	onSubmit: (_: string) => void;
	onGoBack: () => void;
}

const classes = stylesConfig(styles, "auth-verification");

const AuthVerification: React.FC<IAuthVerificationProps> = ({
	email,
	verifyingOtp,
	onSubmit,
	onGoBack,
}) => {
	const [otp, setOtp] = useState(Array(6).fill(""));
	return (
		<>
			<form
				className={classes("-form")}
				onSubmit={(e) => {
					e.preventDefault();
					if (otp.join("").length !== 6)
						return Notify.error("Invalid OTP");
					onSubmit(otp.join(""));
				}}
			>
				<Typography size="s" as="p">
					We sent a 6-digit code to{" "}
					<span style={{ fontWeight: "bold" }}>{email}</span>.
					<br />
					Not the right email?
					<span
						onClick={() => {
							onGoBack();
						}}
						style={{
							color: "var(--accent-color)",
							cursor: "pointer",
						}}
					>
						{" "}
						Change it here.
					</span>
				</Typography>
				<div className={classes("-input-group", "-input-group--otp")}>
					{otp.map((data, index) => (
						<input
							key={index}
							type="text"
							name={`otp${index}`}
							autoFocus={index === 0}
							value={data}
							className={classes("-input--otp")}
							onKeyUp={(e: any) => {
								if (e.key === "Backspace") {
									if (e.target.name === "otp0") {
										e.target.value = "";
										return;
									}
									if (e.target.value === "") {
										document
											.getElementsByName(
												"otp" +
													(+e.target.name[
														e.target.name.length - 1
													] -
														1)
											)[0]
											.focus();
									}
								} else {
									if (e.target.value.length === 1) {
										if (
											e.target.value >= 0 &&
											e.target.value <= 9
										) {
											if (e.target.name === "otp5") {
												e.target.blur();
											} else {
												document
													.getElementsByName(
														"otp" +
															(+e.target.name[
																e.target.name
																	.length - 1
															] +
																1)
													)[0]
													.focus();
											}
										} else {
											e.target.value = "";
										}
									}
								}
							}}
							onChange={(e: any) => {
								if (
									e.target.value.length === 6 &&
									index === 0 &&
									/^\d{6}$/.test(e.target.value)
								) {
									const otpArray = e.target.value.split("");
									setOtp(otpArray);
									document
										.getElementsByName("otp5")[0]
										.focus();
									return;
								} else {
									const otpArray = [...otp];
									if (e.target.value === "")
										otpArray[index] = "";
									else if (
										+e.target.value >= 0 &&
										+e.target.value <= 9
									)
										otpArray[index] = e.target.value;
									setOtp(otpArray);
								}
							}}
							onFocus={(e) => e.target.select()}
						/>
					))}
				</div>
				<Button loading={verifyingOtp} type="submit">
					Verify OTP
				</Button>
			</form>
		</>
	);
};

export default AuthVerification;
