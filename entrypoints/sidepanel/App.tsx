import React from 'react';
import { ReminderSettings } from '@/components/settings/ReminderSettings';
import { SoundSettings } from '@/components/settings/SoundSettings';


const App = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const openDashboard = async () => {
    const url = browser.runtime.getURL('/dashboard.html');
    const tabs = await browser.tabs.query({ url });

    if (tabs.length > 0) {
      // Tab is already open, focus it
      browser.tabs.update(tabs[0].id!, { active: true });
      // Also focus the window containing the tab
      if (tabs[0].windowId) {
        browser.windows.update(tabs[0].windowId, { focused: true });
      }
    } else {
      // Tab is not open, create it
      browser.tabs.create({ url });
    }
  };

  return (
    <div className="w-full min-h-screen p-4 bg-slate-50 flex flex-col gap-6 font-sans">
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold gradient-text">Eye Exercises</h1>
        </div>
      </header>

      <main className="flex-1 space-y-6">

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">Preferences</h2>
          <ReminderSettings />
          <SoundSettings />
        </section>

      </main>
    </div>
  );
};

export default App;
