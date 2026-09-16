---

name: api-fix
description: Analyze an API test failure, prepare a minimal fix proposal, and apply it only after human approval.
-----------------------------------------------------------------------------------------------------------------

# API Fix

## Goal

Resolve an API implementation problem discovered by API testing.

The skill is responsible for preparing a safe, minimal application-code fix and applying it only after explicit human approval.

---

## Workflow

1. Read the application-level test failure provided by the orchestrator.
2. Review the relevant implementation.
3. Delegate fix analysis to `api-fix-reviewer`.
4. Prepare a minimal fix proposal.

---

## Before Code Changes

STOP before modifying application source code.

Show the user:

* failing test
* expected behavior
* actual behavior
* root cause
* files to change
* proposed fix
* tests to rerun

Then use `AskUserQuestion`:

```json
{
  "questions": [
    {
      "question": "Tests identified an application-level issue. Should I apply this fix?",
      "multiSelect": false,
      "options": [
        {
          "label": "Yes, apply the fix",
          "description": "Apply the proposed fix to the application source code and rerun the affected tests."
        },
        {
          "label": "No, do not apply the fix",
          "description": "Do not modify the application source code. Reject this fix and stop the workflow."
        },
        {
          "label": "Let me review",
          "description": "Do not modify the application source code. Pause the workflow so I can review the proposed fix and respond later."
        }
      ]
    }
  ]
}
```

Wait for the user's response.

---

## If "Yes, apply the fix"

Treat this as explicit approval to modify application source code.

Proceed to:

1. Apply only the approved fix.
2. Do not refactor unrelated code.
3. Do not weaken or remove tests.
4. Run the affected tests again.
5. Report the result to the orchestrator.

Do not make another application-code change without obtaining explicit approval again.

---

## If "No, do not apply the fix"

Do not modify application source code.

Report:

* the proposed fix was rejected
* the application issue remains unresolved
* the affected tests remain failing, if applicable

Then stop the workflow.

Do not:

* retry the fix
* modify the tests to make them pass
* modify unrelated code
* make another source-code change

Return the result to the orchestrator.

---

## If "Let me review"

Do not modify application source code.

Preserve the current fix proposal and its context:

* failing test
* expected behavior
* actual behavior
* root cause
* files to change
* proposed fix
* tests to rerun

Report:

> The fix has not been applied. The workflow is paused while you review the proposed change.

Stop the current workflow turn.

If the user later returns with an explicit instruction such as:

> Apply the fix.

treat that as approval for the previously proposed fix, provided the proposal is still valid.

Before applying it:

1. Re-check the relevant source code.
2. Re-check the test failure or latest test result.
3. Confirm that the proposed fix is still applicable.
4. Apply only the previously proposed fix.

If the proposal is no longer valid, prepare an updated proposal and ask for approval again.

If the user's response is ambiguous, use `AskUserQuestion` again rather than assuming approval.

---

## After Approval

Once explicit approval has been received:

1. Apply only the approved fix.
2. Do not refactor unrelated code.
3. Do not weaken or remove tests.
4. Run the affected tests again.
5. Capture the actual test results.
6. Return the results to the orchestrator.

---

## If the Approved Fix Still Fails

Do not automatically make another application-code change.

Return the new test failure to the orchestrator.

The orchestrator should route the failure through `api-test-analyzer` again.

If the analyzer determines that another application-code fix is required:

1. The orchestrator invokes `api-fix` again.
2. A new fix proposal is prepared.
3. Explicit human approval is required again.
4. Only then may another source-code change be made.

---

## Rules

* Never modify application source before explicit approval.
* Never interpret "Let me review" as approval.
* Never interpret silence as approval.
* Never interpret an ambiguous response as approval.
* Never hide an application bug by weakening a test.
* Never refactor unrelated code.
* Never make another source-code change after a failed fix without new explicit approval.
* Do not commit or push.
* Do not install dependencies automatically.
* Preserve the proposed fix context when the workflow is paused.
* Return workflow results to the orchestrator.
* Do not decide the next workflow stage.
