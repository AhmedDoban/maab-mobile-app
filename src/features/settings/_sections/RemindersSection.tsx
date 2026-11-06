import NotificationPermissionDialog from "@/features/prayer-times/_ui/NotificationPermissionDialog";
import { useCallback, useState } from "react";
import ReminderCard from "../_ui/ReminderCard";
import AzkarReminderCard from "../_ui/AzkarReminderCard";

export default function RemindersSection() {
  const [denied, setDenied] = useState(false);
  const openDenied = useCallback(() => setDenied(true), []);
  const closeDenied = useCallback(() => setDenied(false), []);

  return (
    <>
      <ReminderCard kind="dhikr" onDenied={openDenied} />
      <ReminderCard kind="quran" onDenied={openDenied} />
      <AzkarReminderCard kind="morning" onDenied={openDenied} />
      <AzkarReminderCard kind="evening" onDenied={openDenied} />
      <NotificationPermissionDialog visible={denied} onClose={closeDenied} />
    </>
  );
}
