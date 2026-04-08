export default defineBackground(() => {
  const openDashboard = async () => {
    const url = browser.runtime.getURL('/dashboard.html');
    const tabs = await browser.tabs.query({ url });
    
    // Clear badge when opening dashboard
    browser.action.setBadgeText({ text: '' });
    
    if (tabs.length > 0) {
      browser.tabs.update(tabs[0].id!, { active: true });
      if (tabs[0].windowId) {
        browser.windows.update(tabs[0].windowId, { focused: true });
      }
    } else {
      browser.tabs.create({ url });
    }
  };

  browser.action.onClicked.addListener(openDashboard);

  // Handle messages from content scripts
  browser.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'OPEN_DASHBOARD') {
      openDashboard();
    }
  });

  // Manage Alarms based on preference
  const setupAlarm = async () => {
    const res = await browser.storage.local.get('reminder_frequency');
    const freq = parseInt((res as Record<string, any>).reminder_frequency || '0', 10);
    
    await browser.alarms.clear('eye_exercise_reminder');
    
    if (freq > 0) {
      browser.alarms.create('eye_exercise_reminder', { periodInMinutes: freq });
    }
  };

  // Run on startup
  setupAlarm();

  // Listen to config changes
  browser.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.reminder_frequency) {
      setupAlarm();
    }
  });

  // Handle the Alarm
  browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'eye_exercise_reminder') {
      const res = await browser.storage.local.get([
        'reminder_badge',
        'reminder_push',
        'reminder_banner'
      ]) as Record<string, any>;

      const useBadge = res.reminder_badge ?? true;
      const usePush = res.reminder_push ?? false;
      const useBanner = res.reminder_banner ?? true;

      if (useBadge) {
        browser.action.setBadgeText({ text: '!' });
        browser.action.setBadgeBackgroundColor({ color: '#ef4444' });
      }

      if (usePush) {
        browser.notifications.create({
          type: 'basic',
          iconUrl: browser.runtime.getURL('/icon/128.png'),
          title: 'Time for a Break!',
          message: 'Your eyes need a rest. Click the extension icon to start your exercises.',
          requireInteraction: false,
        });
      }

      if (useBanner) {
        try {
          // Send to all active tabs across windows
          const tabs = await browser.tabs.query({ active: true });
          for (const tab of tabs) {
            if (tab.id) {
              browser.tabs.sendMessage(tab.id, { type: 'SHOW_REMINDER_BANNER' }).catch(() => {
                // Ignore if tab cannot receive messages
              });
            }
          }
        } catch (e) {
          console.warn("Failed sending banner message:", e);
        }
      }
    }
  });
});