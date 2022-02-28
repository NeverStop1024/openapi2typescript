import type { OpenAPIObject, SchemaObject, ReferenceObject, ParameterObject, RequestBodyObject, ResponsesObject, OperationObject } from 'openapi3-ts';
import type { GenerateServiceProps } from './index';
export declare type TypescriptFileType = 'interface' | 'serviceController' | 'serviceIndex';
export interface APIDataType extends OperationObject {
    path: string;
    method: string;
}
export declare type TagAPIDataType = Record<string, APIDataType[]>;
export interface MappingItemType {
    antTechApi: string;
    popAction: string;
    popProduct: string;
    antTechVersion: string;
}
export interface ControllerType {
    fileName: string;
    controllerName: string;
}
export declare const getPath: () => string;
export declare const getGenInfo: (isDirExist: boolean, appName: string, absSrcPath: string) => boolean[];
declare class ServiceGenerator {
    protected apiData: TagAPIDataType;
    protected classNameList: ControllerType[];
    protected version: string;
    protected mappings: MappingItemType[];
    protected finalPath: string;
    protected config: GenerateServiceProps;
    protected openAPIData: OpenAPIObject;
    constructor(config: GenerateServiceProps, openAPIData: OpenAPIObject);
    genFile(): void;
    concatOrNull: (...arrays: any[]) => any[];
    getServiceTP(): {
        genType: string;
        className: string;
        instanceName: string;
        list: {
            functionName: string;
            path: string;
            pathInComment: string;
            hasPathVariables: boolean;
            hasApiPrefix: boolean;
            method: string;
            desc: string;
            hasHeader: boolean;
            params: {
                [x: string]: ParameterObject[];
            };
            hasParams: boolean;
            body: {
                required: any;
                propertiesList: {
                    key: string;
                    schema: {
                        type: string;
                        required: boolean;
                        $ref: string;
                    } | {
                        type: string;
                        required: boolean;
                        nullable?: boolean;
                        discriminator?: import("openapi3-ts").DiscriminatorObject;
                        readOnly?: boolean;
                        writeOnly?: boolean;
                        xml?: import("openapi3-ts").XmlObject;
                        externalDocs?: import("openapi3-ts").ExternalDocumentationObject;
                        example?: any;
                        examples?: any[];
                        deprecated?: boolean;
                        format?: string;
                        allOf?: (ReferenceObject | SchemaObject)[];
                        oneOf?: (ReferenceObject | SchemaObject)[];
                        anyOf?: (ReferenceObject | SchemaObject)[];
                        not?: ReferenceObject | SchemaObject;
                        items?: ReferenceObject | SchemaObject;
                        properties?: {
                            [propertyName: string]: ReferenceObject | SchemaObject;
                        };
                        additionalProperties?: boolean | ReferenceObject | SchemaObject;
                        description?: string;
                        default?: any;
                        title?: string;
                        multipleOf?: number;
                        maximum?: number;
                        exclusiveMaximum?: boolean;
                        minimum?: number;
                        exclusiveMinimum?: boolean;
                        maxLength?: number;
                        minLength?: number;
                        pattern?: string;
                        maxItems?: number;
                        minItems?: number;
                        uniqueItems?: boolean;
                        maxProperties?: number;
                        minProperties?: number;
                        enum?: any[];
                    };
                }[];
                nullable?: boolean;
                discriminator?: import("openapi3-ts").DiscriminatorObject;
                readOnly?: boolean;
                writeOnly?: boolean;
                xml?: import("openapi3-ts").XmlObject;
                externalDocs?: import("openapi3-ts").ExternalDocumentationObject;
                example?: any;
                examples?: any[];
                deprecated?: boolean;
                type?: "string" | "number" | "boolean" | "object" | "integer" | "null" | "array";
                format?: string;
                allOf?: (ReferenceObject | SchemaObject)[];
                oneOf?: (ReferenceObject | SchemaObject)[];
                anyOf?: (ReferenceObject | SchemaObject)[];
                not?: ReferenceObject | SchemaObject;
                items?: ReferenceObject | SchemaObject;
                properties?: {
                    [propertyName: string]: ReferenceObject | SchemaObject;
                };
                additionalProperties?: boolean | ReferenceObject | SchemaObject;
                description?: string;
                default?: any;
                title?: string;
                multipleOf?: number;
                maximum?: number;
                exclusiveMaximum?: boolean;
                minimum?: number;
                exclusiveMinimum?: boolean;
                maxLength?: number;
                minLength?: number;
                pattern?: string;
                maxItems?: number;
                minItems?: number;
                uniqueItems?: boolean;
                maxProperties?: number;
                minProperties?: number;
                enum?: any[];
                mediaType: string;
            } | {
                mediaType: string;
                required: any;
                type: string;
            };
            file: ParameterObject[];
            hasFormData: boolean;
            response: {
                mediaType: string;
                type: string;
            };
            tags?: string[];
            summary?: string;
            description?: string;
            externalDocs?: import("openapi3-ts").ExternalDocumentationObject;
            operationId?: string;
            parameters?: (ParameterObject | ReferenceObject)[];
            requestBody?: ReferenceObject | RequestBodyObject;
            responses: ResponsesObject;
            callbacks?: import("openapi3-ts").CallbacksObject;
            deprecated?: boolean;
            security?: import("openapi3-ts").SecurityRequirementObject[];
            servers?: import("openapi3-ts").ServerObject[];
        }[];
    }[];
    getBodyTP(requestBody?: any): {
        required: any;
        propertiesList: {
            key: string;
            schema: {
                type: string;
                required: boolean;
                $ref: string;
            } | {
                type: string;
                required: boolean;
                nullable?: boolean;
                discriminator?: import("openapi3-ts").DiscriminatorObject;
                readOnly?: boolean;
                writeOnly?: boolean;
                xml?: import("openapi3-ts").XmlObject;
                externalDocs?: import("openapi3-ts").ExternalDocumentationObject;
                example?: any;
                examples?: any[];
                deprecated?: boolean;
                format?: string;
                allOf?: (ReferenceObject | SchemaObject)[];
                oneOf?: (ReferenceObject | SchemaObject)[];
                anyOf?: (ReferenceObject | SchemaObject)[];
                not?: ReferenceObject | SchemaObject;
                items?: ReferenceObject | SchemaObject;
                properties?: {
                    [propertyName: string]: ReferenceObject | SchemaObject;
                };
                additionalProperties?: boolean | ReferenceObject | SchemaObject;
                description?: string;
                default?: any;
                title?: string;
                multipleOf?: number;
                maximum?: number;
                exclusiveMaximum?: boolean;
                minimum?: number;
                exclusiveMinimum?: boolean;
                maxLength?: number;
                minLength?: number;
                pattern?: string;
                maxItems?: number;
                minItems?: number;
                uniqueItems?: boolean;
                maxProperties?: number;
                minProperties?: number;
                enum?: any[];
            };
        }[];
        nullable?: boolean;
        discriminator?: import("openapi3-ts").DiscriminatorObject;
        readOnly?: boolean;
        writeOnly?: boolean;
        xml?: import("openapi3-ts").XmlObject;
        externalDocs?: import("openapi3-ts").ExternalDocumentationObject;
        example?: any;
        examples?: any[];
        deprecated?: boolean;
        type?: "string" | "number" | "boolean" | "object" | "integer" | "null" | "array";
        format?: string;
        allOf?: (ReferenceObject | SchemaObject)[];
        oneOf?: (ReferenceObject | SchemaObject)[];
        anyOf?: (ReferenceObject | SchemaObject)[];
        not?: ReferenceObject | SchemaObject;
        items?: ReferenceObject | SchemaObject;
        properties?: {
            [propertyName: string]: ReferenceObject | SchemaObject;
        };
        additionalProperties?: boolean | ReferenceObject | SchemaObject;
        description?: string;
        default?: any;
        title?: string;
        multipleOf?: number;
        maximum?: number;
        exclusiveMaximum?: boolean;
        minimum?: number;
        exclusiveMinimum?: boolean;
        maxLength?: number;
        minLength?: number;
        pattern?: string;
        maxItems?: number;
        minItems?: number;
        uniqueItems?: boolean;
        maxProperties?: number;
        minProperties?: number;
        enum?: any[];
        mediaType: string;
    } | {
        mediaType: string;
        required: any;
        type: string;
    };
    getFileTP(requestBody?: any): any[];
    resolveFileTP(obj: any): any[];
    getResponseTP(responses?: ResponsesObject): {
        mediaType: string;
        type: string;
    };
    getParamsTP(parameters?: (ParameterObject | ReferenceObject)[], path?: string): Record<string, ParameterObject[]>;
    getInterfaceTP(): {
        typeName: string;
        type: any;
        parent: any;
        props: any;
    }[];
    private genFileFromTemplate;
    private getTemplate;
    getProps(schemaObject: SchemaObject): {
        name: string;
        type: string;
        desc: string;
        required: boolean;
        nullable?: boolean;
        discriminator?: import("openapi3-ts").DiscriminatorObject;
        readOnly?: boolean;
        writeOnly?: boolean;
        xml?: import("openapi3-ts").XmlObject;
        externalDocs?: import("openapi3-ts").ExternalDocumentationObject;
        example?: any;
        examples?: any[];
        deprecated?: boolean;
        format?: string;
        allOf?: (ReferenceObject | SchemaObject)[];
        oneOf?: (ReferenceObject | SchemaObject)[];
        anyOf?: (ReferenceObject | SchemaObject)[];
        not?: ReferenceObject | SchemaObject;
        items?: ReferenceObject | SchemaObject;
        properties?: {
            [propertyName: string]: ReferenceObject | SchemaObject;
        };
        additionalProperties?: boolean | ReferenceObject | SchemaObject;
        description?: string;
        default?: any;
        title?: string;
        multipleOf?: number;
        maximum?: number;
        exclusiveMaximum?: boolean;
        minimum?: number;
        exclusiveMinimum?: boolean;
        maxLength?: number;
        minLength?: number;
        pattern?: string;
        maxItems?: number;
        minItems?: number;
        uniqueItems?: boolean;
        maxProperties?: number;
        minProperties?: number;
        enum?: any[];
    }[];
    resolveObject(schemaObject: SchemaObject): any;
    resolveArray(schemaObject: SchemaObject): "any[]" | {
        type: string;
    };
    resolveProperties(schemaObject: SchemaObject): {
        props: {
            name: string;
            type: string;
            desc: string;
            required: boolean;
            nullable?: boolean;
            discriminator?: import("openapi3-ts").DiscriminatorObject;
            readOnly?: boolean;
            writeOnly?: boolean;
            xml?: import("openapi3-ts").XmlObject;
            externalDocs?: import("openapi3-ts").ExternalDocumentationObject;
            example?: any;
            examples?: any[];
            deprecated?: boolean;
            format?: string;
            allOf?: (ReferenceObject | SchemaObject)[];
            oneOf?: (ReferenceObject | SchemaObject)[];
            anyOf?: (ReferenceObject | SchemaObject)[];
            not?: ReferenceObject | SchemaObject;
            items?: ReferenceObject | SchemaObject;
            properties?: {
                [propertyName: string]: ReferenceObject | SchemaObject;
            };
            additionalProperties?: boolean | ReferenceObject | SchemaObject;
            description?: string;
            default?: any;
            title?: string;
            multipleOf?: number;
            maximum?: number;
            exclusiveMaximum?: boolean;
            minimum?: number;
            exclusiveMinimum?: boolean;
            maxLength?: number;
            minLength?: number;
            pattern?: string;
            maxItems?: number;
            minItems?: number;
            uniqueItems?: boolean;
            maxProperties?: number;
            minProperties?: number;
            enum?: any[];
        }[][];
    };
    resolveEnumObject(schemaObject: SchemaObject): {
        type: string;
    };
    resolveAllOfObject(schemaObject: SchemaObject): {
        props: ({
            name: string;
            type: string;
            desc: string;
            required: boolean;
            nullable?: boolean;
            discriminator?: import("openapi3-ts").DiscriminatorObject;
            readOnly?: boolean;
            writeOnly?: boolean;
            xml?: import("openapi3-ts").XmlObject;
            externalDocs?: import("openapi3-ts").ExternalDocumentationObject;
            example?: any;
            examples?: any[];
            deprecated?: boolean;
            format?: string;
            allOf?: (ReferenceObject | SchemaObject)[];
            oneOf?: (ReferenceObject | SchemaObject)[];
            anyOf?: (ReferenceObject | SchemaObject)[];
            not?: ReferenceObject | SchemaObject;
            items?: ReferenceObject | SchemaObject;
            properties?: {
                [propertyName: string]: ReferenceObject | SchemaObject;
            };
            additionalProperties?: boolean | ReferenceObject | SchemaObject;
            description?: string;
            default?: any;
            title?: string;
            multipleOf?: number;
            maximum?: number;
            exclusiveMaximum?: boolean;
            minimum?: number;
            exclusiveMinimum?: boolean;
            maxLength?: number;
            minLength?: number;
            pattern?: string;
            maxItems?: number;
            minItems?: number;
            uniqueItems?: boolean;
            maxProperties?: number;
            minProperties?: number;
            enum?: any[];
        }[] | ({
            type: string;
            $ref: string;
        } | {
            type: string;
            nullable?: boolean;
            discriminator?: import("openapi3-ts").DiscriminatorObject;
            readOnly?: boolean;
            writeOnly?: boolean;
            xml?: import("openapi3-ts").XmlObject;
            externalDocs?: import("openapi3-ts").ExternalDocumentationObject;
            example?: any;
            examples?: any[];
            deprecated?: boolean;
            format?: string;
            allOf?: (ReferenceObject | SchemaObject)[];
            oneOf?: (ReferenceObject | SchemaObject)[];
            anyOf?: (ReferenceObject | SchemaObject)[];
            not?: ReferenceObject | SchemaObject;
            items?: ReferenceObject | SchemaObject;
            properties?: {
                [propertyName: string]: ReferenceObject | SchemaObject;
            };
            additionalProperties?: boolean | ReferenceObject | SchemaObject;
            description?: string;
            default?: any;
            title?: string;
            multipleOf?: number;
            maximum?: number;
            exclusiveMaximum?: boolean;
            minimum?: number;
            exclusiveMinimum?: boolean;
            maxLength?: number;
            minLength?: number;
            pattern?: string;
            maxItems?: number;
            minItems?: number;
            uniqueItems?: boolean;
            maxProperties?: number;
            minProperties?: number;
            required?: string[];
            enum?: any[];
        })[])[];
    };
    private genDefaultFunctionName;
    private getBasePrefix;
    private resolveRefObject;
    private getFinalFileName;
    private replaceDot;
    private resolveFunctionName;
}
export { ServiceGenerator };
