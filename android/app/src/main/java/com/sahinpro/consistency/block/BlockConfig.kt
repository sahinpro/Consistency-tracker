package com.sahinpro.consistency.block

data class BlockConfig(
    val blockedApps: List<String>,
    val blockedDomains: List<String>,
    val dailyWindowStart: String? = null,
    val dailyWindowEnd: String? = null,
    val ringtoneUri: String? = null,
)
