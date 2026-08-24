const AGNT_MARKETPULSE_CONFIG = Object.freeze({
  firebaseProjectId: 'daily-accountability-be0ac',
  inboxAddress: 'agnt.marketpulse@gmail.com',
  approvedOriginalSender: 'marketpulse@mcgrath.com.au',
  approvedOriginalSubject: 'Your Real Estate Update for Today',
  timezone: 'Australia/Sydney',
  lookbackDays: 3,
  initialLookbackHours: 36,
  maxThreadsPerRun: 100,
  maxPlainTextCharacters: 180000,
  dailyTriggerHour: 6,
  dailyTriggerMinute: 0,
  schemaVersion: 1,
});

/**
 * One-time installer. Run this while signed in as agnt.marketpulse@gmail.com
 * after adding FIREBASE_SERVICE_ACCOUNT_JSON in Apps Script > Project Settings
 * > Script Properties. The secret must never be added to this file or GitHub.
 */
function setupMarketPulseBridge() {
  serviceAccount_();
  const properties = PropertiesService.getScriptProperties();
  if (!properties.getProperty('BRIDGE_START_AT')) {
    properties.setProperty('BRIDGE_START_AT', String(Date.now() - AGNT_MARKETPULSE_CONFIG.initialLookbackHours * 60 * 60 * 1000));
  }
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'processMarketPulseInbox')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
  ScriptApp.newTrigger('processMarketPulseInbox')
    .timeBased()
    .atHour(AGNT_MARKETPULSE_CONFIG.dailyTriggerHour)
    .nearMinute(AGNT_MARKETPULSE_CONFIG.dailyTriggerMinute)
    .everyDays(1)
    .inTimezone(AGNT_MARKETPULSE_CONFIG.timezone)
    .create();
  properties.setProperties({
    BRIDGE_INSTALLED_AT: new Date().toISOString(),
    BRIDGE_LAST_ERROR: '',
  }, false);
  return processMarketPulseInbox();
}

/** Run manually at any time to process the inbox immediately. */
function runMarketPulseBridgeNow() {
  return processMarketPulseInbox();
}

/** Remove only the recurring trigger. Existing Gmail and Firestore data remains. */
function removeMarketPulseBridgeTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(trigger => trigger.getHandlerFunction() === 'processMarketPulseInbox')
    .forEach(trigger => ScriptApp.deleteTrigger(trigger));
}

/** Safe diagnostics. This never returns the service-account credential. */
function getMarketPulseBridgeStatus() {
  const properties = PropertiesService.getScriptProperties();
  const triggers = ScriptApp.getProjectTriggers().filter(trigger => trigger.getHandlerFunction() === 'processMarketPulseInbox');
  return {
    inboxAddress: AGNT_MARKETPULSE_CONFIG.inboxAddress,
    installedAt: properties.getProperty('BRIDGE_INSTALLED_AT') || '',
    lastRunAt: properties.getProperty('BRIDGE_LAST_RUN_AT') || '',
    lastSuccessAt: properties.getProperty('BRIDGE_LAST_SUCCESS_AT') || '',
    lastSummary: properties.getProperty('BRIDGE_LAST_SUMMARY') || '',
    lastError: properties.getProperty('BRIDGE_LAST_ERROR') || '',
    recurringSchedule: 'Daily at approximately 6:00 am Australia/Sydney',
    recurringTriggerCount: triggers.length,
    serviceAccountConfigured: Boolean(properties.getProperty('FIREBASE_SERVICE_ACCOUNT_JSON')),
  };
}

/** Main daily intake task. The installed trigger runs at approximately 6:00 am Sydney time. */
function processMarketPulseInbox() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return { skipped: true, reason: 'Another MarketPulse run is active.' };
  const properties = PropertiesService.getScriptProperties();
  const summary = { scanned: 0, imported: 0, duplicates: 0, waitingForProfile: 0, quarantined: 0, errors: 0 };
  try {
    properties.setProperty('BRIDGE_LAST_RUN_AT', new Date().toISOString());
    const credential = serviceAccount_();
    const token = serviceAccountAccessToken_(credential);
    const startAt = Number(properties.getProperty('BRIDGE_START_AT')) || 0;
    const query = `to:${AGNT_MARKETPULSE_CONFIG.inboxAddress} newer_than:${AGNT_MARKETPULSE_CONFIG.lookbackDays}d subject:"${AGNT_MARKETPULSE_CONFIG.approvedOriginalSubject}"`;
    const messages = GmailApp.search(query, 0, AGNT_MARKETPULSE_CONFIG.maxThreadsPerRun)
      .flatMap(thread => thread.getMessages())
      .sort((a, b) => a.getDate().getTime() - b.getDate().getTime());

    for (const message of messages) {
      if (message.getDate().getTime() < startAt || isRecorded_(message, 'PROCESSED') || isRecorded_(message, 'QUARANTINED')) continue;
      summary.scanned++;
      try {
        const result = routeMarketPulseMessage_(message, credential.project_id, token);
        if (result.status === 'waiting') { summary.waitingForProfile++; continue; }
        if (result.status === 'quarantined') {
          recordMessage_(message, 'QUARANTINED');
          summary.quarantined++;
          continue;
        }
        recordMessage_(message, 'PROCESSED');
        if (result.status === 'duplicate') summary.duplicates++;
        else summary.imported++;
      } catch (error) {
        summary.errors++;
        console.error(`MarketPulse message ${message.getId()} failed`, error);
      }
    }

    pruneLedgers_();
    properties.setProperties({
      BRIDGE_LAST_SUCCESS_AT: new Date().toISOString(),
      BRIDGE_LAST_SUMMARY: JSON.stringify(summary),
      BRIDGE_LAST_ERROR: '',
    }, false);
    console.log(JSON.stringify(summary));
    return summary;
  } catch (error) {
    properties.setProperty('BRIDGE_LAST_ERROR', String(error && error.message || error));
    console.error(error);
    throw error;
  } finally {
    lock.releaseLock();
  }
}

function routeMarketPulseMessage_(message, projectId, token) {
  const outerFrom = emailAddress_(message.getFrom());
  const outerTo = emailAddress_(message.getTo());
  const outerSubject = cleanLine_(message.getSubject());
  const plainText = message.getPlainBody();
  const originalFrom = forwardedHeaderEmail_(plainText, 'From');
  const originalTo = forwardedHeaderEmail_(plainText, 'To');
  const originalSubject = forwardedHeaderValue_(plainText, 'Subject');

  const correctEnvelope = outerTo === AGNT_MARKETPULSE_CONFIG.inboxAddress
    && /^(?:fw|fwd)\s*:/i.test(outerSubject);
  const approvedContent = originalFrom === AGNT_MARKETPULSE_CONFIG.approvedOriginalSender
    && originalSubject.toLowerCase() === AGNT_MARKETPULSE_CONFIG.approvedOriginalSubject.toLowerCase();
  const sameIdentity = Boolean(outerFrom && originalTo && outerFrom === originalTo);
  const authenticated = authenticatedMcgrathForward_(message);
  const acceptableSize = plainText.length <= AGNT_MARKETPULSE_CONFIG.maxPlainTextCharacters;
  if (!correctEnvelope || !approvedContent || !sameIdentity || !authenticated || !acceptableSize) {
    console.warn(`Quarantined MarketPulse email ${message.getId()}: envelope=${correctEnvelope}, content=${approvedContent}, identity=${sameIdentity}, auth=${authenticated}, size=${acceptableSize}`);
    return { status: 'quarantined' };
  }

  const userUid = findUserUidByForwardEmail_(projectId, token, outerFrom);
  if (!userUid) {
    console.log(`Waiting for AGNT profile registration: ${outerFrom}`);
    return { status: 'waiting' };
  }

  const receivedDate = Utilities.formatDate(message.getDate(), AGNT_MARKETPULSE_CONFIG.timezone, 'yyyy-MM-dd');
  const fields = {
    schemaVersion: integerValue_(AGNT_MARKETPULSE_CONFIG.schemaVersion),
    source: stringValue_('gmail-forward'),
    status: stringValue_('pending'),
    messageId: stringValue_(message.getId()),
    forwardedFrom: stringValue_(outerFrom),
    originalFrom: stringValue_(originalFrom),
    originalTo: stringValue_(originalTo),
    originalSubject: stringValue_(originalSubject),
    outerSubject: stringValue_(outerSubject),
    receivedDate: stringValue_(receivedDate),
    receivedAt: timestampValue_(message.getDate()),
    plainText: stringValue_(plainText),
  };
  const status = createMarketPulseInboxDocument_(projectId, token, userUid, `gmail_${message.getId()}`, fields);
  return { status };
}

function authenticatedMcgrathForward_(message) {
  const rawHeaders = String(message.getRawContent() || '').split(/\r?\n\r?\n/, 1)[0].replace(/\r?\n[ \t]+/g, ' ');
  const dkim = /dkim=pass[^;]*(?:header\.(?:i|d)=@?mcgrath\.com\.au|dkdomain=mcgrath\.com\.au)/i.test(rawHeaders);
  const dmarc = /dmarc=pass[^;]*header\.from=mcgrath\.com\.au/i.test(rawHeaders);
  return dkim && dmarc;
}

function forwardedHeaderEmail_(body, header) {
  return emailAddress_(forwardedHeaderValue_(body, header));
}

function forwardedHeaderValue_(body, header) {
  const escaped = String(header).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(body || '').match(new RegExp(`^${escaped}:\\s*(.+)$`, 'mi'));
  return cleanLine_(match && match[1] || '');
}

function emailAddress_(value) {
  const match = String(value || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return String(match && match[0] || '').toLowerCase();
}

function cleanLine_(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function findUserUidByForwardEmail_(projectId, token, email) {
  const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: 'users' }],
      where: {
        fieldFilter: {
          field: { fieldPath: 'marketPulseForwardEmail' },
          op: 'EQUAL',
          value: { stringValue: email },
        },
      },
      limit: 2,
    },
  };
  const response = fetchJson_(url, token, 'post', body, [200]);
  const documents = response.filter(row => row.document).map(row => row.document);
  if (documents.length > 1) throw new Error(`More than one AGNT profile is registered for ${email}.`);
  if (!documents.length) return '';
  return documents[0].name.split('/').pop();
}

function createMarketPulseInboxDocument_(projectId, token, uid, documentId, fields) {
  const parent = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/users/${encodeURIComponent(uid)}/marketPulseInbox`;
  const url = `${parent}?documentId=${encodeURIComponent(documentId)}`;
  const response = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${token}` },
    payload: JSON.stringify({ fields }),
    muteHttpExceptions: true,
  });
  const code = response.getResponseCode();
  if (code >= 200 && code < 300) return 'imported';
  if (code === 409) return 'duplicate';
  throw new Error(`Firestore intake write failed (${code}): ${response.getContentText().slice(0, 500)}`);
}

function fetchJson_(url, token, method, body, acceptedCodes) {
  const options = {
    method,
    contentType: 'application/json',
    headers: { Authorization: `Bearer ${token}` },
    muteHttpExceptions: true,
  };
  if (body) options.payload = JSON.stringify(body);
  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  if (!acceptedCodes.includes(code)) throw new Error(`Google API request failed (${code}): ${response.getContentText().slice(0, 500)}`);
  return JSON.parse(response.getContentText() || 'null');
}

function serviceAccount_() {
  const raw = PropertiesService.getScriptProperties().getProperty('FIREBASE_SERVICE_ACCOUNT_JSON');
  if (!raw) throw new Error('Add FIREBASE_SERVICE_ACCOUNT_JSON to Apps Script Properties before setup.');
  let credential;
  try { credential = JSON.parse(raw); } catch (error) { throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.'); }
  if (!credential.project_id || !credential.client_email || !credential.private_key) throw new Error('The Firebase service-account JSON is missing project_id, client_email or private_key.');
  if (credential.project_id !== AGNT_MARKETPULSE_CONFIG.firebaseProjectId) throw new Error(`Use a service account from ${AGNT_MARKETPULSE_CONFIG.firebaseProjectId}.`);
  return credential;
}

function serviceAccountAccessToken_(credential) {
  const cache = CacheService.getScriptCache();
  const cached = cache.get('FIRESTORE_SERVICE_TOKEN');
  if (cached) return cached;
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url_(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = base64Url_(JSON.stringify({
    iss: credential.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }));
  const unsigned = `${header}.${claim}`;
  const key = String(credential.private_key).replace(/\\n/g, '\n');
  const signature = Utilities.computeRsaSha256Signature(unsigned, key);
  const assertion = `${unsigned}.${Utilities.base64EncodeWebSafe(signature).replace(/=+$/g, '')}`;
  const response = UrlFetchApp.fetch('https://oauth2.googleapis.com/token', {
    method: 'post',
    payload: {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    },
    muteHttpExceptions: true,
  });
  if (response.getResponseCode() !== 200) throw new Error(`Service-account token request failed (${response.getResponseCode()}): ${response.getContentText().slice(0, 500)}`);
  const token = JSON.parse(response.getContentText()).access_token;
  cache.put('FIRESTORE_SERVICE_TOKEN', token, 3300);
  return token;
}

function base64Url_(value) {
  return Utilities.base64EncodeWebSafe(value, Utilities.Charset.UTF_8).replace(/=+$/g, '');
}

function stringValue_(value) { return { stringValue: String(value == null ? '' : value) }; }
function integerValue_(value) { return { integerValue: String(Math.round(Number(value) || 0)) }; }
function timestampValue_(value) { return { timestampValue: new Date(value).toISOString() }; }

function ledgerKey_(message, kind) {
  const date = Utilities.formatDate(message.getDate(), AGNT_MARKETPULSE_CONFIG.timezone, 'yyyyMMdd');
  return `MP_${kind}_${date}`;
}

function isRecorded_(message, kind) {
  const raw = PropertiesService.getScriptProperties().getProperty(ledgerKey_(message, kind)) || '[]';
  try { return JSON.parse(raw).includes(message.getId()); } catch (error) { return false; }
}

function recordMessage_(message, kind) {
  const properties = PropertiesService.getScriptProperties();
  const key = ledgerKey_(message, kind);
  let ids = [];
  try { ids = JSON.parse(properties.getProperty(key) || '[]'); } catch (error) { ids = []; }
  if (!ids.includes(message.getId())) ids.push(message.getId());
  properties.setProperty(key, JSON.stringify(ids.slice(-250)));
}

function pruneLedgers_() {
  const properties = PropertiesService.getScriptProperties();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 21);
  const cutoffKey = Utilities.formatDate(cutoff, AGNT_MARKETPULSE_CONFIG.timezone, 'yyyyMMdd');
  Object.keys(properties.getProperties()).forEach(key => {
    const match = key.match(/^MP_(?:PROCESSED|QUARANTINED)_(\d{8})$/);
    if (match && match[1] < cutoffKey) properties.deleteProperty(key);
  });
}
