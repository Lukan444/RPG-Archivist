import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

// Import reducers (to be created)
// import authReducer from "../features/auth/authSlice";
// import userReducer from "../features/user/userSlice";
// import rpgWorldReducer from "../features/rpgWorld/rpgWorldSlice";
// import campaignReducer from "../features/campaign/campaignSlice";
// import sessionReducer from "../features/session/sessionSlice";
// import characterReducer from "../features/character/characterSlice";
// import locationReducer from "../features/location/locationSlice";
// import transcriptionReducer from "../features/transcription/transcriptionSlice";
// import brainReducer from "../features/brain/brainSlice";
// import uiReducer from "../features/ui/uiSlice";

// Create a placeholder reducer for now
const placeholderReducer = (state = {}, action: any) => state;

export const store = configureStore({
  reducer: {
    // Add reducers here when created
    placeholder: placeholderReducer,
    // auth: authReducer,
    // user: userReducer,
    // rpgWorld: rpgWorldReducer,
    // campaign: campaignReducer,
    // session: sessionReducer,
    // character: characterReducer,
    // location: locationReducer,
    // transcription: transcriptionReducer,
    // brain: brainReducer,
    // ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["persist/PERSIST"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        // Ignore these paths in the state
        ignoredPaths: ["items.dates"],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
