package expo.modules.appicon

import android.app.Activity
import android.content.Context
import android.os.Bundle
import expo.modules.core.interfaces.Package
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class AppIconPackage : Package {
  override fun createReactActivityLifecycleListeners(activityContext: Context): List<ReactActivityLifecycleListener> {
    return listOf(object : ReactActivityLifecycleListener {
      override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
        AppIconSwitcher.watchScreen(activity.applicationContext)
      }

      override fun onPause(activity: Activity) {
        if (activity.isFinishing) AppIconSwitcher.applyPending(activity.applicationContext)
      }

      override fun onUserLeaveHint(activity: Activity) {
        AppIconSwitcher.applyPending(activity.applicationContext)
      }
    })
  }
}
