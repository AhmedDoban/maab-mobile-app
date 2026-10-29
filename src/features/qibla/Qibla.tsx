import Screen from "@/components/ui/Screen";
import DeviceCenter from "@/components/ui/DeviceCenter";
import { useTranslation } from "react-i18next";
import { Linking } from "react-native";
import useQibla from "./_components/useQibla";
import QiblaLoading from "./_ui/QiblaLoading";
import QiblaMessage from "./_ui/QiblaMessage";
import QiblaView from "./_ui/QiblaView";

export default function Qibla() {
  const { t } = useTranslation(["common", "qibla"]);
  const {
    status,
    canAskAgain,
    city,
    heading,
    offset,
    aligned,
    accuracy,
    interference,
    bearing,
    distance,
    retry,
  } = useQibla();

  return (
    <Screen scroll={false} className="px-4">
      <DeviceCenter>
        {status === "loading" ? (
          <QiblaLoading />
        ) : status === "denied" ? (
          <QiblaMessage
            icon="location"
            title={t("qibla:permissionTitle")}
            hint={t("qibla:permissionHint")}
            action={t(canAskAgain ? "qibla:allow" : "qibla:openSettings")}
            onAction={canAskAgain ? retry : () => Linking.openSettings()}
          />
        ) : status === "error" || bearing === null || distance === null ? (
          <QiblaMessage
            icon="wifiOff"
            title={t("qibla:error")}
            hint={t("qibla:errorHint")}
            action={t("common:retry")}
            onAction={retry}
          />
        ) : (
          <QiblaView
            city={city}
            heading={heading}
            offset={offset}
            aligned={aligned}
            accuracy={accuracy}
            interference={interference}
            bearing={bearing}
            distance={distance}
          />
        )}
      </DeviceCenter>
    </Screen>
  );
}
