import { UserApi } from "@/api";
import { fallbackAssets, regex } from "@/constants";
import { useDebounce, useHttpClient } from "@/hooks";
import {
	Avatar,
	Button,
	CheckBox,
	IconButton,
	Input,
	Loader,
	MaterialIcon,
	Textarea,
	Typography,
} from "@/library";
import { useAuthStore } from "@/store";
import { IUser } from "@/types";
import { Notify, StringUtils, stylesConfig } from "@/utils";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";

interface MembersPlaceholderProps {
	loading: boolean;
	searchStr: string;
	onInvited: (_: IUser) => void;
}

interface MembersBulkEditorProps {
	selectedMembers: Array<IUser>;
	setSelectedMembers: (_: Array<IUser>) => void;
}

interface MembersWindowProps {
	selectedMembers: Array<IUser>;
	setSelectedMembers: (_: Array<IUser>) => void;
}

interface MembersUserProps extends IUser {
	index: number;
	isSelected?: boolean;
	onSelect?: () => void;
	onRemove?: () => void;
}

const classes = stylesConfig(styles, "group-members");

const MembersPlaceholder: React.FC<MembersPlaceholderProps> = ({
	loading,
	searchStr,
	onInvited,
}) => {
	const [inviting, setInviting] = useState(false);
	const inviteMember = async () => {
		try {
			setInviting(true);
			const res = await UserApi.inviteUser(searchStr);
			onInvited(res.data);
		} catch (error) {
			Notify.error(error);
		} finally {
			setInviting(false);
		}
	};
	if (loading) {
		return <p className={classes("-loading")}>Searching...</p>;
	}
	if (searchStr.length < 3) {
		return (
			<div className={classes("-placeholder")}>
				<Image
					src="/vectors/empty-records.svg"
					alt="empty-records"
					width={1920}
					height={1080}
				/>
				<Typography>
					Please type at least 3 characters of user email
				</Typography>
			</div>
		);
	}
	if (searchStr.length >= 3) {
		if (!regex.email.test(searchStr)) {
			return (
				<div className={classes("-placeholder")}>
					<Image
						src="/vectors/empty-records.svg"
						alt="empty-records"
						width={1920}
						height={1080}
					/>
					<Typography>Couldn&apos;t find any user</Typography>
					<Typography size="sm">
						Tip: Enter the email of the user to invite them
					</Typography>
				</div>
			);
		}
		return (
			<div className={classes("-placeholder")}>
				<Typography>
					Seems like{" "}
					<span style={{ color: "var(--accent-color-heavy)" }}>
						{searchStr}
					</span>{" "}
					has not joined us yet.
				</Typography>
				<Typography>Want to invite them?</Typography>
				<Button
					className={classes("-button")}
					type="button"
					onClick={inviteMember}
					loading={inviting}
				>
					Invite
				</Button>
			</div>
		);
	}
};

const MembersBulkEditor: React.FC<MembersBulkEditorProps> = ({
	selectedMembers,
	setSelectedMembers,
}) => {
	const [editorEmails, debouncedEditorEmails, setEditorEmails] =
		useDebounce<string>(
			selectedMembers.map((user) => user.email).join(", "),
			1000
		);
	const { trigger: bulkEditorCall } = useHttpClient({
		trigger: UserApi.searchInBulk,
	});

	const handleSearchInBulkEditor = async (value: string) => {
		const response = await bulkEditorCall(value);
		if (response.message) {
			Notify.success(response.message);
		}
		setSelectedMembers(response.users);
	};

	useEffect(() => {
		if (StringUtils.isNotEmpty(debouncedEditorEmails)) {
			void handleSearchInBulkEditor(debouncedEditorEmails);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedEditorEmails]);

	return (
		<div className={classes("-bulk-editor")}>
			<Textarea
				type="text"
				value={editorEmails}
				onChange={(e: any) => setEditorEmails(e.target.value)}
			/>
		</div>
	);
};

const MembersUser: React.FC<MembersUserProps> = ({
	name,
	email,
	avatar,
	onSelect,
	isSelected,
	onRemove,
	index,
}) => {
	return (
		<div className={classes("-user")}>
			{onSelect ? (
				<CheckBox onClick={onSelect} checked={isSelected} />
			) : (
				<Typography size="s" weight="medium">
					{index + 1}.
				</Typography>
			)}
			<Avatar
				src={avatar || fallbackAssets.avatar}
				alt={name || "User"}
				size={36}
			/>
			<div className={classes("-user__details")}>
				<Typography size="s" weight="medium">
					{name || email.slice(0, 7) + "..."}
				</Typography>
				<Typography size="s">{email}</Typography>
			</div>
			{onRemove ? (
				<IconButton
					onClick={onRemove}
					icon={<MaterialIcon icon="close" />}
				/>
			) : null}
		</div>
	);
};

const MembersWindow: React.FC<MembersWindowProps> = ({
	selectedMembers,
	setSelectedMembers,
}) => {
	const { getUser } = useAuthStore();
	const loggedInUser = getUser()!;
	const [searchResults, setSearchResults] = useState<Array<IUser>>([]);
	const [openBulkEditor, setOpenBulkEditor] = useState(false);
	const { loading: searching, trigger: searchApiCall } = useHttpClient({
		trigger: UserApi.searchForUsers,
	});
	const [searchStr, debouncedSearchStr, setSearchStr] = useDebounce<string>(
		"",
		1000
	);

	const handleSearch = async (searchStr: any) => {
		const res = await searchApiCall(searchStr);
		setSearchResults(res);
	};

	const handleSelectUser = (user: IUser) => {
		const isUserSelected = selectedMembers
			.map((user) => user.id)
			.includes(user.id);
		if (isUserSelected) {
			const filteredUser = selectedMembers.filter(
				(u) => u.id !== user.id
			);
			setSelectedMembers(filteredUser);
		} else {
			setSelectedMembers([...selectedMembers, user]);
		}
	};

	useEffect(() => {
		if (debouncedSearchStr && debouncedSearchStr.length >= 3) {
			void handleSearch(debouncedSearchStr);
		} else {
			setSearchResults([]);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchStr]);
	return (
		<>
			<div className={classes("-header")}>
				<Typography size="xxl" weight="medium">
					Members
				</Typography>
				<div className={classes("-header-controls")}>
					{!openBulkEditor ? (
						<Input
							name="email"
							placeholder="Search by email"
							size="small"
							value={searchStr}
							onChange={(e: any) => setSearchStr(e.target.value)}
						/>
					) : null}
					<IconButton
						icon={
							<MaterialIcon
								icon={openBulkEditor ? "list" : "email"}
							/>
						}
						title="Bulk Editor"
						type="button"
						onClick={(e: any) => {
							e.preventDefault();
							setOpenBulkEditor((p) => !p);
						}}
					/>
				</div>
			</div>
			{openBulkEditor ? (
				<MembersBulkEditor
					selectedMembers={selectedMembers}
					setSelectedMembers={setSelectedMembers}
				/>
			) : null}
			{debouncedSearchStr.length > 0 ? (
				searching ? (
					<Loader.Spinner />
				) : searchResults.length > 0 ? (
					searchResults.map((user, index) => (
						<MembersUser
							{...user}
							key={`group-manager-searched-user-${user.id}`}
							index={index}
							onSelect={
								user.id === loggedInUser.id
									? undefined
									: () => handleSelectUser(user)
							}
							isSelected={selectedMembers
								.map((user) => user.id)
								.includes(user.id)}
						/>
					))
				) : (
					<MembersPlaceholder
						// no user was found, invitation is expected
						loading={false}
						searchStr={searchStr}
						onInvited={(invitedUser) => {
							setSearchResults([invitedUser]);
							handleSelectUser(invitedUser);
						}}
					/>
				)
			) : (
				selectedMembers.map((user, index) => (
					<MembersUser
						{...user}
						key={`group-manager-user-${user.id}`}
						index={index}
						onRemove={
							user.id === loggedInUser.id
								? undefined
								: () => handleSelectUser(user)
						}
					/>
				))
			)}
		</>
	);
};

export default MembersWindow;
