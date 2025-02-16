import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FormState {
    currentStep: number; // Tracks the active form step
    formData: { [key: string]: any }; // Stores all form data across steps
    images: { fileId: string; type: string; order: number }[]; // Defines the shape of the images array
}

const initialState: FormState = {
    currentStep: 1, // Start at step 1
    formData: {}, // Empty form data
    images: [], // Initialize images as an empty array
};

const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        setStep(state, action: PayloadAction<number>) {
            state.currentStep = action.payload;
        },
        setFormData(state, action: PayloadAction<{ [key: string]: any }>) {
            state.formData = { ...state.formData, ...action.payload }; // Merge new data into the existing formData
        },
        setImages(state, action: PayloadAction<{ fileId: string; type: string; order: number }[]>) {
            state.images = action.payload; // Update the images array
        },
        resetForm(state) {
            state.currentStep = 1;
            state.formData = {};
            state.images = []; // Clear the images array when resetting the form
        },
    },
});

// Export all reducers
export const { setStep, setFormData, setImages, resetForm } = formSlice.actions;

// Export the slice reducer
export default formSlice.reducer;
