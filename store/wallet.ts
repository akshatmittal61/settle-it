import { GroupApi } from "@/api";
import { useHttpClient } from "@/hooks";
import { ApiRequests, ExpenseSpread, GroupSpread, IGroup } from "@/types";
import { useEffect } from "react";
import { createBaseStore, Getter, Setter } from "./base";

export type State = {
	groups: Array<GroupSpread>;
	expenses: Array<ExpenseSpread>;
	tags: Array<String>;
	isSyncing: boolean;
};

export type Actions = {
	getGroups: Getter<State, "groups">;
	getExpenses: Getter<State, "expenses">;
	getTags: Getter<State, "tags">;
	setGroups: Setter<State, "groups">;
	setExpenses: Setter<State, "expenses">;
	setTags: Setter<State, "tags">;
	setIsSyncing: Setter<State, "isSyncing">;
};

export type Options = {
	syncOnMount?: boolean;
};

export type Extras = {
	isGettingGroups: boolean;
	isAddingGroup: boolean;
	isUpdatingGroup: boolean;
	isDeletingGroup: boolean;
	sync: () => Promise<void>;
	createGroup: (_body: ApiRequests.CreateGroup) => Promise<GroupSpread>;
	updateGroup: (
		_id: string,
		_body: ApiRequests.UpdateGroup
	) => Promise<GroupSpread>;
	deleteGroup: (_id: string) => Promise<IGroup>;
};

export const useWalletStore = createBaseStore<State, Actions, Options, Extras>({
	createState: (set, get) => ({
		groups: [],
		expenses: [],
		tags: [],
		isSyncing: false,
		isAdding: false,
		isUpdating: false,
		isDeleting: false,
		getGroups: () => get().groups,
		getExpenses: () => get().expenses,
		getTags: () => get().tags,
		setGroups: (groups) => set({ groups }),
		setExpenses: (expenses) => set({ expenses }),
		setTags: (tags) => set({ tags }),
		setIsSyncing: (isSyncing) => set({ isSyncing }),
	}),
	useSetup: ({ store, options }) => {
		const {
			call: getGroupsClient,
			data: fetchedGroups,
			loading: isGettingGroups,
		} = useHttpClient<Array<GroupSpread>>();
		const {
			call: createGroupClient,
			data: createdGroup,
			loading: isAddingGroup,
		} = useHttpClient<GroupSpread>();
		const {
			call: updateGroupClient,
			data: updatedGroup,
			loading: isUpdatingGroup,
		} = useHttpClient<GroupSpread>();
		const {
			call: deleteGroupClient,
			data: deletedGroup,
			loading: isDeletingGroup,
		} = useHttpClient<IGroup>();

		const sync = async () => {
			try {
				store.getState().setIsSyncing(true);
				await getGroupsClient(GroupApi.getAllGroups);
				store.getState().setGroups(fetchedGroups);
			} finally {
				store.getState().setIsSyncing(false);
			}
		};

		const createGroup = async (body: ApiRequests.CreateGroup) => {
			await createGroupClient(GroupApi.createGroup, body);
			const groupsToSet = [createdGroup, ...store.getState().getGroups()];
			store.getState().setGroups(groupsToSet);
			void sync();
			return createdGroup;
		};

		const updateGroup = async (
			id: string,
			body: ApiRequests.UpdateGroup
		) => {
			await updateGroupClient(GroupApi.updateGroup, id, body);
			const groupsToSet = store
				.getState()
				.getGroups()
				.map((g) => (g.id === id ? updatedGroup : g));
			store.getState().setGroups(groupsToSet);
			void sync();
			return updatedGroup;
		};

		const deleteGroup = async (id: string) => {
			await deleteGroupClient(GroupApi.deleteGroup, id);
			const groupsToSet = store
				.getState()
				.getGroups()
				.filter((g) => g.id === id);
			store.getState().setGroups(groupsToSet);
			void sync();
			return deletedGroup;
		};

		useEffect(() => {
			if (options.syncOnMount) void sync();
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [options.syncOnMount]);

		return {
			isGettingGroups,
			isAddingGroup,
			isUpdatingGroup,
			isDeletingGroup,
			sync,
			createGroup,
			updateGroup,
			deleteGroup,
		};
	},
});
