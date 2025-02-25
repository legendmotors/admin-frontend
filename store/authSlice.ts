// store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  permissions: string[]; // e.g. ["view_dashboard", "manage_car_details", ...]
}

const initialState: AuthState = {
  permissions: [],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setPermissions(state, action: PayloadAction<string[]>) {
      state.permissions = action.payload;
    },
    clearPermissions(state) {
      state.permissions = [];
    },
  },
});

export const { setPermissions, clearPermissions } = authSlice.actions;
export default authSlice.reducer;
