const SHEET_NAME = 'leitner_sync';
const REQUIRED_HEADERS = ['token','payload_json','updated_at'];

function doGet(e) {
  return handleRequest_(e, 'GET');
}

function doPost(e) {
  return handleRequest_(e, 'POST');
}

function handleRequest_(e, method) {
  try {
    const params = (e && e.parameter) || {};
    const mode = String(params.mode || '').trim().toLowerCase();
    const token = String(params.token || '').trim();
    if (!token) return json_({ ok:false, error:'Missing token' });

    const sheet = getSheet_();
    const storedToken = String(sheet.getRange('A2').getValue() || '').trim();
    if (!storedToken) return json_({ ok:false, error:'No token configured in sheet A2' });
    if (token !== storedToken) return json_({ ok:false, error:'Invalid token' });

    if (mode === 'pull') {
      const raw = String(sheet.getRange('B2').getValue() || '').trim();
      if (!raw) return json_({ ok:true, dataset:{ folders:[], cards:[], updatedAt:'' } });
      const dataset = JSON.parse(raw);
      return json_({ ok:true, dataset:dataset });
    }

    if (mode === 'push') {
      const payload = String(params.payload || '').trim();
      if (!payload) return json_({ ok:false, error:'Missing payload' });
      const dataset = JSON.parse(payload);
      validateDataset_(dataset);
      sheet.getRange('B2').setValue(JSON.stringify(dataset));
      sheet.getRange('C2').setValue(new Date().toISOString());
      return json_({ ok:true, message:'Pushed to Google Sheet' });
    }

    return json_({ ok:false, error:'Unsupported mode' });
  } catch (err) {
    return json_({ ok:false, error:String(err && err.message || err) });
  }
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.getRange('A1:C2').setValues([
      ['token','payload_json','updated_at'],
      ['CHANGE_ME','', '']
    ]);
  } else {
    const headers = sh.getRange('A1:C1').getValues()[0];
    const want = REQUIRED_HEADERS;
    const mismatch = want.some((h,i) => String(headers[i]||'').trim() !== h);
    if (mismatch) sh.getRange('A1:C1').setValues([want]);
    if (!sh.getRange('A2').getValue()) sh.getRange('A2').setValue('CHANGE_ME');
  }
  return sh;
}

function validateDataset_(dataset) {
  if (!dataset || typeof dataset !== 'object') throw new Error('Invalid dataset');
  if (!Array.isArray(dataset.folders)) throw new Error('Invalid folders array');
  if (!Array.isArray(dataset.cards)) throw new Error('Invalid cards array');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
