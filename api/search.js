const {
  getTrimmedString,
  methodGuard,
  parseJsonBody,
  sendError,
  sendSuccess
} = require('./_utils');

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

    const query = getTrimmedString(body ?? {}, 'q') || getTrimmedString(req.query ?? {}, 'q');
    if (!query) {
      sendError(res, 400, 'Missing required "q" string in request body.');
      return;
    }

    const limitRaw = body?.limit ?? req.query?.limit;
    const limitNumber = Number.parseInt(limitRaw, 10);
    const limit = Number.isNaN(limitNumber) || limitNumber <= 0 ? 10 : Math.min(limitNumber, 50);

    const results = [];

    sendSuccess(res, {
      query,
      limit,
      results,
      message: 'Search endpoint is configured. Implement result sourcing as needed.'
    });
  } catch (error) {
    sendError(res, 500, 'Unexpected error while handling search request.', { message: error.message });
  }
};
