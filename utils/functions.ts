/**
 * Opens a link in a new tab.
 * @param {string} link - The link to open.
 * @returns {void} None.
 */
export const openLink = (link: string): void => {
	window.open(link, "_blank");
};

/**
 * Copies the given text to the clipboard.
 * @param {string} text - The text to copy.
 * @returns {void} None.
 */
export const copyToClipboard = (text: string): void => {
	void navigator.clipboard.writeText(text);
};

/**
 * Generates a random number between the given min and max values, inclusive.
 * @param {number} min - The minimum value to return.
 * @param {number} max - The maximum value to return.
 * @returns {number} A random number between min and max, inclusive.
 */
export const random = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min;

/**
 * Implements a sleep function that holds the current thread for a given number of seconds.
 * Creates a promise that resolves after the given number of seconds.
 * @param {number} seconds - The number of seconds to wait.
 * @returns {Promise<void>} A promise that resolves after the given number of seconds.
 */
export const sleep = (seconds: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, seconds * 1000));

// function for finding max and min of two numbers
export const max = (a: number, b: number) => (a > b ? a : b);
export const min = (a: number, b: number) => (a < b ? a : b);

/**
 * Creates a debounced version of a function.
 * Debouncing is a technique that prevents a function from being called
 * more than once within a certain time window. If the function is called
 * multiple times within the time window, the function passed to debounce
 * will only be called once after the time window has passed.
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - The time window in milliseconds.
 * @returns {Function} A debounced version of the function.
 */
export const debounce = (fn: Function, delay: number): Function => {
	let timeoutId: ReturnType<typeof setTimeout>;
	return (...args: any) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			fn(...args);
		}, delay);
	};
};

// function to get a random ID
export const randomId = () => Math.floor(Math.random() * 1000000000);

/**
 * Creates a slug from the given text.
 * A slug is a string that is used to identify a resource. It is usually
 * a URL-friendly version of the title of the resource. For example, a
 * blog post with the title "Hello World" would have a slug of "hello-world".
 * @param {string} text - The text to create a slug from.
 * @returns {string} The slugified text.
 */
export const slugify = (text: string): string =>
	text
		.toString()
		.toLowerCase()
		.replace(/\s+/g, "-") // Replace spaces with -
		.replace(/[^\w-]+/g, "") // Remove all non-word chars
		.replace(/--+/g, "-") // Replace multiple - with single -
		.replace(/^-+/, "") // Trim - from start of text
		.replace(/-+$/, ""); // Trim - from end of text

// function to declare class names while using modular styling files
interface Styles {
	[key: string]: string;
}

/**
 * A utility function to help declare class names while using modular styling files.
 * @param {Styles} styles - An object where the key is the class name and the value is the class itself.
 * @param {string} [prefix] - An optional string to prefix all class names with.
 * @returns {function(...(string | {[key: string]: boolean})): string} - A function that takes in multiple arguments,
 * and returns a string of class names. The arguments can be either a string (which will be looked up in the styles object)
 * or an object with boolean values (where the keys of the object will be looked up in the styles object and the value
 * of the boolean will determine whether the class is included or not).
 */
export const stylesConfig =
	(
		styles: Styles,
		prefix: string = ""
	): ((..._classNames: (string | { [key: string]: boolean })[]) => string) =>
	(...args: (string | { [key: string]: boolean })[]) => {
		const classes: string[] = [];
		args.forEach((arg) => {
			if (typeof arg === "string") {
				classes.push(styles[`${prefix}${arg}`]);
			} else if (typeof arg === "object") {
				Object.keys(arg).forEach((key) => {
					if (arg[key]) classes.push(styles[`${prefix}${key}`]);
				});
			}
		});
		return classes.join(" ").trim();
	};

/**
 * Omits the given keys from the object.
 * @param {Object} obj The object to omit keys from.
 * @param {string[]} keys The keys to omit.
 * @returns {Object} The new object with the omitted keys.
 */
export const omitKeys = (obj: any, keys: string[]): any => {
	const newObj: any = {};
	Object.keys(obj).forEach((key) => {
		if (!keys.includes(key)) {
			newObj[key] = obj[key];
		}
	});
	return newObj;
};

/**
 * Rounds off a number to a specified number of decimal places.
 * @param {number} num The number to round off.
 * @param {number} decimalPlaces The number of decimal places to round to.
 * @returns {number} The rounded off number.
 */
export const roundOff = (num: number, decimalPlaces: number): number =>
	Math.round(num * 10 ** decimalPlaces) / 10 ** decimalPlaces;

/**
 * Returns a new array containing all elements that are present in both the given arrays.
 * @param {Array<T>} a - The first array to find the intersection of.
 * @param {Array<T>} b - The second array to find the intersection of.
 * @returns {Array<T>} A new array containing all elements that are present in both the given arrays.
 */
export const intersection = <T>(a: Array<T>, b: Array<T>): Array<T> => {
	const s = new Set(b);
	return a.filter((x) => s.has(x));
};

/**
 * Converts an enumeration value to a readable string format.
 * For example, USER_STATUS_JUST_JOINED would be converted to "User Status Just Joined".
 * @param {string} text The enumeration value to convert.
 * @returns {string} The converted string.
 */
export const enumToText = (text: string): string => {
	return text
		.split("_")
		.map((word) => word[0] + word.slice(1).toLowerCase())
		.join(" ");
};

/**
 * Checks whether a given date string is in UTC or Locale format.
 * @param {string} date The date string to check.
 * @returns {"utc" | "locale"} The format of the given date string.
 */
export const checkDateFormat = (date: string): "utc" | "locale" => {
	if (date.includes("T") && date.includes("Z")) {
		return "utc";
	} else {
		return "locale";
	}
};

/**
 * Switches the given date string from one format to another.
 * @param {string} date The date string to switch.
 * @param {"utc" | "locale"} from The format of the given date string.
 * @param {"utc" | "locale"} to The format to switch the date string to.
 * @returns {string} The switched date string.
 */
export const switchDateFormat = (
	date: string,
	from: "utc" | "locale",
	to: "utc" | "locale"
): string => {
	if (from === "utc" && to === "locale") {
		const utcSeconds = new Date(date).getTime() / 1000;
		return new Date(
			utcSeconds * 1000 - new Date().getTimezoneOffset() * 60000
		)
			.toISOString()
			.slice(0, -1);
	} else if (from === "locale" && to === "utc") {
		return new Date(date).toISOString();
	} else {
		return date;
	}
};

/**
 * Sanitizes a given timestamp from a Date object or a string.
 * If the given timestamp is in UTC format, it will be converted to locale format.
 * If the given timestamp is in locale format, it will be left as is.
 * @param {string} timestamp The timestamp to sanitize.
 * @returns {string} The sanitized timestamp.
 */
export const sanitizeTimestampToDate = (timestamp: string): string => {
	return checkDateFormat(timestamp) === "utc"
		? switchDateFormat(timestamp, "utc", "locale").split("T")[0]
		: timestamp.split("T")[0];
};

/**
 * Generates a random color in hexadecimal format.
 * @returns {string} A random color in hexadecimal format.
 */
export const generateRandomColor = (): string => {
	return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

/**
 * Creates an object where every key is a value from the given array and has itself as the value.
 * This is useful for creating enumerations.
 * @example
 * const enumFromString = getEnumeration(["a", "b", "c"]);
 * // enumFromString = { a: "a", b: "b", c: "c" }
 * @returns {Object} An object with the given values as keys and values.
 */
export const getEnumeration = <T extends string>(
	arr: Array<T>
): { [K in T]: K } => {
	return arr.reduce((acc, key) => {
		acc[key] = key;
		return acc;
	}, {} as any);
};

/**
 * Takes a Google Drive link and returns a URL that can be used as an image
 * src. If the link is not a valid Google Drive link, the original link is
 * returned.
 * @param {string} link The Google Drive link to convert.
 * @returns {string} A URL that can be used as an image src.
 */
export const getImageUrlFromDriveLink = (link: string): string => {
	// eslint-disable-next-line no-useless-escape
	const regex = /^https:\/\/drive\.google\.com\/file\/d\/([^\/]+)(\/|$)/;
	const match = link.match(regex);
	if (match && match[1]) {
		return `https://lh3.googleusercontent.com/d/${match[1]}=w1000`;
	} else {
		return link;
	}
};

export const runningCase = (text: string): string => {
	return text
		.split("_")
		.map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
		.join(" ");
};

export const simplifyFraction = (fraction: string) => {
	let splitted = fraction.split("/");
	if (splitted.length !== 2 || isNaN(+splitted[0]) || isNaN(+splitted[1])) {
		return fraction;
	}
	const numerator = +splitted[0];
	const denominator = +splitted[1];
	const divisors = [];
	for (let i = 2; i <= Math.min(numerator, denominator); i++) {
		if (denominator % i === 0) {
			divisors.push(i);
		}
	}
	for (let i = divisors.length - 1; i >= 0; i--) {
		if (numerator % divisors[i] === 0) {
			return `${numerator / divisors[i]}/${denominator / divisors[i]}`;
		}
	}
	return fraction;
};

/**
 * Converts a hexadecimal color code to RGB.
 * @param {string} hex The hexadecimal color code.
 * @returns {string} A string in the format "red, green, blue" if the conversion was successful, otherwise null.
 */
export const hexToRgb = (hex: string): string => {
	const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
		: hex;
};

/**
 * Checks if the given subset is a subset of the given superset.
 * @example
 * isSubset([1, 2], [1, 2, 3]) // true
 * isSubset([1, 2, 4], [1, 2, 3]) // false
 * @param {Array<T>} subset The subset to check.
 * @param {Array<T>} superset The superset to check against.
 * @returns {boolean} If the subset is a subset of the superset.
 */
export const isSubset = <T = any>(
	subset: Array<T>,
	superset: Array<T>
): boolean => {
	return subset.every((value) => superset.includes(value));
};

/**
 * Tries to extract a search parameter from a given URI. The search parameter
 * is looked up in the following order:
 * 1. The URI is parsed as a URL and the search parameter is looked up in the
 *    URL's searchParams.
 * 2. If the URI is not a valid URL, the search parameter is looked up in the
 *    query string part of the URI.
 * @param {string | undefined} uri The URI to look up the search parameter in.
 * @param {string} param The name of the search parameter to look up.
 * @returns {string | null} The value of the search parameter if it exists, or
 * null if it does not exist.
 */
export const getSearchParam = (
	uri: string | undefined,
	param: string
): string | null => {
	try {
		if (uri === undefined || uri.length === 0) return null;
		const url = (() => {
			try {
				return new URL(uri);
			} catch {
				return null;
			}
		})();
		if (url !== null) {
			const searchParams = url.searchParams;
			const value = searchParams.get(param);
			if (value !== null && value.length !== 0) {
				return value;
			}
		}

		const paramsStr = uri.split("?").length > 1 ? uri.split("?")[1] : "";
		const params = new URLSearchParams(paramsStr);
		return params.get(param);
	} catch {
		return null;
	}
};
