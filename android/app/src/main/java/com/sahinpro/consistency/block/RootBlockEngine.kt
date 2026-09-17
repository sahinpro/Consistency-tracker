package com.sahinpro.consistency.block

/**
 * Magisk/root path. Real `pm suspend-app` + hosts bind-mount lands in Phase 3.2.
 */
class RootBlockEngine : BlockEngine {
    @Volatile
    private var active = false

    @Volatile
    private var config: BlockConfig? = null

    override fun startBlock(config: BlockConfig) {
        this.config = config
        active = true
    }

    override fun endBlock() {
        active = false
    }

    override fun isActive(): Boolean = active
}
