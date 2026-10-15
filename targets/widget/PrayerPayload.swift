import Foundation
import SwiftUI

let appGroup = "group.com.ahmeddoban.maab"

struct WidgetPrayer: Decodable {
  let label: String
  let at: Double
  let time: String
  let icon: String

  var date: Date { Date(timeIntervalSince1970: at / 1000) }
}

struct PrayerPayload: Decodable {
  let rtl: Bool
  let color: String
  let deep: String
  let nextTitle: String
  let leftTitle: String
  let city: String
  let prayers: [WidgetPrayer]

  static func load() -> PrayerPayload? {
    guard
      let raw = UserDefaults(suiteName: appGroup)?.string(forKey: "payload"),
      let data = raw.data(using: .utf8)
    else { return nil }
    return try? JSONDecoder().decode(PrayerPayload.self, from: data)
  }

  func next(after date: Date) -> WidgetPrayer? {
    prayers.sorted { $0.at < $1.at }.first { $0.date > date }
  }

  func day(of date: Date) -> [WidgetPrayer] {
    let calendar = Calendar.current
    let sorted = prayers.sorted { $0.at < $1.at }
    let today = sorted.filter { calendar.isDate($0.date, inSameDayAs: date) }
    if today.contains(where: { $0.date > date }) { return today }
    guard let upcoming = next(after: date) else { return today }
    return sorted.filter { calendar.isDate($0.date, inSameDayAs: upcoming.date) }
  }
}

extension Color {
  init(hex: String) {
    var value: UInt64 = 0
    Scanner(string: hex.replacingOccurrences(of: "#", with: "")).scanHexInt64(&value)
    self.init(
      red: Double((value >> 16) & 0xFF) / 255,
      green: Double((value >> 8) & 0xFF) / 255,
      blue: Double(value & 0xFF) / 255
    )
  }
}
