package expo.modules.adhanalarm

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import org.json.JSONArray
import org.json.JSONObject

data class AdhanAlarm(
  val id: String,
  val at: Long,
  val prayer: String,
  val title: String,
  val body: String,
  val channelId: String,
  val sound: String,
  val soundUri: String,
  val channelName: String,
  val stopLabel: String
) {
  fun toJson(): JSONObject = JSONObject()
    .put("id", id)
    .put("at", at)
    .put("prayer", prayer)
    .put("title", title)
    .put("body", body)
    .put("channelId", channelId)
    .put("sound", sound)
    .put("soundUri", soundUri)
    .put("channelName", channelName)
    .put("stopLabel", stopLabel)

  companion object {
    fun fromJson(json: JSONObject) = AdhanAlarm(
      json.getString("id"),
      json.getLong("at"),
      json.getString("prayer"),
      json.getString("title"),
      json.getString("body"),
      json.getString("channelId"),
      json.optString("sound", "adhan_other"),
      json.optString("soundUri", ""),
      json.optString("channelName", json.getString("title")),
      json.optString("stopLabel", "Stop")
    )
  }
}

object AdhanStore {
  private const val PREFS = "adhan_alarm"
  private const val KEY = "alarms"
  const val EXTRA_PRAYER = "adhanPrayer"
  const val EXTRA_ID = "adhanId"
  const val EXTRA_AT = "adhanAt"
  const val EXTRA_NATIVE = "adhanNative"

  fun load(context: Context): List<AdhanAlarm> {
    val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null)
      ?: return emptyList()
    val array = JSONArray(raw)
    return (0 until array.length()).map { AdhanAlarm.fromJson(array.getJSONObject(it)) }
  }

  private fun save(context: Context, alarms: List<AdhanAlarm>) {
    val array = JSONArray()
    alarms.forEach { array.put(it.toJson()) }
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, array.toString()).apply()
  }

  private fun pending(context: Context, alarm: AdhanAlarm): PendingIntent {
    val intent = Intent(context, AdhanReceiver::class.java)
      .setAction("expo.modules.adhanalarm.FIRE")
      .putExtra(EXTRA_ID, alarm.id)
    return PendingIntent.getBroadcast(
      context,
      alarm.id.hashCode(),
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun arm(context: Context, alarm: AdhanAlarm) {
    val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val operation = pending(context, alarm)
    val exact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || manager.canScheduleExactAlarms()
    if (exact) {
      manager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, alarm.at, operation)
    } else {
      manager.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, alarm.at, operation)
    }
  }

  fun replace(context: Context, alarms: List<AdhanAlarm>) {
    val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val next = alarms.associateBy { it.id }
    load(context).forEach { old ->
      if (next[old.id] != old) manager.cancel(pending(context, old))
    }
    val now = System.currentTimeMillis()
    val upcoming = alarms.filter { it.at > now }
    upcoming.forEach { arm(context, it) }
    save(context, upcoming)
  }

  fun rearm(context: Context) {
    val now = System.currentTimeMillis()
    val upcoming = load(context).filter { it.at > now }
    upcoming.forEach { arm(context, it) }
    save(context, upcoming)
  }

  fun find(context: Context, id: String) = load(context).firstOrNull { it.id == id }
}
