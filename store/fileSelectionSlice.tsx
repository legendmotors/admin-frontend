import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FileSelectionState {
  selectedFileIds: any[]; // ✅ Change string[] to any[] to store full file objects
  selectionMode: "single" | "multi";
  allowFolders: boolean;
}

const initialState: FileSelectionState = {
  selectedFileIds: [],
  selectionMode: "multi",
  allowFolders: true,
};

const fileSelectionSlice = createSlice({
  name: 'fileSelection',
  initialState,
  reducers: {
    setSelectionMode: (state, action: PayloadAction<"single" | "multi">) => {
      state.selectionMode = action.payload;
    },
    setAllowFolders: (state, action: PayloadAction<boolean>) => {
      state.allowFolders = action.payload;
    },
    selectFile: (state, action: PayloadAction<string>) => {
      if (state.selectionMode === "single") {
        state.selectedFileIds = [action.payload]; // ✅ Only allow one file
      } else {
        if (state.selectedFileIds.includes(action.payload)) {
          state.selectedFileIds = state.selectedFileIds.filter(id => id !== action.payload); // ✅ Deselect if already selected
        } else {
          state.selectedFileIds.push(action.payload); // ✅ Allow multiple selections
        }
      }
    },
    setSelectedFiles: (state, action: PayloadAction<any[]>) => {
      state.selectedFileIds = action.payload; // ✅ Replace the entire file list
    },
    clearSelection: (state) => {
      state.selectedFileIds = [];
    },
  },
});

export const { selectFile, clearSelection, setSelectionMode, setAllowFolders, setSelectedFiles } = fileSelectionSlice.actions;
export default fileSelectionSlice.reducer;
