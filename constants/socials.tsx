import { ReactElement } from "react";
import {
	FaEnvelope,
	FaInstagram,
	FaLinkedin,
	FaPhone,
	FaTwitter,
	FaWhatsapp,
} from "react-icons/fa";
import { AppSeo } from "@/constants/seo";

export type Social = {
	name: string;
	href: string;
	title: string;
	icon: ReactElement;
};

export const socials: Array<Social> = [
	{
		name: "linkedin",
		href: "https://www.linkedin.com/in/akshatmittal61",
		title: "@akshatmittal61",
		icon: <FaLinkedin />,
	},
	{
		name: "twitter",
		href: "https://x.com/akshatmittal61",
		title: "@akshatmittal61",
		icon: <FaTwitter />,
	},
	{
		name: "instagram",
		href: "https://www.instagram.com/akshatmittal61",
		title: "@akshatmittal61",
		icon: <FaInstagram />,
	},
	{
		name: "whatsapp",
		href: "https://wa.me/919456849466",
		title: "+91 94568 49466",
		icon: <FaWhatsapp />,
	},
];

export const reachingMethods: Array<Social> = [
	{
		name: "email",
		href: "mailto:settleit.saas@gmail.com",
		title: "settleit.saas@gmail.com",
		icon: <FaEnvelope />,
	},
	{
		name: "phone",
		href: "tel:919456849466",
		title: "+91 94568 49466",
		icon: <FaPhone />,
	},
];
