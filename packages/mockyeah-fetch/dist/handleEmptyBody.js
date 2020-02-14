"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleEmptyBody = async (res) => {
    const { status } = res;
    if (status === 204)
        return '';
    return res.text() || '';
};
exports.handleEmptyBody = handleEmptyBody;
//# sourceMappingURL=handleEmptyBody.js.map