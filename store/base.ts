import { create, StateCreator, StoreApi, UseBoundStore } from "zustand";

// Local copy of the selectorized store helper type to avoid circular exports
type WithSelectors<S> = S extends { getState: () => infer T }
	? S & { use: { [K in keyof T]: () => T[K] } }
	: never;

export type Getter<State, T extends keyof State> = () => State[T];
export type Setter<State, T extends keyof State> = (_val: State[T]) => void;

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
	_store: S
) => {
	let store = _store as WithSelectors<typeof _store>;
	store.use = {};
	for (let k of Object.keys(store.getState())) {
		(store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
	}

	return store;
};
// Builder for a standardized store
// State = State object kept in zustand
// Actions = Actions object kept in zustand
// Options = options accepted by the public hook
// Extras = extra fields/methods returned by the hook in addition to the store

type Ctx<State extends object, Options extends object> = {
	store: WithSelectors<UseBoundStore<StoreApi<State>>>;
	options: Options;
};

// If Extras is an empty object type (no keys), useSetup is optional; otherwise required
type RequireUseSetupIfExtras<
	State extends object,
	Options extends object,
	Extras extends object,
> = keyof Extras extends never
	? { useSetup?: (_ctx: Ctx<State, Options>) => Extras }
	: { useSetup: (_ctx: Ctx<State, Options>) => Extras };

type BaseStoreBuilder<
	State extends object,
	Options extends object = {},
	Extras extends object = {},
> = {
	createState: StateCreator<State, [], [], State>;
	defaults?: Options;
} & RequireUseSetupIfExtras<State, Options, Extras>;

// Factory to create a zustand store + selectorized hook with consistent shape
export function createBaseStore<
	State extends object,
	Actions extends object,
	Options extends object = {},
	Extras extends object = {},
>(builder: BaseStoreBuilder<State & Actions, Options, Extras>) {
	const store = create<State & Actions>(builder.createState);
	const useStore = createSelectors(store) as WithSelectors<typeof store>;

	return (options?: Partial<Options>): State & Actions & Extras => {
		const s = useStore;
		const state = s() as State & Actions;
		const mergedOptions = {
			...(builder.defaults ?? {}),
			...options,
		} as Options;

		// Allow stores to register effects and derive extra methods synchronously
		const extras =
			builder.useSetup?.({
				store: s as WithSelectors<typeof store>,
				options: mergedOptions,
			}) || ({} as Extras);

		return { ...state, ...extras };
	};
}
