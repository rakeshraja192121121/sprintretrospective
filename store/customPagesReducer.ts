const initialState = [];

export default function customPagesReducer(state = initialState, action) {
  switch (action.type) {
    case "ADD_CUSTOM_PAGE":
      return [...state, action.payload];
    default:
      return state;
  }
}
