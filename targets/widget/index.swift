import SwiftUI
import WidgetKit

struct NextPrayerWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "NextPrayerWidget", provider: PrayerTimeline()) { entry in
      PrayerWidgetView(entry: entry)
    }
    .configurationDisplayName("widget.name")
    .description("widget.description")
    .supportedFamilies([
      .systemSmall,
      .systemMedium,
      .systemLarge,
      .accessoryRectangular,
      .accessoryCircular,
      .accessoryInline,
    ])
  }
}

struct PrayerTimesWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "PrayerTimesWidget", provider: PrayerTimeline()) { entry in
      PrayerTimesWidgetView(entry: entry)
    }
    .configurationDisplayName("widget.times.name")
    .description("widget.times.description")
    .supportedFamilies([.systemMedium, .systemLarge])
  }
}

struct DhikrWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "DhikrWidget", provider: PrayerTimeline()) { entry in
      DhikrWidgetView(entry: entry)
    }
    .configurationDisplayName("widget.dhikr.name")
    .description("widget.dhikr.description")
    .supportedFamilies([
      .systemSmall,
      .systemMedium,
      .accessoryRectangular,
      .accessoryInline,
    ])
  }
}

struct ModernPrayerWidget: Widget {
  var body: some WidgetConfiguration {
    StaticConfiguration(kind: "ModernPrayerWidget", provider: PrayerTimeline()) { entry in
      ModernPrayerWidgetView(entry: entry)
    }
    .configurationDisplayName("widget.modern.name")
    .description("widget.modern.description")
    .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
  }
}

@main
struct MaabWidgets: WidgetBundle {
  var body: some Widget {
    NextPrayerWidget()
    PrayerTimesWidget()
    DhikrWidget()
    ModernPrayerWidget()
  }
}
