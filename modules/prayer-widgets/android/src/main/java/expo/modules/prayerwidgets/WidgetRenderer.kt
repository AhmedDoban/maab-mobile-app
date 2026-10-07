package expo.modules.prayerwidgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.util.Log
import android.view.View
import android.widget.RemoteViews

object WidgetRenderer {
  private val DEFAULT_COLOR = Color.parseColor("#18766F")
  private val DEFAULT_DEEP = Color.parseColor("#0B3A36")
  private val INK = Color.parseColor("#0E3A33")
  private const val PASSED_ALPHA = 140

  private val ICONS = mapOf(
    "fajr" to R.drawable.widget_ic_fajr,
    "sunrise" to R.drawable.widget_ic_sunrise,
    "dhuhr" to R.drawable.widget_ic_dhuhr,
    "asr" to R.drawable.widget_ic_asr,
    "maghrib" to R.drawable.widget_ic_maghrib,
    "isha" to R.drawable.widget_ic_isha
  )

  fun renderAll(context: Context) {
    try {
      render(context)
    } catch (error: Exception) {
      Log.w("PrayerWidgets", "Widget render failed", error)
    }
  }

  private fun render(context: Context) {
    val manager = AppWidgetManager.getInstance(context)
    val payload = WidgetStore.load(context)
    val now = System.currentTimeMillis()
    val next = ids(context, manager, NextPrayerWidget::class.java)
    val times = ids(context, manager, PrayerTimesWidget::class.java)
    val dhikr = ids(context, manager, DhikrWidget::class.java)
    next.forEach { manager.updateAppWidget(it, nextPrayer(context, manager, it, payload, now)) }
    times.forEach { manager.updateAppWidget(it, prayerTimes(context, payload, now)) }
    dhikr.forEach { manager.updateAppWidget(it, dhikr(context, payload, now)) }
    if (next.isNotEmpty() || times.isNotEmpty() || dhikr.isNotEmpty()) {
      WidgetScheduler.schedule(context, payload, now, next.isNotEmpty() || times.isNotEmpty())
    } else {
      WidgetScheduler.cancel(context)
    }
  }

  private fun ids(context: Context, manager: AppWidgetManager, type: Class<*>) =
    manager.getAppWidgetIds(ComponentName(context, type))

  private fun openApp(context: Context): PendingIntent {
    val intent = Intent(Intent.ACTION_MAIN)
      .addCategory(Intent.CATEGORY_LAUNCHER)
      .setClassName(context, "${context.packageName}.MainActivity")
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return PendingIntent.getActivity(
      context,
      0,
      intent,
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
  }

  private fun iconOf(prayer: WidgetPrayer) = ICONS[prayer.icon] ?: R.drawable.widget_ic_dhuhr

  private fun size(manager: AppWidgetManager, id: Int): Pair<Float, Float> {
    val options = manager.getAppWidgetOptions(id)
    val w = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
    val h = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT)
    return (if (w > 0) w.toFloat() else 320f) to (if (h > 0) h.toFloat() else 170f)
  }

  private fun px(context: Context, dp: Int) =
    (dp * context.resources.displayMetrics.density).toInt()

  private fun padding(context: Context, views: RemoteViews, id: Int, dp: Int) {
    val value = px(context, dp)
    views.setViewPadding(id, value, value, value, value)
  }

  private fun visible(views: RemoteViews, id: Int, show: Boolean) =
    views.setViewVisibility(id, if (show) View.VISIBLE else View.GONE)

  private fun layout(payload: WidgetPayload?, ltr: Int, rtl: Int) =
    if (payload?.rtl == true) rtl else ltr

  private fun background(views: RemoteViews, payload: WidgetPayload?) {
    views.setImageViewBitmap(
      R.id.bg,
      WidgetArt.gradient(payload?.mid ?: DEFAULT_COLOR, payload?.deep ?: DEFAULT_DEEP)
    )
  }

  private fun city(views: RemoteViews, city: String) {
    val visibility = if (city.isEmpty()) View.GONE else View.VISIBLE
    views.setViewVisibility(R.id.cityIcon, visibility)
    views.setViewVisibility(R.id.city, visibility)
    views.setTextViewText(R.id.city, city)
  }

  private fun stripItem(
    context: Context,
    prayer: WidgetPrayer,
    next: WidgetPrayer?,
    now: Long,
    showIcon: Boolean
  ): RemoteViews {
    val item = RemoteViews(context.packageName, R.layout.widget_strip_item)
    item.setTextViewText(R.id.itemName, prayer.label)
    item.setTextViewText(R.id.itemTime, prayer.time)
    item.setImageViewResource(R.id.itemIcon, iconOf(prayer))
    visible(item, R.id.itemIcon, showIcon)
    val vertical = px(context, if (showIcon) 5 else 3)
    item.setViewPadding(R.id.itemBody, 0, vertical, 0, vertical)
    when {
      prayer == next -> {
        item.setViewVisibility(R.id.itemBg, View.VISIBLE)
        item.setTextColor(R.id.itemName, INK)
        item.setTextColor(R.id.itemTime, INK)
        item.setInt(R.id.itemIcon, "setColorFilter", INK)
      }
      prayer.at <= now -> {
        val faded = Color.argb(PASSED_ALPHA, 255, 255, 255)
        item.setTextColor(R.id.itemName, faded)
        item.setTextColor(R.id.itemTime, faded)
        item.setInt(R.id.itemIcon, "setImageAlpha", PASSED_ALPHA)
      }
    }
    return item
  }

  private fun nextPrayer(
    context: Context,
    manager: AppWidgetManager,
    id: Int,
    payload: WidgetPayload?,
    now: Long
  ): RemoteViews {
    val views = RemoteViews(
      context.packageName,
      layout(payload, R.layout.widget_next_prayer, R.layout.widget_next_prayer_rtl)
    )
    background(views, payload)
    val (w, h) = size(manager, id)
    val wide = w >= 250f
    val showStrip = h >= 110f
    val showDate = h >= 165f
    visible(views, R.id.arch, wide)
    visible(views, R.id.headerSpace, wide)
    visible(views, R.id.stripSpace, wide)
    visible(views, R.id.dateRow, showDate)
    padding(context, views, R.id.body, if (showStrip) 12 else 8)
    if (wide) {
      WidgetArt.arch(context, (w - 12f) * 0.26f, h - 12f)?.let {
        views.setImageViewBitmap(R.id.arch, it)
      }
    }
    views.removeAllViews(R.id.strip)
    val next = payload?.next(now)
    if (payload == null || next == null) {
      views.setViewVisibility(R.id.content, View.INVISIBLE)
      views.setViewVisibility(R.id.stripRow, View.GONE)
      views.setViewVisibility(R.id.empty, View.VISIBLE)
    } else {
      views.setViewVisibility(R.id.empty, View.GONE)
      views.setViewVisibility(R.id.content, View.VISIBLE)
      visible(views, R.id.stripRow, showStrip)
      val minutes = payload.minutesLeft(now)
      views.setTextViewText(R.id.date, payload.dateOf(now))
      city(views, payload.city)
      views.setImageViewBitmap(R.id.arc, WidgetArt.arc(context, payload.progress(now), payload.rtl))
      views.setTextViewText(R.id.left, payload.leftTitle)
      views.setTextViewText(R.id.hours, (minutes / 60).toString())
      views.setTextViewText(R.id.minutes, (minutes % 60).toString().padStart(2, '0'))
      views.setTextViewText(R.id.hourUnit, payload.hourUnit)
      views.setTextViewText(R.id.minuteUnit, payload.minuteUnit)
      views.setImageViewResource(R.id.icon, iconOf(next))
      views.setTextViewText(R.id.title, payload.nextTitle)
      views.setTextViewText(R.id.name, next.label)
      if (showStrip) {
        payload.day(now).forEach {
          views.addView(R.id.strip, stripItem(context, it, next, now, showDate))
        }
      }
    }
    views.setOnClickPendingIntent(R.id.root, openApp(context))
    return views
  }

  private fun prayerTile(context: Context, prayer: WidgetPrayer, next: WidgetPrayer?, now: Long): RemoteViews {
    val tile = RemoteViews(context.packageName, R.layout.widget_prayer_tile)
    tile.setTextViewText(R.id.tileName, prayer.label)
    tile.setTextViewText(R.id.tileTime, prayer.time)
    tile.setImageViewResource(R.id.tileIcon, iconOf(prayer))
    when {
      prayer == next -> {
        tile.setImageViewResource(R.id.tileBg, R.drawable.widget_mint)
        tile.setTextColor(R.id.tileName, INK)
        tile.setTextColor(R.id.tileTime, INK)
        tile.setInt(R.id.tileIcon, "setColorFilter", INK)
      }
      prayer.at <= now -> {
        val faded = Color.argb(PASSED_ALPHA, 255, 255, 255)
        tile.setTextColor(R.id.tileName, faded)
        tile.setTextColor(R.id.tileTime, faded)
        tile.setInt(R.id.tileIcon, "setImageAlpha", PASSED_ALPHA)
      }
    }
    return tile
  }

  private fun prayerTimes(context: Context, payload: WidgetPayload?, now: Long): RemoteViews {
    val views = RemoteViews(
      context.packageName,
      layout(payload, R.layout.widget_prayer_times, R.layout.widget_prayer_times_rtl)
    )
    background(views, payload)
    views.removeAllViews(R.id.row)
    val day = payload?.day(now).orEmpty()
    val next = payload?.next(now)
    if (payload == null || day.isEmpty()) {
      city(views, "")
      visible(views, R.id.chip, false)
      visible(views, R.id.empty, true)
      visible(views, R.id.row, false)
    } else {
      visible(views, R.id.empty, false)
      visible(views, R.id.row, true)
      views.setTextViewText(R.id.title, payload.todayTitle)
      city(views, payload.city)
      visible(views, R.id.chip, next != null)
      if (next != null) {
        val minutes = payload.minutesLeft(now)
        views.setTextViewText(R.id.chipName, next.label)
        views.setTextViewText(
          R.id.chipTime,
          "${payload.leftTitle} ${minutes / 60}:${(minutes % 60).toString().padStart(2, '0')}"
        )
      }
      day.forEach { views.addView(R.id.row, prayerTile(context, it, next, now)) }
    }
    views.setOnClickPendingIntent(R.id.root, openApp(context))
    return views
  }

  private fun dhikr(context: Context, payload: WidgetPayload?, now: Long): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.widget_dhikr)
    views.setInt(R.id.bg, "setColorFilter", payload?.deep ?: DEFAULT_DEEP)
    payload?.let { views.setTextViewText(R.id.title, it.dhikrTitle) }
    payload?.dhikrOf(now)?.let { views.setTextViewText(R.id.text, it) }
    views.setOnClickPendingIntent(R.id.root, openApp(context))
    return views
  }
}
