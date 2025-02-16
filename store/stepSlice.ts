import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StepState {
  activeStep: number;
}

const initialState: StepState = {
  activeStep: 1, // Default starting step
};

const stepSlice = createSlice({
  name: 'step',
  initialState,
  reducers: {
    setActiveStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
    },
  },
});

export const { setActiveStep } = stepSlice.actions;
export default stepSlice.reducer;
