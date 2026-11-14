package com.keepers

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

object KeepersNotificationChannels {
  const val DEFAULT_CHANNEL_ID = "keepers_default"

  fun ensureDefaultChannel(context: Context) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    val existing = manager.getNotificationChannel(DEFAULT_CHANNEL_ID)
    if (existing != null) return
    val channel =
      NotificationChannel(
        DEFAULT_CHANNEL_ID,
        "Keepers",
        NotificationManager.IMPORTANCE_HIGH,
      ).apply {
        description = "Trip, registration and club notifications"
      }
    manager.createNotificationChannel(channel)
  }
}
