// store/customPagesReducer.ts
const initialState: any[] = [];

export default function customPagesReducer(state = initialState, action: any) {
  switch (action.type) {
    case "ADD_CUSTOM_PAGE":
      return [...state, action.payload];
    default:
      return state;
  }
}
