package expo.modules.prayerwidgets

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

object WidgetScheduler {
  private const val REQUEST = 7301
  private const val TICK_MS = 15 * 60 * 1000L
  private const val MINUTE_MS = 60 * 1000L

  private fun intent(context: Context) = PendingIntent.getBroadcast(
    context,
    REQUEST,
    Intent(context, WidgetRefreshReceiver::class.java),
    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
  )

  fun schedule(context: Context, payload: WidgetPayload?, now: Long, everyMinute: Boolean) {
    val midnight = Calendar.getInstance().apply {
      timeInMillis = now
      add(Calendar.DAY_OF_YEAR, 1)
      set(Calendar.HOUR_OF_DAY, 0)
      set(Calendar.MINUTE, 0)
      set(Calendar.SECOND, 5)
      set(Calendar.MILLISECOND, 0)
    }.timeInMillis
    val next = listOfNotNull(
      payload?.next(now)?.at,
      payload?.prayers?.firstOrNull { it.icon == "fajr" && it.at > now }?.at,
      payload?.prayers?.firstOrNull { it.icon == "maghrib" && it.at > now }?.at,
    ).minOrNull()?.plus(1000)
    val minute = (now / MINUTE_MS + 1) * MINUTE_MS + 500
    val tick = if (everyMinute && payload != null) minute else now + TICK_MS
    val at = minOf(next ?: midnight, midnight, tick)
    val alarms = context.getSystemService(AlarmManager::class.java) ?: return
    val canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarms.canScheduleExactAlarms()
    when {
      at == minute && canExact -> alarms.setExact(AlarmManager.RTC, at, intent(context))
      at == tick -> alarms.setAndAllowWhileIdle(AlarmManager.RTC, at, intent(context))
      canExact -> alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, intent(context))
      else -> alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, intent(context))
    }
  }

  fun cancel(context: Context) {
    context.getSystemService(AlarmManager::class.java)?.cancel(intent(context))
  }
}
