import WidgetKit

struct PrayerEntry: TimelineEntry {
  let date: Date
  let payload: PrayerPayload?
}

struct PrayerTimeline: TimelineProvider {
  func placeholder(in context: Context) -> PrayerEntry {
    PrayerEntry(date: Date(), payload: nil)
  }

  func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
    completion(PrayerEntry(date: Date(), payload: PrayerPayload.load()))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
    let now = Date()
    let payload = PrayerPayload.load()
    let changes = (payload?.prayers ?? [])
      .map { $0.date.addingTimeInterval(1) }
      .filter { $0 > now }
      .sorted()
      .prefix(40)
    let entries = [PrayerEntry(date: now, payload: payload)]
      + changes.map { PrayerEntry(date: $0, payload: payload) }
    let refresh = changes.last ?? now.addingTimeInterval(6 * 60 * 60)
    completion(Timeline(entries: entries, policy: .after(refresh)))
  }
}
