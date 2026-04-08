import React, { useState, useEffect } from 'react';
import { SettingsSection, SettingRow } from './SettingsSection';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { browser } from 'wxt/browser';

export function ReminderSettings() {
  const [frequency, setFrequency] = useState("0");
  const [useBadge, setUseBadge] = useState(true);
  const [usePush, setUsePush] = useState(false);
  const [useBanner, setUseBanner] = useState(true);

  useEffect(() => {
    browser.storage.local.get([
      'reminder_frequency',
      'reminder_badge',
      'reminder_push',
      'reminder_banner'
    ]).then((result) => {
      const res = result as Record<string, any>;
      if (typeof res.reminder_frequency === 'string') setFrequency(res.reminder_frequency);
      if (typeof res.reminder_badge === 'boolean') setUseBadge(res.reminder_badge);
      if (typeof res.reminder_push === 'boolean') setUsePush(res.reminder_push);
      if (typeof res.reminder_banner === 'boolean') setUseBanner(res.reminder_banner);
    });
  }, []);

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFrequency(val);
    browser.storage.local.set({ reminder_frequency: val });
  };

  const previewBadge = () => {
    browser.action.setBadgeText({ text: '!' });
    browser.action.setBadgeBackgroundColor({ color: '#ef4444' });
    setTimeout(() => {
      browser.action.setBadgeText({ text: '' });
    }, 5000);
  };

  const previewPush = () => {
    browser.notifications.create({
      type: 'basic',
      iconUrl: browser.runtime.getURL('/icon/128.png'),
      title: 'Time for a Break!',
      message: 'Preview: Your eyes need a rest. Click to start exercises.',
      requireInteraction: false,
    });
    // System notifications automatically hide, no manual 5s clear needed typically,
    // but we can clear it:
    setTimeout(() => {
      // we don't have the id stored easily, so we just let it fade.
    }, 5000);
  };

  const previewBanner = async () => {
    try {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.id) {
        browser.tabs.sendMessage(tabs[0].id, { type: 'SHOW_REMINDER_BANNER', preview: true }).catch(console.warn);
      }
    } catch (e) {
      console.warn("Could not preview banner", e);
    }
  };

  const toggleBadge = (val: boolean) => {
    setUseBadge(val);
    browser.storage.local.set({ reminder_badge: val });
    if (val) previewBadge();
  };

  const togglePush = (val: boolean) => {
    setUsePush(val);
    browser.storage.local.set({ reminder_push: val });
    if (val) previewPush();
  };

  const toggleBanner = (val: boolean) => {
    setUseBanner(val);
    browser.storage.local.set({ reminder_banner: val });
    if (val) previewBanner();
  };

  return (
    <SettingsSection title="Reminders" description="Configure when and how to be notified.">
      <SettingRow label="Remind me every" description="Frequency of eye exercises">
        <Select
          value={frequency}
          onChange={handleFrequencyChange}
          options={[
            { label: 'never', value: '0' },
            { label: '1 hour', value: '60' },
            { label: '2 hours', value: '120' },
            { label: '3 hours', value: '180' },
            { label: '4 hours', value: '240' },
            { label: '6 hours', value: '360' },
          ]}
        />
      </SettingRow>

      <SettingRow label="Notification Methods" description="How you want to be reminded. Select below to see a 5-second preview.">
        <div className="flex flex-col gap-3 mt-2 w-full">
          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
            <Checkbox checked={useBadge} onCheckedChange={toggleBadge} />
            <span className="text-sm font-medium text-slate-700">Badge Icon <span className="text-slate-400 font-normal ml-1">(! on red background)</span></span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
            <Checkbox checked={usePush} onCheckedChange={togglePush} />
            <span className="text-sm font-medium text-slate-700">System Push Notification</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
            <Checkbox checked={useBanner} onCheckedChange={toggleBanner} />
            <span className="text-sm font-medium text-slate-700">Inject Banner on Active Page</span>
          </label>
        </div>
      </SettingRow>

    </SettingsSection>
  );
}
