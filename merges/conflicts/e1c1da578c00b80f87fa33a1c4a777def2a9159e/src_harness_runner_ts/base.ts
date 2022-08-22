//
// Copyright (c) Microsoft Corporation.  All rights reserved.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

/// <reference path='test262Runner.ts' />
/// <reference path='compilerRunner.ts' />
/// <reference path='fourslashRunner.ts' />
/// <reference path='projectsRunner.ts' />
/// <reference path='rwcRunner.ts' />

function runTests(runners: RunnerBase[]) {
    for (var i = iterations; i > 0; i--) {
        for (var j = 0; j < runners.length; j++) {
            runners[j].initializeTests();
        }
    }
}

var runners: RunnerBase[] = [];
var iterations: number = 1;

// users can define tests to run in mytest.config that will override cmd line args, otherwise use cmd line args (test.config), otherwise no options
var mytestconfig = 'mytest.config';
var testconfig = 'test.config';
var testConfigFile =
    Harness.IO.fileExists(mytestconfig) ? Harness.IO.readFile(mytestconfig) :
    (Harness.IO.fileExists(testconfig) ? Harness.IO.readFile(testconfig) : '');

if (testConfigFile !== '') {
    // TODO: not sure why this is crashing mocha
    //var testConfig = JSON.parse(testConfigRaw);
    var testConfig = testConfigFile.match(/test:\s\['(.*)'\]/);
    var options = testConfig ? [testConfig[1]] : [];
    for (var i = 0; i < options.length; i++) {
        switch (options[i]) {
            case 'compiler':
                runners.push(new CompilerBaselineRunner(CompilerTestType.Conformance));
                runners.push(new CompilerBaselineRunner(CompilerTestType.Regressions));
                runners.push(new ProjectRunner());  
                break;
            case 'conformance':
                runners.push(new CompilerBaselineRunner(CompilerTestType.Conformance));
                break;
            case 'project':
                runners.push(new ProjectRunner());
                break;
            case 'fourslash':
                runners.push(new FourSlashRunner(FourSlashTestType.Native));
                break;
            case 'fourslash-shims':
                runners.push(new FourSlashRunner(FourSlashTestType.Shims));
                break;
            case 'fourslash-server':
                runners.push(new FourSlashRunner(FourSlashTestType.Server));
                break;
            case 'fourslash-generated':
                runners.push(new GeneratedFourslashRunner(FourSlashTestType.Native));
                break;
            case 'rwc':
                runners.push(new RWCRunner());
                break;
            case 'test262':
                runners.push(new Test262BaselineRunner());
                break;
        }
    }
}

if (runners.length === 0) {
    // compiler
    runners.push(new CompilerBaselineRunner(CompilerTestType.Conformance));
    runners.push(new CompilerBaselineRunner(CompilerTestType.Regressions));

    // TODO: project tests don't work in the browser yet
    if (Utils.getExecutionEnvironment() !== Utils.ExecutionEnvironment.Browser) {
        runners.push(new ProjectRunner());
    }

    // language services
    runners.push(new FourSlashRunner(FourSlashTestType.Native));
    runners.push(new FourSlashRunner(FourSlashTestType.Shims));
    runners.push(new FourSlashRunner(FourSlashTestType.Server));
    //runners.push(new GeneratedFourslashRunner());
}

ts.sys.newLine = '\r\n';

runTests(runners);
