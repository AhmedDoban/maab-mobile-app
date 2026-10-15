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
      .accessoryRectangular,
      .accessoryCircular,
      .accessoryInline,
    ])
  }
}

@main
struct MaabWidgets: WidgetBundle {
  var body: some Widget {
    NextPrayerWidget()
  }
}
