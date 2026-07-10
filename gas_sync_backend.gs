const SHEET_FOLDERS = 'Folders';
const SHEET_CARDS = 'Cards';
const SYNC_TOKEN = 'change-this-token';

function doGet(e) {
  ensureSheets_();
  const mode = str_(e && e.parameter && e.parameter.mode);
  const token = str_(e && e.parameter && e.parameter.token);
  const nonce = str_(e && e.parameter && e.parameter.nonce);
  if (!isAuthorized_(token)) return bridgeResponse_({ ok:false, error:'Unauthorized', nonce:nonce });
  if (mode === 'pull') return bridgeResponse_({ ok:true, nonce:nonce, dataset:getDataset_(), source:'leitner-gas-sync' });
  if (mode === 'ping') return bridgeResponse_({ ok:true, nonce:nonce, message:'pong', source:'leitner-gas-sync' });
  return HtmlService.createHtmlOutput('<!doctype html><html><body style="font-family:sans-serif;padding:24px">Leitner GAS Sync is running.</body></html>')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function doPost(e) {
  ensureSheets_();
  const p = (e && e.parameter) || {};
  const mode = str_(p.mode);
  const token = str_(p.token);
  const nonce = str_(p.nonce);
  if (!isAuthorized_(token)) return bridgeResponse_({ ok:false, error:'Unauthorized', nonce:nonce });
  try {
    if (mode === 'push') {
      const payload = JSON.parse(str_(p.payload) || '{}');
      writeDataset_(payload);
      return bridgeResponse_({ ok:true, nonce:nonce, message:'Cloud sync complete', source:'leitner-gas-sync' });
    }
    return bridgeResponse_({ ok:false, error:'Unsupported mode', nonce:nonce, source:'leitner-gas-sync' });
  } catch (err) {
    return bridgeResponse_({ ok:false, error:String(err && err.message || err), nonce:nonce, source:'leitner-gas-sync' });
  }
}

function bridgeResponse_(payload) {
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');
  const html = '<!doctype html><html><body><script>' +
    'window.parent && window.parent.postMessage(' + json + ', "*");' +
    'document.body.innerHTML = "Sync response sent.";' +
    '<' + '/script></body></html>';
  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function ensureSheets_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let folders = ss.getSheetByName(SHEET_FOLDERS);
  if (!folders) folders = ss.insertSheet(SHEET_FOLDERS);
  if (folders.getLastRow() === 0) folders.getRange(1,1,1,4).setValues([['id','name','createdAt','updatedAt']]);
  let cards = ss.getSheetByName(SHEET_CARDS);
  if (!cards) cards = ss.insertSheet(SHEET_CARDS);
  if (cards.getLastRow() === 0) cards.getRange(1,1,1,9).setValues([['id','folderId','front','back','box','dueAt','reviewCount','createdAt','updatedAt']]);
}

function getDataset_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return {
    folders: readSheetObjects_(ss.getSheetByName(SHEET_FOLDERS)),
    cards: readSheetObjects_(ss.getSheetByName(SHEET_CARDS)),
    updatedAt: new Date().toISOString()
  };
}

function writeDataset_(payload) {
  const folders = Array.isArray(payload && payload.folders) ? payload.folders : [];
  const cards = Array.isArray(payload && payload.cards) ? payload.cards : [];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  writeSheetObjects_(ss.getSheetByName(SHEET_FOLDERS), ['id','name','createdAt','updatedAt'], folders);
  writeSheetObjects_(ss.getSheetByName(SHEET_CARDS), ['id','folderId','front','back','box','dueAt','reviewCount','createdAt','updatedAt'], cards);
}

function readSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(String);
  return values.slice(1).filter(r => r.some(v => String(v) !== '')).map(r => {
    const obj = {};
    headers.forEach((h,i) => obj[h] = r[i]);
    return obj;
  });
}

function writeSheetObjects_(sheet, headers, rows) {
  sheet.clearContents();
  sheet.getRange(1,1,1,headers.length).setValues([headers]);
  if (!rows.length) return;
  const values = rows.map(r => headers.map(h => r[h] == null ? '' : r[h]));
  sheet.getRange(2,1,values.length,headers.length).setValues(values);
}

function isAuthorized_(token) { return str_(token) && str_(token) === SYNC_TOKEN; }
function str_(v) { return v == null ? '' : String(v); }
