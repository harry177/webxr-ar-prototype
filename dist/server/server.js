"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const port = 3000;
const clientApp = path_1.default.join(__dirname, '../build');
const privateKeyPath = path_1.default.join(__dirname, '../server.key');
const certificatePath = path_1.default.join(__dirname, '../server.crt');
app.use(express_1.default.static(clientApp));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(clientApp, 'index.html'));
});
const serverOptions = {
    key: fs_1.default.readFileSync(privateKeyPath),
    cert: fs_1.default.readFileSync(certificatePath),
};
https_1.default.createServer(serverOptions, app).listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
