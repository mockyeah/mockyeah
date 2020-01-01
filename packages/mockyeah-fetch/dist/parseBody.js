"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const parseBody = async (res) => {
    const { status } = res;
    if (status === 204)
        return '';
    return res.text() || '';
};
exports.parseBody = parseBody;
//# sourceMappingURL=parseBody.js.map