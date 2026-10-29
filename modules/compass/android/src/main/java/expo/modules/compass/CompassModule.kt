package expo.modules.compass

import android.content.Context
import android.hardware.GeomagneticField
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.view.Surface
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlin.math.abs
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin
import kotlin.math.sqrt

class CompassModule : Module(), SensorEventListener {
  private val context: Context
    get() = requireNotNull(appContext.reactContext)

  private val sensors: SensorManager
    get() = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager

  private val rotation = FloatArray(9)
  private val remapped = FloatArray(9)
  private val upright = FloatArray(9)
  private val orientation = FloatArray(3)
  private var east = 0.0
  private var north = 0.0
  private var primed = false
  private var declination = 0f
  private var expectedField = 0f
  private var interference = false
  private var accuracy = SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM
  private var sent = Double.NaN
  private var sentAt = 0L

  override fun definition() = ModuleDefinition {
    Name("Compass")

    Events("onHeading")

    Function("isAvailable") {
      rotationSensor() != null
    }

    Function("setLocation") { latitude: Double, longitude: Double ->
      val field = GeomagneticField(
        latitude.toFloat(),
        longitude.toFloat(),
        0f,
        System.currentTimeMillis()
      )
      declination = field.declination
      expectedField = field.fieldStrength / 1000f
    }

    OnStartObserving("onHeading") { start() }

    OnStopObserving("onHeading") { stop() }

    OnDestroy { stop() }
  }

  private fun rotationSensor(): Sensor? =
    sensors.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
      ?: sensors.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR)

  private fun start() {
    val sensor = rotationSensor() ?: return
    primed = false
    interference = false
    sent = Double.NaN
    sensors.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME)
    sensors.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)?.let {
      sensors.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
    }
  }

  private fun stop() {
    sensors.unregisterListener(this)
  }

  private fun displayRotation(): Int {
    val display = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      appContext.currentActivity?.display
    } else {
      @Suppress("DEPRECATION")
      (context.getSystemService(Context.WINDOW_SERVICE) as WindowManager).defaultDisplay
    }
    return display?.rotation ?: Surface.ROTATION_0
  }

  override fun onSensorChanged(event: SensorEvent) {
    if (event.sensor.type == Sensor.TYPE_MAGNETIC_FIELD) {
      accuracy = event.accuracy
      checkInterference(event.values)
      return
    }
    SensorManager.getRotationMatrixFromVector(rotation, event.values)
    val (x, y) = when (displayRotation()) {
      Surface.ROTATION_90 -> SensorManager.AXIS_Y to SensorManager.AXIS_MINUS_X
      Surface.ROTATION_180 -> SensorManager.AXIS_MINUS_X to SensorManager.AXIS_MINUS_Y
      Surface.ROTATION_270 -> SensorManager.AXIS_MINUS_Y to SensorManager.AXIS_X
      else -> SensorManager.AXIS_X to SensorManager.AXIS_Y
    }
    SensorManager.remapCoordinateSystem(rotation, x, y, remapped)
    SensorManager.getOrientation(remapped, orientation)
    if (abs(orientation[1]) > UPRIGHT_PITCH) {
      SensorManager.remapCoordinateSystem(
        remapped,
        SensorManager.AXIS_X,
        SensorManager.AXIS_Z,
        upright
      )
      SensorManager.getOrientation(upright, orientation)
    }
    val azimuth = orientation[0].toDouble()
    if (primed) {
      east += SMOOTHING * (sin(azimuth) - east)
      north += SMOOTHING * (cos(azimuth) - north)
    } else {
      east = sin(azimuth)
      north = cos(azimuth)
      primed = true
    }
    val heading = (Math.toDegrees(atan2(east, north)) + declination + 360) % 360
    val now = System.currentTimeMillis()
    val change = abs(((heading - sent + 540) % 360) - 180)
    if (!sent.isNaN() && (change < MIN_CHANGE || now - sentAt < MIN_INTERVAL_MS)) return
    sent = heading
    sentAt = now
    emit(heading)
  }

  private fun emit(heading: Double) {
    sendEvent(
      "onHeading",
      mapOf("heading" to heading, "accuracy" to accuracy, "interference" to interference)
    )
  }

  private fun checkInterference(values: FloatArray) {
    if (expectedField <= 0f) return
    val strength = sqrt(values[0] * values[0] + values[1] * values[1] + values[2] * values[2])
    val deviation = abs(strength - expectedField) / expectedField
    val disturbed =
      if (interference) deviation > CLEAR_DEVIATION else deviation > INTERFERENCE_DEVIATION
    if (disturbed == interference) return
    interference = disturbed
    if (!sent.isNaN()) emit(sent)
  }

  override fun onAccuracyChanged(sensor: Sensor, value: Int) {
    if (sensor.type == Sensor.TYPE_MAGNETIC_FIELD) accuracy = value
  }

  companion object {
    private const val SMOOTHING = 0.3
    private const val MIN_CHANGE = 0.5
    private const val MIN_INTERVAL_MS = 16L
    private const val UPRIGHT_PITCH = 0.87f
    private const val INTERFERENCE_DEVIATION = 0.35f
    private const val CLEAR_DEVIATION = 0.25f
  }
}
