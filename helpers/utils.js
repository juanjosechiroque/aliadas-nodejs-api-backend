const dayjs = require('dayjs');
const jwt = require('jsonwebtoken');

function createToken(user) {
    const obj = {
        userId: user.id,
        username: user.name,
        exp_date: dayjs().add(30, 'minutes').unix(),
        roll: user.roll
    }
    return jwt.sign(obj, 'escuela')
}


module.exports = {
    createToken
}