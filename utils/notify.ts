import toast from "react-hot-toast";

export class Notify {
	// if someone call Notify.success(), make a success toast
	public static success(message: string) {
		toast.success(message);
	}

	// if someone call Notify.error(), make an error toast
	public static error(error: any, fallback: string = "An error occurred") {
		if (typeof error === "string") {
			toast.error(error);
		} else if (
			error.response &&
			error.response.data &&
			error.response.data.message &&
			typeof error.response.data.message === "string"
		) {
			toast.error(error.response.data.message);
		} else if (error.message && typeof error.message === "string") {
			toast.error(error.message);
		} else {
			toast.error(fallback);
		}
	}

	// if someone call Notify.info(), make an info toast
	public static info(message: string) {
		toast(message);
	}

	// if someone call Notify.warn(), make an warn toast
	public static warn(message: string) {
		toast(message, {
			icon: "⚠️",
		});
	}

	// promise
	public static promise = toast.promise;
}
