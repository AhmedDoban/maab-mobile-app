package expo.modules.prayerwidgets

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Bundle

open class PrayerWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    WidgetRenderer.renderAll(context)
  }

  override fun onAppWidgetOptionsChanged(
    context: Context,
    manager: AppWidgetManager,
    id: Int,
    options: Bundle
  ) {
    WidgetRenderer.renderAll(context)
  }

  override fun onDisabled(context: Context) {
    WidgetRenderer.renderAll(context)
  }
}

class NextPrayerWidget : PrayerWidgetProvider()

class PrayerTimesWidget : PrayerWidgetProvider()

class DhikrWidget : PrayerWidgetProvider()

class NextPrayerSmallWidget : PrayerWidgetProvider()

class TodayWidget : PrayerWidgetProvider()

class ModernPrayerWidget : PrayerWidgetProvider()

class WidgetRefreshReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    WidgetRenderer.renderAll(context)
  }
}
