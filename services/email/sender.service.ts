import { createTransport } from "nodemailer";
import { googleEmailConfig } from "@/config";
import { AppSeo, emailTemplates, frontendBaseUrl } from "@/constants";
import { EmailTemplateGenerator, T_EMAIL_TEMPLATE } from "@/types";
import { emailTemplate } from "./template";

export class EmailService {
	private static getSMTPTransport() {
		const transportOptions = {
			service: "gmail",
			auth: {
				user: googleEmailConfig.email,
				pass: googleEmailConfig.password,
			},
			// Built-in connection pooling and rate limiting
			pool: true, // Enable connection pooling
			maxConnections: 5, // Max concurrent connections
			maxMessages: 100, // Max messages per connection
			rateDelta: 1000, // Time window for rate limiting (1 second)
			rateLimit: 5, // Max messages per rateDelta period
		};
		return createTransport(transportOptions);
	}

	private static async send(to: string, subject: string, html: string) {
		return EmailService.getSMTPTransport().sendMail({
			from: {
				name: AppSeo.title || "",
				address: googleEmailConfig.email,
			},
			to,
			subject,
			html,
		});
	}

	private static async bulkSend(
		to: Array<string>,
		subject: string,
		html: string
	) {
		return EmailService.getSMTPTransport().sendMail({
			from: googleEmailConfig.email,
			bcc: to,
			subject,
			html,
		});
	}

	public static async sendByTemplate<T extends T_EMAIL_TEMPLATE>(
		to: string,
		subject: string,
		template: T,
		data: EmailTemplateGenerator<T>
	) {
		const html = EmailService.getEmailTemplate(template, data);
		return EmailService.send(to, subject, html);
	}

	public static async bulkSendByTemplate<T extends T_EMAIL_TEMPLATE>(
		to: Array<string>,
		subject: string,
		template: T,
		data: EmailTemplateGenerator<T>
	) {
		const html = EmailService.getEmailTemplate(template, data);
		return EmailService.bulkSend(to, subject, html);
	}

	private static getEmailTemplate<T extends T_EMAIL_TEMPLATE>(
		template: T,
		data: EmailTemplateGenerator<T>
	) {
		if (template === emailTemplates.OTP) {
			const payload = data as EmailTemplateGenerator<"OTP">;
			return emailTemplate(
				"OTP requested for Login",
				`Your OTP is ${payload.otp}`
			);
		} else if (template === emailTemplates.NEW_USER_ONBOARDED) {
			return emailTemplate(
				`Welcome to ${AppSeo.title}`,
				"Your account has been created successfully. You can now login to your account.",
				"Login",
				`${frontendBaseUrl}/login`
			);
		} else if (template === emailTemplates.USER_INVITED) {
			const payload = data as EmailTemplateGenerator<"USER_INVITED">;
			return emailTemplate(
				`Welcome to ${AppSeo.title}`,
				`<a href="mailto:${payload.invitedBy.email}" style="color:inherit;text-decoration:none">${payload.invitedBy.name}</a> has invited you to join ${AppSeo.title}. You can now log in to your account.`,
				"Login",
				`${frontendBaseUrl}/login`
			);
		} else if (template === emailTemplates.USER_ADDED_TO_GROUP) {
			const payload =
				data as EmailTemplateGenerator<"USER_ADDED_TO_GROUP">;
			return emailTemplate(
				`Added to ${payload.group.name}`,
				`<a href="mailto:${payload.invitedBy.email}" style="color:inherit;text-decoration:none">${payload.invitedBy.name}</a> has added you to ${payload.group.name}.`,
				"View Group",
				`${frontendBaseUrl}/group/${payload.group.id}`
			);
		} else {
			return "";
		}
	}
}
