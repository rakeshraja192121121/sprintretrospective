import { configureStore } from "@reduxjs/toolkit";
import editorReducer from "./editorSlice";
import versionReducer from "./versionSlice";
import quickLinksReducer from "./quicklinkSlice";
import stakeholdersReducer from "./stakeholdersSlice"; // import it here
import customPagesReducer from "./customPagesReducer";

export const store = configureStore({
  reducer: {
    editor: editorReducer,
    version: versionReducer,
    quickLinks: quickLinksReducer,
    stakeholders: stakeholdersReducer,
    customPages: customPagesReducer,
  },
});
