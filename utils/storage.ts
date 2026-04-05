import { get, set } from 'idb-keyval';

const STORE_KEY = 'eye-exercises-settings';

export interface AppSettings {
  reminderFrequency: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationMode: string;
  exerciseDuration: string;
  restDuration: string;
  soundsEnabled: boolean;
  showTimer: boolean;
  exerciseSelection: string;
  customExercises: Record<string, boolean>;
}

export const defaultSettings: AppSettings = {
  reminderFrequency: '20',
  quietHoursStart: '22:00',
  quietHoursEnd: '08:00',
  notificationMode: 'alert',
  exerciseDuration: '20',
  restDuration: '5',
  soundsEnabled: true,
  showTimer: true,
  exerciseSelection: 'all',
  customExercises: {
    palming: true,
    blinking: true,
    focus: true,
    rolling: true,
  }
};

export const loadSettings = async (): Promise<AppSettings> => {
  try {
    const data = await get<AppSettings>(STORE_KEY);
    return data ? { ...defaultSettings, ...data } : defaultSettings;
  } catch (error) {
    console.error('Failed to load settings from IndexedDB:', error);
    return defaultSettings;
  }
};

export const saveSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const current = await loadSettings();
    await set(STORE_KEY, { ...current, ...settings });
  } catch (error) {
    console.error('Failed to save settings to IndexedDB:', error);
  }
};
