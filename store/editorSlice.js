import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  descriptions: [], // saved entries
  editingId: null, // id of currently editing description
  draftContent: "", // live input content (not yet saved)
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    setDescriptions: (state, action) => {
      state.descriptions = action.payload;
    },
    addDescription: (state, action) => {
      state.descriptions.unshift(action.payload); // add new description at the top
    },
    updateDescription: (state, action) => {
      const index = state.descriptions.findIndex(
        (desc) => desc._id === action.payload._id
      );
      if (index !== -1) {
        state.descriptions[index] = action.payload;
      }
    },
    removeDescription: (state, action) => {
      state.descriptions = state.descriptions.filter(
        (desc) => desc._id !== action.payload
      );
    },
    setEditingId: (state, action) => {
      state.editingId = action.payload;
    },
    resetEditor: (state) => {
      state.descriptions = [];
      state.editingId = null;
      state.draftContent = "";
    },
    setDraftContent: (state, action) => {
      state.draftContent = action.payload; // update live input content
    },
  },
});

export const {
  setDescriptions,
  addDescription,
  updateDescription,
  removeDescription,
  setEditingId,
  resetEditor,
  setDraftContent, // export the new action
} = editorSlice.actions;

export default editorSlice.reducer;
