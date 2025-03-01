import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FilterState {
  brandId: string[];
  modelId: string[];
  trimId: string[];
  yearId: string[];
  searchQuery: string;
  specFilters: Record<string, string[]>;
  minPriceAED: number | null;
  maxPriceAED: number | null;
  minPriceUSD: number | null;
  maxPriceUSD: number | null;
  sortBy: string;
  order: 'ASC' | 'DESC';
  tagIds: string[]; // NEW: Selected tag IDs for filtering
}

const initialState: FilterState = {
  brandId: [],
  modelId: [],
  trimId: [],
  yearId: [],
  searchQuery: '',
  specFilters: {},
  minPriceAED: null,
  maxPriceAED: null,
  minPriceUSD: null,
  maxPriceUSD: null,
  sortBy: 'createdAt',  // default sort field
  order: 'DESC',        // default sort order
  tagIds: [],           // NEW: default empty array
};

const filterSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setBrandId(state, action: PayloadAction<string[]>) {
      state.brandId = action.payload;
      // When brand is updated, clear lower-level filters.
      state.modelId = [];
      state.trimId = [];
      state.yearId = [];
    },
    setModelId(state, action: PayloadAction<string[]>) {
      state.modelId = action.payload;
      // Clear lower-level filters if model changes.
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
    setSpecFilter(state, action: PayloadAction<{ key: string; value: string[] }>) {
      const { key, value } = action.payload;
      state.specFilters[key] = value;
    },
    setPriceRangeAED(
      state,
      action: PayloadAction<{ minPrice: number | null; maxPrice: number | null }>
    ) {
      state.minPriceAED = action.payload.minPrice;
      state.maxPriceAED = action.payload.maxPrice;
    },
    setPriceRangeUSD(
      state,
      action: PayloadAction<{ minPrice: number | null; maxPrice: number | null }>
    ) {
      state.minPriceUSD = action.payload.minPrice;
      state.maxPriceUSD = action.payload.maxPrice;
    },
    setSortBy(state, action: PayloadAction<string>) {
      state.sortBy = action.payload;
    },
    setOrder(state, action: PayloadAction<'ASC' | 'DESC'>) {
      state.order = action.payload;
    },
    setTagIds(state, action: PayloadAction<string[]>) {
      state.tagIds = action.payload;
    },
    resetFilters(state) {
      state.brandId = [];
      state.modelId = [];
      state.trimId = [];
      state.yearId = [];
      state.searchQuery = '';
      state.specFilters = {};
      state.minPriceAED = null;
      state.maxPriceAED = null;
      state.minPriceUSD = null;
      state.maxPriceUSD = null;
      // Reset sorting to defaults
      state.sortBy = 'createdAt';
      state.order = 'DESC';
      state.tagIds = []; // Clear tag filters as well
    },
  },
});

export const {
  setBrandId,
  setModelId,
  setTrimId,
  setYearId,
  setSearchQuery,
  setSpecFilter,
  resetFilters,
  setPriceRangeAED,
  setPriceRangeUSD,
  setSortBy,
  setOrder,
  setTagIds,
} = filterSlice.actions;

export default filterSlice.reducer;
