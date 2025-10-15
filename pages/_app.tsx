import "@/styles/globals.scss";
import { Wrapper } from "@/layouts";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<Wrapper {...pageProps}>
			<Component {...pageProps} />
		</Wrapper>
	);
}
