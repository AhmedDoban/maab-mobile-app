package expo.modules.prayerwidgets

import android.content.Context
import android.graphics.Color
import org.json.JSONObject
import java.util.Calendar

data class WidgetPrayer(val label: String, val at: Long, val time: String, val icon: String)

data class WidgetDate(val at: Long, val text: String)

data class WidgetPayload(
  val color: Int,
  val mid: Int,
  val deep: Int,
  val rtl: Boolean,
  val leftTitle: String,
  val hourUnit: String,
  val minuteUnit: String,
  val nextTitle: String,
  val todayTitle: String,
  val dhikrTitle: String,
  val city: String,
  val prayers: List<WidgetPrayer>,
  val dhikr: List<String>,
  val dates: List<WidgetDate>,
  val lockScreen: Boolean,
  val lockChannel: String
) {
  fun next(now: Long) = prayers.firstOrNull { it.at > now }

  fun previous(now: Long) = prayers.lastOrNull { it.at <= now }

  fun progress(now: Long): Float {
    val next = next(now) ?: return 0f
    val previous = previous(now) ?: return 0f
    val span = (next.at - previous.at).coerceAtLeast(1L)
    return ((now - previous.at).toFloat() / span).coerceIn(0f, 1f)
  }

  fun minutesLeft(now: Long): Int {
    val next = next(now) ?: return 0
    return (next.at / 60000L - now / 60000L).toInt().coerceAtLeast(0)
  }

  fun dateOf(now: Long) = dates.lastOrNull { it.at <= now }?.text ?: ""

  fun day(now: Long): List<WidgetPrayer> {
    val today = prayers.filter { sameDay(it.at, now) }
    if (today.any { it.at > now }) return today
    val next = next(now) ?: return today
    return prayers.filter { sameDay(it.at, next.at) }
  }

  fun dhikrOf(now: Long): String? {
    if (dhikr.isEmpty()) return null
    val day = Calendar.getInstance().apply { timeInMillis = now }.get(Calendar.DAY_OF_YEAR)
    return dhikr[day % dhikr.size]
  }

  companion object {
    private fun sameDay(a: Long, b: Long): Boolean {
      val x = Calendar.getInstance().apply { timeInMillis = a }
      val y = Calendar.getInstance().apply { timeInMillis = b }
      return x.get(Calendar.YEAR) == y.get(Calendar.YEAR) &&
        x.get(Calendar.DAY_OF_YEAR) == y.get(Calendar.DAY_OF_YEAR)
    }

    fun parse(raw: String): WidgetPayload {
      val json = JSONObject(raw)
      val prayers = json.getJSONArray("prayers")
      val dhikr = json.getJSONArray("dhikr")
      val dates = json.optJSONArray("dates")
      return WidgetPayload(
        color = Color.parseColor(json.getString("color")),
        mid = Color.parseColor(json.optString("mid", json.getString("color"))),
        deep = Color.parseColor(json.getString("deep")),
        rtl = json.optBoolean("rtl"),
        leftTitle = json.optString("leftTitle"),
        hourUnit = json.optString("hourUnit"),
        minuteUnit = json.optString("minuteUnit"),
        nextTitle = json.getString("nextTitle"),
        todayTitle = json.getString("todayTitle"),
        dhikrTitle = json.getString("dhikrTitle"),
        city = json.optString("city"),
        prayers = (0 until prayers.length()).map {
          val item = prayers.getJSONObject(it)
          WidgetPrayer(
            item.getString("label"),
            item.getLong("at"),
            item.getString("time"),
            item.optString("icon")
          )
        }.sortedBy { it.at },
        dhikr = (0 until dhikr.length()).map { dhikr.getString(it) },
        dates = if (dates == null) emptyList() else (0 until dates.length()).map {
          val item = dates.getJSONObject(it)
          WidgetDate(item.getLong("at"), item.getString("text"))
        }.sortedBy { it.at },
        lockScreen = json.optBoolean("lockScreen"),
        lockChannel = json.optString("lockChannel", json.getString("nextTitle"))
      )
    }
  }
}

object WidgetStore {
  private const val PREFS = "maab_widgets"
  private const val KEY = "payload"

  fun save(context: Context, raw: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, raw).apply()
  }

  fun load(context: Context): WidgetPayload? {
    val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null)
      ?: return null
    return try {
      WidgetPayload.parse(raw)
    } catch (error: Exception) {
      null
    }
  }
}
