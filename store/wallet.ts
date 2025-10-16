import { ExpenseApi, GroupApi } from "@/api";
import { useHttpClient } from "@/hooks";
import {
	ApiRequests,
	CreateExpenseData,
	GroupSpread,
	IExpense,
	IGroup,
	UpdateExpenseData,
} from "@/types";
import { Notify } from "@/utils";
import { useEffect } from "react";
import { createBaseStore, Getter, Setter } from "./base";

export type State = {
	groups: Array<GroupSpread>;
	expenses: Array<IExpense>;
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
	isGettingGroupExpenses: boolean;
	isCreatingExpense: boolean;
	isUpdatingExpense: boolean;
	isDeletingExpense: boolean;
	sync: () => Promise<void>;
	createGroup: (_body: ApiRequests.CreateGroup) => Promise<GroupSpread>;
	updateGroup: (
		_id: string,
		_body: ApiRequests.UpdateGroup
	) => Promise<GroupSpread>;
	deleteGroup: (_id: string) => Promise<IGroup>;
	getGroupExpenses: (_id: string) => Promise<Array<IExpense>>;
	createExpense: (_body: CreateExpenseData) => Promise<IExpense>;
	updateExpense: (_id: string, _body: UpdateExpenseData) => Promise<IExpense>;
	deleteExpense: (_id: string) => Promise<IExpense>;
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
		const { trigger: getGroupsClient, loading: isGettingGroups } =
			useHttpClient({
				trigger: GroupApi.getAllGroups,
				onSuccess: store.getState().setGroups,
			});
		const {
			trigger: createGroupClient,
			data: createdGroup,
			loading: isAddingGroup,
		} = useHttpClient({ trigger: GroupApi.createGroup });
		const {
			trigger: updateGroupClient,
			data: updatedGroup,
			loading: isUpdatingGroup,
		} = useHttpClient({ trigger: GroupApi.updateGroup });
		const {
			trigger: deleteGroupClient,
			data: deletedGroup,
			loading: isDeletingGroup,
		} = useHttpClient({ trigger: GroupApi.deleteGroup });
		const {
			trigger: getGroupExpensesClient,
			data: groupExpenses,
			loading: isGettingGroupExpenses,
		} = useHttpClient({
			trigger: GroupApi.getGroupExpenses,
			onError: Notify.error,
		});
		const {
			trigger: createExpenseClient,
			data: createdExpense,
			loading: isCreatingExpense,
		} = useHttpClient({
			trigger: ExpenseApi.createExpense,
			onError: Notify.error,
		});
		const {
			trigger: updateExpenseClient,
			data: updatedExpense,
			loading: isUpdatingExpense,
		} = useHttpClient({
			trigger: ExpenseApi.updateExpense,
			onError: Notify.error,
		});
		const {
			trigger: deleteExpenseClient,
			data: deletedExpense,
			loading: isDeletingExpense,
		} = useHttpClient({
			trigger: ExpenseApi.deleteExpense,
			onError: Notify.error,
		});

		const sync = async () => {
			try {
				store.getState().setIsSyncing(true);
				await getGroupsClient(GroupApi.getAllGroups);
			} finally {
				store.getState().setIsSyncing(false);
			}
		};

		const createGroup = async (body: ApiRequests.CreateGroup) => {
			await createGroupClient(body);
			const groupsToSet = [createdGroup, ...store.getState().getGroups()];
			store.getState().setGroups(groupsToSet);
			void sync();
			return createdGroup;
		};

		const updateGroup = async (
			id: string,
			body: ApiRequests.UpdateGroup
		) => {
			await updateGroupClient(id, body);
			const groupsToSet = store
				.getState()
				.getGroups()
				.map((g) => (g.id === id ? updatedGroup : g));
			store.getState().setGroups(groupsToSet);
			void sync();
			return updatedGroup;
		};

		const deleteGroup = async (id: string) => {
			await deleteGroupClient(id);
			const groupsToSet = store
				.getState()
				.getGroups()
				.filter((g) => g.id === id);
			store.getState().setGroups(groupsToSet);
			void sync();
			return deletedGroup;
		};

		const getGroupExpenses = async (id: string) => {
			await getGroupExpensesClient(id);
			// add the expenses which are not in the store yet
			const expensesToSet = [...store.getState().getExpenses()].concat(
				groupExpenses.filter(
					(exp) =>
						!store
							.getState()
							.getExpenses()
							.map((e) => e.id)
							.includes(exp.id)
				)
			);
			store.getState().setExpenses(expensesToSet);
			void sync();
			return groupExpenses;
		};

		const createExpense = async (body: CreateExpenseData) => {
			await createExpenseClient(body);
			const expensesToSet = [
				createdExpense,
				...store.getState().getExpenses(),
			];
			store.getState().setExpenses(expensesToSet);
			void sync();
			return createdExpense;
		};

		const updateExpense = async (id: string, body: UpdateExpenseData) => {
			await updateExpenseClient({ expenseId: id, data: body });
			const expensesToSet = store
				.getState()
				.getExpenses()
				.map((e) => (e.id === id ? updatedExpense : e));
			store.getState().setExpenses(expensesToSet);
			void sync();
			return updatedExpense;
		};

		const deleteExpense = async (id: string) => {
			await deleteExpenseClient(id);
			const expensesToSet = store
				.getState()
				.getExpenses()
				.filter((e) => e.id === id);
			store.getState().setExpenses(expensesToSet);
			void sync();
			return deletedExpense;
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
			isGettingGroupExpenses,
			isCreatingExpense,
			isUpdatingExpense,
			isDeletingExpense,
			sync,
			createGroup,
			updateGroup,
			deleteGroup,
			getGroupExpenses,
			createExpense,
			updateExpense,
			deleteExpense,
		};
	},
});
