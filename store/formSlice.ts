import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Image {
    fileId: string;
    type: string;
    order: number;
}

interface UploadedFile {
    id: string;
    fileId: string; // Ensure this is always a string
    name: string;
}

interface FormState {
    currentStep: number;
    formData: { [key: string]: any };
    images: Image[];
    brochureFile: UploadedFile | null;
    tags: number[]; // Added property to store tag IDs
}

const initialState: FormState = {
    currentStep: 1,
    formData: {},
    images: [],
    brochureFile: null,
    tags: [],
};

const formSlice = createSlice({
    name: 'form',
    initialState,
    reducers: {
        setStep(state, action: PayloadAction<number>) {
            state.currentStep = action.payload;
        },
        setFormData(state, action: PayloadAction<{ [key: string]: any }>) {
            state.formData = { ...state.formData, ...action.payload };
        },
        setImages(state, action: PayloadAction<Image[]>) {
            state.images = action.payload;
        },
        setBrochure(state, action: PayloadAction<UploadedFile>) {
            state.brochureFile = action.payload;
        },
        setTags(state, action: PayloadAction<number[]>) { // New action for tags
            state.tags = action.payload;
        },
        resetForm(state) {
            state.currentStep = 1;
            state.formData = {};
            state.images = [];
            state.brochureFile = null;
            state.tags = [];
        },
    },
});

export const { setStep, setFormData, setImages, setBrochure, setTags, resetForm } = formSlice.actions;
export default formSlice.reducer;
