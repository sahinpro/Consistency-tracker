package com.sahinpro.consistency.block

import android.content.Context
import com.sahinpro.consistency.root.RootCapability

object BlockEngineFactory {
    @Volatile
    private var instance: BlockEngine? = null

    @Volatile
    private var boundMode: RootCapability.Mode? = null

    @Synchronized
    fun get(context: Context): BlockEngine {
        val mode = RootCapability.detectBlocking(context)
        val existing = instance
        if (existing != null && boundMode == mode) return existing
        val created = create(mode)
        instance = created
        boundMode = mode
        return created
    }

    fun create(mode: RootCapability.Mode): BlockEngine {
        return when (mode) {
            RootCapability.Mode.ROOT_AVAILABLE -> RootBlockEngine()
            RootCapability.Mode.NON_ROOT -> NonRootBlockEngine()
        }
    }
}
