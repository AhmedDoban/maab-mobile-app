import { useSafeAreaInsets } from "react-native-safe-area-context";
import useDirection from "@/hooks/useDirection";
import useFloatingTabBarSpace from "@/hooks/useFloatingTabBarSpace";
import usePageInsets from "@/hooks/usePageInsets";
import { cn } from "@/lib/utils";
import { useScrollToTop } from "expo-router";
import { PropsWithChildren, ReactNode, useRef } from "react";
import StatusBarBackdrop from "@/components/StatusBarBackdrop";
import {
  ScrollView,
  type ScrollViewInstance,
  ScrollViewProps,
  View,
} from "react-native";
import ContentColumn from "./ContentColumn";
import PageHeader from "./PageHeader";

type Props = PropsWithChildren<
  ScrollViewProps & {
    className?: string;
    scroll?: boolean;
    title?: string;
    headerTrailing?: ReactNode;
    header?: ReactNode;
  }
>;

export default function Screen({
  children,
  className,
  scroll = true,
  title,
  headerTrailing,
  header: customHeader,
  ...props
}: Props) {
  const { direction } = useDirection();
  const insets = usePageInsets();
  const { top, left, right } = useSafeAreaInsets();
  const tabBarSpace = useFloatingTabBarSpace();
  const scrollRef = useRef<ScrollViewInstance>(null);
  useScrollToTop(scrollRef);
  const header =
    customHeader ??
    (title ? <PageHeader title={title} trailing={headerTrailing} /> : null);

  if (!scroll) {
    return (
      <View
        className={cn("flex-1 bg-main-bg", className)}
        style={{
          direction,
          paddingTop: title ? insets.paddingTop : top,
          paddingBottom: tabBarSpace,
          paddingLeft: left,
          paddingRight: right,
        }}
      >
        {header}
        {children}
      </View>
    );
  }

  const scrollView = (
    <ScrollView
      ref={scrollRef}
      className="flex-1 bg-main-bg"
      style={{ direction }}
      contentContainerStyle={title ? insets : { paddingBottom: tabBarSpace }}
      contentInsetAdjustmentBehavior={title ? "never" : "automatic"}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      <ContentColumn className={cn("gap-6 px-4 pt-4 pb-8", className)}>
        {header}
        {children}
      </ContentColumn>
    </ScrollView>
  );

  if (title) {
    return (
      <>
        {scrollView}
        <StatusBarBackdrop visible />
      </>
    );
  }

  return scrollView;
}
