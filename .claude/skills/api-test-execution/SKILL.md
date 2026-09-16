---

name: api-test-execution
description: Execute the existing Postman API collection using Postman CLI and capture the actual test results.
---------------------------------------------------------------------------------------------------------------

# API Test Execution

## Goal

Execute the existing Postman collection using Postman CLI and capture the actual test results.

This skill is responsible for **test execution only**.

It does not:

* diagnose application failures
* modify application source code
* modify the Postman collection
* decide the next workflow stage

---

## Workflow

Follow these steps in order.

### Step 1: Ensure Postman CLI is installed

Postman CLI is a required prerequisite for this skill.

First check whether Postman CLI is available:

```bash
command -v postman
postman --version
```

If `postman` is available and the version command succeeds:

* continue to Step 2.

If `postman` is not available:

1. Check whether Homebrew is installed:

```bash
command -v brew
```

2. If Homebrew is available, install Postman CLI:

```bash
brew install postman-cli
```

3. Verify the installation:

```bash
command -v postman
postman --version
```

4. Continue only if the installation and version check succeed.

If Postman CLI cannot be installed:

* do not use Newman
* do not use `node --test`
* do not substitute another test runner
* do not claim that tests passed or failed
* return:

```text
PREREQUISITE_FAILED
Reason: Postman CLI is required but could not be installed.
```

Stop this stage and return the result to the orchestrator.

### Step 2: Locate the Postman collection

Locate the existing Postman collection under:

```text
postman/
```

The collection should have been created or updated by the API documentation/testing stages.

Use the existing collection.

Do not:

* create a new collection
* recreate the collection
* replace the collection
* generate a separate test collection

If the expected collection does not exist:

```text
COLLECTION_MISSING
```

Report the missing collection and stop this stage.

### Step 3: Validate the collection

Verify that the collection is valid JSON.

For example:

```bash
python3 -m json.tool <collection-path> > /dev/null
```

If validation fails:

```text
COLLECTION_INVALID
```

Report the validation error and stop this stage.

Do not modify the collection.

### Step 4: Check the API environment

Determine whether the API is already running.

Inspect the repository for the existing development/start command when necessary.

If the API is not running:

1. Identify the existing command used to start the application.
2. Start the API using the existing project configuration.
3. Do not modify application source code.
4. Do not install application dependencies automatically.

If the API cannot be started, return:

```text
ENVIRONMENT_FAILED
```

Include the startup error and stop this stage.

### Step 5: Execute the collection

Execute the existing collection using Postman CLI.

Use the collection's configured `{{baseUrl}}` or the appropriate existing environment configuration.

Do not modify the collection simply to make execution work.

The execution must use Postman CLI.

Do not substitute:

```text
node --test
```

or another test runner.

### Step 6: Capture the results

Capture the actual Postman CLI execution results.

Report, where available:

* execution status
* collection path
* runner used
* total requests
* passed tests
* failed tests
* skipped tests
* failing request/endpoint
* failing assertion
* expected value
* actual value
* HTTP status code
* relevant response information
* environment/runner errors

Do not infer results that were not produced by the execution.

### Step 7: Return the result

Return the execution result to the orchestrator.

#### If all tests pass

Return:

```text
TESTS_PASSED
```

Include the execution summary.

Do not perform additional analysis.

#### If one or more tests fail

Return:

```text
TESTS_FAILED
```

Include the actual failures and execution evidence.

Do not determine the root cause.

The orchestrator is responsible for sending the failure information to `api-test-analyzer`.

---

## Rules

### Postman CLI

* Postman CLI is mandatory.
* Check/install Postman CLI before doing anything else.
* Do not use Newman.
* Do not use `node --test`.
* Do not substitute another test runner.
* Do not claim execution occurred if Postman CLI did not execute the collection.

### Collection

* Use the existing Postman collection.
* Do not create a replacement collection.
* Do not recreate the collection.
* Do not modify the collection during execution.
* Do not weaken or remove tests to make them pass.

### Application source

* Do not modify application source code.
* Do not modify routes.
* Do not modify controllers.
* Do not modify services.
* Do not modify validation.
* Do not modify database code.
* Do not modify configuration merely to make tests pass.

### Dependencies

* Do not install application dependencies automatically.
* Installing the required Postman CLI prerequisite is allowed when it is missing and Homebrew is available.

### Diagnosis

* Do not diagnose failures.
* Do not decide whether a failure is an application bug.
* Do not propose a source-code fix.
* Return actual execution evidence to the orchestrator.

### Workflow control

* Do not start another workflow stage yourself.
* Do not invoke the fix workflow directly.
* Do not request human approval.
* Return the result to `api-orchestrator`.

### Git

* Do not commit.
* Do not push.
* Do not create a pull request.

---

## Output Format

Return a concise execution report:

```text
Status: TESTS_PASSED | TESTS_FAILED | PREREQUISITE_FAILED | COLLECTION_MISSING | COLLECTION_INVALID | ENVIRONMENT_FAILED

Collection: <path>

Runner: Postman CLI

Requests:
- Total: <number>
- Passed: <number>
- Failed: <number>
- Skipped: <number>

Failures:
- Endpoint: <method> <path>
- Assertion: <assertion>
- Expected: <value>
- Actual: <value>

Environment:
- API: <running/not running/error>
- Postman CLI: <version>

Notes:
- <relevant execution information>
```

Only include failure details when failures actually occurred.

Return the report to `api-orchestrator`.
