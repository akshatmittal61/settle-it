import { Input } from "@/library";
import { Logger } from "@/log";
import { stylesConfig } from "@/utils";
import { isValidFraction, safeValidation } from "@/validations";
import React, { useEffect, useState } from "react";
import { ExpenseUser } from "./assets";
import styles from "./styles.module.scss";

interface IFractionDistributionProps {
	member: ExpenseUser;
	isSelected: boolean;
	onChange: (_: string | number) => void;
}

const classes = stylesConfig(styles, "distribution-member");

export const FractionDistribution: React.FC<IFractionDistributionProps> = ({
	member,
	isSelected,
	onChange,
}) => {
	const [isValid, setIsValid] = useState<boolean>(false);
	const [value, setValue] = useState(member.value.toString().split("/"));
	const handleChange = (
		updatedValue: string,
		part: "numerator" | "denominator"
	) => {
		let newValue: any[];
		if (part === "numerator") {
			newValue = [updatedValue, value[1]];
		} else {
			newValue = [value[0], updatedValue];
		}
		const newFraction = newValue.join("/");
		const newValidation = safeValidation(isValidFraction, newFraction);
		Logger.debug("newValue", newValue);
		Logger.debug("newFraction", newFraction);
		Logger.debug("newValidation", newValidation);
		setIsValid(newValidation);
		setValue(newValue);
		onChange(newFraction);
	};
	useEffect(() => {
		setValue(member.value.toString().split("/"));
	}, [member.value]);

	return (
		<div className={classes("-fraction")}>
			<Input
				name="fraction"
				type="text"
				size="small"
				disabled={!isSelected}
				className={classes("-amount", "-amount--fraction")}
				value={value[0]}
				error={!isValid}
				onChange={(e: any) => {
					handleChange(e.target.value, "numerator");
				}}
			/>
			{" / "}
			<Input
				name="fraction"
				type="text"
				size="small"
				disabled={!isSelected}
				className={classes("-amount", "-amount--fraction")}
				value={value[1]}
				error={!isValid}
				onChange={(e: any) => {
					handleChange(e.target.value, "denominator");
				}}
			/>
		</div>
	);
};
