import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  brandId: string[];
  modelId: string[];
  trimId: string[];
  yearId: string[];
  searchQuery: string;
}

const initialState: FilterState = {
  brandId: [],
  modelId: [],
  trimId: [],
  yearId: [],
  searchQuery: '',
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setBrandId(state, action: PayloadAction<string[]>) {
      state.brandId = action.payload;
      state.modelId = [];
      state.trimId = [];
      state.yearId = [];
    },
    setModelId(state, action: PayloadAction<string[]>) {
      state.modelId = action.payload;
      state.trimId = [];
      state.yearId = [];
    },
    setTrimId(state, action: PayloadAction<string[]>) {
      state.trimId = action.payload;
      state.yearId = [];
    },
    setYearId(state, action: PayloadAction<string[]>) {
      state.yearId = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    resetFilters(state) {
      state.brandId = [];
      state.modelId = [];
      state.trimId = [];
      state.yearId = [];
      state.searchQuery = '';
    },
  },
});

export const {
  setBrandId,
  setModelId,
  setTrimId,
  setYearId,
  setSearchQuery,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;
