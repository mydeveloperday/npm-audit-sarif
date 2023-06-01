
import { minVal, relative, exportSarif } from './sarif';
import { readFileSync,existsSync } from 'fs';

describe("saif tests", () => {
    test('check minVal', () => {
        expect(minVal(0)).toEqual(1);
        expect(minVal(1)).toEqual(1);
        expect(minVal(2)).toEqual(2);
    });

    test('check relative', () => {
        expect(relative("c:/cygwin64/source/", 'c:/cygwin64/source/npm-audit-sarif/audit.json')).toEqual('npm-audit-sarif/audit.json');
    });

    test('check relative case ensitive', () => {
        expect(relative("c:/cygwin64/source/", 'c:/cygwin64/Source/npm-audit-sarif/audit.json')).toEqual('npm-audit-sarif/audit.json');
    });

    test('check export', () => {
        expect(existsSync('audit.json')).toEqual(true);
        exportSarif('audit.json', 'testout.json', 'c:/cygwin64/source');
        expect(existsSync('testout.json')).toEqual(true);
    
        const results = JSON.parse(readFileSync('testout.json', 'utf8'))

        expect(Object.keys(results.runs[0].results).length).toBe(5);
    });

    test('check export to console', () => {
        expect(existsSync('audit.json')).toEqual(true);
        exportSarif('audit.json', '', 'c:/cygwin64/source');
    });

});