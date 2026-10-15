package expo.modules.prayerwidgets

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

object LockScreenPrayer {
  private const val CHANNEL = "next_prayer"
  private const val ID = 7302

  fun update(context: Context, payload: WidgetPayload?, now: Long) {
    val next = payload?.next(now)
    if (payload == null || !payload.lockScreen || next == null) {
      cancel(context)
      return
    }
    val manager = NotificationManagerCompat.from(context)
    if (!manager.areNotificationsEnabled()) return
    ensureChannel(context, payload.lockChannel)
    val icon = context.resources.getIdentifier("notification_icon", "drawable", context.packageName)
      .takeIf { it != 0 } ?: android.R.drawable.ic_lock_idle_alarm
    val notification = NotificationCompat.Builder(context, CHANNEL)
      .setSmallIcon(icon)
      .setColor(payload.color)
      .setContentTitle("${next.label} · ${next.time}")
      .setContentText(listOf(payload.nextTitle, payload.city).filter { it.isNotBlank() }.joinToString(" · "))
      .setWhen(next.at)
      .setShowWhen(true)
      .setUsesChronometer(true)
      .setChronometerCountDown(true)
      .setOngoing(true)
      .setOnlyAlertOnce(true)
      .setSilent(true)
      .setCategory(NotificationCompat.CATEGORY_STATUS)
      .setPriority(NotificationCompat.PRIORITY_LOW)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setContentIntent(openApp(context))
      .build()
    try {
      manager.notify(ID, notification)
    } catch (_: SecurityException) {
    }
  }

  fun cancel(context: Context) {
    NotificationManagerCompat.from(context).cancel(ID)
  }

  private fun ensureChannel(context: Context, name: String) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(NotificationManager::class.java) ?: return
    val channel = NotificationChannel(CHANNEL, name, NotificationManager.IMPORTANCE_LOW).apply {
      setShowBadge(false)
      lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
      setSound(null, null)
      enableVibration(false)
    }
    manager.createNotificationChannel(channel)
  }

  private fun openApp(context: Context): PendingIntent {
    val intent = context.packageManager.getLaunchIntentForPackage(context.packageName)
      ?: Intent().setPackage(context.packageName)
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return PendingIntent.getActivity(
      context,
      ID,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }
}
