import { Wrapper } from "@/layouts";
import "@/styles/globals.scss";
import AOS from "aos";
import "aos/dist/aos.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	if (typeof window !== "undefined") AOS.init();
	return (
		<Wrapper {...pageProps}>
			<Component {...pageProps} />
		</Wrapper>
	);
}
