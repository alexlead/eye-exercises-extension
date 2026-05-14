var background = (function() {
	//#region node_modules/wxt/dist/utils/define-background.mjs
	function defineBackground(arg) {
		if (arg == null || typeof arg === "function") return { main: arg };
		return arg;
	}
	//#endregion
	//#region node_modules/wxt/dist/browser.mjs
	/**
	* Contains the `browser` export which you should use to access the extension
	* APIs in your project:
	*
	* ```ts
	* import { browser } from 'wxt/browser';
	*
	* browser.runtime.onInstalled.addListener(() => {
	*   // ...
	* });
	* ```
	*
	* @module wxt/browser
	*/
	var browser = globalThis.browser?.runtime?.id ? globalThis.browser : globalThis.chrome;
	//#endregion
	//#region entrypoints/background.ts
	var background_default = defineBackground(() => {
		const openDashboard = async () => {
			const url = browser.runtime.getURL("/dashboard.html");
			const tabs = await browser.tabs.query({ url });
			browser.action.setBadgeText({ text: "" });
			if (tabs.length > 0) {
				browser.tabs.update(tabs[0].id, { active: true });
				if (tabs[0].windowId) browser.windows.update(tabs[0].windowId, { focused: true });
			} else browser.tabs.create({ url });
		};
		browser.action.onClicked.addListener(openDashboard);
		browser.runtime.onMessage.addListener((msg) => {
			if (msg.type === "OPEN_DASHBOARD") openDashboard();
		});
		const setupAlarm = async () => {
			const res = await browser.storage.local.get("reminder_frequency");
			const freq = parseInt(res.reminder_frequency || "0", 10);
			await browser.alarms.clear("eye_exercise_reminder");
			if (freq > 0) browser.alarms.create("eye_exercise_reminder", { periodInMinutes: freq });
		};
		setupAlarm();
		browser.storage.onChanged.addListener((changes, area) => {
			if (area === "local" && changes.reminder_frequency) setupAlarm();
		});
		browser.alarms.onAlarm.addListener(async (alarm) => {
			if (alarm.name === "eye_exercise_reminder") {
				const res = await browser.storage.local.get([
					"reminder_badge",
					"reminder_push",
					"reminder_banner"
				]);
				const useBadge = res.reminder_badge ?? true;
				const usePush = res.reminder_push ?? false;
				const useBanner = res.reminder_banner ?? true;
				if (useBadge) {
					browser.action.setBadgeText({ text: "!" });
					browser.action.setBadgeBackgroundColor({ color: "#ef4444" });
				}
				if (usePush) browser.notifications.create({
					type: "basic",
					iconUrl: browser.runtime.getURL("/icon/128.png"),
					title: "Time for a Break!",
					message: "Your eyes need a rest. Click the extension icon to start your exercises.",
					requireInteraction: false
				});
				if (useBanner) try {
					const tabs = await browser.tabs.query({ active: true });
					for (const tab of tabs) if (tab.id) browser.tabs.sendMessage(tab.id, { type: "SHOW_REMINDER_BANNER" }).catch(() => {});
				} catch (e) {
					console.warn("Failed sending banner message:", e);
				}
			}
		});
	});
	//#endregion
	//#region node_modules/@webext-core/match-patterns/lib/index.js
	var _MatchPattern = class {
		constructor(matchPattern) {
			if (matchPattern === "<all_urls>") {
				this.isAllUrls = true;
				this.protocolMatches = [..._MatchPattern.PROTOCOLS];
				this.hostnameMatch = "*";
				this.pathnameMatch = "*";
			} else {
				const groups = /(.*):\/\/(.*?)(\/.*)/.exec(matchPattern);
				if (groups == null) throw new InvalidMatchPattern(matchPattern, "Incorrect format");
				const [_, protocol, hostname, pathname] = groups;
				validateProtocol(matchPattern, protocol);
				validateHostname(matchPattern, hostname);
				validatePathname(matchPattern, pathname);
				this.protocolMatches = protocol === "*" ? ["http", "https"] : [protocol];
				this.hostnameMatch = hostname;
				this.pathnameMatch = pathname;
			}
		}
		includes(url) {
			if (this.isAllUrls) return true;
			const u = typeof url === "string" ? new URL(url) : url instanceof Location ? new URL(url.href) : url;
			return !!this.protocolMatches.find((protocol) => {
				if (protocol === "http") return this.isHttpMatch(u);
				if (protocol === "https") return this.isHttpsMatch(u);
				if (protocol === "file") return this.isFileMatch(u);
				if (protocol === "ftp") return this.isFtpMatch(u);
				if (protocol === "urn") return this.isUrnMatch(u);
			});
		}
		isHttpMatch(url) {
			return url.protocol === "http:" && this.isHostPathMatch(url);
		}
		isHttpsMatch(url) {
			return url.protocol === "https:" && this.isHostPathMatch(url);
		}
		isHostPathMatch(url) {
			if (!this.hostnameMatch || !this.pathnameMatch) return false;
			const hostnameMatchRegexs = [this.convertPatternToRegex(this.hostnameMatch), this.convertPatternToRegex(this.hostnameMatch.replace(/^\*\./, ""))];
			const pathnameMatchRegex = this.convertPatternToRegex(this.pathnameMatch);
			return !!hostnameMatchRegexs.find((regex) => regex.test(url.hostname)) && pathnameMatchRegex.test(url.pathname);
		}
		isFileMatch(url) {
			throw Error("Not implemented: file:// pattern matching. Open a PR to add support");
		}
		isFtpMatch(url) {
			throw Error("Not implemented: ftp:// pattern matching. Open a PR to add support");
		}
		isUrnMatch(url) {
			throw Error("Not implemented: urn:// pattern matching. Open a PR to add support");
		}
		convertPatternToRegex(pattern) {
			const starsReplaced = this.escapeForRegex(pattern).replace(/\\\*/g, ".*");
			return RegExp(`^${starsReplaced}$`);
		}
		escapeForRegex(string) {
			return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
	};
	var MatchPattern = _MatchPattern;
	MatchPattern.PROTOCOLS = [
		"http",
		"https",
		"file",
		"ftp",
		"urn"
	];
	var InvalidMatchPattern = class extends Error {
		constructor(matchPattern, reason) {
			super(`Invalid match pattern "${matchPattern}": ${reason}`);
		}
	};
	function validateProtocol(matchPattern, protocol) {
		if (!MatchPattern.PROTOCOLS.includes(protocol) && protocol !== "*") throw new InvalidMatchPattern(matchPattern, `${protocol} not a valid protocol (${MatchPattern.PROTOCOLS.join(", ")})`);
	}
	function validateHostname(matchPattern, hostname) {
		if (hostname.includes(":")) throw new InvalidMatchPattern(matchPattern, `Hostname cannot include a port`);
		if (hostname.includes("*") && hostname.length > 1 && !hostname.startsWith("*.")) throw new InvalidMatchPattern(matchPattern, `If using a wildcard (*), it must go at the start of the hostname`);
	}
	function validatePathname(matchPattern, pathname) {}
	//#endregion
	//#region \0virtual:wxt-background-entrypoint?D:/chrome-extentions/eyes-excersizes-tool/eye-exercises/entrypoints/background.ts
	function print(method, ...args) {
		if (typeof args[0] === "string") method(`[wxt] ${args.shift()}`, ...args);
		else method("[wxt]", ...args);
	}
	/** Wrapper around `console` with a "[wxt]" prefix */
	var logger = {
		debug: (...args) => print(console.debug, ...args),
		log: (...args) => print(console.log, ...args),
		warn: (...args) => print(console.warn, ...args),
		error: (...args) => print(console.error, ...args)
	};
	var ws;
	/** Connect to the websocket and listen for messages. */
	function getDevServerWebSocket() {
		if (ws == null) {
			const serverUrl = "ws://localhost:3000";
			logger.debug("Connecting to dev server @", serverUrl);
			ws = new WebSocket(serverUrl, "vite-hmr");
			ws.addWxtEventListener = ws.addEventListener.bind(ws);
			ws.sendCustom = (event, payload) => ws?.send(JSON.stringify({
				type: "custom",
				event,
				payload
			}));
			ws.addEventListener("open", () => {
				logger.debug("Connected to dev server");
			});
			ws.addEventListener("close", () => {
				logger.debug("Disconnected from dev server");
			});
			ws.addEventListener("error", (event) => {
				logger.error("Failed to connect to dev server", event);
			});
			ws.addEventListener("message", (e) => {
				try {
					const message = JSON.parse(e.data);
					if (message.type === "custom") ws?.dispatchEvent(new CustomEvent(message.event, { detail: message.data }));
				} catch (err) {
					logger.error("Failed to handle message", err);
				}
			});
		}
		return ws;
	}
	function reloadContentScript(payload) {
		if (browser.runtime.getManifest().manifest_version == 2) reloadContentScriptMv2(payload);
		else reloadContentScriptMv3(payload);
	}
	async function reloadContentScriptMv3({ registration, contentScript }) {
		if (registration === "runtime") await reloadRuntimeContentScriptMv3(contentScript);
		else await reloadManifestContentScriptMv3(contentScript);
	}
	async function reloadManifestContentScriptMv3(contentScript) {
		const id = `wxt:${contentScript.js[0]}`;
		logger.log("Reloading content script:", contentScript);
		const registered = await browser.scripting.getRegisteredContentScripts();
		logger.debug("Existing scripts:", registered);
		const existing = registered.find((cs) => cs.id === id);
		if (existing) {
			logger.debug("Updating content script", existing);
			await browser.scripting.updateContentScripts([{
				...contentScript,
				id,
				css: contentScript.css ?? []
			}]);
		} else {
			logger.debug("Registering new content script...");
			await browser.scripting.registerContentScripts([{
				...contentScript,
				id,
				css: contentScript.css ?? []
			}]);
		}
		await reloadTabsForContentScript(contentScript);
	}
	async function reloadRuntimeContentScriptMv3(contentScript) {
		logger.log("Reloading content script:", contentScript);
		const registered = await browser.scripting.getRegisteredContentScripts();
		logger.debug("Existing scripts:", registered);
		const matches = registered.filter((cs) => {
			const hasJs = contentScript.js?.find((js) => cs.js?.includes(js));
			const hasCss = contentScript.css?.find((css) => cs.css?.includes(css));
			return hasJs || hasCss;
		});
		if (matches.length === 0) {
			logger.log("Content script is not registered yet, nothing to reload", contentScript);
			return;
		}
		await browser.scripting.updateContentScripts(matches);
		await reloadTabsForContentScript(contentScript);
	}
	async function reloadTabsForContentScript(contentScript) {
		const allTabs = await browser.tabs.query({});
		const matchPatterns = contentScript.matches.map((match) => new MatchPattern(match));
		const matchingTabs = allTabs.filter((tab) => {
			const url = tab.url;
			if (!url) return false;
			return !!matchPatterns.find((pattern) => pattern.includes(url));
		});
		await Promise.all(matchingTabs.map(async (tab) => {
			try {
				await browser.tabs.reload(tab.id);
			} catch (err) {
				logger.warn("Failed to reload tab:", err);
			}
		}));
	}
	async function reloadContentScriptMv2(_payload) {
		throw Error("TODO: reloadContentScriptMv2");
	}
	try {
		const ws = getDevServerWebSocket();
		ws.addWxtEventListener("wxt:reload-extension", () => {
			browser.runtime.reload();
		});
		ws.addWxtEventListener("wxt:reload-content-script", (event) => {
			reloadContentScript(event.detail);
		});
	} catch (err) {
		logger.error("Failed to setup web socket connection with dev server", err);
	}
	browser.commands.onCommand.addListener((command) => {
		if (command === "wxt:reload-extension") browser.runtime.reload();
	});
	var result;
	try {
		result = background_default.main();
		if (result instanceof Promise) console.warn("The background's main() function return a promise, but it must be synchronous");
	} catch (err) {
		logger.error("The background crashed on startup!");
		throw err;
	}
	//#endregion
	return result;
})();

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2dyb3VuZC5qcyIsIm5hbWVzIjpbImJyb3dzZXIiXSwic291cmNlcyI6WyIuLi8uLi9ub2RlX21vZHVsZXMvd3h0L2Rpc3QvdXRpbHMvZGVmaW5lLWJhY2tncm91bmQubWpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL0B3eHQtZGV2L2Jyb3dzZXIvc3JjL2luZGV4Lm1qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy93eHQvZGlzdC9icm93c2VyLm1qcyIsIi4uLy4uL2VudHJ5cG9pbnRzL2JhY2tncm91bmQudHMiLCIuLi8uLi9ub2RlX21vZHVsZXMvQHdlYmV4dC1jb3JlL21hdGNoLXBhdHRlcm5zL2xpYi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyNyZWdpb24gc3JjL3V0aWxzL2RlZmluZS1iYWNrZ3JvdW5kLnRzXG5mdW5jdGlvbiBkZWZpbmVCYWNrZ3JvdW5kKGFyZykge1xuXHRpZiAoYXJnID09IG51bGwgfHwgdHlwZW9mIGFyZyA9PT0gXCJmdW5jdGlvblwiKSByZXR1cm4geyBtYWluOiBhcmcgfTtcblx0cmV0dXJuIGFyZztcbn1cbi8vI2VuZHJlZ2lvblxuZXhwb3J0IHsgZGVmaW5lQmFja2dyb3VuZCB9O1xuIiwiLy8gI3JlZ2lvbiBzbmlwcGV0XG5leHBvcnQgY29uc3QgYnJvd3NlciA9IGdsb2JhbFRoaXMuYnJvd3Nlcj8ucnVudGltZT8uaWRcbiAgPyBnbG9iYWxUaGlzLmJyb3dzZXJcbiAgOiBnbG9iYWxUaGlzLmNocm9tZTtcbi8vICNlbmRyZWdpb24gc25pcHBldFxuIiwiaW1wb3J0IHsgYnJvd3NlciBhcyBicm93c2VyJDEgfSBmcm9tIFwiQHd4dC1kZXYvYnJvd3NlclwiO1xuLy8jcmVnaW9uIHNyYy9icm93c2VyLnRzXG4vKipcbiogQ29udGFpbnMgdGhlIGBicm93c2VyYCBleHBvcnQgd2hpY2ggeW91IHNob3VsZCB1c2UgdG8gYWNjZXNzIHRoZSBleHRlbnNpb25cbiogQVBJcyBpbiB5b3VyIHByb2plY3Q6XG4qXG4qIGBgYHRzXG4qIGltcG9ydCB7IGJyb3dzZXIgfSBmcm9tICd3eHQvYnJvd3Nlcic7XG4qXG4qIGJyb3dzZXIucnVudGltZS5vbkluc3RhbGxlZC5hZGRMaXN0ZW5lcigoKSA9PiB7XG4qICAgLy8gLi4uXG4qIH0pO1xuKiBgYGBcbipcbiogQG1vZHVsZSB3eHQvYnJvd3NlclxuKi9cbmNvbnN0IGJyb3dzZXIgPSBicm93c2VyJDE7XG4vLyNlbmRyZWdpb25cbmV4cG9ydCB7IGJyb3dzZXIgfTtcbiIsImV4cG9ydCBkZWZhdWx0IGRlZmluZUJhY2tncm91bmQoKCkgPT4ge1xuICBjb25zdCBvcGVuRGFzaGJvYXJkID0gYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHVybCA9IGJyb3dzZXIucnVudGltZS5nZXRVUkwoJy9kYXNoYm9hcmQuaHRtbCcpO1xuICAgIGNvbnN0IHRhYnMgPSBhd2FpdCBicm93c2VyLnRhYnMucXVlcnkoeyB1cmwgfSk7XG4gICAgXG4gICAgLy8gQ2xlYXIgYmFkZ2Ugd2hlbiBvcGVuaW5nIGRhc2hib2FyZFxuICAgIGJyb3dzZXIuYWN0aW9uLnNldEJhZGdlVGV4dCh7IHRleHQ6ICcnIH0pO1xuICAgIFxuICAgIGlmICh0YWJzLmxlbmd0aCA+IDApIHtcbiAgICAgIGJyb3dzZXIudGFicy51cGRhdGUodGFic1swXS5pZCEsIHsgYWN0aXZlOiB0cnVlIH0pO1xuICAgICAgaWYgKHRhYnNbMF0ud2luZG93SWQpIHtcbiAgICAgICAgYnJvd3Nlci53aW5kb3dzLnVwZGF0ZSh0YWJzWzBdLndpbmRvd0lkLCB7IGZvY3VzZWQ6IHRydWUgfSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyb3dzZXIudGFicy5jcmVhdGUoeyB1cmwgfSk7XG4gICAgfVxuICB9O1xuXG4gIGJyb3dzZXIuYWN0aW9uLm9uQ2xpY2tlZC5hZGRMaXN0ZW5lcihvcGVuRGFzaGJvYXJkKTtcblxuICAvLyBIYW5kbGUgbWVzc2FnZXMgZnJvbSBjb250ZW50IHNjcmlwdHNcbiAgYnJvd3Nlci5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcigobXNnKSA9PiB7XG4gICAgaWYgKG1zZy50eXBlID09PSAnT1BFTl9EQVNIQk9BUkQnKSB7XG4gICAgICBvcGVuRGFzaGJvYXJkKCk7XG4gICAgfVxuICB9KTtcblxuICAvLyBNYW5hZ2UgQWxhcm1zIGJhc2VkIG9uIHByZWZlcmVuY2VcbiAgY29uc3Qgc2V0dXBBbGFybSA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCBicm93c2VyLnN0b3JhZ2UubG9jYWwuZ2V0KCdyZW1pbmRlcl9mcmVxdWVuY3knKTtcbiAgICBjb25zdCBmcmVxID0gcGFyc2VJbnQoKHJlcyBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+KS5yZW1pbmRlcl9mcmVxdWVuY3kgfHwgJzAnLCAxMCk7XG4gICAgXG4gICAgYXdhaXQgYnJvd3Nlci5hbGFybXMuY2xlYXIoJ2V5ZV9leGVyY2lzZV9yZW1pbmRlcicpO1xuICAgIFxuICAgIGlmIChmcmVxID4gMCkge1xuICAgICAgYnJvd3Nlci5hbGFybXMuY3JlYXRlKCdleWVfZXhlcmNpc2VfcmVtaW5kZXInLCB7IHBlcmlvZEluTWludXRlczogZnJlcSB9KTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUnVuIG9uIHN0YXJ0dXBcbiAgc2V0dXBBbGFybSgpO1xuXG4gIC8vIExpc3RlbiB0byBjb25maWcgY2hhbmdlc1xuICBicm93c2VyLnN0b3JhZ2Uub25DaGFuZ2VkLmFkZExpc3RlbmVyKChjaGFuZ2VzLCBhcmVhKSA9PiB7XG4gICAgaWYgKGFyZWEgPT09ICdsb2NhbCcgJiYgY2hhbmdlcy5yZW1pbmRlcl9mcmVxdWVuY3kpIHtcbiAgICAgIHNldHVwQWxhcm0oKTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEhhbmRsZSB0aGUgQWxhcm1cbiAgYnJvd3Nlci5hbGFybXMub25BbGFybS5hZGRMaXN0ZW5lcihhc3luYyAoYWxhcm0pID0+IHtcbiAgICBpZiAoYWxhcm0ubmFtZSA9PT0gJ2V5ZV9leGVyY2lzZV9yZW1pbmRlcicpIHtcbiAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IGJyb3dzZXIuc3RvcmFnZS5sb2NhbC5nZXQoW1xuICAgICAgICAncmVtaW5kZXJfYmFkZ2UnLFxuICAgICAgICAncmVtaW5kZXJfcHVzaCcsXG4gICAgICAgICdyZW1pbmRlcl9iYW5uZXInXG4gICAgICBdKSBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+O1xuXG4gICAgICBjb25zdCB1c2VCYWRnZSA9IHJlcy5yZW1pbmRlcl9iYWRnZSA/PyB0cnVlO1xuICAgICAgY29uc3QgdXNlUHVzaCA9IHJlcy5yZW1pbmRlcl9wdXNoID8/IGZhbHNlO1xuICAgICAgY29uc3QgdXNlQmFubmVyID0gcmVzLnJlbWluZGVyX2Jhbm5lciA/PyB0cnVlO1xuXG4gICAgICBpZiAodXNlQmFkZ2UpIHtcbiAgICAgICAgYnJvd3Nlci5hY3Rpb24uc2V0QmFkZ2VUZXh0KHsgdGV4dDogJyEnIH0pO1xuICAgICAgICBicm93c2VyLmFjdGlvbi5zZXRCYWRnZUJhY2tncm91bmRDb2xvcih7IGNvbG9yOiAnI2VmNDQ0NCcgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh1c2VQdXNoKSB7XG4gICAgICAgIGJyb3dzZXIubm90aWZpY2F0aW9ucy5jcmVhdGUoe1xuICAgICAgICAgIHR5cGU6ICdiYXNpYycsXG4gICAgICAgICAgaWNvblVybDogYnJvd3Nlci5ydW50aW1lLmdldFVSTCgnL2ljb24vMTI4LnBuZycpLFxuICAgICAgICAgIHRpdGxlOiAnVGltZSBmb3IgYSBCcmVhayEnLFxuICAgICAgICAgIG1lc3NhZ2U6ICdZb3VyIGV5ZXMgbmVlZCBhIHJlc3QuIENsaWNrIHRoZSBleHRlbnNpb24gaWNvbiB0byBzdGFydCB5b3VyIGV4ZXJjaXNlcy4nLFxuICAgICAgICAgIHJlcXVpcmVJbnRlcmFjdGlvbjogZmFsc2UsXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodXNlQmFubmVyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgLy8gU2VuZCB0byBhbGwgYWN0aXZlIHRhYnMgYWNyb3NzIHdpbmRvd3NcbiAgICAgICAgICBjb25zdCB0YWJzID0gYXdhaXQgYnJvd3Nlci50YWJzLnF1ZXJ5KHsgYWN0aXZlOiB0cnVlIH0pO1xuICAgICAgICAgIGZvciAoY29uc3QgdGFiIG9mIHRhYnMpIHtcbiAgICAgICAgICAgIGlmICh0YWIuaWQpIHtcbiAgICAgICAgICAgICAgYnJvd3Nlci50YWJzLnNlbmRNZXNzYWdlKHRhYi5pZCwgeyB0eXBlOiAnU0hPV19SRU1JTkRFUl9CQU5ORVInIH0pLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBJZ25vcmUgaWYgdGFiIGNhbm5vdCByZWNlaXZlIG1lc3NhZ2VzXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIkZhaWxlZCBzZW5kaW5nIGJhbm5lciBtZXNzYWdlOlwiLCBlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTsiLCIvLyBzcmMvaW5kZXgudHNcbnZhciBfTWF0Y2hQYXR0ZXJuID0gY2xhc3Mge1xuICBjb25zdHJ1Y3RvcihtYXRjaFBhdHRlcm4pIHtcbiAgICBpZiAobWF0Y2hQYXR0ZXJuID09PSBcIjxhbGxfdXJscz5cIikge1xuICAgICAgdGhpcy5pc0FsbFVybHMgPSB0cnVlO1xuICAgICAgdGhpcy5wcm90b2NvbE1hdGNoZXMgPSBbLi4uX01hdGNoUGF0dGVybi5QUk9UT0NPTFNdO1xuICAgICAgdGhpcy5ob3N0bmFtZU1hdGNoID0gXCIqXCI7XG4gICAgICB0aGlzLnBhdGhuYW1lTWF0Y2ggPSBcIipcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZ3JvdXBzID0gLyguKik6XFwvXFwvKC4qPykoXFwvLiopLy5leGVjKG1hdGNoUGF0dGVybik7XG4gICAgICBpZiAoZ3JvdXBzID09IG51bGwpXG4gICAgICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgXCJJbmNvcnJlY3QgZm9ybWF0XCIpO1xuICAgICAgY29uc3QgW18sIHByb3RvY29sLCBob3N0bmFtZSwgcGF0aG5hbWVdID0gZ3JvdXBzO1xuICAgICAgdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKTtcbiAgICAgIHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSk7XG4gICAgICB2YWxpZGF0ZVBhdGhuYW1lKG1hdGNoUGF0dGVybiwgcGF0aG5hbWUpO1xuICAgICAgdGhpcy5wcm90b2NvbE1hdGNoZXMgPSBwcm90b2NvbCA9PT0gXCIqXCIgPyBbXCJodHRwXCIsIFwiaHR0cHNcIl0gOiBbcHJvdG9jb2xdO1xuICAgICAgdGhpcy5ob3N0bmFtZU1hdGNoID0gaG9zdG5hbWU7XG4gICAgICB0aGlzLnBhdGhuYW1lTWF0Y2ggPSBwYXRobmFtZTtcbiAgICB9XG4gIH1cbiAgaW5jbHVkZXModXJsKSB7XG4gICAgaWYgKHRoaXMuaXNBbGxVcmxzKVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgY29uc3QgdSA9IHR5cGVvZiB1cmwgPT09IFwic3RyaW5nXCIgPyBuZXcgVVJMKHVybCkgOiB1cmwgaW5zdGFuY2VvZiBMb2NhdGlvbiA/IG5ldyBVUkwodXJsLmhyZWYpIDogdXJsO1xuICAgIHJldHVybiAhIXRoaXMucHJvdG9jb2xNYXRjaGVzLmZpbmQoKHByb3RvY29sKSA9PiB7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiaHR0cFwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0h0dHBNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJodHRwc1wiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0h0dHBzTWF0Y2godSk7XG4gICAgICBpZiAocHJvdG9jb2wgPT09IFwiZmlsZVwiKVxuICAgICAgICByZXR1cm4gdGhpcy5pc0ZpbGVNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJmdHBcIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNGdHBNYXRjaCh1KTtcbiAgICAgIGlmIChwcm90b2NvbCA9PT0gXCJ1cm5cIilcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNVcm5NYXRjaCh1KTtcbiAgICB9KTtcbiAgfVxuICBpc0h0dHBNYXRjaCh1cmwpIHtcbiAgICByZXR1cm4gdXJsLnByb3RvY29sID09PSBcImh0dHA6XCIgJiYgdGhpcy5pc0hvc3RQYXRoTWF0Y2godXJsKTtcbiAgfVxuICBpc0h0dHBzTWF0Y2godXJsKSB7XG4gICAgcmV0dXJuIHVybC5wcm90b2NvbCA9PT0gXCJodHRwczpcIiAmJiB0aGlzLmlzSG9zdFBhdGhNYXRjaCh1cmwpO1xuICB9XG4gIGlzSG9zdFBhdGhNYXRjaCh1cmwpIHtcbiAgICBpZiAoIXRoaXMuaG9zdG5hbWVNYXRjaCB8fCAhdGhpcy5wYXRobmFtZU1hdGNoKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIGNvbnN0IGhvc3RuYW1lTWF0Y2hSZWdleHMgPSBbXG4gICAgICB0aGlzLmNvbnZlcnRQYXR0ZXJuVG9SZWdleCh0aGlzLmhvc3RuYW1lTWF0Y2gpLFxuICAgICAgdGhpcy5jb252ZXJ0UGF0dGVyblRvUmVnZXgodGhpcy5ob3N0bmFtZU1hdGNoLnJlcGxhY2UoL15cXCpcXC4vLCBcIlwiKSlcbiAgICBdO1xuICAgIGNvbnN0IHBhdGhuYW1lTWF0Y2hSZWdleCA9IHRoaXMuY29udmVydFBhdHRlcm5Ub1JlZ2V4KHRoaXMucGF0aG5hbWVNYXRjaCk7XG4gICAgcmV0dXJuICEhaG9zdG5hbWVNYXRjaFJlZ2V4cy5maW5kKChyZWdleCkgPT4gcmVnZXgudGVzdCh1cmwuaG9zdG5hbWUpKSAmJiBwYXRobmFtZU1hdGNoUmVnZXgudGVzdCh1cmwucGF0aG5hbWUpO1xuICB9XG4gIGlzRmlsZU1hdGNoKHVybCkge1xuICAgIHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmaWxlOi8vIHBhdHRlcm4gbWF0Y2hpbmcuIE9wZW4gYSBQUiB0byBhZGQgc3VwcG9ydFwiKTtcbiAgfVxuICBpc0Z0cE1hdGNoKHVybCkge1xuICAgIHRocm93IEVycm9yKFwiTm90IGltcGxlbWVudGVkOiBmdHA6Ly8gcGF0dGVybiBtYXRjaGluZy4gT3BlbiBhIFBSIHRvIGFkZCBzdXBwb3J0XCIpO1xuICB9XG4gIGlzVXJuTWF0Y2godXJsKSB7XG4gICAgdGhyb3cgRXJyb3IoXCJOb3QgaW1wbGVtZW50ZWQ6IHVybjovLyBwYXR0ZXJuIG1hdGNoaW5nLiBPcGVuIGEgUFIgdG8gYWRkIHN1cHBvcnRcIik7XG4gIH1cbiAgY29udmVydFBhdHRlcm5Ub1JlZ2V4KHBhdHRlcm4pIHtcbiAgICBjb25zdCBlc2NhcGVkID0gdGhpcy5lc2NhcGVGb3JSZWdleChwYXR0ZXJuKTtcbiAgICBjb25zdCBzdGFyc1JlcGxhY2VkID0gZXNjYXBlZC5yZXBsYWNlKC9cXFxcXFwqL2csIFwiLipcIik7XG4gICAgcmV0dXJuIFJlZ0V4cChgXiR7c3RhcnNSZXBsYWNlZH0kYCk7XG4gIH1cbiAgZXNjYXBlRm9yUmVnZXgoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgXCJcXFxcJCZcIik7XG4gIH1cbn07XG52YXIgTWF0Y2hQYXR0ZXJuID0gX01hdGNoUGF0dGVybjtcbk1hdGNoUGF0dGVybi5QUk9UT0NPTFMgPSBbXCJodHRwXCIsIFwiaHR0cHNcIiwgXCJmaWxlXCIsIFwiZnRwXCIsIFwidXJuXCJdO1xudmFyIEludmFsaWRNYXRjaFBhdHRlcm4gPSBjbGFzcyBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWF0Y2hQYXR0ZXJuLCByZWFzb24pIHtcbiAgICBzdXBlcihgSW52YWxpZCBtYXRjaCBwYXR0ZXJuIFwiJHttYXRjaFBhdHRlcm59XCI6ICR7cmVhc29ufWApO1xuICB9XG59O1xuZnVuY3Rpb24gdmFsaWRhdGVQcm90b2NvbChtYXRjaFBhdHRlcm4sIHByb3RvY29sKSB7XG4gIGlmICghTWF0Y2hQYXR0ZXJuLlBST1RPQ09MUy5pbmNsdWRlcyhwcm90b2NvbCkgJiYgcHJvdG9jb2wgIT09IFwiKlwiKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKFxuICAgICAgbWF0Y2hQYXR0ZXJuLFxuICAgICAgYCR7cHJvdG9jb2x9IG5vdCBhIHZhbGlkIHByb3RvY29sICgke01hdGNoUGF0dGVybi5QUk9UT0NPTFMuam9pbihcIiwgXCIpfSlgXG4gICAgKTtcbn1cbmZ1bmN0aW9uIHZhbGlkYXRlSG9zdG5hbWUobWF0Y2hQYXR0ZXJuLCBob3N0bmFtZSkge1xuICBpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCI6XCIpKVxuICAgIHRocm93IG5ldyBJbnZhbGlkTWF0Y2hQYXR0ZXJuKG1hdGNoUGF0dGVybiwgYEhvc3RuYW1lIGNhbm5vdCBpbmNsdWRlIGEgcG9ydGApO1xuICBpZiAoaG9zdG5hbWUuaW5jbHVkZXMoXCIqXCIpICYmIGhvc3RuYW1lLmxlbmd0aCA+IDEgJiYgIWhvc3RuYW1lLnN0YXJ0c1dpdGgoXCIqLlwiKSlcbiAgICB0aHJvdyBuZXcgSW52YWxpZE1hdGNoUGF0dGVybihcbiAgICAgIG1hdGNoUGF0dGVybixcbiAgICAgIGBJZiB1c2luZyBhIHdpbGRjYXJkICgqKSwgaXQgbXVzdCBnbyBhdCB0aGUgc3RhcnQgb2YgdGhlIGhvc3RuYW1lYFxuICAgICk7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZVBhdGhuYW1lKG1hdGNoUGF0dGVybiwgcGF0aG5hbWUpIHtcbiAgcmV0dXJuO1xufVxuZXhwb3J0IHtcbiAgSW52YWxpZE1hdGNoUGF0dGVybixcbiAgTWF0Y2hQYXR0ZXJuXG59O1xuIl0sInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiw0XSwibWFwcGluZ3MiOiI7O0NBQ0EsU0FBUyxpQkFBaUIsS0FBSztBQUM5QixNQUFJLE9BQU8sUUFBUSxPQUFPLFFBQVEsV0FBWSxRQUFPLEVBQUUsTUFBTSxLQUFLO0FBQ2xFLFNBQU87Ozs7Ozs7Ozs7Ozs7Ozs7OztDRWFSLElBQU0sVURmaUIsV0FB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