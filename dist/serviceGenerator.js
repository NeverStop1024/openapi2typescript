"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceGenerator = exports.getGenInfo = exports.getPath = void 0;
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const nunjucks = (0, tslib_1.__importStar)(require("nunjucks"));
const glob_1 = (0, tslib_1.__importDefault)(require("glob"));
const rimraf_1 = (0, tslib_1.__importDefault)(require("rimraf"));
const reserved_words_1 = (0, tslib_1.__importDefault)(require("reserved-words"));
const path_1 = require("path");
const tiny_pinyin_1 = (0, tslib_1.__importDefault)(require("tiny-pinyin"));
const log_1 = (0, tslib_1.__importDefault)(require("./log"));
const util_1 = require("./util");
const BASE_DIRS = ['service', 'services'];
const getPath = () => {
    const cwd = process.cwd();
    return (0, fs_1.existsSync)((0, path_1.join)(cwd, 'src')) ? (0, path_1.join)(cwd, 'src') : cwd;
};
exports.getPath = getPath;
// 类型声明过滤关键字
const resolveTypeName = (typeName) => {
    if (reserved_words_1.default.check(typeName)) {
        return `__openAPI__${typeName}`;
    }
    const typeLastName = typeName.split('/').pop()
        .split('.').pop();
    const name = typeLastName
        .replace(/[-_ ](\w)/g, (_all, letter) => letter.toUpperCase())
        .replace(/[^\w^\s^\u4e00-\u9fa5]/gi, '');
    if (!/[\u3220-\uFA29]/.test(name)) {
        return name;
    }
    return tiny_pinyin_1.default.convertToPinyin(name, '', true);
};
function getRefName(refObject) {
    if (typeof refObject !== 'object' || !refObject.$ref) {
        return refObject;
    }
    const refPaths = refObject.$ref.split('/');
    return resolveTypeName(refPaths[refPaths.length - 1]);
}
const getType = (schemaObject, namespace = '') => {
    if (schemaObject === undefined || schemaObject === null) {
        return 'any';
    }
    if (typeof schemaObject !== 'object') {
        return schemaObject;
    }
    if (schemaObject.$ref) {
        return [namespace, getRefName(schemaObject)].filter((s) => s).join('.');
    }
    let { type } = schemaObject;
    const numberEnum = [
        'int64',
        'integer',
        'long',
        'float',
        'double',
        'number',
        'int',
        'float',
        'double',
        'int32',
        'int64',
    ];
    const dateEnum = ['Date', 'date', 'dateTime', 'date-time', 'datetime'];
    const stringEnum = ['string', 'email', 'password', 'url', 'byte', 'binary'];
    if (numberEnum.includes(schemaObject.format)) {
        type = 'number';
    }
    if (schemaObject.enum) {
        type = 'enum';
    }
    if (numberEnum.includes(type)) {
        return 'number';
    }
    if (dateEnum.includes(type)) {
        return 'Date';
    }
    if (stringEnum.includes(type)) {
        return 'string';
    }
    if (type === 'boolean') {
        return 'boolean';
    }
    if (type === 'array') {
        let { items } = schemaObject;
        if (schemaObject.schema) {
            items = schemaObject.schema.items;
        }
        if (Array.isArray(items)) {
            const arrayItemType = items
                .map((subType) => getType(subType.schema || subType, namespace))
                .toString();
            return `[${arrayItemType}]`;
        }
        return `${getType(items, namespace)}[]`;
    }
    if (type === 'enum') {
        return Array.isArray(schemaObject.enum)
            ? Array.from(new Set(schemaObject.enum.map((v) => typeof v === 'string' ? `"${v.replace(/"/g, '"')}"` : getType(v)))).join(' | ')
            : 'string';
    }
    if (schemaObject.oneOf && schemaObject.oneOf.length) {
        return schemaObject.oneOf.map((item) => getType(item, namespace)).join(' | ');
    }
    if (schemaObject.allOf && schemaObject.allOf.length) {
        return `(${schemaObject.allOf.map((item) => getType(item, namespace)).join(' & ')})`;
    }
    if (schemaObject.type === 'object' || schemaObject.properties) {
        if (!Object.keys(schemaObject.properties || {}).length) {
            return 'Record<string, any>';
        }
        return `{ ${Object.keys(schemaObject.properties)
            .map((key) => {
            const required = 'required' in (schemaObject.properties[key] || {})
                ? (schemaObject.properties[key] || {}).required
                : false;
            return `${key}${required ? '' : '?'}: ${getType(schemaObject.properties && schemaObject.properties[key], namespace)}; `;
        })
            .join('')}}`;
    }
    return 'any';
};
const getGenInfo = (isDirExist, appName, absSrcPath) => {
    // dir 不存在，则没有占用，且为第一次
    if (!isDirExist) {
        return [false, true];
    }
    const indexList = glob_1.default.sync(`@(${BASE_DIRS.join('|')})/${appName}/index.@(js|ts)`, {
        cwd: absSrcPath,
    });
    // dir 存在，且 index 存在
    if (indexList && indexList.length) {
        const indexFile = (0, path_1.join)(absSrcPath, indexList[0]);
        try {
            const line = ((0, fs_1.readFileSync)(indexFile, 'utf-8') || '').split(/\r?\n/).slice(0, 3).join('');
            // dir 存在，index 存在， 且 index 是我们生成的。则未占用，且不是第一次
            if (line.includes('// API 更新时间：')) {
                return [false, false];
            }
            // dir 存在，index 存在，且 index 内容不是我们生成的。此时如果 openAPI 子文件存在，就不是第一次，否则是第一次
            return [true, !(0, fs_1.existsSync)((0, path_1.join)(indexFile, 'openAPI'))];
        }
        catch (e) {
            // 因为 glob 已经拿到了这个文件，但没权限读，所以当作 dirUsed, 在子目录重新新建，所以当作 firstTime
            return [true, true];
        }
    }
    // dir 存在，index 不存在, 冲突，第一次要看 dir 下有没有 openAPI 文件夹
    return [
        true,
        !((0, fs_1.existsSync)((0, path_1.join)(absSrcPath, BASE_DIRS[0], appName, 'openAPI')) ||
            (0, fs_1.existsSync)((0, path_1.join)(absSrcPath, BASE_DIRS[1], appName, 'openAPI'))),
    ];
};
exports.getGenInfo = getGenInfo;
const DEFAULT_SCHEMA = {
    type: 'object',
    properties: { id: { type: 'number' } },
};
const DEFAULT_PATH_PARAM = {
    in: 'path',
    name: null,
    schema: {
        type: 'string',
    },
    required: true,
    isObject: false,
    type: 'string',
};
class ServiceGenerator {
    constructor(config, openAPIData) {
        this.apiData = {};
        this.classNameList = [];
        this.mappings = [];
        this.concatOrNull = (...arrays) => { let c = [].concat(...arrays.filter(Array.isArray)); return c.length > 0 ? c : null; };
        this.finalPath = '';
        this.config = Object.assign({ projectName: 'api' }, config);
        this.openAPIData = openAPIData;
        const { info } = openAPIData;
        const basePath = '';
        this.version = info.version;
        Object.keys(openAPIData.paths || {}).forEach((p) => {
            const pathItem = openAPIData.paths[p];
            ['get', 'put', 'post', 'delete', 'patch'].forEach((method) => {
                const operationObject = pathItem[method];
                if (!operationObject) {
                    return;
                }
                // const tags = pathItem['x-swagger-router-controller']
                //   ? [pathItem['x-swagger-router-controller']]
                //   : operationObject.tags || [operationObject.operationId] || [
                //       p.replace('/', '').split('/')[1],
                //     ];
                const tags = operationObject['x-swagger-router-controller']
                    ? [operationObject['x-swagger-router-controller']]
                    : operationObject.tags || [operationObject.operationId] || [
                        p.replace('/', '').split('/')[1],
                    ];
                tags.forEach((tagString) => {
                    const tag = resolveTypeName(tagString);
                    if (!this.apiData[tag]) {
                        this.apiData[tag] = [];
                    }
                    this.apiData[tag].push(Object.assign({ path: `${basePath}${p}`, method }, operationObject));
                });
            });
        });
    }
    genFile() {
        const basePath = this.config.serversPath || './src/service';
        try {
            const finalPath = (0, path_1.join)(basePath, this.config.projectName);
            this.finalPath = finalPath;
            glob_1.default
                .sync(`${finalPath}/**/*`)
                .filter((ele) => !ele.includes('_deperated'))
                .forEach((ele) => {
                rimraf_1.default.sync(ele);
            });
        }
        catch (error) {
            (0, log_1.default)(`🚥 serves 生成失败: ${error}`);
        }
        // 生成 ts 类型声明
        this.genFileFromTemplate('typings.d.ts', 'interface', {
            namespace: this.config.namespace,
            // namespace: 'API',
            list: this.getInterfaceTP(),
            disableTypeCheck: false,
        });
        // 生成 controller 文件
        const prettierError = [];
        // 生成 service 统计
        this.getServiceTP().forEach((tp) => {
            // 根据当前数据源类型选择恰当的 controller 模版
            const template = 'serviceController';
            const hasError = this.genFileFromTemplate(this.getFinalFileName(`${tp.className}.ts`), template, Object.assign({ namespace: this.config.namespace, requestImportStatement: this.config.requestImportStatement, disableTypeCheck: false }, tp));
            prettierError.push(hasError);
        });
        if (prettierError.includes(true)) {
            (0, log_1.default)(`🚥 格式化失败，请检查 service 文件内可能存在的语法错误`);
        }
        // 生成 index 文件
        this.genFileFromTemplate(`index.ts`, 'serviceIndex', {
            list: this.classNameList,
            disableTypeCheck: false,
        });
        // 打印日志
        (0, log_1.default)(`✅ 成功生成 service 文件`);
    }
    getServiceTP() {
        // 获取路径相同部分
        const pathBasePrefix = this.getBasePrefix(Object.keys(this.openAPIData.paths));
        return Object.keys(this.apiData)
            .map((tag) => {
            // functionName tag 级别防重
            const tmpFunctionRD = {};
            const genParams = this.apiData[tag]
                .filter((api) => 
            // 暂不支持变量
            !api.path.includes('${'))
                .map((api) => {
                const newApi = api;
                try {
                    const allParams = this.getParamsTP(newApi.parameters, newApi.path);
                    const body = this.getBodyTP(newApi.requestBody);
                    const response = this.getResponseTP(newApi.responses);
                    let _a = allParams || {}, { file } = _a, params = (0, tslib_1.__rest)(_a, ["file"]); // I dont't know if 'file' is valid parameter, maybe it's safe to remove it
                    const newfile = this.getFileTP(newApi.requestBody);
                    file = this.concatOrNull(file, newfile);
                    //const file = this.getFileTP(newApi.requestBody);
                    let formData = false;
                    if ((body && (body.mediaType || '').includes('form')) || file) {
                        formData = true;
                    }
                    let functionName = this.config.hook && this.config.hook.customFunctionName
                        ? this.config.hook.customFunctionName(newApi)
                        : newApi.operationId
                            ? this.resolveFunctionName((0, util_1.stripDot)(newApi.operationId), newApi.method)
                            : newApi.method + this.genDefaultFunctionName(newApi.path, pathBasePrefix);
                    if (functionName && tmpFunctionRD[functionName]) {
                        functionName = `${functionName}_${(tmpFunctionRD[functionName] += 1)}`;
                    }
                    else if (functionName) {
                        tmpFunctionRD[functionName] = 1;
                    }
                    let formattedPath = newApi.path.replace(/:([^/]*)|{([^}]*)}/gi, (_, str, str2) => `$\{${str || str2}}`);
                    if (newApi.extensions && newApi.extensions['x-antTech-description']) {
                        const { extensions } = newApi;
                        const { apiName, antTechVersion, productCode, antTechApiName } = extensions['x-antTech-description'];
                        formattedPath = antTechApiName || formattedPath;
                        this.mappings.push({
                            antTechApi: formattedPath,
                            popAction: apiName,
                            popProduct: productCode,
                            antTechVersion,
                        });
                        newApi.antTechVersion = antTechVersion;
                    }
                    // 为 path 中的 params 添加 alias
                    const escapedPathParams = ((params || {}).path || []).map((ele, index) => (Object.assign(Object.assign({}, ele), { alias: `param${index}` })));
                    if (escapedPathParams.length) {
                        escapedPathParams.forEach((param) => {
                            formattedPath = formattedPath.replace(`$\{${param.name}}`, `$\{${param.alias}}`);
                        });
                    }
                    const finalParams = escapedPathParams && escapedPathParams.length
                        ? Object.assign(Object.assign({}, params), { path: escapedPathParams }) : params;
                    // 处理 query 中的复杂对象
                    if (finalParams && finalParams.query) {
                        finalParams.query = finalParams.query.map((ele) => (Object.assign(Object.assign({}, ele), { isComplexType: ele.isObject })));
                    }
                    const getPrefixPath = () => {
                        if (!this.config.apiPrefix) {
                            return formattedPath;
                        }
                        // 静态 apiPrefix
                        const prefix = typeof this.config.apiPrefix === 'function'
                            ? `${this.config.apiPrefix({
                                path: formattedPath,
                                method: newApi.method,
                                namespace: tag,
                                functionName,
                            })}`.trim()
                            : this.config.apiPrefix.trim();
                        if (!prefix) {
                            return formattedPath;
                        }
                        if (prefix.startsWith("'") || prefix.startsWith('"') || prefix.startsWith('`')) {
                            const finalPrefix = prefix.slice(1, prefix.length - 1);
                            if (formattedPath.startsWith(finalPrefix) ||
                                formattedPath.startsWith(`/${finalPrefix}`)) {
                                return formattedPath;
                            }
                            return `${finalPrefix}${formattedPath}`;
                        }
                        // prefix 变量
                        return `$\{${prefix}}${formattedPath}`;
                    };
                    return Object.assign(Object.assign({}, newApi), { functionName, path: getPrefixPath(), pathInComment: formattedPath.replace(/\*/g, '&#42;'), hasPathVariables: formattedPath.includes('{'), hasApiPrefix: !!this.config.apiPrefix, method: newApi.method, 
                        // 如果 functionName 和 summary 相同，则不显示 summary
                        desc: functionName === newApi.summary
                            ? newApi.description
                            : [newApi.summary, newApi.description].filter((s) => s).join(' '), hasHeader: !!(params && params.header) || !!(body && body.mediaType), params: finalParams, hasParams: Boolean(Object.keys(finalParams || {}).length), body,
                        file, hasFormData: formData, response });
                }
                catch (error) {
                    // eslint-disable-next-line no-console
                    console.error('[GenSDK] gen service param error:', error);
                    throw error;
                }
            });
            const fileName = this.replaceDot(tag);
            if (genParams.length) {
                this.classNameList.push({
                    fileName,
                    controllerName: fileName,
                });
            }
            let className = fileName;
            if (this.config.hook && this.config.hook.customClassName) {
                className = this.config.hook.customClassName(tag);
            }
            return {
                genType: 'ts',
                className,
                instanceName: `${fileName[0].toLowerCase()}${fileName.substr(1)}`,
                list: genParams,
            };
        })
            .filter((ele) => !!ele.list.length);
    }
    getBodyTP(requestBody = {}) {
        const reqBody = this.resolveRefObject(requestBody);
        if (!reqBody) {
            return null;
        }
        const reqContent = reqBody.content;
        if (typeof reqContent !== 'object') {
            return null;
        }
        let mediaType = Object.keys(reqContent)[0];
        const schema = reqContent[mediaType].schema || DEFAULT_SCHEMA;
        if (mediaType === '*/*') {
            mediaType = '';
        }
        // 如果 requestBody 有 required 属性，则正常展示；如果没有，默认非必填
        const required = typeof requestBody.required === 'boolean' ? requestBody.required : false;
        if (schema.type === 'object' && schema.properties) {
            const propertiesList = Object.keys(schema.properties).map((p) => {
                var _a, _b;
                if (schema.properties && schema.properties[p]) {
                    return {
                        key: p,
                        schema: Object.assign(Object.assign({}, schema.properties[p]), { type: getType(schema.properties[p], this.config.namespace), required: (_b = (_a = schema.required) === null || _a === void 0 ? void 0 : _a.includes(p)) !== null && _b !== void 0 ? _b : false }),
                    };
                }
                return undefined;
            });
            return Object.assign(Object.assign({ mediaType }, schema), { required,
                propertiesList });
        }
        return {
            mediaType,
            required,
            type: getType(schema, this.config.namespace),
        };
    }
    getFileTP(requestBody = {}) {
        if (requestBody && requestBody.content && requestBody.content['multipart/form-data']) {
            let ret = this.resolveFileTP(requestBody.content['multipart/form-data'].schema);
            return ret.length > 0 ? ret : null;
        }
        return null;
    }
    resolveFileTP(obj) {
        let ret = [];
        let resolved = this.resolveObject(obj);
        let props = (resolved.props && resolved.props.filter(p => p.format === 'binary' || p.format === 'base64')) || [];
        if (props.length > 0) {
            ret = props.map(p => { return { title: p.name }; });
        }
        if (resolved.type)
            ret = [...ret, ...this.resolveFileTP(resolved.type)];
        return ret;
    }
    getResponseTP(responses = {}) {
        const response = responses && this.resolveRefObject(responses.default || responses['200']);
        const defaultResponse = {
            mediaType: '*/*',
            type: 'any',
        };
        if (!response) {
            return defaultResponse;
        }
        const resContent = response.content;
        const mediaType = Object.keys(resContent || {})[0];
        if (typeof resContent !== 'object' || !mediaType) {
            return defaultResponse;
        }
        const schema = resContent[mediaType].schema || DEFAULT_SCHEMA;
        if ("properties" in schema) {
            Object.keys(schema.properties).map(fieldName => {
                var _a, _b;
                schema.properties[fieldName]['required'] = (_b = (_a = schema.required) === null || _a === void 0 ? void 0 : _a.includes(fieldName)) !== null && _b !== void 0 ? _b : false;
            });
        }
        return {
            mediaType,
            type: getType(schema, this.config.namespace),
        };
    }
    getParamsTP(parameters = [], path = null) {
        const templateParams = {};
        if (parameters && parameters.length) {
            ['query', 'header', 'path', 'cookie', 'file'].forEach((source) => {
                const params = parameters
                    .map((p) => this.resolveRefObject(p))
                    .filter((p) => p.in === source)
                    .map((p) => {
                    const isDirectObject = ((p.schema || {}).type || p.type) === 'object';
                    const refList = ((p.schema || {}).$ref || p.$ref || '').split('/');
                    const ref = refList[refList.length - 1];
                    const deRefObj = (Object.entries(this.openAPIData.components.schemas || {}).find(([k]) => k === ref) || []);
                    const isRefObject = (deRefObj[1] || {}).type === 'object';
                    return Object.assign(Object.assign({}, p), { isObject: isDirectObject || isRefObject, type: getType(p.schema || DEFAULT_SCHEMA, this.config.namespace) });
                });
                if (params.length) {
                    templateParams[source] = params;
                }
            });
        }
        if (path && path.length > 0) {
            var regex = /\{(\w+)\}/g;
            templateParams['path'] = templateParams['path'] || [];
            let match = null;
            while (match = regex.exec(path)) {
                if (!templateParams['path'].some(p => p.name === match[1])) {
                    templateParams['path'].push(Object.assign(Object.assign({}, DEFAULT_PATH_PARAM), { name: match[1] }));
                }
            }
            // 如果 path 没有内容，则将删除 path 参数，避免影响后续的 hasParams 判断
            !templateParams['path'].length && (delete templateParams['path']);
        }
        return templateParams;
    }
    getInterfaceTP() {
        const { components } = this.openAPIData;
        const data = components &&
            [components.schemas].map((defines) => {
                if (!defines) {
                    return null;
                }
                return Object.keys(defines).map((typeName) => {
                    const result = this.resolveObject(defines[typeName]);
                    const getDefinesType = () => {
                        if (result.type) {
                            return defines[typeName].type === 'object' || result.type;
                        }
                        return 'Record<string, any>';
                    };
                    return {
                        typeName: resolveTypeName(typeName),
                        type: getDefinesType(),
                        parent: result.parent,
                        props: result.props || [],
                    };
                });
            });
        return data && data.reduce((p, c) => p && c && p.concat(c), []);
    }
    genFileFromTemplate(fileName, type, params) {
        try {
            const template = this.getTemplate(type);
            // 设置输出不转义
            nunjucks.configure({
                autoescape: false,
            });
            return (0, util_1.writeFile)(this.finalPath, fileName, nunjucks.renderString(template, params));
        }
        catch (error) {
            // eslint-disable-next-line no-console
            console.error('[GenSDK] file gen fail:', fileName, 'type:', type);
            throw error;
        }
    }
    getTemplate(type) {
        return (0, fs_1.readFileSync)((0, path_1.join)(__dirname, '../', 'templates', `${type}.njk`), 'utf8');
    }
    // 获取 TS 类型的属性列表
    getProps(schemaObject) {
        var _a;
        const requiredPropKeys = (_a = schemaObject === null || schemaObject === void 0 ? void 0 : schemaObject.required) !== null && _a !== void 0 ? _a : false;
        return schemaObject.properties
            ? Object.keys(schemaObject.properties).map((propName) => {
                const schema = (schemaObject.properties && schemaObject.properties[propName]) || DEFAULT_SCHEMA;
                return Object.assign(Object.assign({}, schema), { name: propName, type: getType(schema), desc: [schema.title, schema.description].filter((s) => s).join(' '), 
                    // 如果没有 required 信息，默认全部是非必填
                    required: requiredPropKeys ? requiredPropKeys.some((key) => key === propName) : false });
            })
            : [];
    }
    resolveObject(schemaObject) {
        // 引用类型
        if (schemaObject.$ref) {
            return this.resolveRefObject(schemaObject);
        }
        // 枚举类型
        if (schemaObject.enum) {
            return this.resolveEnumObject(schemaObject);
        }
        // 继承类型
        if (schemaObject.allOf && schemaObject.allOf.length) {
            return this.resolveAllOfObject(schemaObject);
        }
        // 对象类型
        if (schemaObject.properties) {
            return this.resolveProperties(schemaObject);
        }
        // 数组类型
        if (schemaObject.items && schemaObject.type === 'array') {
            return this.resolveArray(schemaObject);
        }
        return schemaObject;
    }
    resolveArray(schemaObject) {
        if (schemaObject.items.$ref) {
            const refObj = schemaObject.items.$ref.split('/');
            return {
                type: `${refObj[refObj.length - 1]}[]`,
            };
        }
        // TODO: 这里需要解析出具体属性，但由于 parser 层还不确定，所以暂时先返回 any
        return 'any[]';
    }
    resolveProperties(schemaObject) {
        return {
            props: [this.getProps(schemaObject)],
        };
    }
    resolveEnumObject(schemaObject) {
        const enumArray = schemaObject.enum;
        const enumStr = Array.from(new Set(enumArray.map((v) => (typeof v === 'string' ? `"${v.replace(/"/g, '"')}"` : getType(v))))).join(' | ');
        return {
            type: Array.isArray(enumArray) ? enumStr : 'string',
        };
    }
    resolveAllOfObject(schemaObject) {
        const props = (schemaObject.allOf || []).map(item => item.$ref ? [Object.assign(Object.assign({}, item), { type: getType(item).split('/').pop() })] : this.getProps(item));
        return { props };
    }
    // 将地址path路径转为大驼峰
    genDefaultFunctionName(path, pathBasePrefix) {
        // 首字母转大写
        function toUpperFirstLetter(text) {
            return text.charAt(0).toUpperCase() + text.slice(1);
        }
        return path
            .replace(pathBasePrefix, '')
            .split('/')
            .map((str) => {
            let s = str;
            if (s.includes('-')) {
                s = s.replace(/(-\w)+/g, (_match, p1) => p1 === null || p1 === void 0 ? void 0 : p1.slice(1).toUpperCase());
            }
            if (s.match(/^{.+}$/gim)) {
                return `By${toUpperFirstLetter(s.slice(1, s.length - 1))}`;
            }
            return toUpperFirstLetter(s);
        })
            .join('');
    }
    // 检测所有path重复区域（prefix）
    getBasePrefix(paths) {
        const arr = [];
        paths
            .map(item => item.split('/'))
            .forEach((pathItem) => {
            pathItem.forEach((item, key) => {
                if (arr.length <= key) {
                    arr[key] = [];
                }
                arr[key].push(item);
            });
        });
        const res = [];
        arr.map(item => Array.from(new Set(item)))
            .every(item => {
            const b = item.length === 1;
            if (b) {
                res.push(item);
            }
            return b;
        });
        return `${res.join('/')}/`;
    }
    resolveRefObject(refObject) {
        if (!refObject || !refObject.$ref) {
            return refObject;
        }
        const refPaths = refObject.$ref.split('/');
        if (refPaths[0] === '#') {
            refPaths.shift();
            let obj = this.openAPIData;
            refPaths.forEach((node) => {
                obj = obj[node];
            });
            if (!obj) {
                throw new Error(`[GenSDK] Data Error! Notfoud: ${refObject.$ref}`);
            }
            return Object.assign(Object.assign({}, this.resolveRefObject(obj)), { type: obj.$ref ? this.resolveRefObject(obj).type : obj });
        }
        return refObject;
    }
    getFinalFileName(s) {
        // 支持下划线、中划线和空格分隔符，注意分隔符枚举值的顺序不能改变，否则正则匹配会报错
        return s.replace(/[-_ ](\w)/g, (_all, letter) => letter.toUpperCase());
    }
    replaceDot(s) {
        return s.replace(/\./g, '_').replace(/[-_ ](\w)/g, (_all, letter) => letter.toUpperCase());
    }
    resolveFunctionName(functionName, methodName) {
        // 类型声明过滤关键字
        if (reserved_words_1.default.check(functionName)) {
            return `${functionName}Using${methodName.toUpperCase()}`;
        }
        return functionName;
    }
}
exports.ServiceGenerator = ServiceGenerator;
