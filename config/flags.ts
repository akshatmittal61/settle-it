export const enableDebugging: boolean =
	process.env.NEXT_PUBLIC_ENABLE_DEBUGGING === "true" || false;

export const enableEmailSender: boolean =
	process.env.ENABLE_EMAIL_SENDER === "true" || false;
