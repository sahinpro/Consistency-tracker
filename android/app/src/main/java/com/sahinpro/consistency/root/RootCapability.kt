package com.sahinpro.consistency.root

import android.content.Context
import com.topjohnwu.superuser.Shell
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Probes Magisk/libsu once per launch (and whenever [detect] is called),
 * caches the result, and treats a cache miss-match as a root/unroot change.
 */
object RootCapability {
    enum class Mode { ROOT_AVAILABLE, NON_ROOT }

    private const val PREFS = "root_capability"
    private const val KEY_MODE = "mode"
    private const val KEY_CHECKED_AT = "checked_at"

    fun cachedMode(context: Context): Mode? {
        val raw = prefs(context).getString(KEY_MODE, null) ?: return null
        return runCatching { Mode.valueOf(raw) }.getOrNull()
    }

    /** Non-blocking: last known mode, if any. */
    fun peek(context: Context): Mode? = cachedMode(context)

    /**
     * Re-probes su on a background thread. Updates the cache when the
     * device has been rooted or unrooted since the last check.
     */
    suspend fun detect(context: Context): Mode = withContext(Dispatchers.IO) {
        detectBlocking(context)
    }

    fun detectBlocking(context: Context): Mode {
        val app = context.applicationContext
        val current = probe()
        val previous = cachedMode(app)
        if (previous != current) {
            prefs(app)
                .edit()
                .putString(KEY_MODE, current.name)
                .putLong(KEY_CHECKED_AT, System.currentTimeMillis())
                .apply()
        }
        return current
    }

    /** Seed cache from a previous run so the first frame can render immediately. */
    fun warmCache(context: Context) {
        cachedMode(context.applicationContext)
    }

    fun lastChangedAt(context: Context): Long =
        prefs(context).getLong(KEY_CHECKED_AT, 0L)

    private fun probe(): Mode {
        return try {
            when (Shell.isAppGrantedRoot()) {
                true -> Mode.ROOT_AVAILABLE
                false -> Mode.NON_ROOT
                null -> if (Shell.getShell().isRoot) Mode.ROOT_AVAILABLE else Mode.NON_ROOT
            }
        } catch (_: Exception) {
            Mode.NON_ROOT
        }
    }

    private fun prefs(context: Context) =
        context.applicationContext.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
}
