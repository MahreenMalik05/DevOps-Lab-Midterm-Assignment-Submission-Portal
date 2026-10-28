
const fs = require("fs");
const path = require("path");

async function sendReport() {
    const rawPath = path.join(__dirname, "..", "test-report-raw.json");
    let raw = null;
    let parseError = null;

    try {
        raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
    } catch (error) {
        parseError = error.message;
    }

    const tests = [];

    if (raw && Array.isArray(raw.testResults)) {
        for (const suite of raw.testResults) {
            for (const test of suite.assertionResults || []) {
                tests.push({
                    name: test.fullName || test.title || "Unnamed test",
                    result: test.status === "passed" ? "PASSED" :
                        test.status === "failed" ? "FAILED" : test.status,
                    failureMessages: test.failureMessages || []
                });
            }
        }
    }

    let repositoryUrl = "";
    try {
        const { execFileSync } = require("child_process");
        repositoryUrl = execFileSync(
            "git",
            ["config", "--get", "remote.origin.url"],
            { encoding: "utf8" }
        ).trim();
    } catch {}

    const repoName = repositoryUrl
        .replace(/\.git$/, "")
        .split(/[\\/]/)
        .pop() || "unknown";

    const branch = (process.env.GIT_BRANCH ||
        process.env.BRANCH_NAME ||
        "unknown").replace(/^origin\//, "");

    const failed = raw ? raw.numFailedTests : tests.filter(
        test => test.result === "FAILED"
    ).length;

    const passed = raw ? raw.numPassedTests : tests.filter(
        test => test.result === "PASSED"
    ).length;

    const total = raw ? raw.numTotalTests : tests.length;

    const report = {
        repository: repoName,
        repositoryUrl,
        branch,
        commitSha: process.env.GIT_COMMIT || "unknown",
        pipelineRunId: process.env.BUILD_TAG ||
            process.env.BUILD_NUMBER || "local",
        buildNumber: process.env.BUILD_NUMBER || "unknown",
        timestamp: new Date().toISOString(),
        tests,
        totalTests: total,
        passedTests: passed,
        failedTests: failed,
        overallStatus: process.env.BUILD_STATUS ||
            (failed > 0 ? "FAILURE" : "SUCCESS"),
        reportError: parseError
    };

    const outputPath = path.join(__dirname, "..", "test-report.json");

    fs.writeFileSync(
        outputPath,
        JSON.stringify(report, null, 2),
        "utf8"
    );

    console.log(`Prepared report: ${outputPath}`);

    const response = await fetch("http://127.0.0.1:4000/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(report)
    });

    if (!response.ok) {
        throw new Error(`Receiver returned HTTP ${response.status}`);
    }

    console.log("Report successfully delivered to local receiver.");
    console.log(await response.text());
}

sendReport().catch(error => {
    console.error("Report delivery failed:", error.message);
    process.exitCode = 1;
});
