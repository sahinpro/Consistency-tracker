package com.sahinpro.consistency.block

/**
 * Accessibility + on-device VPN DNS path. Implemented in a later Phase 3 session.
 */
class NonRootBlockEngine : BlockEngine {
    @Volatile
    private var active = false

    override fun startBlock(config: BlockConfig) {
        active = true
    }

    override fun endBlock() {
        active = false
    }

    override fun isActive(): Boolean = active
}
