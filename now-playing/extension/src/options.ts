import { loadSettings, saveSettings, type StatusResponse } from './messages';

const $ = <T extends HTMLElement>(id: string): T => {
	const el = document.getElementById(id);
	if (!el) throw new Error(`missing #${id}`);
	return el as T;
};

const urlInput = $<HTMLInputElement>('wsUrl');
const tokenInput = $<HTMLInputElement>('ownerToken');
const form = $<HTMLFormElement>('settings');
const saved = $<HTMLParagraphElement>('saved');
const dot = $<HTMLSpanElement>('dot');
const statusText = $<HTMLSpanElement>('statusText');
const detailText = $<HTMLParagraphElement>('detail');
const trackText = $<HTMLParagraphElement>('track');

async function hydrate(): Promise<void> {
	const settings = await loadSettings();
	urlInput.value = settings.wsUrl;
	tokenInput.value = settings.ownerToken;
}

async function refreshStatus(): Promise<void> {
	let response: StatusResponse | undefined;
	try {
		response = (await chrome.runtime.sendMessage({ kind: 'status' })) as StatusResponse;
	} catch {
		// Service worker asleep or restarting.
	}

	const status = response?.status ?? 'disconnected';
	statusText.textContent =
		status === 'connected'
			? 'Connected'
			: status === 'authenticating'
				? 'Authenticating'
				: status === 'connecting'
					? 'Connecting'
					: status === 'error'
						? 'Error'
						: 'Disconnected';

	dot.dataset.state = status;
	detailText.textContent = response?.detail ?? '';
	detailText.hidden = !response?.detail;

	trackText.textContent = response?.lastTitle ? `Publishing: ${response.lastTitle}` : '';
	trackText.hidden = !response?.lastTitle;
}

form.addEventListener('submit', (event) => {
	event.preventDefault();
	void (async () => {
		await saveSettings({
			wsUrl: urlInput.value.trim(),
			ownerToken: tokenInput.value.trim()
		});
		saved.hidden = false;
		setTimeout(() => (saved.hidden = true), 1600);
		// Settings changed: force a fresh connection rather than waiting out backoff.
		await chrome.runtime.sendMessage({ kind: 'reconnect' }).catch(() => {});
		void refreshStatus();
	})();
});

$<HTMLButtonElement>('reconnect').addEventListener('click', () => {
	void chrome.runtime.sendMessage({ kind: 'reconnect' }).catch(() => {});
	setTimeout(() => void refreshStatus(), 300);
});

chrome.runtime.onMessage.addListener((message: { kind?: string }) => {
	if (message?.kind === 'status_changed') void refreshStatus();
	return false;
});

void hydrate();
void refreshStatus();
setInterval(() => void refreshStatus(), 2000);
