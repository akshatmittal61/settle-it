import { IGroup } from "@/types/group";
import { createSlice } from "@reduxjs/toolkit";
import { groupHelpers } from "../helpers";

const initialState: Array<IGroup> = [];

export const groupSlice = createSlice({
	name: "group",
	initialState,
	reducers: {
		setGroups: (
			state,
			action: { payload: Array<IGroup>; type: string }
		) => {
			state = action.payload;
			return state;
		},
	},
	extraReducers(builder) {
		builder.addCase(
			groupHelpers.getAllGroups.fulfilled,
			(state, action) => {
				state = action.payload;
				return state;
			}
		);
		builder.addCase(groupHelpers.createGroup.fulfilled, (state, action) => {
			state = [...state, action.payload];
			return state;
		});
		builder.addCase(groupHelpers.updateGroup.fulfilled, (state, action) => {
			state = state.map((group) => {
				if (group.id === action.payload.id) {
					return action.payload;
				}
				return group;
			});
			return state;
		});
		builder.addCase(groupHelpers.deleteGroup.fulfilled, (state, action) => {
			state = state.filter((group) => group.id !== action.payload.id);
			return state;
		});
	},
});

export const { setGroups } = groupSlice.actions;

export default groupSlice.reducer;

export const groupSelector = (state: { group: Array<IGroup> }) => state.group;
