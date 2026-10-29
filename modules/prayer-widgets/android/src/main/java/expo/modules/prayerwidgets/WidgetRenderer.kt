package expo.modules.prayerwidgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.util.Log
import android.util.TypedValue
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
    val small = ids(context, manager, NextPrayerSmallWidget::class.java)
    val today = ids(context, manager, TodayWidget::class.java)
    val modern = ids(context, manager, ModernPrayerWidget::class.java)
    next.forEach { update(context, manager, it, Kind.NEXT, payload, now) }
    times.forEach { update(context, manager, it, Kind.TIMES, payload, now) }
    dhikr.forEach { manager.updateAppWidget(it, dhikr(context, payload, now)) }
    small.forEach { update(context, manager, it, Kind.SMALL, payload, now) }
    today.forEach { update(context, manager, it, Kind.TODAY, payload, now) }
    modern.forEach { update(context, manager, it, Kind.MODERN, payload, now) }
    LockScreenPrayer.update(context, payload, now)
    val lockScreen = payload?.lockScreen == true
    val timed = next.isNotEmpty() || times.isNotEmpty() || small.isNotEmpty() ||
      today.isNotEmpty() || modern.isNotEmpty()
    if (timed || dhikr.isNotEmpty() || lockScreen) {
      WidgetScheduler.schedule(context, payload, now, timed)
    } else {
      WidgetScheduler.cancel(context)
    }
  }

  private enum class Kind { NEXT, TIMES, SMALL, TODAY, MODERN }

  private const val COMPACT_WIDTH = 200f
  private const val TALL_HEIGHT = 230f
  private const val MODERN_SMALL_WIDTH = 280f
  private const val MODERN_LIST_HEIGHT = 200f

  private fun update(
    context: Context,
    manager: AppWidgetManager,
    id: Int,
    kind: Kind,
    payload: WidgetPayload?,
    now: Long
  ) {
    val (w, h) = size(manager, id)
    val views = when {
      kind == Kind.MODERN -> modern(context, payload, now, w, h)
      w < COMPACT_WIDTH -> nextSmall(context, payload, now)
      h >= TALL_HEIGHT -> today(context, payload, now)
      kind == Kind.TIMES || kind == Kind.TODAY -> prayerTimes(context, payload, now)
      else -> nextPrayer(context, manager, id, payload, now)
    }
    manager.updateAppWidget(id, views)
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
    val wide = w >= 320f
    val showTile = w >= 230f
    val showStrip = h >= 110f
    val showDate = h >= 165f
    visible(views, R.id.divider, showTile)
    visible(views, R.id.tile, showTile)
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

  private fun leftText(payload: WidgetPayload, now: Long): String {
    val minutes = payload.minutesLeft(now)
    return "${payload.leftTitle} ${minutes / 60}:${(minutes % 60).toString().padStart(2, '0')}"
  }

  private fun nextSmall(context: Context, payload: WidgetPayload?, now: Long): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.widget_next_small)
    background(views, payload)
    val next = payload?.next(now)
    if (payload == null || next == null) {
      visible(views, R.id.content, false)
      visible(views, R.id.empty, true)
    } else {
      visible(views, R.id.empty, false)
      visible(views, R.id.content, true)
      views.setTextViewText(R.id.title, payload.nextTitle)
      views.setImageViewResource(R.id.icon, iconOf(next))
      views.setTextViewText(R.id.name, next.label)
      views.setTextViewText(R.id.time, next.time)
      views.setTextViewText(R.id.left, leftText(payload, now))
    }
    views.setOnClickPendingIntent(R.id.root, openApp(context))
    return views
  }

  private fun todayRow(
    context: Context,
    prayer: WidgetPrayer,
    next: WidgetPrayer?,
    now: Long,
    rtl: Boolean
  ): RemoteViews {
    val row = RemoteViews(
      context.packageName,
      if (rtl) R.layout.widget_today_row_rtl else R.layout.widget_today_row
    )
    row.setTextViewText(R.id.rowName, prayer.label)
    row.setTextViewText(R.id.rowTime, prayer.time)
    row.setImageViewResource(R.id.rowIcon, iconOf(prayer))
    when {
      prayer == next -> {
        row.setViewVisibility(R.id.rowBg, View.VISIBLE)
        row.setTextColor(R.id.rowName, INK)
        row.setTextColor(R.id.rowTime, INK)
        row.setInt(R.id.rowIcon, "setColorFilter", INK)
      }
      prayer.at <= now -> {
        val faded = Color.argb(PASSED_ALPHA, 255, 255, 255)
        row.setTextColor(R.id.rowName, faded)
        row.setTextColor(R.id.rowTime, faded)
        row.setInt(R.id.rowIcon, "setImageAlpha", PASSED_ALPHA)
      }
    }
    return row
  }

  private fun today(context: Context, payload: WidgetPayload?, now: Long): RemoteViews {
    val views = RemoteViews(context.packageName, R.layout.widget_today)
    background(views, payload)
    views.removeAllViews(R.id.rows)
    val day = payload?.day(now).orEmpty()
    val next = payload?.next(now)
    if (payload == null || day.isEmpty() || next == null) {
      visible(views, R.id.content, false)
      visible(views, R.id.empty, true)
    } else {
      visible(views, R.id.empty, false)
      visible(views, R.id.content, true)
      views.setTextViewText(R.id.title, payload.nextTitle)
      views.setTextViewText(R.id.name, "${next.label} · ${next.time}")
      views.setTextViewText(R.id.left, leftText(payload, now))
      val date = payload.dateOf(now)
      views.setTextViewText(
        R.id.date,
        if (payload.city.isEmpty()) date else "$date · ${payload.city}"
      )
      day.forEach { views.addView(R.id.rows, todayRow(context, it, next, now, payload.rtl)) }
    }
    views.setOnClickPendingIntent(R.id.root, openApp(context))
    return views
  }

  private fun modernCell(
    context: Context,
    prayer: WidgetPrayer,
    next: WidgetPrayer?,
    now: Long,
    accent: Int,
    showIcon: Boolean
  ): RemoteViews {
    val cell = RemoteViews(context.packageName, R.layout.widget_modern_cell)
    cell.setTextViewText(R.id.cellName, prayer.label)
    cell.setTextViewText(R.id.cellTime, prayer.time)
    cell.setImageViewResource(R.id.cellIcon, iconOf(prayer))
    visible(cell, R.id.cellIcon, showIcon)
    if (prayer == next) {
      cell.setViewVisibility(R.id.cellBg, View.VISIBLE)
      cell.setInt(R.id.cellBg, "setColorFilter", accent)
      cell.setTextColor(R.id.cellName, Color.WHITE)
      cell.setTextColor(R.id.cellTime, Color.WHITE)
      cell.setInt(R.id.cellIcon, "setColorFilter", Color.WHITE)
    } else {
      cell.setInt(R.id.cellIcon, "setColorFilter", accent)
      if (prayer.at <= now) {
        cell.setInt(R.id.cellIcon, "setImageAlpha", PASSED_ALPHA)
        val ink = context.getColor(R.color.widget_card_ink)
        val faded = Color.argb(PASSED_ALPHA, Color.red(ink), Color.green(ink), Color.blue(ink))
        cell.setTextColor(R.id.cellName, faded)
        cell.setTextColor(R.id.cellTime, faded)
      }
    }
    return cell
  }

  private fun modernRow(
    context: Context,
    prayer: WidgetPrayer,
    next: WidgetPrayer?,
    now: Long,
    accent: Int,
    rtl: Boolean
  ): RemoteViews {
    val row = RemoteViews(
      context.packageName,
      if (rtl) R.layout.widget_modern_list_row_rtl else R.layout.widget_modern_list_row
    )
    row.setTextViewText(R.id.rowName, prayer.label)
    row.setTextViewText(R.id.rowTime, prayer.time)
    row.setImageViewResource(R.id.rowIcon, iconOf(prayer))
    if (prayer == next) {
      row.setViewVisibility(R.id.rowBg, View.VISIBLE)
      row.setInt(R.id.rowBg, "setColorFilter", accent)
      row.setTextColor(R.id.rowName, Color.WHITE)
      row.setTextColor(R.id.rowTime, Color.WHITE)
      row.setInt(R.id.rowIcon, "setColorFilter", Color.WHITE)
    } else {
      row.setInt(R.id.rowIcon, "setColorFilter", accent)
      if (prayer.at <= now) {
        row.setInt(R.id.rowIcon, "setImageAlpha", PASSED_ALPHA)
        val ink = context.getColor(R.color.widget_card_ink)
        val faded = Color.argb(PASSED_ALPHA, Color.red(ink), Color.green(ink), Color.blue(ink))
        row.setTextColor(R.id.rowName, faded)
        row.setTextColor(R.id.rowTime, faded)
      }
    }
    return row
  }

  private fun modernSmall(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    h: Float
  ): RemoteViews {
    val views = RemoteViews(
      context.packageName,
      layout(payload, R.layout.widget_modern_small, R.layout.widget_modern_small_rtl)
    )
    views.removeAllViews(R.id.list)
    val day = payload?.day(now).orEmpty()
    val next = payload?.next(now)
    if (payload == null || day.isEmpty() || next == null) {
      visible(views, R.id.content, false)
      visible(views, R.id.empty, true)
    } else {
      visible(views, R.id.empty, false)
      visible(views, R.id.content, true)
      val accent = payload.color
      views.setInt(R.id.circle, "setColorFilter", accent)
      views.setImageViewResource(R.id.icon, iconOf(next))
      views.setTextViewText(R.id.name, next.label)
      views.setTextViewText(R.id.time, next.time)
      views.setTextColor(R.id.time, accent)
      views.setTextViewText(R.id.left, leftText(payload, now))
      val showList = h >= MODERN_LIST_HEIGHT
      visible(views, R.id.list, showList)
      if (showList) {
        day.forEach {
          views.addView(R.id.list, modernRow(context, it, next, now, accent, payload.rtl))
        }
      }
    }
    views.setOnClickPendingIntent(R.id.root, openApp(context))
    return views
  }

  private fun modern(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float
  ): RemoteViews {
    if (w < MODERN_SMALL_WIDTH) return modernSmall(context, payload, now, h)
    val views = RemoteViews(
      context.packageName,
      layout(payload, R.layout.widget_modern, R.layout.widget_modern_rtl)
    )
    val showLeft = w >= 280f
    val showInfo = w >= 350f
    val showIcons = h >= 150f
    visible(views, R.id.divider, showLeft)
    visible(views, R.id.leftCol, showLeft)
    visible(views, R.id.info, showInfo)
    views.setTextViewTextSize(R.id.time, TypedValue.COMPLEX_UNIT_SP, if (w >= 300f) 24f else 20f)
    padding(context, views, R.id.content, if (h >= 130f) 14 else 10)
    views.removeAllViews(R.id.row)
    val day = payload?.day(now).orEmpty()
    val next = payload?.next(now)
    if (payload == null || day.isEmpty() || next == null) {
      visible(views, R.id.content, false)
      visible(views, R.id.empty, true)
    } else {
      visible(views, R.id.empty, false)
      visible(views, R.id.content, true)
      val accent = payload.color
      views.setInt(R.id.circle, "setColorFilter", accent)
      views.setImageViewResource(R.id.icon, iconOf(next))
      views.setTextViewText(R.id.name, next.label)
      views.setTextViewText(R.id.time, next.time)
      views.setTextColor(R.id.time, accent)
      views.setTextViewText(R.id.leftTitle, payload.leftTitle)
      val minutes = payload.minutesLeft(now)
      views.setTextViewText(
        R.id.left,
        "${minutes / 60}:${(minutes % 60).toString().padStart(2, '0')}"
      )
      visible(views, R.id.city, payload.city.isNotEmpty())
      views.setTextViewText(R.id.city, payload.city)
      views.setTextViewText(R.id.date, payload.dateOf(now))
      day.forEach { views.addView(R.id.row, modernCell(context, it, next, now, accent, showIcons)) }
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
