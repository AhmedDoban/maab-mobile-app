import useContentColumn from "@/hooks/useContentColumn";
import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";
import { View } from "react-native";

export default function ContentColumn({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  const style = useContentColumn();

  return (
    <View
      className={cn("w-full max-w-3xl self-center", className)}
      style={style}
    >
      {children}
    </View>
  );
}
