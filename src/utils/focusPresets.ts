import { FocusBlockConfig, PresetFocusType } from '../types/focus';

export function getBlocksForPreset(preset: PresetFocusType, customDuration = 50): FocusBlockConfig[] {
  switch (preset) {
    case 'CLASSIC':
      return [
        { id: 'b_1', type: 'FOCUS', durationMinutes: 25, label: 'Focus Block 01' },
        { id: 'b_2', type: 'SHORT_BREAK', durationMinutes: 5, label: 'Recovery Break' },
      ];

    case 'EXTENDED':
      return [
        { id: 'b_1', type: 'FOCUS', durationMinutes: 50, label: 'Extended Focus 01' },
        { id: 'b_2', type: 'SHORT_BREAK', durationMinutes: 10, label: 'Tactical Break' },
      ];

    case 'DEEP_WORK':
      return [
        { id: 'b_1', type: 'FOCUS', durationMinutes: 90, label: 'Deep Work Block' },
        { id: 'b_2', type: 'LONG_BREAK', durationMinutes: 15, label: 'Mental Recharge' },
      ];

    case 'UNIVERSAL':
    case 'TRIPLE_FOCUS':
      // 3 Hour Session: 50/10 x 3
      return [
        { id: 'b_1', type: 'FOCUS', durationMinutes: 50, label: 'Focus Block 01' },
        { id: 'b_2', type: 'SHORT_BREAK', durationMinutes: 10, label: 'Break 01' },
        { id: 'b_3', type: 'FOCUS', durationMinutes: 50, label: 'Focus Block 02' },
        { id: 'b_4', type: 'SHORT_BREAK', durationMinutes: 10, label: 'Break 02' },
        { id: 'b_5', type: 'FOCUS', durationMinutes: 50, label: 'Focus Block 03' },
        { id: 'b_6', type: 'LONG_BREAK', durationMinutes: 15, label: 'Final Recovery' },
      ];

    case 'ULTRA_FOCUS':
      // 90/15 x 2
      return [
        { id: 'b_1', type: 'FOCUS', durationMinutes: 90, label: 'Deep Work 01' },
        { id: 'b_2', type: 'LONG_BREAK', durationMinutes: 15, label: 'Midpoint Decompress' },
        { id: 'b_3', type: 'FOCUS', durationMinutes: 90, label: 'Deep Work 02' },
        { id: 'b_4', type: 'LONG_BREAK', durationMinutes: 20, label: 'Session Complete' },
      ];

    case 'CUSTOM':
    default:
      return [
        { id: 'b_1', type: 'FOCUS', durationMinutes: customDuration, label: 'Focus Session' },
        { id: 'b_2', type: 'SHORT_BREAK', durationMinutes: 10, label: 'Rest Interval' },
      ];
  }
}
