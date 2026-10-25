import SwiftUI
import WidgetKit

private let modernIcons: [String: String] = [
  "fajr": "moon.stars.fill",
  "sunrise": "sunrise.fill",
  "dhuhr": "sun.max.fill",
  "asr": "sun.haze.fill",
  "maghrib": "sunset.fill",
  "isha": "moon.fill",
]

private func modernSymbol(_ prayer: WidgetPrayer) -> String {
  modernIcons[prayer.icon] ?? "clock.fill"
}

struct ModernPrayerWidgetView: View {
  @Environment(\.widgetFamily) private var family
  let entry: PrayerEntry

  var body: some View {
    Group {
      if let payload = entry.payload, let next = payload.next(after: entry.date) {
        content(payload: payload, next: next, accent: Color(hex: payload.color))
          .environment(\.layoutDirection, payload.rtl ? .rightToLeft : .leftToRight)
      } else {
        Text("widget.openApp")
          .font(.caption)
          .multilineTextAlignment(.center)
          .foregroundStyle(.secondary)
      }
    }
    .containerBackground(for: .widget) {
      Color(uiColor: .systemBackground)
    }
  }

  @ViewBuilder
  private func content(payload: PrayerPayload, next: WidgetPrayer, accent: Color) -> some View {
    switch family {
    case .systemSmall:
      VStack(alignment: .leading, spacing: 6) {
        badge(next: next, accent: accent, size: 34)
        Text(next.label).font(.subheadline.bold()).foregroundStyle(.primary)
        Text(next.time).font(.title.bold()).foregroundStyle(accent)
        Spacer(minLength: 0)
        Text(next.date, style: .timer)
          .font(.subheadline.bold().monospacedDigit())
          .foregroundStyle(.primary)
      }
      .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
    case .systemLarge:
      VStack(spacing: 12) {
        header(payload: payload, next: next, accent: accent)
        Divider()
        VStack(spacing: 4) {
          ForEach(payload.day(of: entry.date), id: \.at) { prayer in
            let isNext = prayer.at == next.at
            HStack(spacing: 10) {
              Image(systemName: modernSymbol(prayer))
                .foregroundStyle(isNext ? .white : accent)
                .frame(width: 22)
              Text(prayer.label).font(.subheadline.bold())
              Spacer(minLength: 0)
              Text(prayer.time).font(.subheadline.monospacedDigit())
            }
            .foregroundStyle(isNext ? .white : .primary)
            .padding(.horizontal, 12)
            .frame(maxHeight: .infinity)
            .background(isNext ? accent : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .opacity(prayer.date < entry.date && !isNext ? 0.55 : 1)
          }
        }
      }
    default:
      VStack(spacing: 10) {
        header(payload: payload, next: next, accent: accent)
        HStack(spacing: 4) {
          ForEach(payload.day(of: entry.date), id: \.at) { prayer in
            let isNext = prayer.at == next.at
            VStack(spacing: 3) {
              Image(systemName: modernSymbol(prayer))
                .font(.caption)
                .foregroundStyle(isNext ? .white : accent)
              Text(prayer.label).font(.caption2.bold()).lineLimit(1).minimumScaleFactor(0.6)
              Text(prayer.time).font(.caption2).minimumScaleFactor(0.7)
            }
            .foregroundStyle(isNext ? .white : .primary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 6)
            .background(isNext ? accent : Color.clear)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .opacity(prayer.date < entry.date && !isNext ? 0.55 : 1)
          }
        }
      }
    }
  }

  private func badge(next: WidgetPrayer, accent: Color, size: CGFloat) -> some View {
    Image(systemName: modernSymbol(next))
      .font(.system(size: size * 0.45))
      .foregroundStyle(.white)
      .frame(width: size, height: size)
      .background(accent)
      .clipShape(Circle())
  }

  private func header(payload: PrayerPayload, next: WidgetPrayer, accent: Color) -> some View {
    HStack(spacing: 10) {
      badge(next: next, accent: accent, size: 38)
      VStack(alignment: .leading, spacing: 0) {
        Text(next.label).font(.caption.bold()).foregroundStyle(.primary)
        Text(next.time).font(.title2.bold()).foregroundStyle(accent)
      }
      Divider().frame(height: 32)
      VStack(spacing: 1) {
        Text(payload.leftTitle).font(.caption2).foregroundStyle(.secondary)
        Text(next.date, style: .timer)
          .font(.subheadline.bold().monospacedDigit())
          .foregroundStyle(.primary)
          .multilineTextAlignment(.center)
      }
      .frame(maxWidth: 70)
      Spacer(minLength: 0)
      VStack(alignment: .trailing, spacing: 1) {
        if !payload.city.isEmpty {
          Text(payload.city).font(.caption2).foregroundStyle(.secondary)
        }
        if let date = payload.dateText(at: entry.date) {
          Text(date)
            .font(.caption2)
            .foregroundStyle(.secondary)
            .multilineTextAlignment(.trailing)
            .lineLimit(2)
        }
      }
    }
  }
}
