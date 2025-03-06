"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parse_1 = require("./parse");
var vitest_1 = require("vitest");
(0, vitest_1.test)('key', function () {
    var testCases = [
        {
            input: 'foo',
            output: 'foo'
        },
        {
            input: 'test',
            output: 'test'
        },
        {
            input: 'foo:bar',
            errorMsg: 'invalid input: key cannot contain ":"'
        }
    ];
    for (var _i = 0, testCases_1 = testCases; _i < testCases_1.length; _i++) {
        var testCase = testCases_1[_i];
        var hasError = false;
        try {
            var value = (0, parse_1.parseKey)(testCase.input);
            (0, vitest_1.expect)(value).toEqual(testCase.output);
        }
        catch (err) {
            var error = err;
            (0, vitest_1.expect)(error.message).toBe(testCase.errorMsg);
            hasError = true;
        }
        (0, vitest_1.expect)(hasError).toBe(testCase.errorMsg !== undefined);
    }
});
(0, vitest_1.describe)('parseNewEnvironmentRequest', function () {
    (0, vitest_1.test)('success', function () {
        var testCases = [
            {
                input: '{"name":"production"}',
                output: { name: 'production' }
            },
            {
                input: '{"name":"foo"}',
                output: { name: 'foo' }
            }
        ];
        for (var _i = 0, testCases_2 = testCases; _i < testCases_2.length; _i++) {
            var testCase = testCases_2[_i];
            var value = (0, parse_1.parseNewEnvironmentRequest)(testCase.input);
            (0, vitest_1.expect)(value).toEqual(testCase.output);
        }
    });
    (0, vitest_1.test)('invalid json', function () {
        (0, vitest_1.expect)(function () { return (0, parse_1.parseNewEnvironmentRequest)('invalid input'); }).toThrow('invalid input: input is not valid JSON');
    });
    (0, vitest_1.test)('zod validation failed', function () {
        (0, vitest_1.expect)(function () { return (0, parse_1.parseNewEnvironmentRequest)('{}'); }).toThrow('invalid input: field name is invalid');
    });
});
(0, vitest_1.describe)('parseEnvironmentValue', function () {
    (0, vitest_1.test)('success', function () {
        var testCases = [
            {
                input: '{"groups":["foo","bar"]}',
                output: { groups: ['foo', 'bar'] }
            },
            {
                input: '{"groups":["foo"]}',
                output: { groups: ['foo'] }
            }
        ];
        for (var _i = 0, testCases_3 = testCases; _i < testCases_3.length; _i++) {
            var testCase = testCases_3[_i];
            var value = (0, parse_1.parseEnvironmentValue)(testCase.input);
            (0, vitest_1.expect)(value).toEqual(testCase.output);
        }
    });
    (0, vitest_1.test)('invalid json', function () {
        (0, vitest_1.expect)(function () { return (0, parse_1.parseEnvironmentValue)('invalid input'); }).toThrow('invalid input: input is not valid JSON');
    });
    (0, vitest_1.test)('zod validation failed', function () {
        (0, vitest_1.expect)(function () { return (0, parse_1.parseEnvironmentValue)('{}'); }).toThrow('invalid input: field groups is invalid');
    });
});
(0, vitest_1.describe)('parseNewGroupRequest', function () {
    (0, vitest_1.test)('success', function () {
        var value = (0, parse_1.parseNewGroupRequest)('{"name":"project-1"}');
        (0, vitest_1.expect)(value).toEqual({ name: 'project-1' });
    });
    (0, vitest_1.test)('invalid json', function () {
        (0, vitest_1.expect)(function () { return (0, parse_1.parseNewGroupRequest)('invalid input'); }).toThrow('invalid input: input is not valid JSON');
    });
    (0, vitest_1.test)('zod validation failed', function () {
        (0, vitest_1.expect)(function () { return (0, parse_1.parseNewGroupRequest)('{}'); }).toThrow('invalid input: field name is invalid');
    });
});
(0, vitest_1.describe)('parseGroupValue', function () {
    (0, vitest_1.test)('success', function () {
        var testCases = [
            {
                input: '{"environments":["production","staging"]}',
                output: { environments: ['production', 'staging'] }
            },
            {
                input: '{"environments":["production"]}',
                output: { environments: ['production'] }
            }
        ];
        for (var _i = 0, testCases_4 = testCases; _i < testCases_4.length; _i++) {
            var testCase = testCases_4[_i];
            var value = (0, parse_1.parseGroupValue)(testCase.input);
            (0, vitest_1.expect)(value).toEqual(testCase.output);
        }
    });
    (0, vitest_1.test)('invalid json', function () {
        (0, vitest_1.expect)(function () { return (0, parse_1.parseGroupValue)('invalid input'); }).toThrow('invalid input: input is not valid JSON');
    });
    (0, vitest_1.test)('zod validation failed', function () {
        (0, vitest_1.expect)(function () { return (0, parse_1.parseGroupValue)('{}'); }).toThrow('invalid input: field environments is invalid');
    });
});
(0, vitest_1.test)('config value', function () {
    var testCases = [
        {
            input: '{"type":"text","value":"bar"}',
            output: { type: 'text', value: 'bar' }
        },
        {
            input: '{"type":"json","value":"bar"}',
            output: { type: 'json', value: 'bar' }
        },
        {
            input: '{"type":"yaml","value":"bar"}',
            output: { type: 'yaml', value: 'bar' }
        },
        {
            input: '{"type":"yaml"}',
            errorMsg: 'invalid input: field value is invalid'
        },
        {
            input: '{"type":"error","value":"bar"}',
            errorMsg: 'invalid input: field type is invalid'
        }
    ];
    for (var _i = 0, testCases_5 = testCases; _i < testCases_5.length; _i++) {
        var testCase = testCases_5[_i];
        var hasError = false;
        try {
            var value = (0, parse_1.parseConfigValue)(testCase.input);
            (0, vitest_1.expect)(value).toEqual(testCase.output);
        }
        catch (err) {
            var error = err;
            (0, vitest_1.expect)(error.message).toBe(testCase.errorMsg);
            hasError = true;
        }
        (0, vitest_1.expect)(hasError).toBe(testCase.errorMsg !== undefined);
    }
});
(0, vitest_1.test)('config schema', function () {
    var testCases = [
        {
            input: '{"type":"text","key":"foo","value":"bar"}',
            output: { type: 'text', key: 'foo', value: 'bar' }
        },
        {
            input: '{"type":"json"}',
            errorMsg: 'invalid input: fields key, value are invalid'
        },
        {
            input: '{"type":"json","value":"bar"}',
            errorMsg: 'invalid input: field key is invalid'
        },
        {
            input: '{"key":"foo"}',
            errorMsg: 'invalid input: fields type, value are invalid'
        },
        {
            input: '{"type":"error","key":"foo","value":"bar"}',
            errorMsg: 'invalid input: field type is invalid'
        }
    ];
    for (var _i = 0, testCases_6 = testCases; _i < testCases_6.length; _i++) {
        var testCase = testCases_6[_i];
        var hasError = false;
        try {
            var value = (0, parse_1.parseConfigEntry)(testCase.input);
            (0, vitest_1.expect)(value).toEqual(testCase.output);
        }
        catch (err) {
            var error = err;
            (0, vitest_1.expect)(error.message).toBe(testCase.errorMsg);
            hasError = true;
        }
        (0, vitest_1.expect)(hasError).toBe(testCase.errorMsg !== undefined);
    }
});
