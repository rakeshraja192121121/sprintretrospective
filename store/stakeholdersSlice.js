import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  { role: "", name: "" },
  { role: "", name: "" },
];

const stakeholdersSlice = createSlice({
  name: "stakeholders",
  initialState,
  reducers: {
    setStakeholders: (state, action) => action.payload,
    addStakeholder: (state) => {
      state.push({ role: "", name: "" });
    },
    updateStakeholder: (state, action) => {
      const { index, field, value } = action.payload;
      if (state[index]) {
        state[index][field] = value;
      }
    },
    deleteStakeholder: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.length) {
        state.splice(index, 1);
      }
    },
  },
});

export const {
  setStakeholders,
  addStakeholder,
  updateStakeholder,
  deleteStakeholder,
} = stakeholdersSlice.actions;

export default stakeholdersSlice.reducer;
