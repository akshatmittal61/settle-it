import { useEffect, useState } from "react";

type DeviceType = "mobile" | "tablet" | "desktop";
type ScreenOrientationType = "portrait" | "landscape";
type PlatformType = "client" | "server";

export const useDevice = () => {
	const [device, setDevice] = useState<DeviceType>("desktop");
	const [orientation, setOrientation] =
		useState<ScreenOrientationType>("landscape");
	const [platform, setPlatform] = useState<PlatformType>("server");

	useEffect(() => {
		const handleResize = () => {
			if (navigator.userAgent.match(/Android/i)) {
				setDevice("mobile");
			} else if (navigator.userAgent.match(/webOS/i)) {
				setDevice("mobile");
			} else if (navigator.userAgent.match(/iPhone/i)) {
				setDevice("mobile");
			} else if (navigator.userAgent.match(/iPad/i)) {
				setDevice("tablet");
			} else if (navigator.userAgent.match(/iPod/i)) {
				setDevice("mobile");
			} else if (navigator.userAgent.match(/BlackBerry/i)) {
				setDevice("mobile");
			} else if (navigator.userAgent.match(/Windows Phone/i)) {
				setDevice("mobile");
			} else {
				setDevice("desktop");
			}

			if (window.innerHeight > window.innerWidth) {
				setOrientation("portrait");
			} else {
				setOrientation("landscape");
			}
		};

		handleResize();

		window.addEventListener("resize", handleResize);

		setTimeout(() => {
			setPlatform("client");
		}, 1000);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return { device, orientation, platform };
};
