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

struct WidgetDate: Decodable {
  let at: Double
  let text: String
}

struct PrayerPayload: Decodable {
  let rtl: Bool
  let color: String
  let deep: String
  let nextTitle: String
  let leftTitle: String
  let city: String
  let prayers: [WidgetPrayer]
  var todayTitle: String?
  var dhikrTitle: String?
  var dhikr: [String]?
  var dates: [WidgetDate]?

  static func load() -> PrayerPayload? {
    guard
      let raw = UserDefaults(suiteName: appGroup)?.string(forKey: "payload"),
      let data = raw.data(using: .utf8)
    else { return nil }
    return try? JSONDecoder().decode(PrayerPayload.self, from: data)
  }

  static func sample(now: Date = Date()) -> PrayerPayload {
    let arabic = Locale.preferredLanguages.first?.hasPrefix("ar") ?? false
    let names = arabic
      ? ["الفجر", "الظهر", "العصر", "المغرب", "العشاء"]
      : ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]
    let icons = ["fajr", "dhuhr", "asr", "maghrib", "isha"]
    let offsets: [Double] = [-600, -200, 84, 230, 307]
    let formatter = DateFormatter()
    formatter.dateFormat = "h:mm"
    formatter.locale = Locale(identifier: "en_US_POSIX")
    let prayers = (0..<5).map { index -> WidgetPrayer in
      let date = now.addingTimeInterval(offsets[index] * 60)
      return WidgetPrayer(
        label: names[index],
        at: date.timeIntervalSince1970 * 1000,
        time: formatter.string(from: date),
        icon: icons[index]
      )
    }
    return PrayerPayload(
      rtl: arabic,
      color: "#18766F",
      deep: "#0B3A36",
      nextTitle: arabic ? "الصلاة القادمة" : "Next prayer",
      leftTitle: arabic ? "متبقي" : "Left",
      city: arabic ? "القاهرة" : "Cairo",
      prayers: prayers,
      todayTitle: arabic ? "مواقيت الصلاة" : "Prayer times",
      dhikrTitle: arabic ? "ذكر اليوم" : "Dhikr of the day",
      dhikr: [
        arabic
          ? "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ"
          : "I seek forgiveness from Allah and turn to Him in repentance"
      ],
      dates: [
        WidgetDate(
          at: now.addingTimeInterval(-3600).timeIntervalSince1970 * 1000,
          text: arabic ? "الأربعاء، 3 جمادى الأولى 1448" : "Wednesday, 3 Jumada al-Ula 1448"
        )
      ]
    )
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

  func dateText(at date: Date) -> String? {
    let ms = date.timeIntervalSince1970 * 1000
    return (dates ?? []).sorted { $0.at < $1.at }.last { $0.at <= ms }?.text
  }

  func dhikr(at date: Date) -> String? {
    guard let list = dhikr, !list.isEmpty else { return nil }
    let day = Calendar.current.ordinality(of: .day, in: .year, for: date) ?? 0
    return list[day % list.count]
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
