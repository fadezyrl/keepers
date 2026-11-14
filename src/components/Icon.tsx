import React from 'react';
import Svg, {Circle, Line, Path, Polyline, Rect} from 'react-native-svg';
import {colors} from '../theme';

export type IconName =
  | 'home'
  | 'trips'
  | 'settings'
  | 'about'
  | 'bell'
  | 'search'
  | 'chevron-right'
  | 'chevron-left'
  | 'close'
  | 'check'
  | 'user'
  | 'lock'
  | 'mail'
  | 'phone'
  | 'map-pin'
  | 'calendar'
  | 'users'
  | 'camera'
  | 'logout'
  | 'trash'
  | 'edit'
  | 'globe'
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'wifi-off'
  | 'alert'
  | 'plus'
  | 'eye'
  | 'eye-off'
  | 'star'
  | 'car'
  | 'share'
  | 'chevron-down'
  | 'chevron-up'
  | 'badge'
  | 'clock'
  | 'play'
  | 'pause';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({
  name,
  size = 22,
  color = colors.black,
  strokeWidth = 1.6,
}: IconProps) {
  const common = {
    stroke: color,
    strokeWidth,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 10.5L12 3l9 7.5" {...common} />
          <Path d="M5.5 9.5V21h13V9.5" {...common} />
        </Svg>
      );
    case 'trips':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 19l5-5 4 3 7-9" {...common} />
          <Circle cx="18.5" cy="7" r="1.4" stroke={color} strokeWidth={strokeWidth} fill={color} />
        </Svg>
      );
    case 'settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="3" {...common} />
          <Path
            d="M12 2.5v2.2M12 19.3v2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
            {...common}
          />
        </Svg>
      );
    case 'about':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9" {...common} />
          <Line x1="12" y1="10" x2="12" y2="17" {...common} />
          <Circle cx="12" cy="7" r="1" fill={color} stroke="none" />
        </Svg>
      );
    case 'bell':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M6 9a6 6 0 0112 0c0 7 2 8 2 8H4s2-1 2-8" {...common} />
          <Path d="M10 20a2 2 0 004 0" {...common} />
        </Svg>
      );
    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="11" cy="11" r="6.5" {...common} />
          <Line x1="16.2" y1="16.2" x2="21" y2="21" {...common} />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline points="9 6 15 12 9 18" {...common} />
        </Svg>
      );
    case 'chevron-left':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline points="15 6 9 12 15 18" {...common} />
        </Svg>
      );
    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1="6" y1="6" x2="18" y2="18" {...common} />
          <Line x1="18" y1="6" x2="6" y2="18" {...common} />
        </Svg>
      );
    case 'check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline points="5 12 10 17 19 7" {...common} />
        </Svg>
      );
    case 'user':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="8" r="3.5" {...common} />
          <Path d="M5 20c1.8-3.5 4-5 7-5s5.2 1.5 7 5" {...common} />
        </Svg>
      );
    case 'lock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="5" y="11" width="14" height="10" rx="2" {...common} />
          <Path d="M8 11V8a4 4 0 018 0v3" {...common} />
        </Svg>
      );
    case 'mail':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="5" width="18" height="14" rx="2" {...common} />
          <Polyline points="3 7 12 13 21 7" {...common} />
        </Svg>
      );
    case 'phone':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path
            d="M7 3h4l1 5-3 2a12 12 0 006 6l2-3 5 1v4a2 2 0 01-2 2A16 16 0 015 5a2 2 0 012-2z"
            {...common}
          />
        </Svg>
      );
    case 'map-pin':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11z" {...common} />
          <Circle cx="12" cy="10" r="2.2" {...common} />
        </Svg>
      );
    case 'calendar':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="3" y="5" width="18" height="16" rx="2" {...common} />
          <Line x1="3" y1="10" x2="21" y2="10" {...common} />
          <Line x1="8" y1="3" x2="8" y2="7" {...common} />
          <Line x1="16" y1="3" x2="16" y2="7" {...common} />
        </Svg>
      );
    case 'users':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="9" cy="8" r="3" {...common} />
          <Path d="M2.5 19c1.2-3 3-4.5 6.5-4.5S17.3 16 18.5 19" {...common} />
          <Circle cx="17" cy="8.5" r="2.3" {...common} />
          <Path d="M15 14.2c2 .3 3.4 1.3 4.5 3.3" {...common} />
        </Svg>
      );
    case 'camera':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 8h3l2-2h6l2 2h3v11H4V8z" {...common} />
          <Circle cx="12" cy="13" r="3.2" {...common} />
        </Svg>
      );
    case 'logout':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M10 5H5v14h5" {...common} />
          <Polyline points="14 8 18 12 14 16" {...common} />
          <Line x1="8" y1="12" x2="18" y2="12" {...common} />
        </Svg>
      );
    case 'trash':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline points="4 7 20 7" {...common} />
          <Path d="M9 7V5h6v2" {...common} />
          <Path d="M7 7l1 13h8l1-13" {...common} />
        </Svg>
      );
    case 'edit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 20l4.2-1.1L19 8.1 15.9 5 5.1 15.8 4 20z" {...common} />
          <Line x1="13.8" y1="6.9" x2="17.1" y2="10.2" {...common} />
        </Svg>
      );
    case 'globe':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="9" {...common} />
          <Path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" {...common} />
        </Svg>
      );
    case 'instagram':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Rect x="4" y="4" width="16" height="16" rx="4" {...common} />
          <Circle cx="12" cy="12" r="3.5" {...common} />
          <Circle cx="17" cy="7" r="1" fill={color} stroke="none" />
        </Svg>
      );
    case 'facebook':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M14 8h3V5h-3a4 4 0 00-4 4v2H8v3h2v7h3v-7h3l1-3h-4V9a1 1 0 011-1z" {...common} />
        </Svg>
      );
    case 'tiktok':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M14 4v10.2a3.2 3.2 0 11-2.4-3.1V8.2A5.8 5.8 0 0019 10V7.2A5.5 5.5 0 0114 4z" {...common} />
        </Svg>
      );
    case 'wifi-off':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1="4" y1="4" x2="20" y2="20" {...common} />
          <Path d="M8.5 15.5a5 5 0 017 0M5.5 12a9 9 0 014.2-2.4M18.5 12a9 9 0 00-3.3-2.1" {...common} />
          <Circle cx="12" cy="19" r="1.2" fill={color} stroke="none" />
        </Svg>
      );
    case 'alert':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 4l9 16H3L12 4z" {...common} />
          <Line x1="12" y1="10" x2="12" y2="14" {...common} />
          <Circle cx="12" cy="17" r="1" fill={color} stroke="none" />
        </Svg>
      );
    case 'plus':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Line x1="12" y1="5" x2="12" y2="19" {...common} />
          <Line x1="5" y1="12" x2="19" y2="12" {...common} />
        </Svg>
      );
    case 'eye':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" {...common} />
          <Circle cx="12" cy="12" r="3" {...common} />
        </Svg>
      );
    case 'eye-off':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M3 3l18 18" {...common} />
          <Path d="M10.6 10.6A3 3 0 0012 15a3 3 0 002.4-1.2" {...common} />
          <Path d="M6.1 6.4C3.9 8 2 12 2 12s4 7 10 7a10 10 0 005.4-1.6M9.9 5.2A10 10 0 0112 5c6 0 10 7 10 7a17 17 0 01-3.1 3.7" {...common} />
        </Svg>
      );
    case 'star':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3l2.6 5.8L21 9.6l-4.5 4.1L17.8 21 12 17.8 6.2 21l1.3-7.3L3 9.6l6.4-.8L12 3z" {...common} />
        </Svg>
      );
    case 'car':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M4 14l2-5h12l2 5" {...common} />
          <Rect x="3" y="14" width="18" height="5" rx="1.5" {...common} />
          <Circle cx="7.5" cy="19.5" r="1.3" fill={color} stroke="none" />
          <Circle cx="16.5" cy="19.5" r="1.3" fill={color} stroke="none" />
        </Svg>
      );
    case 'share':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="18" cy="5" r="2.4" {...common} />
          <Circle cx="6" cy="12" r="2.4" {...common} />
          <Circle cx="18" cy="19" r="2.4" {...common} />
          <Path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" {...common} />
        </Svg>
      );
    case 'chevron-down':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline points="6 9 12 15 18 9" {...common} />
        </Svg>
      );
    case 'chevron-up':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Polyline points="6 15 12 9 18 15" {...common} />
        </Svg>
      );
    case 'badge':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Path d="M12 3l2.2 2.2L17 4.8l.4 2.8L20 9l-1.6 2.2.8 2.8-2.8.6L15.2 17 12 15.8 8.8 17l-1.2-2.4-2.8-.6.8-2.8L4 9l2.6-1.4L7 4.8l2.8.4L12 3z" {...common} />
          <Circle cx="12" cy="11" r="2.2" {...common} />
        </Svg>
      );
    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8.5" {...common} />
          <Polyline points="12 7.5 12 12 15.5 14" {...common} />
        </Svg>
      );
    case 'play':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8.5" {...common} />
          <Path d="M10 8.5l7 3.5-7 3.5V8.5z" {...common} />
        </Svg>
      );
    case 'pause':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24">
          <Circle cx="12" cy="12" r="8.5" {...common} />
          <Line x1="10" y1="8.5" x2="10" y2="15.5" {...common} />
          <Line x1="14" y1="8.5" x2="14" y2="15.5" {...common} />
        </Svg>
      );
    default:
      return null;
  }
}
