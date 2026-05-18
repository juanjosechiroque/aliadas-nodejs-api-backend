function getHealthPayload() {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

module.exports = { getHealthPayload };
