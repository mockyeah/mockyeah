const decodedPortRegex = /^(\/?https?.{3}[^/:?]+):/;
const decodedProtocolRegex = /^(\/?https?).{3}/;
const encodedPortRegex = /^(\/?https?.{3}[^/:?]+)~/;
const encodedProtocolRegex = /^(\/?https?).{3}/;

exports.decodedPortRegex = decodedPortRegex;
exports.decodedProtocolRegex = decodedProtocolRegex;
exports.encodedPortRegex = encodedPortRegex;
exports.encodedProtocolRegex = encodedProtocolRegex;
