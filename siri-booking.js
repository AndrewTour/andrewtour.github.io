// Interpret a dictated AGNT appointment. Dates use the same local calendar as AGNT.
const appointmentTypes = {
  bap: 'BAP', 'buyer appointment': 'BAP',
  map: 'MAP', 'market appraisal': 'MAP',
  lap: 'LAP', 'listing appointment': 'LAP',
  ofi: 'OFI', 'open for inspection': 'OFI',
};

export function parseSiriBooking(details, requestedAt) {
  if (typeof details !== 'string' || !Number.isFinite(requestedAt)) return null;
  const date = new Date(requestedAt);
  if (!Number.isFinite(date.getTime())) return null;

  const command = details.trim()
    .replace(/[“”]/g, '')
    .replace(/\b([bml])\s+a\s+p\b/gi, '$1AP')
    .replace(/\bo\s+f\s+i\b/gi, 'OFI')
    .replace(/\b([ap])\s*\.\s*m\.?/gi, '$1m')
    .replace(/\s+/g, ' ');
  const match = /^(?:book\s+)?(.+?)\s+(?:in\s+)?for\s+(?:an?\s+)?(BAP|MAP|LAP|OFI|Buyer Appointment|Market Appraisal|Listing Appointment|Open for Inspection)\s+(?:on\s+)?(today|tomorrow|(?:next\s+)?(?:sunday|monday|tuesday|wednesday|thursday|friday|saturday)|\d{4}-\d{2}-\d{2})\s*(?:,\s*|at\s*)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*,?\s+(?:at\s+)?(.+)$/i.exec(command);
  if (!match) return null;
  const [, person, kind, spokenDay, hours, minutes, period, property] = match;
  const assignee = person.trim();
  const address = property.trim();
  if (assignee.length > 100 || address.length > 240 || !address || !assignee) return null;

  let hour = Number(hours);
  const minute = Number(minutes || 0);
  if (minute > 59) return null;
  if (period) {
    if (hour < 1 || hour > 12) return null;
    hour = hour % 12 + (period.toLowerCase() === 'pm' ? 12 : 0);
  } else if (hour < 13 || hour > 23) {
    // Leave ambiguous times such as "10" for the user to restate with am/pm.
    if (hour !== 0 || !minutes) return null;
  }

  const day = spokenDay.toLowerCase();
  if (day === 'tomorrow') {
    date.setDate(date.getDate() + 1);
  } else if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const [year, month, value] = day.split('-').map(Number);
    date.setFullYear(year, month - 1, value);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== value) return null;
  } else if (day !== 'today') {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const delta = (weekdays.indexOf(day.replace(/^next\s+/, '')) - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + (delta || 7));
  }

  date.setHours(hour, minute, 0, 0);
  if (date.getHours() !== hour || date.getMinutes() !== minute || date.getTime() <= requestedAt) return null;
  const pad = value => String(value).padStart(2, '0');
  return {
    assignee, address, type: appointmentTypes[kind.toLowerCase()],
    day: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(hour)}:${pad(minute)}`,
  };
}

export function matchSiriAssignee(name, members) {
  const key = value => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
  const wanted = key(name);
  if (!wanted) return '';
  const full = members.filter(member => member.names.some(value => key(value) === wanted && key(value).includes(' ')));
  if (full.length) return full.length === 1 ? full[0].id : '';
  const first = members.filter(member => member.names.some(value => key(value).split(' ')[0] === wanted));
  return first.length === 1 ? first[0].id : '';
}
