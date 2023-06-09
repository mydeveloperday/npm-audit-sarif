

const fs = require('fs')
const {
    SarifBuilder,
    SarifRunBuilder,
    SarifResultBuilder,
} = require('node-sarif-builder')
const yargs = require('yargs')

export function minVal(val: number) {
    if (val) {
        return val;
    }
    return 1;
}

export function relative(rootdir: string, fullpath: string) {
    if (rootdir) {
        if (fullpath.toLowerCase().startsWith(rootdir.toLowerCase())) {
            return fullpath.substring(rootdir.length);
        }
    }
    return fullpath;
}

export function main() {
    const argv = yargs
        .option('o', {
            alias: 'output',
            describe: 'Output filename',
            type: 'string',
            demandOption: false,
        })
        .option('r', {
            alias: 'root',
            describe: 'Root directory',
            type: 'string',
            demandOption: false,
        })
        .demandCommand(1)
        .usage('Usage: $0 [options] <filename>').argv;

    exportSarif(argv._[0], argv.output, argv.root);
}

export interface Via
{
    source: number;
    name: string;
    dependency: string;
    title: string;
    url: string;
    severity: string;    
    cwe: string[];
};

export interface Vulnerability
{
    name: string;
    severity: string;
    via: Via[] | string[];
    isDirect: boolean;
    range: string;
    fixAvailable: boolean;
};

export function exportSarif(filename:string, outputfilename:string,rootdir:string) {
    const results = JSON.parse(fs.readFileSync(filename, 'utf8'))

    // SARIF builder
    const sarifBuilder = new SarifBuilder()

    // SARIF Run builder
    const sarifRunBuilder = new SarifRunBuilder().initSimple({
        toolDriverName: 'npm-audit-sarif',
        toolDriverVersion: '0.0.6',
    })

    for (const key in results.vulnerabilities) {
        const value = results.vulnerabilities[key];

        for (const viaobj of value.via){ 
            if (typeof (viaobj) == "string") {
                continue;
            }
            const via: Via = viaobj as Via;
            let msg = "Audit: " + via.severity + "\n" + via.name + "\n" + via.title + "\n" + via.url;

            if (via.cwe.length) {
                for (const cwe of via.cwe) {
                    msg += "\n";
                    msg += cwe;
                }
            }

            let level = "error";
            if (via.severity == "moderate") {
                level = "info";
            }
            if (via.severity == "high") {
                level = "warning";
            }
            if (via.severity == "critical") {
                level = "error";
            }
        
            const ruleId = "npm-audit-" + key.toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");

            const sarifResultBuilder = new SarifResultBuilder()
            const sarifResultInit = {
                ruleId: ruleId,
                level: level,
                messageText: msg,
                fileUri: relative(rootdir, "package.json"),
            
                startLine: 0,
                startColumn: 0,
                endLine: 0,
                endColumn: 0
            }

            sarifResultInit.startLine = 1;
            sarifResultInit.startColumn = 1;
            sarifResultInit.endLine = 1;
            sarifResultInit.endColumn = 1;

            sarifResultBuilder.initSimple(sarifResultInit)
            sarifRunBuilder.addResult(sarifResultBuilder)
        }
    }

    sarifBuilder.addRun(sarifRunBuilder)

    const json = sarifBuilder.buildSarifJsonString({ indent: true })

    if (outputfilename) {
        fs.writeFileSync(outputfilename, json)
    } else {
        console.log(json)
    }
}
