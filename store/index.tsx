import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from '@/store/themeConfigSlice';
import fileSelectionSlice from '@/store/fileSelectionSlice';
import stepSlice from '@/store/stepSlice'; // ✅ Import the new step slice
import formSlice from '@/store/formSlice'; // ✅ Import the new step slice
import filterOptionsSlice from '@/store/filterOptionsSlice'; // ✅ Import the new step slice
import carSlice from '@/store/carSlice'; // ✅ Import the new step slice

const rootReducer = combineReducers({
  themeConfig: themeConfigSlice,
  fileSelection: fileSelectionSlice,
  step: stepSlice, 
  form: formSlice,
  filters: filterOptionsSlice,
  car: carSlice,
});

const store = configureStore({
  reducer: rootReducer,
});

export default store;
export type IRootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch; // ✅ Export AppDispatch for use in components
