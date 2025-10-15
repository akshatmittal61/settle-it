import { ParserSafetyError } from "@/errors";

export class BooleanUtils {
	public static True = {
		value: true,
		toString: () => "true",
		toNumber: () => 1,
		toBoolean: () => true,
		equals: (input: any) =>
			input === true || input === "true" || input === 1,
	};

	public static False = {
		value: false,
		toString: () => "false",
		toNumber: () => 0,
		toBoolean: () => false,
		equals: (input: any) =>
			input === false || input === "false" || input === 0,
	};

	public static valueOf(input: any): boolean {
		if (
			(typeof input === "string" &&
				input !== BooleanUtils.True.toString() &&
				input !== BooleanUtils.False.toString()) ||
			(typeof input === "number" &&
				input !== BooleanUtils.True.toNumber() &&
				input !== BooleanUtils.False.toNumber())
		) {
			throw new ParserSafetyError(
				`${input} of type ${typeof input} is not a valid boolean!`,
				"Boolean.getBoolean",
				input
			);
		}

		if (typeof input === "string") {
			return BooleanUtils.True.equals(input);
		} else if (typeof input === "number") {
			return BooleanUtils.True.equals(input);
		} else {
			return input;
		}
	}

	public static invert(input: any): boolean {
		return !BooleanUtils.valueOf(input);
	}
}
