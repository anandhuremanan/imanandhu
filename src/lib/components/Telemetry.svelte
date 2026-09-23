<script lang="ts">
	// The little live-looking panels that sit beside each case study. Purely
	// decorative mockups — they animate on a loop, they do not fetch anything.
	let {
		kind,
		accent
	}: { kind: 'route' | 'transfer' | 'metrics' | 'agent' | 'blocks'; accent: string } = $props();
</script>

<div class="tele" style="--accent: {accent}">
	{#if kind === 'route'}
		<span class="label">Live Route</span>
		<div class="rows">
			<div class="stop">
				<i class="pip done"></i>
				<div class="bar" style="width: 60%"></div>
				<span class="t mono">07:02</span>
			</div>
			<div class="link"></div>
			<div class="stop">
				<i class="pip done"></i>
				<div class="bar" style="width: 50%"></div>
				<span class="t mono">07:14</span>
			</div>
			<div class="link"></div>
			<div class="stop">
				<i class="pip live"></i>
				<div class="bar" style="width: 72%"></div>
				<span class="t mono accent">ETA ~3m</span>
			</div>
			<div class="link dashed"></div>
			<div class="stop">
				<i class="pip"></i>
				<div class="bar" style="width: 40%"></div>
				<span class="t mono">07:31</span>
			</div>
		</div>
		<span class="cap label">Real-time route timeline view</span>
	{:else if kind === 'transfer'}
		<span class="label">Transfer Session</span>
		<div class="code mono">742 · 981</div>
		<div class="devices">
			<span class="dev mono">DESKTOP</span>
			<div class="wire"><div class="pulse"></div></div>
			<span class="dev mono">MOBILE</span>
		</div>
		<div class="file">
			<div class="file-head">
				<span class="mono">presentation.pdf</span>
				<span class="mono dim">65%</span>
			</div>
			<div class="track"><div class="fill"></div></div>
			<span class="mono dim size">4.2 MB / 6.5 MB</span>
		</div>
		<span class="cap label">Temporary peer transfer mockup</span>
	{:else if kind === 'metrics'}
		<span class="label">Live Telemetry</span>
		<div class="metrics">
			<div class="metric">
				<div class="m-head"><span class="mono">CPU</span><span class="mono accent">34%</span></div>
				<div class="track"><div class="fill cpu"></div></div>
			</div>
			<div class="metric">
				<div class="m-head">
					<span class="mono">RAM</span><span class="mono accent">9.2 GB</span>
				</div>
				<div class="track"><div class="fill ram"></div></div>
			</div>
			<div class="metric">
				<div class="m-head">
					<span class="mono">DISK</span><span class="mono accent">412 GB</span>
				</div>
				<div class="track"><div class="fill disk"></div></div>
			</div>
			<div class="net">
				<span class="mono">↓ 112 Mbps</span>
				<span class="mono">↑ 24 Mbps</span>
			</div>
		</div>
		<span class="cap label">Real-time system telemetry view</span>
	{:else if kind === 'agent'}
		<div class="a-head">
			<span class="label">Local Session</span>
			<span class="mono offline">◉ OFFLINE</span>
		</div>
		<div class="model mono">ollama · qwen2.5-coder</div>
		<div class="steps">
			<div class="step">
				<span class="mono tok">›</span><span class="mono task">refactor auth middleware</span>
			</div>
			<div class="step">
				<span class="mono tok ok">✓</span><span class="mono">read <b>auth/mw.ts</b></span>
			</div>
			<div class="step">
				<span class="mono tok ok">✓</span><span class="mono">edit <b>auth/mw.ts</b></span><span
					class="diff mono">+18 −6</span
				>
			</div>
			<div class="step pending">
				<span class="mono tok wait">◆</span><span class="mono">run <b>npm test</b></span>
				<span class="approve mono">APPROVE?</span>
			</div>
		</div>
		<span class="cap label">Agent loop, running locally</span>
	{:else}
		<span class="label">Bundle</span>
		<div class="deps">
			<span class="deps-n mono">0</span>
			<span class="label">dependencies</span>
		</div>
		<div class="blocks">
			{#each ['Button', 'DataGrid', 'Combobox', 'Dialog', 'Toaster', 'Tabs', 'Popover', 'Switch'] as b (b)}
				<span class="mono block">{b}</span>
			{/each}
			<span class="more mono block">+21</span>
		</div>
		<div class="tokens">
			<span class="mono dim">--gk-radius</span>
			<span class="mono dim">--gk-accent</span>
		</div>
		<span class="cap label">Copy-in blocks, themed by CSS variables</span>
	{/if}
</div>

<style>
	.tele {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.25rem;
		border: 1px solid var(--line);
		background: rgba(255, 255, 255, 0.02);
	}

	.accent {
		color: var(--accent);
	}

	.dim {
		color: #55555f;
	}

	.cap {
		margin-top: 0.25rem;
		font-size: 0.5625rem;
		letter-spacing: 0.1em;
	}

	/* ---- route ---- */
	.rows {
		display: flex;
		flex-direction: column;
	}

	.stop {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.pip {
		width: 7px;
		height: 7px;
		border-radius: 999px;
		border: 1px solid #55555f;
		flex-shrink: 0;
	}

	.pip.done {
		background: var(--accent);
		border-color: var(--accent);
		opacity: 0.55;
	}

	.pip.live {
		background: var(--accent);
		border-color: var(--accent);
		animation: glow 2s ease-out infinite;
	}

	@keyframes glow {
		0% {
			box-shadow: 0 0 0 0 color-mix(in srgb, var(--accent) 45%, transparent);
		}
		70%,
		100% {
			box-shadow: 0 0 0 7px transparent;
		}
	}

	.bar {
		height: 2px;
		background: rgba(255, 255, 255, 0.12);
	}

	.t {
		margin-left: auto;
		font-size: 0.625rem;
		color: #94949e;
	}

	.link {
		width: 1px;
		height: 1.1rem;
		margin-left: 3px;
		background: rgba(255, 255, 255, 0.12);
	}

	.link.dashed {
		background: repeating-linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.2) 0 3px,
			transparent 3px 6px
		);
	}

	/* ---- transfer ---- */
	.code {
		text-align: center;
		font-size: 1rem;
		letter-spacing: 0.3em;
		color: var(--accent);
		padding: 0.6rem;
		border: 1px solid var(--line);
	}

	.devices {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.dev {
		font-size: 0.5625rem;
		letter-spacing: 0.12em;
		color: #94949e;
	}

	.wire {
		position: relative;
		flex: 1;
		height: 1px;
		background: rgba(255, 255, 255, 0.12);
		overflow: hidden;
	}

	.pulse {
		position: absolute;
		top: 0;
		left: -30%;
		width: 30%;
		height: 100%;
		background: linear-gradient(90deg, transparent, var(--accent), transparent);
		animation: travel 2.4s linear infinite;
	}

	@keyframes travel {
		to {
			left: 110%;
		}
	}

	.file {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		border: 1px solid var(--line);
	}

	.file-head {
		display: flex;
		justify-content: space-between;
		font-size: 0.625rem;
	}

	.size {
		font-size: 0.5625rem;
	}

	/* ---- metrics ---- */
	.metrics {
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}

	.m-head {
		display: flex;
		justify-content: space-between;
		font-size: 0.625rem;
		color: #94949e;
		margin-bottom: 0.35rem;
	}

	.net {
		display: flex;
		justify-content: space-between;
		font-size: 0.625rem;
		color: #94949e;
		padding-top: 0.6rem;
		border-top: 1px solid var(--line);
	}

	/* ---- agent ---- */
	.a-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
	}

	.offline {
		font-size: 0.5625rem;
		letter-spacing: 0.1em;
		color: var(--accent);
	}

	.model {
		font-size: 0.625rem;
		color: #94949e;
		padding: 0.5rem 0.65rem;
		border: 1px solid var(--line);
	}

	.steps {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		font-size: 0.625rem;
	}

	.step {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		color: #94949e;
	}

	.step b {
		font-weight: 400;
		color: #f0f0f2;
	}

	.tok {
		flex-shrink: 0;
		color: #55555f;
	}

	.tok.ok {
		color: var(--accent);
	}

	.tok.wait {
		color: #ffb03a;
	}

	.task {
		color: #f0f0f2;
	}

	.diff {
		margin-left: auto;
		font-size: 0.5625rem;
		color: var(--accent);
	}

	.step.pending {
		padding-top: 0.55rem;
		border-top: 1px solid var(--line);
	}

	.approve {
		margin-left: auto;
		font-size: 0.5rem;
		letter-spacing: 0.1em;
		padding: 0.2rem 0.4rem;
		color: #ffb03a;
		border: 1px solid rgba(255, 176, 58, 0.35);
		animation: blink 1.8s ease-in-out infinite;
	}

	@keyframes blink {
		50% {
			opacity: 0.35;
		}
	}

	/* ---- blocks ---- */
	.deps {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}

	.deps-n {
		font-size: 2.25rem;
		line-height: 1;
		color: var(--accent);
	}

	.blocks {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.block {
		font-size: 0.5625rem;
		padding: 0.25rem 0.45rem;
		border: 1px solid var(--line);
		color: #94949e;
	}

	.block.more {
		border-color: color-mix(in srgb, var(--accent) 35%, transparent);
		color: var(--accent);
	}

	.tokens {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		font-size: 0.5625rem;
		padding-top: 0.6rem;
		border-top: 1px solid var(--line);
	}

	/* ---- shared bars ---- */
	.track {
		height: 2px;
		background: rgba(255, 255, 255, 0.1);
		overflow: hidden;
	}

	.fill {
		height: 100%;
		background: var(--accent);
		width: 65%;
		animation: progress 5s ease-in-out infinite;
	}

	.fill.cpu {
		width: 34%;
		animation: cpu 3.2s ease-in-out infinite;
	}

	.fill.ram {
		width: 58%;
		animation: ram 8s ease-in-out infinite;
	}

	.fill.disk {
		width: 41%;
		animation: none;
	}

	@keyframes progress {
		0% {
			width: 0%;
		}
		10% {
			width: 15%;
		}
		40% {
			width: 65%;
		}
		75%,
		100% {
			width: 100%;
		}
	}

	@keyframes cpu {
		0%,
		100% {
			width: 34%;
		}
		30% {
			width: 52%;
		}
		60% {
			width: 28%;
		}
		80% {
			width: 61%;
		}
	}

	@keyframes ram {
		0%,
		100% {
			width: 58%;
		}
		50% {
			width: 65%;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fill,
		.pulse,
		.pip.live,
		.approve {
			animation: none !important;
		}
	}
</style>
