import ExpoModulesCore
import WidgetKit

public class PrayerWidgetsModule: Module {
  static let appGroup = "group.com.ahmeddoban.maab"
  static let key = "payload"

  public func definition() -> ModuleDefinition {
    Name("PrayerWidgets")

    Function("update") { (payload: String) in
      UserDefaults(suiteName: PrayerWidgetsModule.appGroup)?.set(payload, forKey: PrayerWidgetsModule.key)
      WidgetCenter.shared.reloadAllTimelines()
    }
  }
}
