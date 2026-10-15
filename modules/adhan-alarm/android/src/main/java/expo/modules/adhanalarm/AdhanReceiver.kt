package expo.modules.adhanalarm

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

class AdhanReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val id = intent.getStringExtra(AdhanStore.EXTRA_ID) ?: return
    val alarm = AdhanStore.find(context, id) ?: return
    if (System.currentTimeMillis() - alarm.at > 10 * 60 * 1000) return

    val launch = context.packageManager.getLaunchIntentForPackage(context.packageName) ?: return
    launch
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
      .putExtra(AdhanStore.EXTRA_PRAYER, alarm.prayer)
      .putExtra(AdhanStore.EXTRA_ID, alarm.id)
      .putExtra(AdhanStore.EXTRA_AT, alarm.at)
    val listener = AdhanLaunch.listener
    if (AdhanLaunch.foreground && listener != null) {
      listener(Intent(launch))
      return
    }

    launch.putExtra(AdhanStore.EXTRA_NATIVE, true)
    val open = PendingIntent.getActivity(
      context,
      alarm.id.hashCode(),
      launch,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    try {
      ContextCompat.startForegroundService(
        context,
        Intent(context, AdhanService::class.java)
          .putExtra(AdhanStore.EXTRA_ID, alarm.id)
          .putExtra(AdhanService.EXTRA_ALARM, alarm.toJson().toString())
          .putExtra(AdhanService.EXTRA_OPEN, open)
      )
    } catch (_: Exception) {
      launch.putExtra(AdhanStore.EXTRA_NATIVE, false)
      fallback(
        context,
        alarm,
        PendingIntent.getActivity(
          context,
          alarm.id.hashCode(),
          launch,
          PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
      )
    }
  }

  private fun fallback(context: Context, alarm: AdhanAlarm, open: PendingIntent) {
    val icon = context.resources.getIdentifier("notification_icon", "drawable", context.packageName)
      .takeIf { it != 0 } ?: context.applicationInfo.icon
    val notification = NotificationCompat.Builder(context, alarm.channelId)
      .setSmallIcon(icon)
      .setContentTitle(alarm.title)
      .setContentText(alarm.body)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setAutoCancel(true)
      .setContentIntent(open)
      .setFullScreenIntent(open, true)
      .build()
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(alarm.id.hashCode(), notification)
  }
}
