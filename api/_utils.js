const MAX_RAW_SIZE = 1_000_000; // 1MB safety limit

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

function sendSuccess(res, data) {
  sendJson(res, 200, { ok: true, data });
}

function sendError(res, statusCode, message, details) {
  sendJson(res, statusCode, {
    ok: false,
    error: {
      message,
      ...(details ? { details } : {})
    }
  });
}

function methodGuard(req, res, allowedMethods) {
  if (allowedMethods.includes(req.method)) {
    return true;
  }

  res.setHeader('Allow', allowedMethods.join(', '));
  sendError(res, 405, `Method ${req.method} not allowed. Use ${allowedMethods.join(', ')}.`);
  return false;
}

async function parseJsonBody(req) {
  if (req.body !== undefined) {
    return req.body;
  }

  return new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;

      if (raw.length > MAX_RAW_SIZE) {
        reject(new Error('Payload too large'));
      }
    });

    req.on('end', () => {
      if (!raw) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(new Error('Invalid JSON payload'));
      }
    });

    req.on('error', (error) => reject(error));
  });
}

function getTrimmedString(source, key) {
  const value = source?.[key];
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

module.exports = {
  getTrimmedString,
  methodGuard,
  parseJsonBody,
  sendError,
  sendSuccess
};
