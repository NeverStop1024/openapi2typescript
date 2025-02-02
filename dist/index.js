"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateService = exports.getSchema = void 0;
const tslib_1 = require("tslib");
const node_fetch_1 = (0, tslib_1.__importDefault)(require("node-fetch"));
const swagger2openapi_1 = (0, tslib_1.__importDefault)(require("swagger2openapi"));
const serviceGenerator_1 = require("./serviceGenerator");
const mockGenerator_1 = require("./mockGenerator");
const log_1 = (0, tslib_1.__importDefault)(require("./log"));
const getImportStatement = (requestLibPath) => {
    if (requestLibPath && requestLibPath.startsWith('import')) {
        return requestLibPath;
    }
    if (requestLibPath) {
        return `import request from '${requestLibPath}'`;
    }
    return `import { request } from "umi"`;
};
const converterSwaggerToOpenApi = (swagger) => {
    if (!swagger.swagger) {
        return swagger;
    }
    return new Promise((resolve, reject) => {
        swagger2openapi_1.default.convertObj(swagger, {}, (err, options) => {
            (0, log_1.default)(['💺 将 Swagger 转化为 openAPI']);
            if (err) {
                reject(err);
                return;
            }
            resolve(options.openapi);
        });
    });
};
const getSchema = (schemaPath) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    if (schemaPath.startsWith('http')) {
        const json = yield (0, node_fetch_1.default)(schemaPath).then((rest) => rest.json());
        return json;
    }
    const schema = require(schemaPath);
    return schema;
});
exports.getSchema = getSchema;
const getOpenAPIConfig = (schemaPath) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    const schema = yield (0, exports.getSchema)(schemaPath);
    const openAPI = yield converterSwaggerToOpenApi(schema);
    if (!schema) {
        return null;
    }
    return openAPI;
});
// 从 appName 生成 service 数据
const generateService = (_a) => (0, tslib_1.__awaiter)(void 0, void 0, void 0, function* () {
    var { requestLibPath, schemaPath, mockFolder } = _a, rest = (0, tslib_1.__rest)(_a, ["requestLibPath", "schemaPath", "mockFolder"]);
    const openAPI = yield getOpenAPIConfig(schemaPath);
    const requestImportStatement = getImportStatement(requestLibPath);
    const serviceGenerator = new serviceGenerator_1.ServiceGenerator(Object.assign({ namespace: 'API', requestImportStatement }, rest), openAPI);
    serviceGenerator.genFile();
    if (mockFolder) {
        yield (0, mockGenerator_1.mockGenerator)({
            openAPI,
            mockFolder: mockFolder || './mocks/',
        });
    }
});
exports.generateService = generateService;
