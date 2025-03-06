"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseConfigEntry = exports.parseConfigValue = exports.parseGroupValue = exports.parseNewGroupRequest = exports.parseEnvironmentValue = exports.parseNewEnvironmentRequest = exports.parseKey = void 0;
var types_1 = require("@/common/types");
var parseJson = function (input) {
    var json;
    try {
        json = JSON.parse(input);
    }
    catch (e) {
        throw new Error('invalid input: input is not valid JSON');
    }
    return json;
};
var parseKey = function (input) {
    try {
        var value = types_1.Key.parse(input);
        return value;
    }
    catch (e) {
        throw new Error('invalid input: key cannot contain ":"');
    }
};
exports.parseKey = parseKey;
var parseNewEnvironmentRequest = function (input) {
    var json = parseJson(input);
    try {
        var value = types_1.NewEnvironmentRequest.parse(json);
        return value;
    }
    catch (e) {
        var error = e;
        var message = formatZodError(error);
        throw new Error(message);
    }
};
exports.parseNewEnvironmentRequest = parseNewEnvironmentRequest;
var parseEnvironmentValue = function (input) {
    var json = parseJson(input);
    try {
        var value = types_1.EnvironmentValue.parse(json);
        return value;
    }
    catch (e) {
        var error = e;
        var message = formatZodError(error);
        throw new Error(message);
    }
};
exports.parseEnvironmentValue = parseEnvironmentValue;
var parseNewGroupRequest = function (input) {
    var json = parseJson(input);
    try {
        return types_1.NewGroupRequest.parse(json);
    }
    catch (e) {
        var error = e;
        var message = formatZodError(error);
        throw new Error(message);
    }
};
exports.parseNewGroupRequest = parseNewGroupRequest;
var parseGroupValue = function (input) {
    var json = parseJson(input);
    try {
        var value = types_1.GroupValue.parse(json);
        return value;
    }
    catch (e) {
        var error = e;
        var message = formatZodError(error);
        throw new Error(message);
    }
};
exports.parseGroupValue = parseGroupValue;
var parseConfigValue = function (input) {
    var json = parseJson(input);
    try {
        return types_1.ConfigValue.parse(json);
    }
    catch (e) {
        var error = e;
        var message = formatZodError(error);
        throw new Error(message);
    }
};
exports.parseConfigValue = parseConfigValue;
var parseConfigEntry = function (input) {
    var json = parseJson(input);
    try {
        var value = types_1.ConfigEntry.parse(json);
        return value;
    }
    catch (e) {
        var error = e;
        var message = formatZodError(error);
        throw new Error(message);
    }
};
exports.parseConfigEntry = parseConfigEntry;
var formatZodError = function (error) {
    var fields = [];
    for (var _i = 0, _a = error.issues; _i < _a.length; _i++) {
        var issue = _a[_i];
        fields.push(issue.path.join('.'));
    }
    var message = "invalid input: field".concat(fields.length > 1 ? 's' : '', " ") +
        fields.join(', ') +
        " ".concat(fields.length > 1 ? 'are' : 'is', " invalid");
    return message;
};
