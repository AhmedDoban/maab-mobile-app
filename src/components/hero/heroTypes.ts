import type { IconKey } from "@/components/ui/Icon";

export type HeroSearch = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
};

export type HeroAction = {
  icon: IconKey;
  label: string;
  onPress: () => void;
};

export type HeroBar = {
  title: string;
  subtitle?: string;
  search?: HeroSearch;
  action?: HeroAction;
};
