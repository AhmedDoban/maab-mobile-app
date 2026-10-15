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

private func symbol(_ prayer: WidgetPrayer) -> String {
  icons[prayer.icon] ?? "clock.fill"
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
        Image(systemName: "moon.stars")
          .font(.title2)
          .foregroundStyle(.white)
      }
    }
    .containerBackground(for: .widget) {
      if let payload = entry.payload {
        LinearGradient(
          colors: [Color(hex: payload.color), Color(hex: payload.deep)],
          startPoint: .topLeading,
          endPoint: .bottomTrailing
        )
      } else {
        Color("$widgetBackground")
      }
    }
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
      HStack(spacing: 4) {
        ForEach(payload.day(of: entry.date), id: \.at) { prayer in
          let isNext = prayer.at == next.at
          VStack(spacing: 3) {
            Image(systemName: symbol(prayer)).font(.caption)
            Text(prayer.label).font(.caption2).lineLimit(1).minimumScaleFactor(0.6)
            Text(prayer.time).font(.caption.bold()).minimumScaleFactor(0.7)
          }
          .frame(maxWidth: .infinity)
          .padding(.vertical, 6)
          .background(isNext ? Color.white.opacity(0.22) : Color.white.opacity(0.08))
          .clipShape(RoundedRectangle(cornerRadius: 10))
          .opacity(prayer.date < entry.date && !isNext ? 0.6 : 1)
        }
      }
    }
    .foregroundStyle(.white)
  }
}
