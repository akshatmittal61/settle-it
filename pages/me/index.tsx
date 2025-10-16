import { withAuthPage } from "@/client";
import { AppSeo, routes } from "@/constants";
import { Responsive, Seo } from "@/layouts";
import { Avatar, Button, Input, Typography } from "@/library";
import { useAuthStore } from "@/store";
import styles from "@/styles/pages/Profile.module.scss";
import { IUser } from "@/types";
import { Notify, stylesConfig, UserUtils } from "@/utils";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FiArrowLeft, FiLogOut } from "react-icons/fi";

const classes = stylesConfig(styles, "profile-page");

interface IProfilePageProps {
	user: IUser;
}

const ProfilePage: React.FC<IProfilePageProps> = (props) => {
	const router = useRouter();
	const { getUser, updateProfile, isUpdatingProfile, logout } =
		useAuthStore();
	const [fields, setFields] = useState({
		name: getUser()?.name || props.user.name || "",
		phone: getUser()?.phone || props.user.phone || "",
		avatar: getUser()?.avatar || props.user.avatar || "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFields({
			...fields,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		await updateProfile(fields);
		Notify.success("Updated successfully");
	};

	const logoutUser = async () => {
		await logout();
		void router.push(routes.LOGIN);
	};

	return (
		<>
			<Seo title={`${getUser()!.name} - Profile | ${AppSeo.title}`} />
			<main className={classes("")}>
				<div className={classes("-banner")}>
					<button
						onClick={() => router.back()}
						className={classes("-banner-btn")}
					>
						<FiArrowLeft />
					</button>
					<button
						onClick={logoutUser}
						className={classes("-banner-btn", "-banner-btn--flat")}
					>
						<FiLogOut />
						<Typography size="s">Logout</Typography>
					</button>
				</div>
				<div className={classes("-meta")}>
					<Avatar
						src={UserUtils.getUserDetails(getUser()!).avatar!}
						alt={UserUtils.getUserDetails(getUser()!).name!}
						size={160}
					/>
				</div>
				<form className={classes("-form")} onSubmit={handleSubmit}>
					<Responsive.Row>
						<Responsive.Col
							xlg={50}
							lg={50}
							md={50}
							sm={100}
							xsm={100}
							className={classes("-form-col")}
						>
							<Input
								label="Name"
								name="name"
								type="text"
								required
								placeholder="Name"
								value={fields.name}
								onChange={handleChange}
							/>
						</Responsive.Col>
						<Responsive.Col
							xlg={50}
							lg={50}
							md={50}
							sm={100}
							xsm={100}
							className={classes("-form-col")}
						>
							<Input
								label="Phone"
								name="phone"
								type="tel"
								required
								placeholder="Phone"
								value={fields.phone}
								onChange={handleChange}
							/>
						</Responsive.Col>
						<Responsive.Col
							xlg={100}
							lg={100}
							md={100}
							sm={100}
							xsm={100}
							className={classes("-form-col")}
						>
							<Input
								label="Avatar"
								name="avatar"
								type="url"
								required
								placeholder="Avatar"
								value={fields.avatar}
								onChange={handleChange}
							/>
						</Responsive.Col>
						<Responsive.Col
							xlg={100}
							lg={100}
							md={100}
							sm={100}
							xsm={100}
							className={classes("-form-col", "-form-col--btn")}
						>
							<Button
								type="submit"
								loading={isUpdatingProfile}
								className={classes("-form-btn")}
								size="large"
							>
								Save
							</Button>
						</Responsive.Col>
					</Responsive.Row>
				</form>
			</main>
		</>
	);
};

export default ProfilePage;

export const getServerSideProps = withAuthPage((user) => ({
	props: { user },
}));
