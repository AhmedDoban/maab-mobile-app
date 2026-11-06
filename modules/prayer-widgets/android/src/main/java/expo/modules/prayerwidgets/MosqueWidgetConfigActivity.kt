package expo.modules.prayerwidgets

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.os.Bundle
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.LinearLayout
import android.widget.Spinner

class MosqueWidgetConfigActivity : Activity() {
  override fun onCreate(state: Bundle?) {
    super.onCreate(state)
    val widgetId = intent.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID)
    if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
      finish()
      return
    }
    setResult(RESULT_CANCELED)
    val payload = WidgetStore.load(this)
    val mosques = payload?.mosques.orEmpty()
    val spinner = Spinner(this).apply {
      adapter = ArrayAdapter(
        this@MosqueWidgetConfigActivity,
        android.R.layout.simple_spinner_dropdown_item,
        mosques.map { it.name }
      )
    }
    val save = Button(this).apply {
      text = getString(android.R.string.ok)
      setOnClickListener {
        mosques.getOrNull(spinner.selectedItemPosition)?.let {
          getSharedPreferences("maab_widgets", MODE_PRIVATE).edit()
            .putString("mosque_$widgetId", it.id)
            .apply()
        }
        setResult(RESULT_OK)
        finish()
      }
    }
    setContentView(LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      setPadding(32, 32, 32, 32)
      addView(spinner)
      addView(save)
    })
  }
}
