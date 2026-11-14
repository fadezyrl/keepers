import {Linking, Platform} from 'react-native';
import RNCalendarEvents from 'react-native-calendar-events';

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Civil date + local clock — avoids UTC shift from bare YYYY-MM-DD parsing. */
function toLocalDate(date: string, time?: string) {
  const t = (time || '09:00').slice(0, 5);
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = t.split(':').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, hh || 9, mm || 0, 0);
}

/** Format local date/time as Google Calendar stamp (YYYYMMDDTHHMMSS). */
function toStamp(date: Date) {
  return (
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `T${pad(date.getHours())}${pad(date.getMinutes())}00`
  );
}

async function openGoogleCalendarFallback(params: {
  title: string;
  date: string;
  time?: string;
  location?: string;
  details?: string;
}): Promise<{ok: boolean; message: string}> {
  const startDate = toLocalDate(params.date, params.time);
  const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);
  const qs = new URLSearchParams({
    action: 'TEMPLATE',
    text: params.title,
    dates: `${toStamp(startDate)}/${toStamp(endDate)}`,
    details: params.details || '',
    location: params.location || '',
  });
  const url = `https://calendar.google.com/calendar/render?${qs.toString()}`;
  try {
    const can = await Linking.canOpenURL(url);
    if (!can && Platform.OS === 'ios') {
      return {ok: false, message: 'Unable to open calendar on this device.'};
    }
    await Linking.openURL(url);
    return {ok: true, message: 'Opened Google Calendar to save this adventure.'};
  } catch {
    return {ok: false, message: 'Unable to open calendar.'};
  }
}

/**
 * Prefer native device calendar write; fall back to Google Calendar URL.
 * Viewing the in-app calendar never calls this — only explicit user action.
 */
export async function openTripInCalendar(params: {
  title: string;
  date: string;
  time?: string;
  location?: string;
  details?: string;
}): Promise<{ok: boolean; message: string}> {
  const startDate = toLocalDate(params.date, params.time);
  const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000);

  try {
    let status = await RNCalendarEvents.checkPermissions(false);
    if (status !== 'authorized') {
      status = await RNCalendarEvents.requestPermissions(false);
    }

    if (status === 'authorized') {
      // Best-effort duplicate guard: same title within a 1-hour window.
      try {
        const windowStart = new Date(startDate.getTime() - 60 * 60 * 1000);
        const windowEnd = new Date(startDate.getTime() + 60 * 60 * 1000);
        const existing = await RNCalendarEvents.fetchAllEvents(
          windowStart.toISOString(),
          windowEnd.toISOString(),
        );
        const duplicate = (existing || []).some(
          event =>
            String(event.title || '').trim().toLowerCase() ===
            params.title.trim().toLowerCase(),
        );
        if (duplicate) {
          return {
            ok: true,
            message: 'This adventure is already on your phone calendar.',
          };
        }
      } catch {
        // fetchAllEvents unavailable on some devices — continue to save.
      }

      await RNCalendarEvents.saveEvent(params.title, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        location: params.location || undefined,
        notes: params.details || undefined,
        description: params.details || undefined,
        alarms: [{date: -60}],
      });
      return {ok: true, message: 'Added to your phone calendar.'};
    }
  } catch {
    // Native path unavailable — use URL fallback below.
  }

  return openGoogleCalendarFallback(params);
}
