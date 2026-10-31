import { createContext } from "react";
import type useRecitation from "./useRecitation";

export default createContext<ReturnType<typeof useRecitation> | null>(null);
