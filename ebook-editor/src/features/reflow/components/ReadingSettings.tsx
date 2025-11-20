import React from 'react';
import { SimpleRange } from '../../../ui/components/Range/SimpleRange';
import { useReflowSettings } from '../hooks/useReflowSettings';

export const ReadingSettings: React.FC = () => {
  const { settings, updateSettings } = useReflowSettings();

  return (
    <div className="p-4 space-y-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Reading Settings</h3>
      
      {/* Font Size */}
      <SimpleRange
        label="Font Size"
        value={settings.fontSize}
        min={12}
        max={32}
        step={1}
        valueSuffix="px"
        onChange={(val) => updateSettings({ fontSize: val })}
      />

      {/* Line Height */}
      <SimpleRange
        label="Line Height"
        value={settings.lineHeight}
        min={1}
        max={2.5}
        step={0.1}
        onChange={(val) => updateSettings({ lineHeight: val })}
      />

      {/* Theme Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Theme</label>
        <div className="flex gap-2">
          {(['light', 'dark', 'sepia'] as const).map((theme) => (
            <button
              key={theme}
              onClick={() => updateSettings({ theme })}
              className={`
                px-4 py-2 rounded-md border capitalize transition-colors
                ${settings.theme === theme 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' 
                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'}
              `}
            >
              {theme}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
