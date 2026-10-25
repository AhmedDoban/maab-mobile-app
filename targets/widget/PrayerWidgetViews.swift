import SwiftUI
import WidgetKit

private let icons: [String: String] = [
  "fajr": "moon.stars.fill",
  "sunrise": "sunrise.fill",
  "dhuhr": "sun.max.fill",
  "asr": "sun.haze.fill",
  "maghrib": "sunset.fill",
  "isha": "moon.fill",
]

private let mint = Color(red: 0.875, green: 0.953, blue: 0.918)
private let ink = Color(red: 0.055, green: 0.227, blue: 0.2)

private func symbol(_ prayer: WidgetPrayer) -> String {
  icons[prayer.icon] ?? "clock.fill"
}

private struct WidgetBackground: ViewModifier {
  let payload: PrayerPayload?
  var solid = false

  func body(content: Content) -> some View {
    content.containerBackground(for: .widget) {
      if let payload {
        if solid {
          Color(hex: payload.deep)
        } else {
          LinearGradient(
            colors: [Color(hex: payload.color), Color(hex: payload.deep)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
          )
        }
      } else {
        Color("$widgetBackground")
      }
    }
  }
}

private struct OpenAppHint: View {
  var body: some View {
    VStack(spacing: 6) {
      Image(systemName: "moon.stars").font(.title2)
      Text("widget.openApp")
        .font(.caption)
        .multilineTextAlignment(.center)
    }
    .foregroundStyle(.white)
  }
}

private struct PrayerList: View {
  let payload: PrayerPayload
  let next: WidgetPrayer
  let now: Date

  var body: some View {
    VStack(spacing: 4) {
      ForEach(payload.day(of: now), id: \.at) { prayer in
        let isNext = prayer.at == next.at
        HStack(spacing: 10) {
          Image(systemName: symbol(prayer)).font(.subheadline).frame(width: 22)
          Text(prayer.label).font(.subheadline)
          Spacer(minLength: 0)
          Text(prayer.time).font(.subheadline.bold().monospacedDigit())
        }
        .foregroundStyle(isNext ? ink : .white)
        .padding(.horizontal, 12)
        .frame(maxHeight: .infinity)
        .background(isNext ? mint : Color.clear)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .opacity(prayer.date < now && !isNext ? 0.55 : 1)
      }
    }
  }
}

private struct PrayerTiles: View {
  let payload: PrayerPayload
  let next: WidgetPrayer
  let now: Date

  var body: some View {
    HStack(spacing: 4) {
      ForEach(payload.day(of: now), id: \.at) { prayer in
        let isNext = prayer.at == next.at
        VStack(spacing: 3) {
          Image(systemName: symbol(prayer)).font(.caption)
          Text(prayer.label).font(.caption2).lineLimit(1).minimumScaleFactor(0.6)
          Text(prayer.time).font(.caption.bold()).minimumScaleFactor(0.7)
        }
        .foregroundStyle(isNext ? ink : .white)
        .frame(maxWidth: .infinity)
        .padding(.vertical, 6)
        .background(isNext ? mint : Color.white.opacity(0.1))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .opacity(prayer.date < now && !isNext ? 0.6 : 1)
      }
    }
  }
}

struct PrayerWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: PrayerEntry

  var body: some View {
    Group {
      if let payload = entry.payload, let next = payload.next(after: entry.date) {
        content(payload: payload, next: next)
          .environment(\.layoutDirection, payload.rtl ? .rightToLeft : .leftToRight)
      } else {
        OpenAppHint()
      }
    }
    .modifier(WidgetBackground(payload: entry.payload))
  }

  @ViewBuilder
  private func content(payload: PrayerPayload, next: WidgetPrayer) -> some View {
    switch family {
    case .accessoryInline:
      Text("\(next.label) \(next.time) · \(next.date, style: .timer)")
    case .accessoryCircular:
      VStack(spacing: 1) {
        Image(systemName: symbol(next)).font(.caption)
        Text(next.time).font(.system(size: 13, weight: .bold)).minimumScaleFactor(0.6)
        Text(next.date, style: .timer)
          .font(.system(size: 9))
          .multilineTextAlignment(.center)
          .minimumScaleFactor(0.5)
      }
    case .accessoryRectangular:
      VStack(alignment: .leading, spacing: 1) {
        Label(payload.nextTitle, systemImage: symbol(next)).font(.caption2)
        Text("\(next.label) · \(next.time)").font(.headline).lineLimit(1)
        Text(next.date, style: .timer).font(.caption).monospacedDigit()
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    case .systemLarge:
      large(payload: payload, next: next)
    case .systemMedium:
      medium(payload: payload, next: next)
    default:
      small(payload: payload, next: next)
    }
  }

  private func small(payload: PrayerPayload, next: WidgetPrayer) -> some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(payload.nextTitle).font(.caption2).opacity(0.8)
      HStack(spacing: 6) {
        Image(systemName: symbol(next))
        Text(next.label).font(.title3.bold()).lineLimit(1).minimumScaleFactor(0.7)
      }
      Text(next.time).font(.title2.bold())
      Spacer(minLength: 0)
      Text(next.date, style: .timer).font(.subheadline.monospacedDigit()).opacity(0.9)
      if !payload.city.isEmpty {
        Text(payload.city).font(.caption2).opacity(0.7).lineLimit(1)
      }
    }
    .foregroundStyle(.white)
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
  }

  private func medium(payload: PrayerPayload, next: WidgetPrayer) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(alignment: .firstTextBaseline) {
        VStack(alignment: .leading, spacing: 2) {
          Text(payload.nextTitle).font(.caption2).opacity(0.8)
          Text("\(next.label) · \(next.time)").font(.headline).lineLimit(1)
        }
        Spacer()
        Text(next.date, style: .timer)
          .font(.title3.bold().monospacedDigit())
          .multilineTextAlignment(.trailing)
      }
      PrayerTiles(payload: payload, next: next, now: entry.date)
    }
    .foregroundStyle(.white)
  }

  private func large(payload: PrayerPayload, next: WidgetPrayer) -> some View {
    VStack(spacing: 8) {
      VStack(spacing: 2) {
        Text(payload.nextTitle).font(.caption).opacity(0.8)
        Text("\(next.label) · \(next.time)").font(.title2.bold()).lineLimit(1)
        Text(next.date, style: .timer)
          .font(.subheadline.bold().monospacedDigit())
          .foregroundStyle(ink)
          .padding(.horizontal, 12)
          .padding(.vertical, 3)
          .background(mint)
          .clipShape(Capsule())
        if let date = payload.dateText(at: entry.date) {
          Text(payload.city.isEmpty ? date : "\(date) · \(payload.city)")
            .font(.caption)
            .opacity(0.8)
            .lineLimit(1)
        }
      }
      .multilineTextAlignment(.center)
      PrayerList(payload: payload, next: next, now: entry.date)
    }
    .foregroundStyle(.white)
  }
}

struct PrayerTimesWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: PrayerEntry

  var body: some View {
    Group {
      if let payload = entry.payload, let next = payload.next(after: entry.date) {
        content(payload: payload, next: next)
          .environment(\.layoutDirection, payload.rtl ? .rightToLeft : .leftToRight)
      } else {
        OpenAppHint()
      }
    }
    .modifier(WidgetBackground(payload: entry.payload))
  }

  private func content(payload: PrayerPayload, next: WidgetPrayer) -> some View {
    VStack(alignment: .leading, spacing: 8) {
      HStack(alignment: .center) {
        VStack(alignment: .leading, spacing: 2) {
          Text(payload.todayTitle ?? payload.nextTitle).font(.headline)
          if !payload.city.isEmpty {
            Label(payload.city, systemImage: "location").font(.caption2).opacity(0.8)
          }
        }
        Spacer(minLength: 4)
        HStack(spacing: 4) {
          Text(next.label)
          Text(next.date, style: .timer).monospacedDigit()
        }
        .font(.caption.bold())
        .foregroundStyle(ink)
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(mint)
        .clipShape(Capsule())
      }
      if family == .systemLarge {
        if let date = payload.dateText(at: entry.date) {
          Text(date).font(.caption).opacity(0.8)
        }
        PrayerList(payload: payload, next: next, now: entry.date)
      } else {
        PrayerTiles(payload: payload, next: next, now: entry.date)
      }
    }
    .foregroundStyle(.white)
  }
}

struct DhikrWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: PrayerEntry

  var body: some View {
    Group {
      if let payload = entry.payload, let text = payload.dhikr(at: entry.date) {
        content(payload: payload, text: text)
          .environment(\.layoutDirection, payload.rtl ? .rightToLeft : .leftToRight)
      } else {
        OpenAppHint()
      }
    }
    .modifier(WidgetBackground(payload: entry.payload, solid: true))
  }

  @ViewBuilder
  private func content(payload: PrayerPayload, text: String) -> some View {
    switch family {
    case .accessoryInline:
      Text(text)
    case .accessoryRectangular:
      VStack(alignment: .leading, spacing: 1) {
        Text(payload.dhikrTitle ?? "").font(.caption2)
        Text(text).font(.caption.bold()).lineLimit(3).minimumScaleFactor(0.7)
      }
      .frame(maxWidth: .infinity, alignment: .leading)
    default:
      VStack(spacing: 6) {
        Text(payload.dhikrTitle ?? "").font(.caption).opacity(0.8)
        Text(text)
          .font(family == .systemSmall ? .subheadline.bold() : .title3.bold())
          .multilineTextAlignment(.center)
          .minimumScaleFactor(0.6)
      }
      .foregroundStyle(.white)
      .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
  }
}
