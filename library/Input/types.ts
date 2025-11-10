import React from "react";

export interface InputDropdownOption {
	id: any;
	value: string;
	label: string;
}

export interface InputProps
	extends Omit<React.HTMLProps<HTMLInputElement>, "size"> {
	styles?: {
		box?: React.CSSProperties;
		label?: React.CSSProperties;
		input?: React.CSSProperties;
		dropdown?: React.CSSProperties;
		dropdownOption?: React.CSSProperties;
	};
	label?: string | any;
	dropdown?: {
		enabled: boolean;
		options: InputDropdownOption[];
		onSelect: (_: InputDropdownOption) => void;
		onSearch?: (_: string) => void;
	};
	size?: "small" | "medium" | "large";
	error?: boolean;
	errorMessage?: string;
	leftIcon?: React.ReactNode;
	rightIcon?: React.ReactNode;
	variant?: "line" | "box";
}

export interface TextareaProps
	extends Omit<React.HTMLProps<HTMLTextAreaElement>, "size"> {
	styles?: {
		box?: React.CSSProperties;
		label?: React.CSSProperties;
		input?: React.CSSProperties;
	};
	label?: string | any;
	error?: boolean;
	errorMessage?: string;
	variant?: "line" | "box";
}
