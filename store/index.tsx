import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from '@/store/themeConfigSlice';
import fileSelectionSlice from '@/store/fileSelectionSlice'; // ✅ Import file selection slice

const rootReducer = combineReducers({
  themeConfig: themeConfigSlice,
  fileSelection: fileSelectionSlice, // ✅ Add file selection reducer
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch; // ✅ Export AppDispatch for use in components
