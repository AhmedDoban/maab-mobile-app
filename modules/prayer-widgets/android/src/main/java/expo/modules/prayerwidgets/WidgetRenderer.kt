package expo.modules.prayerwidgets

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.SizeF
import android.widget.RemoteViews
import kotlin.math.min
import kotlin.math.sqrt

object WidgetRenderer {
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
    val morningEvening = ids(context, manager, MorningEveningWidget::class.java)
    val small = ids(context, manager, NextPrayerSmallWidget::class.java)
    val today = ids(context, manager, TodayWidget::class.java)
    val modern = ids(context, manager, ModernPrayerWidget::class.java)
    next.forEach { update(context, manager, it, Kind.NEXT, payload, now) }
    times.forEach { update(context, manager, it, Kind.TIMES, payload, now) }
    dhikr.forEach { update(context, manager, it, Kind.DHIKR, payload, now) }
    morningEvening.forEach { update(context, manager, it, Kind.MORNING_EVENING, payload, now) }
    small.forEach { update(context, manager, it, Kind.SMALL, payload, now) }
    today.forEach { update(context, manager, it, Kind.TODAY, payload, now) }
    modern.forEach { update(context, manager, it, Kind.MODERN, payload, now) }
    LockScreenPrayer.update(context, payload, now)
    val lockScreen = payload?.lockScreen == true
    val timed = next.isNotEmpty() || times.isNotEmpty() || small.isNotEmpty() ||
      today.isNotEmpty() || modern.isNotEmpty()
    if (timed || dhikr.isNotEmpty() || morningEvening.isNotEmpty() || lockScreen) {
      WidgetScheduler.schedule(context, payload, now, timed)
    } else {
      WidgetScheduler.cancel(context)
    }
  }

  private enum class Kind { NEXT, TIMES, SMALL, TODAY, MODERN, DHIKR, MORNING_EVENING }

  private const val COMPACT_WIDTH = 200f
  private const val TALL_HEIGHT = 230f
  private const val TALL_RATIO = 0.85f
  private const val MODERN_SMALL_WIDTH = 280f
  private const val MAX_SIZES = 2
  private const val SCREEN_BUDGET = 1.2f

  private fun update(
    context: Context,
    manager: AppWidgetManager,
    id: Int,
    kind: Kind,
    payload: WidgetPayload?,
    now: Long
  ) {
    val sizes = sizes(manager.getAppWidgetOptions(id))
    val metrics = context.resources.displayMetrics
    val copies = sizes.size * if (kind == Kind.MODERN) 2 else 1
    val budget = metrics.widthPixels.toFloat() * metrics.heightPixels * SCREEN_BUDGET / copies
    val build = { size: SizeF ->
      val scale = min(metrics.density, sqrt(budget / (size.width * size.height)))
      views(context, kind, payload, now, size.width, size.height, scale)
    }
    val views = when {
      sizes.size == 1 -> build(sizes[0])
      Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> RemoteViews(sizes.associateWith(build))
      else -> RemoteViews(build(sizes[0]), build(sizes[1]))
    }
    manager.updateAppWidget(id, views)
  }

  private fun views(
    context: Context,
    kind: Kind,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float
  ): RemoteViews {
    val views = if (kind == Kind.MODERN) {
      RemoteViews(context.packageName, R.layout.widget_canvas_themed).apply {
        setImageViewBitmap(R.id.light, modern(context, payload, now, w, h, scale, WidgetDesigns.LIGHT))
        setImageViewBitmap(R.id.dark, modern(context, payload, now, w, h, scale, WidgetDesigns.DARK))
      }
    } else {
      RemoteViews(context.packageName, R.layout.widget_canvas).apply {
        setImageViewBitmap(R.id.canvas, classic(context, kind, payload, now, w, h, scale))
      }
    }
    views.setContentDescription(
      R.id.root,
      WidgetDesigns.describe(
        context,
        payload,
        now,
        kind == Kind.DHIKR || kind == Kind.MORNING_EVENING,
        kind == Kind.MORNING_EVENING
      )
    )
    views.setOnClickPendingIntent(R.id.root, openApp(context))
    return views
  }

  private fun classic(
    context: Context,
    kind: Kind,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float
  ): Bitmap = when {
    kind == Kind.DHIKR || kind == Kind.MORNING_EVENING ->
      WidgetDesigns.dhikr(context, payload, now, w, h, scale, kind == Kind.MORNING_EVENING)
    w < COMPACT_WIDTH -> WidgetDesigns.nextSmall(context, payload, now, w, h, scale)
    tall(w, h) -> WidgetDesigns.today(context, payload, now, w, h, scale)
    kind == Kind.TIMES || kind == Kind.TODAY -> WidgetDesigns.prayerTimes(context, payload, now, w, h, scale)
    else -> WidgetDesigns.nextPrayer(context, payload, now, w, h, scale)
  }

  private fun modern(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float,
    theme: CardTheme
  ): Bitmap = when {
    w < MODERN_SMALL_WIDTH -> WidgetDesigns.modernSmall(context, payload, now, w, h, scale, theme)
    tall(w, h) -> WidgetDesigns.modernTall(context, payload, now, w, h, scale, theme)
    else -> WidgetDesigns.modern(context, payload, now, w, h, scale, theme)
  }

  private fun tall(w: Float, h: Float) = h >= TALL_HEIGHT && h >= w * TALL_RATIO

  private fun sizes(options: Bundle): List<SizeF> {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      @Suppress("DEPRECATION")
      val sizes = options.getParcelableArrayList<SizeF>(AppWidgetManager.OPTION_APPWIDGET_SIZES)
        .orEmpty()
        .filter { it.width > 0f && it.height > 0f }
        .distinct()
        .take(MAX_SIZES)
      if (sizes.isNotEmpty()) return sizes
    }
    val minW = dimension(options, AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH, 320f)
    val maxW = dimension(options, AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, minW)
    val minH = dimension(options, AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT, 170f)
    val maxH = dimension(options, AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, minH)
    return listOf(SizeF(maxW, minH), SizeF(minW, maxH)).distinct()
  }

  private fun dimension(options: Bundle, key: String, fallback: Float): Float {
    val value = options.getInt(key)
    return if (value > 0) value.toFloat() else fallback
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
}
