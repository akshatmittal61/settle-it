import { Friend } from "@/types";
import { createBaseStore, Getter, Setter } from "@/store/base";
import { useEffect } from "react";
import { BooleanUtils } from "@/utils";

type State = {
	friends: Array<Friend>;
};

type Action = {
	getFriends: Getter<State, "friends">;
	setFriends: Setter<State, "friends">;
};

type Options = {
	syncOnMount?: boolean;
};

type Extras = {
	sync: () => Promise<void>;
};

export const useGodownStore = createBaseStore<State, Action, Options, Extras>({
	createState: (set, get) => ({
		friends: [],
		getFriends: () => get().friends,
		setFriends: (friends) => set({ friends }),
	}),
	useSetup: ({ options }) => {
		const sync = async () => {};

		useEffect(() => {
			if (BooleanUtils.True.equals(options.syncOnMount)) {
				void sync();
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [options.syncOnMount]);
		return { sync };
	},
});
