package expo.modules.prayerwidgets

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.BitmapShader
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Matrix
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Shader
import android.graphics.Typeface
import android.text.Layout
import android.text.StaticLayout
import android.text.TextDirectionHeuristics
import android.text.TextPaint
import android.text.TextUtils
import kotlin.math.ceil
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

class WidgetPainter(
  private val context: Context,
  val w: Float,
  val h: Float,
  scale: Float,
  val rtl: Boolean
) {
  val bitmap: Bitmap = Bitmap.createBitmap(
    max(1, (w * scale).roundToInt()),
    max(1, (h * scale).roundToInt()),
    Bitmap.Config.ARGB_8888
  )
  private val canvas = Canvas(bitmap).apply { scale(scale, scale) }

  fun sx(x: Float, left: Float = 0f, right: Float = w) = if (rtl) right - x else left + x

  val startAlign get() = if (rtl) Paint.Align.RIGHT else Paint.Align.LEFT

  val endAlign get() = if (rtl) Paint.Align.LEFT else Paint.Align.RIGHT

  fun gradient(start: Int, end: Int) {
    val paint = Paint().apply {
      isDither = true
      shader = LinearGradient(0f, 0f, w, h, start, end, Shader.TileMode.CLAMP)
    }
    canvas.drawRect(0f, 0f, w, h, paint)
  }

  fun fill(color: Int) = canvas.drawColor(color)

  fun decor() {
    val image = image(context, R.drawable.widget_decor) ?: return
    canvas.drawBitmap(image, slice(image, w, h), RectF(0f, 0f, w, h), Paint(Paint.FILTER_BITMAP_FLAG))
  }

  fun arch(x: Float, y: Float, width: Float, height: Float) {
    if (width <= 0f || height <= 0f) return
    val path = archPath(x, y, width, height)
    image(context, R.drawable.widget_mosque)?.let { image ->
      val src = slice(image, width, height)
      val matrix = Matrix().apply {
        setRectToRect(RectF(src), RectF(x, y, x + width, y + height), Matrix.ScaleToFit.FILL)
      }
      val paint = Paint(Paint.ANTI_ALIAS_FLAG or Paint.FILTER_BITMAP_FLAG).apply {
        shader = BitmapShader(image, Shader.TileMode.CLAMP, Shader.TileMode.CLAMP).apply {
          setLocalMatrix(matrix)
        }
      }
      canvas.drawPath(path, paint)
    }
    val shade = Color.argb(115, 13, 54, 48)
    val shadePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      shader = LinearGradient(
        0f, y, 0f, y + height,
        intArrayOf(Color.TRANSPARENT, Color.TRANSPARENT, shade, shade),
        floatArrayOf(0f, 0.55f, 0.55f, 1f),
        Shader.TileMode.CLAMP
      )
    }
    canvas.drawPath(path, shadePaint)
    val stroke = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeWidth = 1.5f
      color = Color.argb(89, 255, 255, 255)
    }
    canvas.drawPath(path, stroke)
  }

  fun rect(
    x: Float,
    y: Float,
    width: Float,
    height: Float,
    radius: Float,
    color: Int,
    alpha: Float = 1f
  ) {
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      this.color = color
      this.alpha = (Color.alpha(color) * alpha).roundToInt()
    }
    canvas.drawRoundRect(RectF(x, y, x + width, y + height), radius, radius, paint)
  }

  fun outline(x: Float, y: Float, width: Float, height: Float, radius: Float, color: Int, stroke: Float) {
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      style = Paint.Style.STROKE
      strokeWidth = stroke
      this.color = color
    }
    val inset = stroke / 2
    canvas.drawRoundRect(
      RectF(x + inset, y + inset, x + width - inset, y + height - inset),
      radius,
      radius,
      paint
    )
  }

  fun circle(cx: Float, cy: Float, radius: Float, color: Int) {
    canvas.drawCircle(cx, cy, radius, Paint(Paint.ANTI_ALIAS_FLAG).apply { this.color = color })
  }

  fun icon(res: Int, x: Float, y: Float, size: Float, color: Int, alpha: Float = 1f) {
    val drawable = context.getDrawable(res)?.mutate() ?: return
    drawable.setBounds(x.roundToInt(), y.roundToInt(), (x + size).roundToInt(), (y + size).roundToInt())
    drawable.setTint(color)
    drawable.alpha = (255 * alpha).roundToInt()
    drawable.draw(canvas)
  }

  fun text(
    value: String,
    x: Float,
    baseline: Float,
    size: Float,
    color: Int,
    align: Paint.Align,
    bold: Boolean = false,
    alpha: Float = 1f,
    maxWidth: Float = Float.MAX_VALUE
  ): Float {
    if (value.isEmpty() || maxWidth <= 0f) return 0f
    val paint = paint(size, color, bold, alpha)
    var width = measure(value, paint)
    if (width > maxWidth) {
      paint(paint, max(size * MIN_SHRINK, size * maxWidth / width), bold)
      width = measure(value, paint)
    }
    val shown = if (width > maxWidth) {
      TextUtils.ellipsize(value, paint, maxWidth - pad(paint), TextUtils.TruncateAt.END).toString()
    } else {
      value
    }
    val layoutWidth = ceil(min(measure(shown, paint), maxWidth)).toInt().coerceAtLeast(1)
    val layout = layout(shown, paint, layoutWidth, 1)
    val left = when (align) {
      Paint.Align.LEFT -> x
      Paint.Align.CENTER -> x - layoutWidth / 2f
      Paint.Align.RIGHT -> x - layoutWidth
    }
    canvas.save()
    canvas.translate(left, baseline - layout.getLineBaseline(0))
    layout.draw(canvas)
    canvas.restore()
    return layoutWidth.toFloat()
  }

  fun measureText(value: String, size: Float, bold: Boolean = false) =
    measure(value, paint(size, Color.WHITE, bold, 1f))

  fun fit(
    value: String,
    maxWidth: Float,
    maxHeight: Float,
    size: Float,
    minSize: Float,
    color: Int,
    bold: Boolean,
    alpha: Float = 1f
  ): StaticLayout {
    val width = max(1, maxWidth.toInt())
    var current = size
    var layout: StaticLayout
    while (true) {
      val paint = paint(current, color, bold, alpha)
      layout = layout(value, paint, width, Int.MAX_VALUE, Layout.Alignment.ALIGN_CENTER, LINE_SPACING)
      if (layout.height <= maxHeight || current <= minSize) break
      current = max(minSize, current - 0.5f)
    }
    if (layout.height > maxHeight && layout.lineCount > 1) {
      val lines = max(1, (maxHeight / (layout.height / layout.lineCount.toFloat())).toInt())
      layout = layout(
        value,
        paint(current, color, bold, alpha),
        width,
        lines,
        Layout.Alignment.ALIGN_CENTER,
        LINE_SPACING
      )
    }
    return layout
  }

  fun draw(layout: StaticLayout, cx: Float, top: Float) {
    canvas.save()
    canvas.translate(cx - layout.width / 2f, top)
    layout.draw(canvas)
    canvas.restore()
  }

  fun finish(radius: Float): Bitmap {
    val path = Path().apply {
      addRoundRect(RectF(0f, 0f, w, h), radius, radius, Path.Direction.CW)
      fillType = Path.FillType.INVERSE_WINDING
    }
    val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
      xfermode = PorterDuffXfermode(PorterDuff.Mode.DST_OUT)
    }
    canvas.drawPath(path, paint)
    return bitmap
  }

  private fun paint(size: Float, color: Int, bold: Boolean, alpha: Float) =
    TextPaint(Paint.ANTI_ALIAS_FLAG or Paint.SUBPIXEL_TEXT_FLAG).apply {
      this.color = color
      this.alpha = (Color.alpha(color) * alpha).roundToInt()
      paint(this, size, bold)
    }

  private fun paint(paint: TextPaint, size: Float, bold: Boolean) {
    paint.textSize = size
    paint.typeface = typeface(context, rtl, bold)
    if (bold && rtl) {
      paint.style = Paint.Style.FILL_AND_STROKE
      paint.strokeWidth = size * FAUX_BOLD
      paint.strokeJoin = Paint.Join.ROUND
    } else {
      paint.style = Paint.Style.FILL
      paint.strokeWidth = 0f
    }
  }

  private fun pad(paint: TextPaint) = paint.strokeWidth * 2 + 1f

  private fun measure(value: String, paint: TextPaint) = Layout.getDesiredWidth(value, paint) + pad(paint)

  private fun layout(
    value: String,
    paint: TextPaint,
    width: Int,
    maxLines: Int,
    alignment: Layout.Alignment = Layout.Alignment.ALIGN_NORMAL,
    spacing: Float = 1f
  ): StaticLayout =
    StaticLayout.Builder.obtain(value, 0, value.length, paint, width)
      .setAlignment(alignment)
      .setTextDirection(if (rtl) TextDirectionHeuristics.RTL else TextDirectionHeuristics.LTR)
      .setIncludePad(false)
      .setLineSpacing(0f, spacing)
      .setMaxLines(maxLines)
      .setEllipsize(TextUtils.TruncateAt.END)
      .build()

  private fun archPath(x: Float, y: Float, width: Float, height: Float): Path {
    val spring = min(width * 0.75f, height * 0.45f)
    return Path().apply {
      moveTo(x, y + height)
      lineTo(x, y + spring)
      cubicTo(x, y + spring * 0.6f, x + width * 0.24f, y + spring * 0.32f, x + width / 2, y)
      cubicTo(x + width * 0.76f, y + spring * 0.32f, x + width, y + spring * 0.6f, x + width, y + spring)
      lineTo(x + width, y + height)
      close()
    }
  }

  private fun slice(image: Bitmap, width: Float, height: Float): Rect {
    val ratio = max(width / image.width, height / image.height)
    val srcW = (width / ratio).roundToInt().coerceIn(1, image.width)
    val srcH = (height / ratio).roundToInt().coerceIn(1, image.height)
    val left = (image.width - srcW) / 2
    val top = (image.height - srcH) / 2
    return Rect(left, top, left + srcW, top + srcH)
  }

  companion object {
    private const val MIN_SHRINK = 0.65f
    private const val FAUX_BOLD = 0.045f
    private const val LINE_SPACING = 1.3f
    private val images = mutableMapOf<Int, Bitmap>()
    private val typefaces = mutableMapOf<String, Typeface>()

    private fun image(context: Context, res: Int): Bitmap? =
      images[res] ?: BitmapFactory.decodeResource(context.resources, res)?.also { images[res] = it }

    private fun typeface(context: Context, rtl: Boolean, bold: Boolean): Typeface {
      val file = when {
        rtl -> "LamaSans-Regular.ttf"
        bold -> "SpaceGrotesk-Bold.ttf"
        else -> "SpaceGrotesk-Regular.ttf"
      }
      return typefaces.getOrPut(file) {
        try {
          Typeface.createFromAsset(context.assets, "prayer-widgets/$file")
        } catch (error: Exception) {
          if (bold) Typeface.DEFAULT_BOLD else Typeface.DEFAULT
        }
      }
    }
  }
}
