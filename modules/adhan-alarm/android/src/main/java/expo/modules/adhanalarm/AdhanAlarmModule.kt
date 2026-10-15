package expo.modules.adhanalarm

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class AlarmRecord : Record {
  @Field var id: String = ""
  @Field var at: Double = 0.0
  @Field var prayer: String = ""
  @Field var title: String = ""
  @Field var body: String = ""
  @Field var channelId: String = ""
  @Field var sound: String = ""
  @Field var soundUri: String = ""
  @Field var channelName: String = ""
  @Field var stopLabel: String = ""
}

class AdhanAlarmModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext)

  private fun payload(intent: Intent) = mapOf(
    "prayer" to intent.getStringExtra(AdhanStore.EXTRA_PRAYER),
    "id" to intent.getStringExtra(AdhanStore.EXTRA_ID),
    "at" to intent.getLongExtra(AdhanStore.EXTRA_AT, 0L).toDouble(),
    "native" to intent.getBooleanExtra(AdhanStore.EXTRA_NATIVE, false)
  )

  override fun definition() = ModuleDefinition {
    Name("AdhanAlarm")

    Events("onAdhan", "onAdhanEnd")

    OnCreate {
      AdhanLaunch.listener = { intent -> sendEvent("onAdhan", payload(intent)) }
      AdhanLaunch.endListener = { id -> sendEvent("onAdhanEnd", mapOf("id" to id)) }
    }

    OnDestroy {
      AdhanLaunch.listener = null
      AdhanLaunch.endListener = null
    }

    Function("schedule") { alarms: List<AlarmRecord> ->
      AdhanStore.replace(
        context,
        alarms.map {
          AdhanAlarm(
            it.id,
            it.at.toLong(),
            it.prayer,
            it.title,
            it.body,
            it.channelId,
            it.sound,
            it.soundUri,
            it.channelName,
            it.stopLabel
          )
        }
      )
    }

    Function("consumeLaunch") {
      val intent = AdhanLaunch.pending ?: return@Function null
      AdhanLaunch.pending = null
      payload(intent)
    }

    Function("dismiss") { id: String ->
      val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      manager.cancel(id.hashCode())
    }

    Function("stop") {
      AdhanService.stop(context)
      AdhanLaunch.release()
    }
  }
}
