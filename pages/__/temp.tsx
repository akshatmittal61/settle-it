import { http } from "@/client";
import { Notify } from "@/utils";
import React, { useState } from "react";

const TempPage: React.FC = () => {
	const [ep, setEp] = useState("");
	const hit = async (endpoint: string) => {
		try {
			const res = await http.get(endpoint);
			Notify.info(res.data?.message);
		} catch (error) {
			Notify.error(error);
		}
	};
	return (
		<main>
			<button
				onClick={() => {
					hit("https://settle-it.onrender.com/api/health").then(
						() => {
							hit("https://settleit.vercel.app/api/health");
						}
					);
				}}
			>
				Hit Health API
			</button>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					hit(ep);
				}}
			>
				<input
					type="text"
					name="ep"
					value={ep}
					onChange={(e) => setEp(e.target.value)}
				/>
				<button type="submit">Hit {ep}</button>
			</form>
		</main>
	);
};

export default TempPage;
