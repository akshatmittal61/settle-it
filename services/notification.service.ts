import { ContactMessage } from "@/types";
import { StringUtils } from "@/utils";
import { emailTemplates, regex } from "@/constants";
import { ParserSafetyError } from "@/errors";
import { EmailService } from "@/services/email";
import { googleEmailConfig } from "@/config";

export class NotificationService {
	public static async sendContactMessage(
		payload: ContactMessage
	): Promise<string> {
		const name = StringUtils.getNonEmptyString(payload.name);
		const email = StringUtils.getNonEmptyString(payload.email);
		const message = StringUtils.getNonEmptyString(payload.message);
		if (!regex.email.test(payload.email)) {
			throw new ParserSafetyError(
				"Invalid email",
				this.sendContactMessage.name,
				payload.email
			);
		}
		if (name.length < 3 || name.length > 100) {
			throw new ParserSafetyError(
				"Invalid name",
				this.sendContactMessage.name,
				payload.name
			);
		}
		if (message.length < 3) {
			throw new ParserSafetyError(
				"Invalid message",
				this.sendContactMessage.name,
				payload.message
			);
		} else if (message.length > 1000) {
			throw new ParserSafetyError(
				"Message too long!",
				this.sendContactMessage.name,
				payload.message
			);
		}
		// Send it to my email only
		await EmailService.sendByTemplate(
			googleEmailConfig.email,
			`You have unread message from ${name}`,
			emailTemplates.CONTACT_MESSAGE,
			{ name, email, message }
		);
		return "Your message has been sent!";
	}
}
