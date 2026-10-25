import WidgetKit

struct PrayerEntry: TimelineEntry {
  let date: Date
  let payload: PrayerPayload?
}

struct PrayerTimeline: TimelineProvider {
  func placeholder(in context: Context) -> PrayerEntry {
    PrayerEntry(date: Date(), payload: PrayerPayload.sample())
  }

  func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
    let now = Date()
    let saved = context.isPreview ? nil : PrayerPayload.load()
    completion(PrayerEntry(date: now, payload: saved ?? PrayerPayload.sample(now: now)))
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
    let now = Date()
    let payload = PrayerPayload.load()
    let changes = (payload?.prayers ?? [])
      .map { $0.date.addingTimeInterval(1) }
      .filter { $0 > now }
      .sorted()
      .prefix(40)
    let midnight = Calendar.current.startOfDay(for: now.addingTimeInterval(24 * 60 * 60))
    let entries = [PrayerEntry(date: now, payload: payload)]
      + changes.map { PrayerEntry(date: $0, payload: payload) }
      + [PrayerEntry(date: midnight, payload: payload)]
    let refresh = changes.last ?? now.addingTimeInterval(6 * 60 * 60)
    completion(
      Timeline(entries: entries.sorted { $0.date < $1.date }, policy: .after(max(refresh, midnight)))
    )
  }
}
