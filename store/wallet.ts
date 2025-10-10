import { GroupApi } from "@/api";
import { useHttpClient } from "@/hooks";
import { GroupSpread } from "@/types";
import { useEffect } from "react";
import { createBaseStore, Getter, Setter } from "./base";

export type State = {
	groups: Array<GroupSpread>;
	isSyncing: boolean;
};

export type Actions = {
	getGroups: Getter<State, "groups">;
	getIsSyncing: Getter<State, "isSyncing">;
	setGroups: Setter<State, "groups">;
	setIsSyncing: Setter<State, "isSyncing">;
};

export type Options = {
	syncOnMount?: boolean;
};

export type Extras = {
	sync: () => Promise<void>;
};

export const useWalletStore = createBaseStore<State, Actions, Options, Extras>({
	createState: (set, get) => ({
		groups: [],
		isSyncing: false,
		getGroups: () => get().groups,
		getIsSyncing: () => get().isSyncing,
		setGroups: (groups) => set({ groups }),
		setIsSyncing: (isSyncing) => set({ isSyncing }),
	}),
	useSetup: ({ store, options }) => {
		const client = useHttpClient();
		const sync = async () => {
			try {
				store.getState().setIsSyncing(true);
				const res = await client.call(GroupApi.getAllGroups);
				store.getState().setGroups(res);
			} finally {
				store.getState().setIsSyncing(false);
			}
		};

		useEffect(() => {
			if (options.syncOnMount) void sync();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [options.syncOnMount]);

		return { sync };
	},
});
