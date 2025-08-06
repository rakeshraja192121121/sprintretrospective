import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VersionEntry {
  _id: string;
  date: string;
  name: string;
  update: string;
}

interface VersionState {
  versionHistory: VersionEntry[];
  editingId: string | null; // if you want to track which entry is being edited
  draftEntry: Partial<VersionEntry>; // for live input of new or edited entry
}

const initialState: VersionState = {
  versionHistory: [],
  editingId: null,
  draftEntry: { date: "", name: "", update: "" },
};

const versionSlice = createSlice({
  name: "version",
  initialState,
  reducers: {
    setVersionHistory(state, action: PayloadAction<VersionEntry[]>) {
      state.versionHistory = action.payload;
    },
    addVersionEntry(state, action: PayloadAction<VersionEntry>) {
      state.versionHistory.unshift(action.payload); // add new on top
    },
    updateVersionEntry(state, action: PayloadAction<VersionEntry>) {
      const index = state.versionHistory.findIndex(
        (entry) => entry._id === action.payload._id
      );
      if (index !== -1) {
        state.versionHistory[index] = action.payload;
      }
    },
    removeVersionEntry(state, action: PayloadAction<string>) {
      state.versionHistory = state.versionHistory.filter(
        (entry) => entry._id !== action.payload
      );
    },
    setEditingId(state, action: PayloadAction<string | null>) {
      state.editingId = action.payload;
    },
    setDraftEntry(state, action: PayloadAction<Partial<VersionEntry>>) {
      state.draftEntry = action.payload;
    },
    resetVersionState(state) {
      state.versionHistory = [];
      state.editingId = null;
      state.draftEntry = { date: "", name: "", update: "" };
    },
  },
});

export const {
  setVersionHistory,
  addVersionEntry,
  updateVersionEntry,
  removeVersionEntry,
  setEditingId,
  setDraftEntry,
  resetVersionState,
} = versionSlice.actions;

export default versionSlice.reducer;
