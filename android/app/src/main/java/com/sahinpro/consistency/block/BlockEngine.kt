package com.sahinpro.consistency.block

sealed interface BlockEngine {
    fun startBlock(config: BlockConfig)
    fun endBlock()
    fun isActive(): Boolean
}
