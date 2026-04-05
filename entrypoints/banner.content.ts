export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg.type === 'SHOW_REMINDER_BANNER') {
        const id = 'eyeletic-banner';

        // Remove existing banner if left
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        const banner = document.createElement('div');
        banner.id = id;
        banner.style.position = 'fixed';
        banner.style.top = '0';
        banner.style.left = '0';
        banner.style.width = '100%';
        banner.style.backgroundColor = '#ef4444';
        banner.style.color = '#fff';
        banner.style.zIndex = '2147483647'; // max z-index
        banner.style.padding = '12px 24px';
        banner.style.display = 'flex';
        banner.style.justifyContent = 'space-between';
        banner.style.alignItems = 'center';
        banner.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        banner.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.2)';
        banner.style.boxSizing = 'border-box';

        banner.innerHTML = `
          <div style="font-weight: 600; font-size: 15px; letter-spacing: 0.3px;">Your eyes need a rest. Take a 5-minute break.</div>
          <div style="display: flex; gap: 12px; align-items: center;">
            <button id="start-btn-${id}" style="background: white; color: #ef4444; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 800; cursor: pointer; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Start</button>
            <button id="close-btn-${id}" style="background: transparent; color: white; border: 2px solid white; padding: 6px 16px; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 14px;">Close</button>
          </div>
        `;
        document.body.appendChild(banner);

        document.getElementById(`start-btn-${id}`)?.addEventListener('click', () => {
          browser.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
          banner.remove();
        });

        document.getElementById(`close-btn-${id}`)?.addEventListener('click', () => {
          banner.remove();
        });

        if (msg.preview) {
          setTimeout(() => {
            const b = document.getElementById(id);
            if (b) b.remove();
          }, 5000);
        }
      }
    });
  },
});
