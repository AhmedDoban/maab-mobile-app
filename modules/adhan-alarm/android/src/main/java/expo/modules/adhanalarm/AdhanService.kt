package expo.modules.adhanalarm

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import org.json.JSONObject

class AdhanService : Service() {
  private var player: MediaPlayer? = null
  private var current: AdhanAlarm? = null

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.action == ACTION_STOP) {
      finish()
      return START_NOT_STICKY
    }
    val alarm = intent?.getStringExtra(EXTRA_ALARM)
      ?.let { runCatching { AdhanAlarm.fromJson(JSONObject(it)) }.getOrNull() }
      ?: intent?.getStringExtra(AdhanStore.EXTRA_ID)?.let { AdhanStore.find(this, it) }
    val open = intent?.getParcelableExtraCompat<PendingIntent>(EXTRA_OPEN)
    if (alarm == null || open == null) {
      stopSelf()
      return START_NOT_STICKY
    }
    player?.release()
    current = alarm
    ServiceCompat.startForeground(
      this,
      alarm.id.hashCode(),
      notification(alarm, open),
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
      } else {
        0
      }
    )
    play(alarm)
    return START_NOT_STICKY
  }

  override fun onDestroy() {
    player?.release()
    player = null
    super.onDestroy()
  }

  private fun play(alarm: AdhanAlarm) {
    val next = MediaPlayer()
    player = next
    try {
      next.setAudioAttributes(
        AudioAttributes.Builder()
          .setUsage(AudioAttributes.USAGE_ALARM)
          .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
          .build()
      )
      if (!source(next, alarm)) {
        finish()
        return
      }
      next.setOnCompletionListener { finish() }
      next.setOnErrorListener { _, _, _ ->
        finish()
        true
      }
      next.setOnPreparedListener { it.start() }
      next.prepareAsync()
    } catch (_: Exception) {
      finish()
    }
  }

  private fun source(target: MediaPlayer, alarm: AdhanAlarm): Boolean {
    if (alarm.soundUri.isNotEmpty()) {
      try {
        target.setDataSource(this, Uri.parse(alarm.soundUri))
        return true
      } catch (_: Exception) {
        target.reset()
        target.setAudioAttributes(
          AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_ALARM)
            .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
            .build()
        )
      }
    }
    val res = resources.getIdentifier(alarm.sound, "raw", packageName).takeIf { it != 0 }
      ?: resources.getIdentifier(DEFAULT_SOUND, "raw", packageName).takeIf { it != 0 }
      ?: return false
    resources.openRawResourceFd(res).use {
      target.setDataSource(it.fileDescriptor, it.startOffset, it.length)
    }
    return true
  }

  private fun finish() {
    player?.release()
    player = null
    val alarm = current
    current = null
    ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
    alarm?.let {
      (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(it.id.hashCode())
    }
    stopSelf()
    AdhanLaunch.finished(alarm?.id)
  }

  private fun notification(alarm: AdhanAlarm, open: PendingIntent) =
    NotificationCompat.Builder(this, channel(this, alarm.channelName))
      .setSmallIcon(
        resources.getIdentifier("notification_icon", "drawable", packageName)
          .takeIf { it != 0 } ?: applicationInfo.icon
      )
      .setContentTitle(alarm.title)
      .setContentText(alarm.body)
      .setCategory(NotificationCompat.CATEGORY_ALARM)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
      .setOngoing(true)
      .setSilent(true)
      .setContentIntent(open)
      .setFullScreenIntent(open, true)
      .setDeleteIntent(stopIntent(this))
      .addAction(0, alarm.stopLabel, stopIntent(this))
      .build()

  companion object {
    const val ACTION_STOP = "expo.modules.adhanalarm.STOP"
    const val EXTRA_OPEN = "adhanOpen"
    const val EXTRA_ALARM = "adhanAlarm"
    private const val CHANNEL = "adhan_playback"
    private const val DEFAULT_SOUND = "adhan_other"

    fun stopIntent(context: Context): PendingIntent = PendingIntent.getService(
      context,
      0,
      Intent(context, AdhanService::class.java).setAction(ACTION_STOP),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    fun stop(context: Context) {
      try {
        context.startService(Intent(context, AdhanService::class.java).setAction(ACTION_STOP))
      } catch (_: Exception) {
      }
    }

    private fun channel(context: Context, name: String): String {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
        val manager = context.getSystemService(NotificationManager::class.java)
        manager?.createNotificationChannel(
          NotificationChannel(CHANNEL, name, NotificationManager.IMPORTANCE_HIGH).apply {
            setSound(null, null)
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 400, 200, 400)
            lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
          }
        )
      }
      return CHANNEL
    }
  }
}

@Suppress("DEPRECATION")
private inline fun <reified T : android.os.Parcelable> Intent.getParcelableExtraCompat(key: String): T? =
  if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
    getParcelableExtra(key, T::class.java)
  } else {
    getParcelableExtra(key)
  }
