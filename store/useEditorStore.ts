// store/useEditorStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EditorStore {
  descriptionHTML: string;
  setDescriptionHTML: (html: string) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      descriptionHTML: "",
      setDescriptionHTML: (html) => set({ descriptionHTML: html }),
      editingId: null,
      setEditingId: (id) => set({ editingId: id }),
    }),
    {
      name: "editor-storage",
    }
  )
);
