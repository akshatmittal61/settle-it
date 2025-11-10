import { stylesConfig } from "@/utils";
import React, { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import styles from "./styles.module.scss";
import { InputDropdownOption, InputProps, TextareaProps } from "./types";

const classes = stylesConfig(styles, "input");

export const Input: React.FC<InputProps> = ({
	label,
	styles,
	style,
	className,
	dropdown,
	leftIcon,
	rightIcon,
	error,
	errorMessage,
	size,
	variant = "line",
	...props
}) => {
	const inputRef = useRef<any>(null);
	const [optionsToRender, setOptionsToRender] = useState<
		InputDropdownOption[]
	>(dropdown?.options || []);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (
				dropdown?.enabled &&
				optionsToRender?.length > 0 &&
				inputRef.current === document.activeElement
			) {
				if (e.key === "ArrowDown") {
					e.preventDefault();
					const nextIndex =
						optionsToRender?.findIndex(
							(option) => option.value === inputRef.current?.value
						) + 1;
					if (nextIndex < optionsToRender?.length) {
						inputRef.current.value =
							optionsToRender[nextIndex].value;
					}
				} else if (e.key === "ArrowUp") {
					e.preventDefault();
					const nextIndex =
						optionsToRender?.findIndex(
							(option) => option.value === inputRef.current?.value
						) - 1;
					if (nextIndex >= 0) {
						inputRef.current.value =
							optionsToRender[nextIndex].value;
					}
				} else if (e.key === "Enter") {
					e.preventDefault();
					const selectedOption = optionsToRender?.find(
						(option) => option.value === inputRef.current?.value
					);
					if (selectedOption) {
						dropdown.onSelect(selectedOption);
						inputRef.current.blur();
						setOptionsToRender(dropdown?.options || []);
					}
				} else if (e.key === "Escape") {
					e.preventDefault();
					inputRef.current.blur();
					setOptionsToRender(dropdown?.options || []);
				} else if (e.key === "Tab") {
					inputRef.current.blur();
					setOptionsToRender(dropdown?.options || []);
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [dropdown, optionsToRender]);

	return (
		<div
			className={classes("", `--${variant}`) + ` ${className}`}
			style={styles?.box}
		>
			{label ? (
				<label className={classes("__label")} style={styles?.label}>
					{label}
				</label>
			) : null}
			<div className={classes("__input-container")}>
				{leftIcon && !dropdown?.enabled ? (
					<div className={classes("__icon", "__icon--left")}>
						{leftIcon}
					</div>
				) : null}
				<input
					className={classes("__input", `__input-size--${size}`)}
					ref={inputRef}
					style={{
						...styles?.input,
						...style,
					}}
					onInvalid={(e) => {
						e.currentTarget.setCustomValidity(errorMessage + "");
					}}
					onInput={(e) => {
						e.currentTarget.setCustomValidity("");
					}}
					title={error ? errorMessage : ""}
					onChange={(() => {
						if (dropdown?.enabled) {
							return (e) => {
								const search = e.target.value;
								const options = dropdown.options.filter(
									(option) =>
										option.label
											.toLowerCase()
											.includes(search.toLowerCase())
								);
								setOptionsToRender(options);
								if (dropdown.onSearch)
									dropdown.onSearch(search);
								else if (props.onChange) props.onChange(e);
							};
						} else {
							return props.onChange;
						}
					})()}
					{...props}
				/>
				{rightIcon && !dropdown?.enabled ? (
					<div className={classes("__icon", "__icon--right")}>
						{rightIcon}
					</div>
				) : null}
				{dropdown?.enabled ? (
					<div
						className={classes(
							"__icon",
							"__icon--right",
							"__icon--dropdown"
						)}
						onClick={() => {
							inputRef.current.focus();
						}}
					>
						<FiChevronDown />
					</div>
				) : null}
				{dropdown?.enabled ? (
					<div
						className={classes("__dropdown")}
						style={styles?.dropdown}
					>
						{optionsToRender?.map((option, index) => (
							<div
								key={index}
								className={classes("__dropdown__option")}
								onClick={() => {
									dropdown?.onSelect(option);
									inputRef.current.blur();
								}}
								style={styles?.dropdownOption}
							>
								{option.label}
							</div>
						))}
					</div>
				) : null}
			</div>
		</div>
	);
};

export const Textarea: React.FC<TextareaProps> = ({
	label,
	styles,
	className,
	style,
	errorMessage,
	variant = "line",
	...rest
}) => {
	return (
		<div
			className={classes("", `--${variant}`) + ` ${className}`}
			style={styles?.box}
		>
			{label ? (
				<label className={classes("__label")} style={styles?.label}>
					{label}
				</label>
			) : null}
			<textarea
				{...rest}
				className={classes("__input")}
				style={{
					...styles?.input,
					...style,
				}}
				onInvalid={(e) => {
					e.currentTarget.setCustomValidity(errorMessage + "");
				}}
				onInput={(e) => {
					e.currentTarget.setCustomValidity("");
				}}
			/>
		</div>
	);
};
