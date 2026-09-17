package com.sahinpro.consistency

import android.app.Application
import android.content.pm.ApplicationInfo
import androidx.appcompat.app.AppCompatDelegate
import com.sahinpro.consistency.root.RootCapability
import com.topjohnwu.superuser.Shell

class ConsistencyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES)
        val debuggable = (applicationInfo.flags and ApplicationInfo.FLAG_DEBUGGABLE) != 0
        Shell.enableVerboseLogging = debuggable
        Shell.setDefaultBuilder(
            Shell.Builder.create().setTimeout(10),
        )
        RootCapability.warmCache(this)
    }
}
