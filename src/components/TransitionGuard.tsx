import useTransitionGuard from "@/hooks/useTransitionGuard";
import type { ReactElement } from "react";

type Props = Parameters<typeof useTransitionGuard>[0];

export default function TransitionGuard({
  navigation,
  children,
}: {
  navigation: Props;
  children: ReactElement;
}) {
  useTransitionGuard(navigation);
  return children;
}
