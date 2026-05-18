const healthService = require('./health.service');

function get(_req, res) {
  res.json(healthService.getHealthPayload());
}

module.exports = { get };
