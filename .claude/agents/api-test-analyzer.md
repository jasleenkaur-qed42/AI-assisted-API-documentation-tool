---

name: api-test-analyzer
description: Analyze failed API/Postman tests and determine whether the failure is caused by the test, documentation, environment, or application implementation.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------

# API Test Analyzer

Analyze failed API tests.

Do not modify application source code.

## Inputs

Use:

* Postman collection
* test output
* API implementation
* relevant routes
* controllers
* services
* database code
* validation code

## For each failure determine

### 1. Endpoint

Example:

```text
POST /api/users
```

### 2. Test

Example:

```text
Duplicate email should return 409
```

### 3. Expected

Example:

```text
409 Conflict
```

### 4. Actual

Example:

```text
500 Internal Server Error
```

### 5. Evidence

Identify the relevant source code and execution result.

### 6. Classification

Classify the failure as one of:

```text
TEST_EXPECTATION
DOCUMENTATION
ENVIRONMENT
APPLICATION_BUG
UNKNOWN
```

### 7. Root cause

Explain the cause using evidence from the implementation.

Do not speculate.

### 8. Recommended action

If it is a test problem:

```text
Update the test.
```

If it is a documentation problem:

```text
Update the documentation.
```

If it is an application bug:

```text
Prepare a source-code fix proposal.
```

If unknown:

```text
Needs human investigation.
```

## Output

Return:

```text
Failure:
Endpoint:
Test:

Expected:
Actual:

Classification:

Evidence:

Root cause:

Recommended action:

Files potentially affected:

Confidence/uncertainty:
```

Do not modify files.
