import { createSlice } from "@reduxjs/toolkit";

const initialState = [
  { name: "", link: "" },
  { name: "", link: "" },
];

const quickLinksSlice = createSlice({
  name: "quickLinks",
  initialState,
  reducers: {
    setLinks: (state, action) => action.payload,
    addLink: (state) => {
      state.push({ name: "", link: "" });
    },
    updateLink: (state, action) => {
      const { index, field, value } = action.payload;
      if (state[index]) state[index][field] = value;
    },
    deleteLink: (state, action) => {
      const index = action.payload;
      if (index >= 0 && index < state.length) state.splice(index, 1);
    },
  },
});

// Make sure these lines exist and match the case used in your imports!
export const { setLinks, addLink, updateLink, deleteLink } =
  quickLinksSlice.actions;
export default quickLinksSlice.reducer;
