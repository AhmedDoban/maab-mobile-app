package expo.modules.prayerwidgets

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.Paint
import android.view.View
import kotlin.math.max
import kotlin.math.min

data class CardTheme(val bg: Int, val ink: Int, val gray: Int, val line: Int)

object WidgetDesigns {
  private val INK = Color.parseColor("#0E3A33")
  private val MINT = Color.parseColor("#DFF3EA")
  private val DEFAULT_MID = Color.parseColor("#18766F")
  private val DEFAULT_DEEP = Color.parseColor("#0B3A36")
  private val STRIP_LINE = Color.argb(41, 255, 255, 255)
  private const val WHITE = Color.WHITE
  private const val PASSED = 0.55f
  private const val CARD_RADIUS = 28f

  val LIGHT = CardTheme(
    Color.parseColor("#FFFFFF"),
    Color.parseColor("#092B38"),
    Color.parseColor("#667176"),
    Color.parseColor("#E5E7EB")
  )
  val DARK = CardTheme(
    Color.parseColor("#101010"),
    Color.parseColor("#F0F0F0"),
    Color.parseColor("#929292"),
    Color.parseColor("#252525")
  )

  private val ICONS = mapOf(
    "fajr" to R.drawable.widget_ic_fajr,
    "sunrise" to R.drawable.widget_ic_sunrise,
    "dhuhr" to R.drawable.widget_ic_dhuhr,
    "asr" to R.drawable.widget_ic_asr,
    "maghrib" to R.drawable.widget_ic_maghrib,
    "isha" to R.drawable.widget_ic_isha
  )

  fun nextPrayer(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float
  ): Bitmap {
    val p = classic(context, payload, w, h, scale)
    val k = min(w / 320f, h / 170f).coerceIn(0.8f, 1.5f)
    val pad = 12f * k
    val showArch = w >= 250f
    val archW = if (showArch) min((w - pad) * 0.26f, (h - pad) * 0.62f) else 0f
    val archX = if (p.rtl) pad else w - pad - archW
    if (showArch) p.arch(archX, pad, archW, h - pad)
    val left = if (p.rtl && showArch) archX + archW + pad else pad
    val right = if (!p.rtl && showArch) archX - pad else w - pad
    val width = right - left
    val next = payload?.next(now)
    if (payload == null || next == null) {
      empty(context, p, (left + right) / 2, h / 2, width, h - pad * 2, WHITE)
      return p.finish(radius(w, h))
    }
    val stripH = 66f * k
    val showStrip = h >= 160f * k
    val showDate = h >= (if (showStrip) 166f else 90f) * k
    val date = payload.dateOf(now)
    if (showDate && date.isNotEmpty()) {
      val size = 13f * k
      p.icon(R.drawable.widget_ic_calendar, if (p.rtl) right - size else left, 10f * k, size, WHITE, 0.85f)
      p.text(
        date,
        p.sx(18f * k, left, right),
        21f * k,
        10.5f * k,
        WHITE,
        p.startAlign,
        alpha = 0.85f,
        maxWidth = width - 18f * k
      )
    }
    val stripY = h - pad - stripH
    val top = if (showDate) 28f * k else pad
    val bottom = if (showStrip) stripY - 4f * k else h - pad
    val main = top + (bottom - top - 42f * k) / 2
    p.text(
      payload.nextTitle,
      p.sx(0f, left, right),
      main + 9f * k,
      11f * k,
      WHITE,
      p.startAlign,
      alpha = 0.75f,
      maxWidth = width * 0.58f
    )
    p.text(
      next.label,
      p.sx(0f, left, right),
      main + 35f * k,
      22f * k,
      WHITE,
      p.startAlign,
      bold = true,
      maxWidth = width * 0.58f
    )
    val countdownX = if (p.rtl) left + 8f * k else right - 8f * k
    p.text(
      payload.leftTitle,
      countdownX,
      main + 9f * k,
      11f * k,
      WHITE,
      p.endAlign,
      alpha = 0.75f,
      maxWidth = width * 0.36f
    )
    p.text(
      countdown(payload, now),
      countdownX,
      main + 35f * k,
      22f * k,
      WHITE,
      p.endAlign,
      bold = true,
      maxWidth = width * 0.36f
    )
    if (showStrip) {
      val stripX = left - 4f * k
      val stripW = width + 8f * k
      p.rect(stripX, stripY, stripW, stripH, 24f * k, WHITE, 0.1f)
      p.outline(stripX, stripY, stripW, stripH, 24f * k, STRIP_LINE, 1f)
      val day = ordered(payload, now, p.rtl)
      val cellW = (stripW - 8f * k) / day.size
      day.forEachIndexed { i, prayer ->
        stripCell(p, prayer, next, now, stripX + 4f * k + i * cellW, stripY + 4f * k, cellW, k)
      }
    }
    return p.finish(radius(w, h))
  }

  fun mosque(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float,
    mode: Int,
    selected: WidgetMosque? = payload?.mosques?.firstOrNull()
  ): Bitmap {
    val p = classic(context, payload, w, h, scale)
    val mosque = selected
    val k = min(w / 320f, h / 170f).coerceIn(0.8f, 1.5f)
    val pad = 12f * k
    val showArch = w >= 250f
    val archW = if (showArch) min((w - pad) * 0.26f, (h - pad) * 0.62f) else 0f
    val archX = if (p.rtl) pad else w - pad - archW
    if (showArch) p.arch(archX, pad, archW, h - pad)
    val left = if (p.rtl && showArch) archX + archW + pad else pad
    val right = if (!p.rtl && showArch) archX - pad else w - pad
    val width = right - left
    if (mosque == null) {
      empty(context, p, (left + right) / 2f, h / 2f, width, h - pad * 2f, WHITE)
      return p.finish(radius(w, h))
    }
    val title = when (mode) {
      0 -> payload?.nextTitle.orEmpty()
      1 -> context.getString(R.string.widget_mosque_times)
      else -> context.getString(R.string.widget_mosque_distance)
    }
    val next = mosque.next
    val stripH = 66f * k
    val showStrip = mode == 1 && h >= 160f * k && mosque.schedule.isNotEmpty()
    val top = if (showStrip) 28f * k else pad
    val stripY = h - pad - stripH
    val bottom = if (showStrip) stripY - 4f * k else h - pad
    val main = top + (bottom - top - 42f * k) / 2
    p.text(
      mosque.name,
      p.sx(0f, left, right),
      if (showStrip) 21f * k else 24f * k,
      11f * k,
      WHITE,
      p.startAlign,
      bold = true,
      maxWidth = width
    )
    if (mode == 2) {
      p.icon(R.drawable.widget_ic_location, left, main - 8f * k, 22f * k, WHITE, 0.9f)
      p.text(
        title,
        p.sx(30f * k, left, right),
        main + 8f * k,
        15f * k,
        WHITE,
        p.startAlign,
        maxWidth = width - 30f * k
      )
      p.text(
        context.getString(R.string.widget_mosque_location),
        p.sx(30f * k, left, right),
        main + 32f * k,
        12f * k,
        WHITE,
        p.startAlign,
        alpha = 0.75f,
        maxWidth = width - 30f * k
      )
    } else if (mode == 0 && next != null) {
      p.text(title, p.sx(0f, left, right), main + 9f * k, 11f * k, WHITE, p.startAlign, alpha = 0.75f, maxWidth = width * 0.58f)
      p.text(next.label, p.sx(0f, left, right), main + 35f * k, 22f * k, WHITE, p.startAlign, bold = true, maxWidth = width * 0.58f)
      p.text(next.time, if (p.rtl) left + 8f * k else right - 8f * k, main + 35f * k, 22f * k, WHITE, p.endAlign, bold = true, maxWidth = width * 0.36f)
    } else {
      p.text(title, p.sx(0f, left, right), main + 9f * k, 11f * k, WHITE, p.startAlign, alpha = 0.75f, maxWidth = width)
      p.text(
        mosque.schedule.firstOrNull { it.at > now }?.label ?: mosque.schedule.lastOrNull()?.label.orEmpty(),
        p.sx(0f, left, right),
        main + 35f * k,
        22f * k,
        WHITE,
        p.startAlign,
        bold = true,
        maxWidth = width
      )
    }
    if (showStrip) {
      val stripX = left - 4f * k
      val stripW = width + 8f * k
      p.rect(stripX, stripY, stripW, stripH, 24f * k, WHITE, 0.1f)
      p.outline(stripX, stripY, stripW, stripH, 24f * k, STRIP_LINE, 1f)
      val items = mosque.schedule.take(5)
      val cellW = (stripW - 8f * k) / items.size
      items.forEachIndexed { i, item ->
        val x = stripX + 4f * k + i * cellW
        val cx = x + cellW / 2
        p.text(item.label, cx, stripY + 21f * k, 10f * k, WHITE, Paint.Align.CENTER, maxWidth = cellW - 6f * k)
        p.text(item.time, cx, stripY + 42f * k, 13f * k, WHITE, Paint.Align.CENTER, bold = true, maxWidth = cellW - 6f * k)
      }
    }
    return p.finish(radius(w, h))
  }

  fun prayerTimes(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float
  ): Bitmap {
    val p = classic(context, payload, w, h, scale)
    val k = min(w / 320f, h / 170f).coerceIn(0.8f, 1.5f)
    val day = payload?.day(now).orEmpty()
    val next = payload?.next(now)
    if (payload == null || day.isEmpty() || next == null) {
      empty(context, p, w / 2, h / 2, w - 32f * k, h - 24f * k, WHITE)
      return p.finish(radius(w, h))
    }

    val chipText = "${next.label}${separator(p.rtl)}${payload.leftTitle} ${countdown(payload, now)}"
    val chipW = min(p.measureText(chipText, 12f * k, true) + 20f * k, w * 0.5f)
    p.text(
      payload.todayTitle,
      p.sx(16f * k),
      30f * k,
      15f * k,
      WHITE,
      p.startAlign,
      bold = true,
      maxWidth = w - 40f * k - chipW
    )
    if (payload.city.isNotEmpty()) {
      val size = 12f * k
      p.icon(R.drawable.widget_ic_location, if (p.rtl) w - 16f * k - size else 16f * k, 38f * k, size, WHITE, 0.8f)
      p.text(
        payload.city,
        p.sx(32f * k),
        48f * k,
        11f * k,
        WHITE,
        p.startAlign,
        alpha = 0.8f,
        maxWidth = w - 48f * k - chipW
      )
    }
    chip(p, chipText, if (p.rtl) 16f * k + chipW / 2 else w - 16f * k - chipW / 2, 22f * k, chipW, k)
    val top = 70f * k
    val cellH = h - top - 12f * k
    val cellW = (w - 20f * k) / day.size
    val showIcon = cellH >= 60f * k
    ordered(payload, now, p.rtl).forEachIndexed { i, prayer ->
      val x = 10f * k + i * cellW
      val isNext = prayer == next
      if (isNext) {
        p.rect(x + 2f * k, top, cellW - 4f * k, cellH, 16f * k, MINT)
      } else {
        p.rect(x + 3f * k, top, cellW - 6f * k, cellH, 16f * k, WHITE, 0.12f)
      }
      val color = if (isNext) INK else WHITE
      val alpha = if (passed(prayer, next, now)) PASSED else 1f
      val cx = x + cellW / 2
      val nameBase: Float
      if (showIcon) {
        val iconTop = top + (cellH - 66f * k) / 2
        p.icon(iconOf(prayer), cx - 9f * k, iconTop, 18f * k, color, alpha)
        nameBase = iconTop + 35f * k
      } else {
        nameBase = top + cellH / 2 - 2f * k
      }
      p.text(
        prayer.label,
        cx,
        nameBase,
        11f * k,
        color,
        Paint.Align.CENTER,
        alpha = alpha * (if (isNext) 1f else 0.85f),
        maxWidth = cellW - 8f * k
      )
      p.text(
        prayer.time,
        cx,
        nameBase + 17f * k,
        14f * k,
        color,
        Paint.Align.CENTER,
        bold = true,
        alpha = alpha,
        maxWidth = cellW - 8f * k
      )
    }
    return p.finish(radius(w, h))
  }

  fun nextSmall(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float
  ): Bitmap {
    val p = classic(context, payload, w, h, scale)
    val k = (min(w, h) / 170f).coerceIn(0.7f, 1.6f)
    val next = payload?.next(now)
    if (payload == null || next == null) {
      empty(context, p, w / 2, h / 2, w - 24f * k, h - 24f * k, WHITE)
      return p.finish(radius(w, h))
    }
    val room = h - 16f * k
    val showIcon = room >= 125f * k
    val showTitle = room >= (if (showIcon) 125f else 93f) * k
    val block = (if (showTitle) 19f else 0f) * k + (if (showIcon) 32f else 0f) * k + 74f * k
    var y = (h - block) / 2
    val cx = w / 2
    if (showTitle) {
      p.text(payload.nextTitle, cx, y + 9f * k, 11f * k, WHITE, Paint.Align.CENTER, alpha = 0.8f, maxWidth = w - 16f * k)
      y += 19f * k
    }
    if (showIcon) {
      p.icon(iconOf(next), cx - 13f * k, y, 26f * k, WHITE)
      y += 32f * k
    }
    p.text(next.label, cx, y + 22f * k, 20f * k, WHITE, Paint.Align.CENTER, bold = true, maxWidth = w - 16f * k)
    p.text(
      next.time,
      cx,
      y + 42f * k,
      15f * k,
      WHITE,
      Paint.Align.CENTER,
      bold = true,
      alpha = 0.9f,
      maxWidth = w - 16f * k
    )
    val chipText = "${payload.leftTitle} ${countdown(payload, now)}"
    val chipW = min(max(92f * k, p.measureText(chipText, 12f * k, true) + 24f * k), w - 16f * k)
    chip(p, chipText, cx, y + 52f * k, chipW, k)
    return p.finish(radius(w, h))
  }

  fun today(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float
  ): Bitmap {
    val p = classic(context, payload, w, h, scale)
    val k = min(w / 320f, h / 260f).coerceIn(0.75f, 1.5f)
    val day = payload?.day(now).orEmpty()
    val next = payload?.next(now)
    if (payload == null || day.isEmpty() || next == null) {
      empty(context, p, w / 2, h / 2, w - 32f * k, h - 28f * k, WHITE)
      return p.finish(radius(w, h))
    }
    val bottom = 14f * k
    val rowsFor = { top: Float -> (h - bottom - top) / day.size }
    val layout = when {
      rowsFor(128f * k) >= 30f * k -> 2
      rowsFor(104f * k) >= 28f * k -> 1
      else -> 0
    }
    val top = when (layout) {
      2 -> 128f * k
      1 -> 104f * k
      else -> 46f * k
    }
    val rowH = min(rowsFor(top), 44f * k)
    val offset = max(0f, (h - (top + rowH * day.size + bottom)) / 2)
    val cx = w / 2
    val sep = separator(p.rtl)
    if (layout == 0) {
      p.text(
        "${next.label}$sep${countdown(payload, now)}",
        cx,
        offset + 32f * k,
        20f * k,
        WHITE,
        Paint.Align.CENTER,
        bold = true,
        maxWidth = w - 28f * k
      )
    } else {
      p.text(payload.nextTitle, cx, offset + 34f * k, 12f * k, WHITE, Paint.Align.CENTER, alpha = 0.8f, maxWidth = w - 28f * k)
      p.text(
        "${next.label}$sep${next.time}",
        cx,
        offset + 64f * k,
        24f * k,
        WHITE,
        Paint.Align.CENTER,
        bold = true,
        maxWidth = w - 28f * k
      )
      val chipText = "${payload.leftTitle} ${countdown(payload, now)}"
      val chipW = min(max(96f * k, p.measureText(chipText, 12f * k, true) + 24f * k), w - 28f * k)
      chip(p, chipText, cx, offset + 74f * k, chipW, k)
      if (layout == 2) {
        val date = payload.dateOf(now)
        val line = listOf(date, payload.city).filter { it.isNotEmpty() }.joinToString(sep)
        p.text(line, cx, offset + 116f * k, 12f * k, WHITE, Paint.Align.CENTER, alpha = 0.8f, maxWidth = w - 28f * k)
      }
    }
    day.forEachIndexed { i, prayer ->
      val y = offset + top + i * rowH
      val isNext = prayer == next
      if (isNext) {
        val height = rowH - 4f * k
        p.rect(14f * k, y + 2f * k, w - 28f * k, height, min(16f * k, height / 2), MINT)
      }
      val color = if (isNext) INK else WHITE
      val alpha = if (passed(prayer, next, now)) PASSED else 1f
      val mid = y + rowH / 2
      p.icon(iconOf(prayer), if (p.rtl) w - 44f * k else 26f * k, mid - 9f * k, 18f * k, color, alpha)
      p.text(
        prayer.label,
        p.sx(54f * k),
        mid + 5f * k,
        14f * k,
        color,
        p.startAlign,
        alpha = alpha,
        maxWidth = w - 150f * k
      )
      p.text(
        prayer.time,
        if (p.rtl) 26f * k else w - 26f * k,
        mid + 5f * k,
        15f * k,
        color,
        p.endAlign,
        bold = true,
        alpha = alpha,
        maxWidth = 70f * k
      )
    }
    return p.finish(radius(w, h))
  }

  fun dhikr(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float,
    morningEvening: Boolean = false
  ): Bitmap {
    val p = WidgetPainter(context, w, h, scale, payload?.rtl ?: rtl(context))
    p.fill(payload?.deep ?: DEFAULT_DEEP)
    val k = min(w / 320f, h / 170f).coerceIn(0.75f, 1.5f)
    val title = if (morningEvening) {
      payload?.dhikrTitleOf(now)
        ?: context.getString(R.string.widget_morning_evening)
    } else {
      payload?.dhikrTitle ?: context.getString(R.string.widget_dhikr)
    }
    val text = if (morningEvening) {
      val title = payload?.dhikrTitleOf(now)
      if (title == payload?.morningDhikrTitle) {
        payload?.morningSelectedText
      } else {
        payload?.eveningSelectedText
      }
    } else {
      payload?.dhikrOf(now, false)
    }
      ?: context.getString(R.string.widget_dhikr_default)
    val progress = if (morningEvening) {
      val fajr = payload?.prayers?.lastOrNull { it.icon == "fajr" && it.at <= now }?.at
      val maghrib = payload?.prayers?.lastOrNull { it.icon == "maghrib" && it.at <= now }?.at
      if (fajr != null && maghrib != null && fajr > maghrib) {
        payload?.morningProgress
      } else {
        payload?.eveningProgress
      }
    } else null
    val titleH = 17f * k
    val gap = 12f * k
    val layout = p.fit(
      text,
      w - 32f * k,
      h - 32f * k - titleH - gap,
      18f * k,
      11f * k,
      WHITE,
      true
    )
    val progressH = if (progress.isNullOrEmpty()) 0f else 16f * k
    val top = (h - titleH - gap - layout.height - progressH) / 2
    p.text(title, w / 2, top + 12f * k, 12f * k, WHITE, Paint.Align.CENTER, alpha = 0.8f, maxWidth = w - 32f * k)
    p.draw(layout, w / 2, top + titleH + gap)
    if (!progress.isNullOrEmpty()) {
      p.text(progress, w / 2, h - 12f * k, 10f * k, WHITE, Paint.Align.CENTER, alpha = 0.8f)
    }
    return p.finish(radius(w, h))
  }

  fun modern(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float,
    theme: CardTheme
  ): Bitmap {
    val p = WidgetPainter(context, w, h, scale, payload?.rtl ?: rtl(context))
    p.fill(theme.bg)
    val k = min(w / 320f, h / 170f).coerceIn(0.75f, 1.5f)
    val day = payload?.day(now).orEmpty()
    val next = payload?.next(now)
    if (payload == null || day.isEmpty() || next == null) {
      empty(context, p, w / 2, h / 2, w - 28f * k, h - 28f * k, theme.ink)
      return p.finish(radius(w, h))
    }

    fun modernMosque(
      context: Context,
      payload: WidgetPayload?,
      now: Long,
      w: Float,
      h: Float,
      scale: Float,
      mode: Int,
      mosque: WidgetMosque?,
      theme: CardTheme
    ): Bitmap {
      val p = WidgetPainter(context, w, h, scale, payload?.rtl ?: rtl(context))
      p.fill(theme.bg)
      val k = min(w / 320f, h / 170f).coerceIn(0.75f, 1.5f)
      if (mosque == null) {
        empty(context, p, w / 2f, h / 2f, w - 28f * k, h - 28f * k, theme.ink)
        return p.finish(radius(w, h))
      }
      val accent = payload?.color ?: DEFAULT_MID
      val pad = 14f * k
      val title = when (mode) {
        0 -> context.getString(R.string.widget_mosque_next)
        1 -> context.getString(R.string.widget_mosque_times)
        else -> context.getString(R.string.widget_mosque_distance)
      }
      p.text(mosque.name, p.sx(pad), 28f * k, 15f * k, theme.ink, p.startAlign, bold = true, maxWidth = w - 2f * pad)
      p.text(title, p.sx(pad), 47f * k, 11f * k, theme.gray, p.startAlign, maxWidth = w - 2f * pad)

      if (mode == 2) {
        val cy = h * 0.62f
        p.circle(p.sx(34f * k), cy, 20f * k, accent)
        p.icon(R.drawable.widget_ic_location, p.sx(24f * k) - 10f * k, cy - 10f * k, 20f * k, WHITE)
        p.text(context.getString(R.string.widget_mosque_location), p.sx(66f * k), cy + 5f * k, 18f * k, theme.ink, p.startAlign, bold = true, maxWidth = w - 84f * k)
        return p.finish(radius(w, h))
      }

      val items = if (mode == 0) {
        listOfNotNull(mosque.next)
      } else {
        mosque.schedule.filter { it.at > now }.take(5)
      }
      if (items.isEmpty()) {
        empty(context, p, w / 2f, h * 0.66f, w - 28f * k, h * 0.45f, theme.ink)
        return p.finish(radius(w, h))
      }
      val rowTop = 60f * k
      val rowH = min(42f * k, (h - rowTop - 12f * k) / items.size)
      items.forEachIndexed { index, item ->
        val y = rowTop + index * rowH
        val isNext = index == 0
        if (isNext) p.rect(pad, y, w - 2f * pad, rowH - 4f * k, 14f * k, accent)
        val color = if (isNext) WHITE else theme.ink
        p.icon(
          R.drawable.widget_ic_dhuhr,
          if (p.rtl) w - pad - 28f * k else pad + 10f * k,
          y + (rowH - 20f * k) / 2,
          20f * k,
          if (isNext) WHITE else accent
        )
        p.text(item.label, p.sx(42f * k, pad, w - pad), y + rowH / 2 + 5f * k, 13f * k, color, p.startAlign, bold = isNext, maxWidth = w - 110f * k)
        p.text(item.time, if (p.rtl) pad + 12f * k else w - pad - 12f * k, y + rowH / 2 + 5f * k, 13f * k, color, p.endAlign, bold = true, maxWidth = 64f * k)
      }
      return p.finish(radius(w, h))
    }
    val accent = payload.color
    val showIcons = h >= 150f * k
    val cellH = (if (showIcons) 78f else 50f) * k
    val extra = max(0f, h - (78f * k + cellH + 14f * k))
    modernHeader(p, payload, next, now, k, extra * 0.3f, theme)
    val top = 78f * k + extra * 0.7f
    val cellW = (w - 28f * k) / day.size
    ordered(payload, now, p.rtl).forEachIndexed { i, prayer ->
      val x = 14f * k + i * cellW
      val isNext = prayer == next
      if (isNext) p.rect(x + 2f * k, top, cellW - 4f * k, cellH, 16f * k, accent)
      val alpha = if (passed(prayer, next, now)) PASSED else 1f
      val color = if (isNext) WHITE else theme.ink
      val cx = x + cellW / 2
      if (showIcons) {
        p.icon(iconOf(prayer), cx - 10f * k, top + 12f * k, 20f * k, if (isNext) WHITE else accent, alpha)
      }
      val nameBase = top + (if (showIcons) 50f else 22f) * k
      p.text(
        prayer.label,
        cx,
        nameBase,
        12f * k,
        color,
        Paint.Align.CENTER,
        bold = true,
        alpha = alpha,
        maxWidth = cellW - 6f * k
      )
      p.text(
        prayer.time,
        cx,
        nameBase + 17f * k,
        12f * k,
        color,
        Paint.Align.CENTER,
        alpha = alpha,
        maxWidth = cellW - 6f * k
      )
    }
    return p.finish(radius(w, h))
  }

  fun modernMosqueCard(
      context: Context,
      payload: WidgetPayload?,
      now: Long,
      w: Float,
      h: Float,
      scale: Float,
      mode: Int,
      mosque: WidgetMosque?,
      theme: CardTheme
    ): Bitmap {
      val p = WidgetPainter(context, w, h, scale, payload?.rtl ?: rtl(context))
      p.fill(theme.bg)
      val k = min(w / 320f, h / 170f).coerceIn(0.75f, 1.5f)
      val pad = 14f * k
      if (mosque == null) {
        empty(context, p, w / 2f, h / 2f, w - 28f * k, h - 28f * k, theme.ink)
        return p.finish(radius(w, h))
      }
      p.text(mosque.name, p.sx(pad), 28f * k, 15f * k, theme.ink, p.startAlign, bold = true, maxWidth = w - pad * 2)
      p.text(
        when (mode) {
          0 -> context.getString(R.string.widget_mosque_next)
          1 -> context.getString(R.string.widget_mosque_times)
          else -> context.getString(R.string.widget_mosque_distance)
        },
        p.sx(pad),
        47f * k,
        11f * k,
        theme.gray,
        p.startAlign,
        maxWidth = w - pad * 2
      )

      if (mode == 2) {
        val cardY = 62f * k
        val cardH = h - cardY - pad
        p.rect(pad, cardY, w - pad * 2, cardH, 18f * k, theme.line, 0.35f)
        p.circle(p.sx(pad + 30f * k), cardY + cardH / 2, 20f * k, payload?.color ?: DEFAULT_MID)
        p.icon(R.drawable.widget_ic_location, p.sx(pad + 20f * k) - 10f * k, cardY + cardH / 2 - 10f * k, 20f * k, WHITE)
        p.text(
          context.getString(R.string.widget_mosque_location),
          p.sx(pad + 62f * k),
          cardY + cardH / 2 + 6f * k,
          17f * k,
          theme.ink,
          p.startAlign,
          bold = true,
          maxWidth = w - pad * 2 - 76f * k
        )
        return p.finish(radius(w, h))
      }

      val items = if (mode == 0) listOfNotNull(mosque.next) else mosque.schedule.filter { it.at > now }.take(5)
      if (items.isEmpty()) {
        empty(context, p, w / 2f, h * 0.68f, w - pad * 2, h * 0.4f, theme.ink)
        return p.finish(radius(w, h))
      }
      val gap = 6f * k
      val top = if (h >= 150f * k) 55f * k else 48f * k
      p.rect(
        pad - 4f * k,
        top - 5f * k,
        w - 2f * pad + 8f * k,
        h - top - pad + 5f * k,
        20f * k,
        theme.line,
        0.22f
      )
      val rowH = ((h - top - pad - gap * (items.size - 1)) / items.size)
        .coerceAtMost(32f * k)
      items.forEachIndexed { index, item ->
        val y = top + index * (rowH + gap)
        val active = index == 0
        val cardColor = if (active) payload?.color ?: DEFAULT_MID else theme.line
        val alpha = if (active) 1f else 0.4f
        p.rect(pad, y, w - pad * 2, rowH, 16f * k, cardColor, alpha)
        val color = if (active) WHITE else theme.ink
        p.icon(
          R.drawable.widget_ic_dhuhr,
          if (p.rtl) w - pad - 28f * k else pad + 10f * k,
          y + (rowH - 20f * k) / 2,
          20f * k,
          if (active) WHITE else payload?.color ?: DEFAULT_MID
        )
        p.text(item.label, p.sx(42f * k, pad, w - pad), y + rowH / 2 + 5f * k, 13f * k, color, p.startAlign, bold = active, maxWidth = w - 110f * k)
        p.text(item.time, if (p.rtl) pad + 12f * k else w - pad - 12f * k, y + rowH / 2 + 5f * k, 13f * k, color, p.endAlign, bold = true, maxWidth = 64f * k)
      }
      return p.finish(radius(w, h))
    }
  fun modernTall(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float,
    theme: CardTheme
  ): Bitmap {
    val p = WidgetPainter(context, w, h, scale, payload?.rtl ?: rtl(context))
    p.fill(theme.bg)
    val k = (w / 320f).coerceIn(0.75f, 1.5f)
    val day = payload?.day(now).orEmpty()
    val next = payload?.next(now)
    if (payload == null || day.isEmpty() || next == null) {
      empty(context, p, w / 2, h / 2, w - 28f * k, h - 28f * k, theme.ink)
      return p.finish(radius(w, h))
    }
    val pad = 14f * k
    val room = h - 78f * k - pad
    val rowH = min(room / day.size, 44f * k)
    val extra = max(0f, room - rowH * day.size)
    modernHeader(p, payload, next, now, k, extra * 0.3f, theme)
    val top = 78f * k + extra * 0.7f
    day.forEachIndexed { i, prayer ->
      modernRow(p, prayer, next, now, pad, w - pad, top + i * rowH, rowH, k, theme, payload.color)
    }
    return p.finish(radius(w, h))
  }

  fun modernSmall(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    w: Float,
    h: Float,
    scale: Float,
    theme: CardTheme
  ): Bitmap {
    val p = WidgetPainter(context, w, h, scale, payload?.rtl ?: rtl(context))
    p.fill(theme.bg)
    val k = (min(w, h) / 170f).coerceIn(0.75f, 1.5f)
    val day = payload?.day(now).orEmpty()
    val next = payload?.next(now)
    if (payload == null || day.isEmpty() || next == null) {
      empty(context, p, w / 2, h / 2, w - 24f * k, h - 24f * k, theme.ink)
      return p.finish(radius(w, h))
    }
    val accent = payload.color
    val pad = 14f * k
    val block = 92f * k
    val listRoom = h - pad * 2 - block - 6f * k
    val showList = h >= 250f && listRoom / day.size >= 22f * k
    val rowH = if (showList) min(listRoom / day.size, 40f * k) else 0f
    val total = block + if (showList) 6f * k + rowH * day.size else 0f
    val top = max(pad, (h - total) / 2)
    val circleR = 17f * k
    val circleX = p.sx(pad + circleR)
    p.circle(circleX, top + circleR, circleR, accent)
    p.icon(iconOf(next), circleX - 8.5f * k, top + circleR - 8.5f * k, 17f * k, WHITE)
    p.text(
      next.label,
      p.sx(pad + 42f * k),
      top + 22f * k,
      13f * k,
      theme.ink,
      p.startAlign,
      bold = true,
      maxWidth = w - pad * 2 - 42f * k
    )
    p.text(next.time, p.sx(pad), top + 66f * k, 26f * k, accent, p.startAlign, bold = true, maxWidth = w - pad * 2)
    p.text(
      "${payload.leftTitle} ${countdown(payload, now)}",
      p.sx(pad),
      top + 84f * k,
      11f * k,
      theme.gray,
      p.startAlign,
      maxWidth = w - pad * 2
    )
    if (showList) {
      val listTop = top + block + 6f * k
      day.forEachIndexed { i, prayer ->
        modernRow(p, prayer, next, now, pad, w - pad, listTop + i * rowH, rowH, k, theme, accent)
      }
    }
    return p.finish(radius(w, h))
  }

  fun describe(
    context: Context,
    payload: WidgetPayload?,
    now: Long,
    dhikr: Boolean,
    morningEvening: Boolean
  ): String {
    if (dhikr && morningEvening) {
      val title = payload?.dhikrTitleOf(now)
        ?: context.getString(R.string.widget_morning_evening)
      return "$title: ${payload?.dhikrOf(now)
        ?: context.getString(R.string.widget_dhikr_default)}"
    }
    if (dhikr && payload != null) {
      return "${payload.dhikrTitle}: ${payload.dhikrOf(now, false)
        ?: context.getString(R.string.widget_dhikr_default)}"
    }
    val next = payload?.next(now) ?: return context.getString(R.string.widget_open_app)
    return "${payload.nextTitle}: ${next.label} ${next.time}, ${payload.leftTitle} ${countdown(payload, now)}"
  }

  private fun modernHeader(
    p: WidgetPainter,
    payload: WidgetPayload,
    next: WidgetPrayer,
    now: Long,
    k: Float,
    y: Float,
    theme: CardTheme
  ) {
    val accent = payload.color
    val cx = p.sx(34f * k)
    p.circle(cx, y + 34f * k, 20f * k, accent)
    p.icon(iconOf(next), cx - 10f * k, y + 24f * k, 20f * k, WHITE)
    p.text(next.label, p.sx(64f * k), y + 28f * k, 13f * k, theme.ink, p.startAlign, bold = true, maxWidth = 64f * k)
    p.text(next.time, p.sx(64f * k), y + 54f * k, 24f * k, accent, p.startAlign, bold = true, maxWidth = 66f * k)
    if (p.w < 230f * k) return
    p.rect(p.sx(136f * k) - 0.5f, y + 16f * k, 1f, 36f * k, 0f, theme.line)
    val mid = p.sx(178f * k)
    p.text(payload.leftTitle, mid, y + 28f * k, 11f * k, theme.gray, Paint.Align.CENTER, maxWidth = 76f * k)
    p.text(
      countdown(payload, now),
      mid,
      y + 50f * k,
      17f * k,
      theme.ink,
      Paint.Align.CENTER,
      bold = true,
      maxWidth = 76f * k
    )
    val pad = 14f * k
    val room = p.w - pad - 220f * k
    if (room < 56f * k) return
    val end = if (p.rtl) pad else p.w - pad
    val lines = listOf(payload.city).filter { it.isNotEmpty() } + dateLines(payload.dateOf(now))
    lines.take(3).forEachIndexed { i, line ->
      p.text(line, end, y + 24f * k + i * 15f * k, 10.5f * k, theme.gray, p.endAlign, maxWidth = room)
    }
  }

  private fun modernRow(
    p: WidgetPainter,
    prayer: WidgetPrayer,
    next: WidgetPrayer,
    now: Long,
    left: Float,
    right: Float,
    y: Float,
    rowH: Float,
    k: Float,
    theme: CardTheme,
    accent: Int
  ) {
    val isNext = prayer == next
    if (isNext) {
      val height = rowH - 4f * k
      p.rect(left, y + 2f * k, right - left, height, min(14f * k, height / 2), accent)
    }
    val alpha = if (passed(prayer, next, now)) PASSED else 1f
    val color = if (isNext) WHITE else theme.ink
    val mid = y + rowH / 2
    val size = 16f * k
    p.icon(
      iconOf(prayer),
      if (p.rtl) right - 12f * k - size else left + 12f * k,
      mid - size / 2,
      size,
      if (isNext) WHITE else accent,
      alpha
    )
    p.text(
      prayer.label,
      p.sx(38f * k, left, right),
      mid + 4.5f * k,
      13f * k,
      color,
      p.startAlign,
      alpha = alpha,
      maxWidth = right - left - 110f * k
    )
    p.text(
      prayer.time,
      if (p.rtl) left + 12f * k else right - 12f * k,
      mid + 4.5f * k,
      13f * k,
      color,
      p.endAlign,
      bold = true,
      alpha = alpha,
      maxWidth = 64f * k
    )
  }

  private fun stripCell(
    p: WidgetPainter,
    prayer: WidgetPrayer,
    next: WidgetPrayer,
    now: Long,
    x: Float,
    y: Float,
    w: Float,
    k: Float
  ) {
    val isNext = prayer == next
    if (isNext) p.rect(x + 2f * k, y, w - 4f * k, 58f * k, 16f * k, MINT)
    val color = if (isNext) INK else WHITE
    val alpha = if (passed(prayer, next, now)) PASSED else 1f
    val cx = x + w / 2
    p.text(prayer.label, cx, y + 17f * k, 11f * k, color, Paint.Align.CENTER, alpha = alpha, maxWidth = w - 6f * k)
    p.text(
      prayer.time,
      cx,
      y + 34f * k,
      13f * k,
      color,
      Paint.Align.CENTER,
      bold = true,
      alpha = alpha,
      maxWidth = w - 6f * k
    )
    p.icon(iconOf(prayer), cx - 7.5f * k, y + 40f * k, 15f * k, color, alpha)
  }

  private fun chip(p: WidgetPainter, label: String, cx: Float, y: Float, width: Float, k: Float) {
    p.rect(cx - width / 2, y, width, 22f * k, 11f * k, MINT)
    p.text(label, cx, y + 15f * k, 12f * k, INK, Paint.Align.CENTER, bold = true, maxWidth = width - 12f * k)
  }

  private fun classic(context: Context, payload: WidgetPayload?, w: Float, h: Float, scale: Float): WidgetPainter {
    val p = WidgetPainter(context, w, h, scale, payload?.rtl ?: rtl(context))
    p.gradient(payload?.mid ?: DEFAULT_MID, payload?.deep ?: DEFAULT_DEEP)
    p.decor()
    return p
  }

  private fun empty(
    context: Context,
    p: WidgetPainter,
    cx: Float,
    cy: Float,
    width: Float,
    height: Float,
    color: Int
  ) {
    val layout = p.fit(context.getString(R.string.widget_open_app), width, height, 13f, 9f, color, false, 0.85f)
    p.draw(layout, cx, cy - layout.height / 2f)
  }

  private fun ordered(payload: WidgetPayload, now: Long, rtl: Boolean): List<WidgetPrayer> {
    val day = payload.day(now)
    return if (rtl) day.reversed() else day
  }

  private fun passed(prayer: WidgetPrayer, next: WidgetPrayer, now: Long) = prayer != next && prayer.at <= now

  private fun countdown(payload: WidgetPayload, now: Long): String {
    val minutes = payload.minutesLeft(now)
    return "${minutes / 60}:${(minutes % 60).toString().padStart(2, '0')}"
  }

  private fun dateLines(date: String): List<String> {
    if (date.isEmpty()) return emptyList()
    val sep = listOf("، ", ", ").firstOrNull { date.contains(it) } ?: return listOf(date)
    return listOf(date.substringBefore(sep), date.substringAfter(sep))
  }

  private fun separator(rtl: Boolean) = if (rtl) "، " else " · "

  private fun iconOf(prayer: WidgetPrayer) = ICONS[prayer.icon] ?: R.drawable.widget_ic_dhuhr

  private fun radius(w: Float, h: Float) = min(CARD_RADIUS, min(w, h) * 0.165f)

  private fun rtl(context: Context) =
    context.resources.configuration.layoutDirection == View.LAYOUT_DIRECTION_RTL
}
