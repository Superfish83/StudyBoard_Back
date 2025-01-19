const { v4: uuidv4 } = require('uuid');

/**
 * Function that generates a new id(UUID).
 * @returns {string} - UUID
 */
function makeId() { return uuidv4(); }

module.exports = makeId;