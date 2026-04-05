import React, { useState, useEffect } from 'react';
import { SettingsSection, SettingRow } from './SettingsSection';
import { Switch } from '@/components/ui/Switch';

export function SoundSettings() {
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('local:sounds_enabled');
    if (saved !== null) {
      setSoundsEnabled(saved === 'true');
    }
  }, []);

  const handleChange = (checked: boolean) => {
    setSoundsEnabled(checked);
    localStorage.setItem('local:sounds_enabled', String(checked));
  };

  return (
    <SettingsSection title="Sounds & Music" description="Audio feedback during exercises.">
      <SettingRow label="Exercise Sounds" description="Play a sound when an exercise starts/ends">
        <Switch checked={soundsEnabled} onCheckedChange={handleChange} />
      </SettingRow>
    </SettingsSection>
  );
}
