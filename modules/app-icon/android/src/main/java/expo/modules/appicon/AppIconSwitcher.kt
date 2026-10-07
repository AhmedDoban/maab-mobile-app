package expo.modules.appicon

import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log

object AppIconSwitcher {
  private const val PREFS = "maab_app_icon"
  private const val KEY_TARGET = "target"
  private const val KEY_NAMES = "names"

  @Volatile
  var foreground = false

  private var watching = false

  private val screenOff = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      if (!foreground) applyPending(context.applicationContext)
    }
  }

  fun watchScreen(context: Context) {
    if (watching) return
    watching = true
    val filter = IntentFilter(Intent.ACTION_SCREEN_OFF)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      context.registerReceiver(screenOff, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      context.registerReceiver(screenOff, filter)
    }
  }

  private fun prefs(context: Context) =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  private fun alias(context: Context, name: String) =
    ComponentName(context.packageName, "${context.packageName}.MainActivity$name")

  private fun isEnabled(context: Context, name: String, fallback: String): Boolean {
    val state = try {
      context.packageManager.getComponentEnabledSetting(alias(context, name))
    } catch (error: IllegalArgumentException) {
      return false
    }
    return when (state) {
      PackageManager.COMPONENT_ENABLED_STATE_ENABLED -> true
      PackageManager.COMPONENT_ENABLED_STATE_DEFAULT -> name == fallback
      else -> false
    }
  }

  private fun changes(context: Context, target: String, names: List<String>) =
    names
      .map { it to (it == target) }
      .filter { (name, enable) -> isEnabled(context, name, names.first()) != enable }
      .sortedByDescending { it.second }

  fun request(context: Context, target: String, names: List<String>) {
    if (target !in names) return
    val editor = prefs(context).edit()
    if (changes(context, target, names).isEmpty()) {
      editor.remove(KEY_TARGET).remove(KEY_NAMES)
    } else {
      editor.putString(KEY_TARGET, target).putString(KEY_NAMES, names.joinToString(","))
    }
    editor.commit()
  }

  private fun applyPending(context: Context) {
    val prefs = prefs(context)
    val target = prefs.getString(KEY_TARGET, null) ?: return
    val names = prefs.getString(KEY_NAMES, null)?.split(",").orEmpty()
    prefs.edit().remove(KEY_TARGET).remove(KEY_NAMES).commit()
    if (target !in names) return
    val pending = changes(context, target, names)
    if (pending.isEmpty()) return
    val manager = context.packageManager
    val flags = PackageManager.DONT_KILL_APP
    val state = { enable: Boolean ->
      if (enable) PackageManager.COMPONENT_ENABLED_STATE_ENABLED
      else PackageManager.COMPONENT_ENABLED_STATE_DISABLED
    }
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        manager.setComponentEnabledSettings(
          pending.map { (name, enable) ->
            PackageManager.ComponentEnabledSetting(alias(context, name), state(enable), flags)
          }
        )
      } else {
        pending.forEach { (name, enable) ->
          manager.setComponentEnabledSetting(alias(context, name), state(enable), flags)
        }
      }
    } catch (error: Exception) {
      Log.w("AppIcon", "Icon switch failed", error)
    }
  }
}
