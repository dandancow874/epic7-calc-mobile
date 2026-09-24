package com.epic7.calc.mobile

import android.os.Bundle
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  private var backPending = false
  private var exitDialog: AlertDialog? = null

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
      override fun handleOnBackPressed() {
        if (backPending || exitDialog?.isShowing == true) return
        val insets = ViewCompat.getRootWindowInsets(webView)
        if (insets?.isVisible(WindowInsetsCompat.Type.ime()) == true) {
          ViewCompat.getWindowInsetsController(webView)?.hide(WindowInsetsCompat.Type.ime())
          return
        }
        backPending = true
        webView.evaluateJavascript("window.__epic7HandleBack ? window.__epic7HandleBack() : true") { handled ->
          backPending = false
          if (handled == "false" && !isFinishing && !isDestroyed) {
            exitDialog = AlertDialog.Builder(this@MainActivity)
              .setTitle("退出应用")
              .setMessage("是否退出 Epic7 Calc？")
              .setNegativeButton("取消", null)
              .setPositiveButton("退出") { _, _ -> finish() }
              .create()
            exitDialog?.show()
          }
        }
      }
    })
  }

  override fun onCreate(savedInstanceState: Bundle?) {
    enableEdgeToEdge()
    super.onCreate(savedInstanceState)
  }
}
