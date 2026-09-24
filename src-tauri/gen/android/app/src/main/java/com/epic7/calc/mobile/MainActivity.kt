package com.epic7.calc.mobile

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.Settings
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.activity.OnBackPressedCallback
import androidx.activity.enableEdgeToEdge
import androidx.appcompat.app.AlertDialog
import androidx.core.content.FileProvider
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import java.io.File

class MainActivity : TauriActivity() {
  private var backPending = false
  private var exitDialog: AlertDialog? = null
  private val updatePreferences by lazy { getSharedPreferences("apk-updater", Context.MODE_PRIVATE) }
  private var receiverRegistered = false

  inner class ApkUpdateBridge {
    @JavascriptInterface
    fun downloadAndInstall(url: String, fileName: String) {
      runOnUiThread { startApkDownload(url, fileName) }
    }
  }

  private val downloadReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      if (intent?.action != DownloadManager.ACTION_DOWNLOAD_COMPLETE) return
      val completedId = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1L)
      if (completedId == updatePreferences.getLong("download-id", -2L)) installCompletedDownload(completedId)
    }
  }

  override fun onWebViewCreate(webView: WebView) {
    super.onWebViewCreate(webView)
    webView.addJavascriptInterface(ApkUpdateBridge(), "Epic7Updater")
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
    val filter = IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(downloadReceiver, filter, RECEIVER_NOT_EXPORTED)
    } else {
      @Suppress("DEPRECATION")
      registerReceiver(downloadReceiver, filter)
    }
    receiverRegistered = true
  }

  override fun onResume() {
    super.onResume()
    val pendingId = updatePreferences.getLong("download-id", -1L)
    if (pendingId >= 0 && (Build.VERSION.SDK_INT < Build.VERSION_CODES.O || packageManager.canRequestPackageInstalls())) {
      installCompletedDownload(pendingId)
    }
  }

  override fun onDestroy() {
    if (receiverRegistered) {
      try { unregisterReceiver(downloadReceiver) } catch (_: IllegalArgumentException) { }
      receiverRegistered = false
    }
    super.onDestroy()
  }

  private fun startApkDownload(url: String, fileName: String) {
    val uri = runCatching { Uri.parse(url) }.getOrNull()
    val validName = Regex("^Epic7-Calc-Mobile-v\\d+\\.\\d+\\.\\d+-arm64\\.apk$").matches(fileName)
    val validUrl = uri?.scheme == "https" && uri.host == "github.com"
      && uri.path?.startsWith("/dandancow874/epic7-calc-mobile/releases/download/") == true
    if (!validName || !validUrl) {
      AlertDialog.Builder(this).setTitle("更新失败").setMessage("更新包地址无效。")
        .setPositiveButton("确定", null).show()
      return
    }
    val destination = File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), fileName)
    if (destination.exists()) destination.delete()
    val request = DownloadManager.Request(uri)
      .setTitle("Epic7 Calc Mobile $fileName")
      .setDescription("正在下载应用更新")
      .setMimeType("application/vnd.android.package-archive")
      .setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
      .setAllowedOverMetered(true)
      .setAllowedOverRoaming(false)
      .setDestinationInExternalFilesDir(this, Environment.DIRECTORY_DOWNLOADS, fileName)
    val id = (getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager).enqueue(request)
    updatePreferences.edit().putLong("download-id", id).putString("file-name", fileName).apply()
  }

  private fun installCompletedDownload(downloadId: Long) {
    val manager = getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
    val successful = manager.query(DownloadManager.Query().setFilterById(downloadId)).use { cursor ->
      if (!cursor.moveToFirst()) false
      else cursor.getInt(cursor.getColumnIndexOrThrow(DownloadManager.COLUMN_STATUS)) == DownloadManager.STATUS_SUCCESSFUL
    }
    if (!successful) return
    val fileName = updatePreferences.getString("file-name", null) ?: return
    val apk = File(getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS), fileName)
    if (!apk.exists()) return
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !packageManager.canRequestPackageInstalls()) {
      startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:$packageName")))
      return
    }
    updatePreferences.edit().clear().apply()
    val apkUri = FileProvider.getUriForFile(this, "$packageName.fileprovider", apk)
    startActivity(Intent(Intent.ACTION_VIEW).apply {
      setDataAndType(apkUri, "application/vnd.android.package-archive")
      addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
    })
  }
}
