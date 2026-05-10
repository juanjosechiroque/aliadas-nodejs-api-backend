const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');

function createToken(user) {
  const obj = {
    userId: user.id,
    name: user.name,
    loginUsername: user.username,
    exp_date: dayjs().add(30, 'minutes').unix(),
    rol_type: user.rol_type,
  };
  return jwt.sign(obj, 'escuela');
}


module.exports = {
    createToken
}