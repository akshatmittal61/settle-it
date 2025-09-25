import { USER_ROLE, USER_STATUS } from "@/constants";
import { authHelpers, userHelpers } from "@/context/helpers";
import { IUser, UserSlice } from "@/types";
import { createSlice } from "@reduxjs/toolkit";

const initialState: UserSlice = {
	id: "",
	name: "",
	email: "",
	status: USER_STATUS.JOINED,
	role: USER_ROLE.MEMBER,
};

export const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		setUser: (state, action: { payload: Partial<IUser>; type: string }) => {
			state = { ...state, ...action.payload };
			return state;
		},
		logout: (state) => {
			state = initialState;
			return state;
		},
	},
	extraReducers: (builder) => {
		// Fetch Logged In User
		builder.addCase(
			authHelpers.fetchAuthenticatedUser.fulfilled,
			(state, action) => {
				state = { ...state, ...action.payload };
				return state;
			}
		);
		// Handle rejection: Fetch Logged In User
		builder.addCase(
			authHelpers.fetchAuthenticatedUser.rejected,
			(state) => {
				state = initialState;
				return state;
			}
		);
		// Logout User
		builder.addCase(authHelpers.logoutUser.fulfilled, (state) => {
			state = initialState;
			return state;
		});
		// Update User
		builder.addCase(userHelpers.updateUser.fulfilled, (state, action) => {
			state = { ...state, ...action.payload };
			return state;
		});
	},
});

export const { setUser, logout } = userSlice.actions;

export default userSlice.reducer;

export const userSelector = (state: { user: UserSlice }) => state.user;
