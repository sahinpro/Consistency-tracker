package com.sahinpro.consistency

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.sahinpro.consistency.block.BlockEngineFactory
import com.sahinpro.consistency.block.NonRootBlockEngine
import com.sahinpro.consistency.block.RootBlockEngine
import com.sahinpro.consistency.root.RootCapability
import kotlinx.coroutines.launch

/**
 * Temporary launch screen so Phase 3.1 can be verified on-device.
 * Planning / settings UI is later phases.
 */
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        val status = findViewById<TextView>(R.id.status)
        val engineLabel = findViewById<TextView>(R.id.engine)

        RootCapability.peek(this)?.let { status.text = labelFor(it) }

        lifecycleScope.launch {
            val mode = RootCapability.detect(this@MainActivity)
            val engine = BlockEngineFactory.get(this@MainActivity)
            status.text = labelFor(mode)
            engineLabel.text = when (engine) {
                is RootBlockEngine -> getString(R.string.engine_root)
                is NonRootBlockEngine -> getString(R.string.engine_non_root)
            }
        }
    }

    private fun labelFor(mode: RootCapability.Mode): String {
        return when (mode) {
            RootCapability.Mode.ROOT_AVAILABLE -> getString(R.string.mode_root)
            RootCapability.Mode.NON_ROOT -> getString(R.string.mode_non_root)
        }
    }
}
