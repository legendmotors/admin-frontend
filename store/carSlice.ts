import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import CarService from '@/services/CarService';
import { Car } from '@/types'; // or wherever your Car interface is
import { IRootState } from '@/store';

interface CarState {
  cars: Car[];
  totalCars: number;
  currentPage: number;
  hasMore: boolean;
  isLoading: boolean;
}

const initialState: CarState = {
  cars: [],
  totalCars: 0,
  currentPage: 1,
  hasMore: true,
  isLoading: false,
};

export const fetchCarList = createAsyncThunk<
  { data: Car[]; pagination: { totalItems: number; currentPage: number; totalPages: number } },
  { page: number },
  { state: IRootState }
>(
  'car/fetchCarList',
  async ({ page }, { getState, rejectWithValue }) => {
    try {
      const { filters } = getState();
      const params: Record<string, any> = {
        page,
        limit: 12,
      };

      // Fixed filters
      if (filters.brandId.length > 0) params.brandId = filters.brandId.join(',');
      if (filters.modelId.length > 0) params.modelId = filters.modelId.join(',');
      if (filters.trimId.length > 0) params.trimId = filters.trimId.join(',');
      if (filters.yearId.length > 0) params.yearId = filters.yearId.join(',');
      if (filters.searchQuery.trim()) params.search = filters.searchQuery.trim();

      // Price range filters for AED
      if (filters.minPriceAED !== null && filters.minPriceAED !== undefined) {
        params.minPriceAED = filters.minPriceAED;
      }
      if (filters.maxPriceAED !== null && filters.maxPriceAED !== undefined) {
        params.maxPriceAED = filters.maxPriceAED;
      }

      // Price range filters for USD
      if (filters.minPriceUSD !== null && filters.minPriceUSD !== undefined) {
        params.minPriceUSD = filters.minPriceUSD;
      }
      if (filters.maxPriceUSD !== null && filters.maxPriceUSD !== undefined) {
        params.maxPriceUSD = filters.maxPriceUSD;
      }

      // Dynamic specification filters
      if (filters.specFilters) {
        Object.entries(filters.specFilters).forEach(([key, values]) => {
          if (values.length > 0) {
            params[key] = values.join(',');
          }
        });
      }

      // Tag filter (if any)
      if (filters.tagIds && filters.tagIds.length > 0) {
        params.tags = filters.tagIds.join(',');
      }

      // Add sorting parameters
      if (filters.sortBy) {
        params.sortBy = filters.sortBy;
      }
      if (filters.order) {
        params.order = filters.order;
      }

      const response = await CarService.listCars(params);
      return response;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const carSlice = createSlice({
  name: 'car',
  initialState,
  reducers: {
    resetCars(state) {
      state.cars = [];
      state.currentPage = 1;
      state.hasMore = true;
    },
    incrementPage(state) {
      state.currentPage += 1;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCarList.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchCarList.fulfilled, (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      const { data, pagination } = action.payload;
      if (state.currentPage === 1) {
        state.cars = data;
      } else {
        state.cars = [...state.cars, ...data];
      }
      state.totalCars = pagination.totalItems;
      state.hasMore = pagination.currentPage < pagination.totalPages;
    });
    builder.addCase(fetchCarList.rejected, (state) => {
      state.isLoading = false;
    });
  },
});

export const { resetCars, incrementPage } = carSlice.actions;
export default carSlice.reducer;
