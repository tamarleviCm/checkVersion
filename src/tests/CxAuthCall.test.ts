import {CxScanConfig} from '../main/CxScanConfig';
import {CxAuth} from '../main/CxAuth';
import {CxParamType} from '../main/CxParamType';
import {CxCommandOutput} from "../main/CxCommandOutput";
import * as fs from "fs";

let cxScanConfig = new CxScanConfig();
cxScanConfig.baseUri = process.env["CX_BASE_URI"];
cxScanConfig.clientId = process.env["CX_CLIENT_ID"];
cxScanConfig.clientSecret = process.env["CX_CLIENT_SECRET"];
cxScanConfig.tenant = process.env["CX_TENANT"];
if(process.env["PATH_TO_EXECUTABLE"] !== null && process.env["PATH_TO_EXECUTABLE"] !== undefined ) {
    cxScanConfig.pathToExecutable = process.env["PATH_TO_EXECUTABLE"];
}

describe("ScanCreate cases",() => {
    it('ScanCreate Successful case wait mode', async () => {
        const params = new Map();
        params.set(CxParamType.PROJECT_NAME, "ast-cli-javascript-integration-success");
        params.set(CxParamType.S, "./src/tests");
        params.set(CxParamType.FILTER, "*.ts,!**/node_modules/**/*");
        params.set(CxParamType.ADDITIONAL_PARAMETERS, "--scan-types sast");

        const auth = new CxAuth(cxScanConfig);
        const data = await auth.scanCreate(params);
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        const ScanObject = cxCommandOutput.scanObjectList.pop()
        const scanShowObject = await auth.scanShow(ScanObject.ID);
        console.log(" Json object from successful wait mode case: " + JSON.stringify(scanShowObject))
        expect(scanShowObject.scanObjectList.pop().Status).toEqual("Completed")
    })

    it('ScanCreate Successful case with Branch', async () => {
        const params = new Map();
        params.set(CxParamType.PROJECT_NAME, "ast-cli-javascript-integration-success-branch");
        params.set(CxParamType.S, "./src/tests");
        params.set(CxParamType.FILTER, "*.ts,!**/node_modules/**/*");
        params.set(CxParamType.ADDITIONAL_PARAMETERS, "--scan-types sast");
        params.set(CxParamType.BRANCH, "master");
        const auth = new CxAuth(cxScanConfig);

        const data = await auth.scanCreate(params);
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        const ScanObject = cxCommandOutput.scanObjectList.pop()
        const scanShowObject = await auth.scanShow(ScanObject.ID);
        console.log(" Json object from successful wait mode case with branch: " +JSON.stringify(scanShowObject))
        expect(scanShowObject.scanObjectList.pop().Status).toEqual("Completed")

    })

    it('ScanCreate Failure case', async () => {
        const params = new Map();
        params.set(CxParamType.PROJECT_NAME, "ast-cli-javascript-integration-failure");
        params.set(CxParamType.S, "./src/tests");
        params.set(CxParamType.SAST_PRESET_NAME, "Checkmarx Default Fake");
        params.set(CxParamType.BRANCH, "master");
        const auth = new CxAuth(cxScanConfig);

        const data = await auth.scanCreate(params);
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        const ScanObject = cxCommandOutput.scanObjectList.pop()
        const scanShowObject = await auth.scanShow(ScanObject.ID);
        console.log(" Json object from failure case: " + JSON.stringify(scanShowObject))
        expect(scanShowObject.scanObjectList.pop().Status).toEqual("Failed")
    })

    it('ScanCreate Successful case no wait mode', async () => {
        const params = new Map();
        params.set(CxParamType.PROJECT_NAME, "ast-cli-javascript-integration-nowait");
        params.set(CxParamType.S, "./src/tests");
        params.set(CxParamType.SAST_PRESET_NAME, "Checkmarx Default Fake");
        params.set(CxParamType.ADDITIONAL_PARAMETERS, "--nowait");
        const auth = new CxAuth(cxScanConfig);

        const data = await auth.scanCreate(params);
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        const ScanObject = cxCommandOutput.scanObjectList.pop()
        const scanShowObject = await auth.scanShow(ScanObject.ID);
        console.log(" Json object from successful no wait mode case: " + JSON.stringify(scanShowObject))
        expect(scanShowObject.scanObjectList.pop().Status).toEqual("Running")
    })

});

describe("ScanList cases",() => {
    it('ScanList Successful case', async () => {
        const auth = new CxAuth(cxScanConfig);
        const data = await auth.scanList();
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        expect(cxCommandOutput.scanObjectList.length).toBeGreaterThan(0);
    });
});

describe("ProjectList cases",() => {
    it('ProjectList Successful case', async () => {
        const auth = new CxAuth(cxScanConfig);
        const data = await auth.projectList();
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        expect(cxCommandOutput.scanObjectList.length).toBeGreaterThan(0);
    });
});

describe("Results cases",() => {
    it('Result Test Successful case', async () => {
        const auth = new CxAuth(cxScanConfig);
        const data = await auth.scanList();
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        let sampleId  = cxCommandOutput.scanObjectList.pop().ID;
        await auth.getResults(sampleId,"json","jsonList", ".")
        const file = await fileExists("./jsonList.json");
        expect(file).toBe(true);
    });

    it('Result List Successful case', async () => {
        const auth = new CxAuth(cxScanConfig);
        const data = await auth.scanList();
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        let sampleId  = cxCommandOutput.scanObjectList.pop().ID;
        const written = await auth.getResultsList(sampleId)
        expect(written.length).toBeGreaterThan(0);
    });

    it('Result summary html file generation successful case', async () => {
        const auth = new CxAuth(cxScanConfig);
        const data = await auth.scanList();
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        let sampleId  = cxCommandOutput.scanObjectList.pop().ID;
        await auth.getResults(sampleId,"summaryHTML","test", ".")
        const file = await fileExists("./test.html");
        expect(file).toBe(true);
    });

    it('Result summary html string successful case', async () => {
        const auth = new CxAuth(cxScanConfig);
        const data = await auth.scanList();
        const cxCommandOutput: CxCommandOutput = JSON.parse(JSON.stringify(data))
        let sampleId  = cxCommandOutput.scanObjectList.pop().ID;
        const written = await auth.getResultsSummary(sampleId)
        expect(written.length).toBeGreaterThan(0);
    });

});

const fileExists = (file:any) => {
    return new Promise((resolve) => {
        fs.access(file, fs.constants.F_OK, (err) => {
            err ? resolve(false) : resolve(true)
        });
    })
}
