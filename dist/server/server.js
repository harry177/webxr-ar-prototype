"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
const clientApp = path_1.default.join(__dirname, '../../build');
app.use(express_1.default.static(clientApp));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(clientApp, 'index.html'));
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
