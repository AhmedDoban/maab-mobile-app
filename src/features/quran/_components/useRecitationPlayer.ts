import { useContext } from "react";
import RecitationContext from "./RecitationContext";

export default function useRecitationPlayer() {
  const recitation = useContext(RecitationContext);
  if (!recitation) {
    throw new Error(
      "useRecitationPlayer must be used inside RecitationProvider",
    );
  }
  return recitation;
}
