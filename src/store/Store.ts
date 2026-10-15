import { clearDorarCache } from "./dorarCache";
import { useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { DorarSlice } from "./Slices/DorarSlice";
import { SettingsSlice } from "./Slices/SettingsSlice";
import { AzkarSlice } from "./Slices/AzkarSlice";
import { persistMiddleware } from "./persist";

export const Store = configureStore({
  reducer: {
    [SettingsSlice.name]: SettingsSlice.reducer,
    [AzkarSlice.name]: AzkarSlice.reducer,
    [DorarSlice.reducerPath]: DorarSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredPaths: [DorarSlice.reducerPath] },
      immutableCheck: { ignoredPaths: [DorarSlice.reducerPath] },
    })
      .prepend(persistMiddleware.middleware)
      .concat([DorarSlice.middleware]),
});

type RootState = ReturnType<typeof Store.getState>;
export type AppDispatch = typeof Store.dispatch;

export function clearApiCache(dispatch: AppDispatch) {
  dispatch(DorarSlice.util.resetApiState());
  clearDorarCache();
}

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
