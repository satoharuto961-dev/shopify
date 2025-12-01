const {
  getTrimmedString,
  methodGuard,
  parseJsonBody,
  sendError,
  sendSuccess
} = require('./_utils');

const SUPPORTED_ENCODINGS = ['base64', 'uri'];

module.exports = async function handler(req, res) {
  try {
    if (!methodGuard(req, res, ['POST'])) {
      return;
    }

    const body = await parseJsonBody(req).catch((error) => {
      sendError(res, 400, error.message);
      return null;
    });

    if (body === null) {
      return;
    }

    const text = getTrimmedString(body ?? {}, 'text') || getTrimmedString(req.query ?? {}, 'text');
    if (!text) {
      sendError(res, 400, 'Missing required "text" string in request body.');
      return;
    }

    const encoding = getTrimmedString(body ?? {}, 'encoding') || getTrimmedString(req.query ?? {}, 'encoding') || 'base64';

    if (!SUPPORTED_ENCODINGS.includes(encoding)) {
      sendError(res, 400, `Unsupported encoding. Use one of: ${SUPPORTED_ENCODINGS.join(', ')}.`);
      return;
    }

    let encoded;
    if (encoding === 'base64') {
      encoded = Buffer.from(text, 'utf8').toString('base64');
    } else {
      encoded = encodeURIComponent(text);
    }

    sendSuccess(res, {
      text,
      encoding,
      encoded
    });
  } catch (error) {
    sendError(res, 500, 'Unexpected error while handling encode request.', { message: error.message });
  }
};
