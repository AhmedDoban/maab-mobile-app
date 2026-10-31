package expo.modules.prayerwidgets

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Path
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import kotlin.math.ceil
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt
import kotlin.math.sin

object WidgetArt {
  private const val GRADIENT_W = 240
  private const val GRADIENT_H = 120
  private const val ARC_R = 35f
  private const val ARC_STROKE = 7f
  private const val ARC_HALF_DEG = 30f
  private val MINT = Color.parseColor("#4FD1A1")
  private val SHADE = Color.parseColor("#0D3630")

  private var mosque: Bitmap? = null

  private var gradientKey: Pair<Int, Int>? = null
  private var gradientCache: Bitmap? = null

  fun gradient(start: Int, end: Int): Bitmap {
    val key = start to end
    gradientCache?.let { if (gradientKey == key) return it }
    val bitmap = Bitmap.createBitmap(GRADIENT_W, GRADIENT_H, Bitmap.Config.ARGB_8888)
    val w = GRADIENT_W.toFloat()
    val h = GRADIENT_H.toFloat()
    val paint = Paint().apply {
      isDither = true
      shader = LinearGradient(0f, 0f, w, h, start, end, Shader.TileMode.CLAMP)
    }
    Canvas(bitmap).drawRect(0f, 0f, w, h, paint)
    gradientKey = key
    gradientCache = bitmap
    return bitmap
  }

  fun arc(context: Context, progress: Float, rtl: Boolean): Bitmap {
    val density = context.resources.displayMetrics.density
    val half = Math.toRadians(ARC_HALF_DEG.toDouble())
    val h = ceil(2 * ARC_R * sin(half)).toFloat() + ARC_STROKE
    val w = ceil(ARC_R * (1 - cos(half))).toFloat() + ARC_STROKE
    val bitmap = Bitmap.createBitmap(
      (w * density).roundToInt(),
      (h * density).roundToInt(),
      Bitmap.Config.ARGB_8888
    )
    val canvas = Canvas(bitmap)
    canvas.scale(density, density)
    if (rtl) canvas.scale(-1f, 1f, w / 2, h / 2)
    val cx = ARC_R + ARC_STROKE / 2
    val cy = h / 2
    val oval = RectF(cx - ARC_R, cy - ARC_R, cx + ARC_R, cy + ARC_R)
    val start = 180f - ARC_HALF_DEG
    val sweep = ARC_HALF_DEG * 2
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeWidth = ARC_STROKE
      strokeCap = Paint.Cap.ROUND
      color = Color.argb(38, 255, 255, 255)
    }
    canvas.drawArc(oval, start, sweep, false, paint)
    val p = progress.coerceIn(0f, 1f)
    if (p > 0f) {
      paint.color = MINT
      canvas.drawArc(oval, start, sweep * p, false, paint)
    }
    return bitmap
  }

  private fun archPath(w: Float, h: Float, i: Float = 0f): Path {
    val spring = min(w * 0.75f, h * 0.45f) + i
    val tip = i * 1.6f
    return Path().apply {
      moveTo(i, h)
      lineTo(i, spring)
      cubicTo(i, spring * 0.6f, w * 0.24f, spring * 0.32f, w / 2, tip)
      cubicTo(w * 0.76f, spring * 0.32f, w - i, spring * 0.6f, w - i, spring)
      lineTo(w - i, h)
      close()
    }
  }

  private fun mosque(context: Context): Bitmap? {
    mosque?.let { return it }
    return BitmapFactory.decodeResource(context.resources, R.drawable.widget_mosque)
      ?.also { mosque = it }
  }

  fun arch(context: Context, widthDp: Float, heightDp: Float): Bitmap? {
    if (widthDp <= 0f || heightDp <= 0f) return null
    val density = context.resources.displayMetrics.density
    val scale = min(density, 1.5f)
    val bitmap = Bitmap.createBitmap(
      max(1, (widthDp * scale).roundToInt()),
      max(1, (heightDp * scale).roundToInt()),
      Bitmap.Config.ARGB_8888
    )
    val canvas = Canvas(bitmap)
    canvas.scale(scale, scale)
    val outer = archPath(widthDp, heightDp)
    val inner = archPath(widthDp, heightDp, 6f)
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)

    paint.style = Paint.Style.FILL
    paint.color = Color.argb(20, 255, 255, 255)
    canvas.drawPath(outer, paint)
    paint.style = Paint.Style.STROKE
    paint.strokeWidth = 1f
    paint.color = Color.argb(56, 255, 255, 255)
    canvas.drawPath(outer, paint)

    canvas.save()
    canvas.clipPath(inner)
    mosque(context)?.let { image ->
      val ratio = max(widthDp / image.width, heightDp / image.height)
      val drawW = image.width * ratio
      val drawH = image.height * ratio
      val left = (widthDp - drawW) / 2
      val top = (heightDp - drawH) / 2
      canvas.drawBitmap(
        image,
        Rect(0, 0, image.width, image.height),
        RectF(left, top, left + drawW, top + drawH),
        Paint(Paint.FILTER_BITMAP_FLAG)
      )
    }
    val shade = Paint().apply {
      shader = LinearGradient(
        0f, heightDp * 0.55f, 0f, heightDp,
        Color.argb(0, Color.red(SHADE), Color.green(SHADE), Color.blue(SHADE)),
        Color.argb(153, Color.red(SHADE), Color.green(SHADE), Color.blue(SHADE)),
        Shader.TileMode.CLAMP
      )
    }
    canvas.drawRect(0f, 0f, widthDp, heightDp, shade)
    canvas.restore()

    paint.color = Color.argb(89, 255, 255, 255)
    canvas.drawPath(inner, paint)
    return bitmap
  }
}
