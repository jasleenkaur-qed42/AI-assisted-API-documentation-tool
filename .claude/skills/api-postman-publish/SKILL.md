---

name: api-postman-publish
description: Publish validated API documentation and tests into the project-level Postman collection using Postman MCP.
-----------------------------------------------------------------------------------------------------------------------

# API Postman Publish

## Goal

Publish the existing validated Postman API collection into the project's Postman workspace using Postman MCP.

The project name is used as the **parent Postman collection**.

Each API collection is represented as a **folder inside the project collection**.

Example:

```text
Workspace
└── my-express-app
    ├── User API
    │   ├── Get Users
    │   ├── Get User
    │   ├── Create User
    │   ├── Update User
    │   └── Delete User
    │
    └── Product API
        ├── Get Products
        ├── Get Product
        └── Create Product
```

Postman collections cannot be nested inside other collections. Therefore, do not create a collection for each API under the project collection. Use folders for API grouping.

---

# Workflow

## Step 1: Determine the project name

Determine the project name from the repository.

Preferred source:

1. `package.json` `"name"` field
2. Repository/project directory name as fallback

Example:

```json
{
  "name": "my-express-app"
}
```

Use:

```text
my-express-app
```

as the parent Postman collection name.

Do not invent or manually rename the project.

---

## Step 2: Determine the API scope

Determine which API was documented by the preceding API documentation stage.

For example:

```text
User API
```

This becomes the folder name inside the project collection.

The API folder must contain the requests and tests from the existing local Postman collection.

---

## Step 3: Locate the validated local collection

Locate the Postman collection produced by the documentation/testing workflow under:

```text
postman/
```

Example:

```text
postman/User_API.postman_collection.json
```

The local collection is the source artifact for publishing.

Read the collection before modifying anything in Postman.

Do not regenerate the collection.

Do not rerun API analysis unless required to resolve an inconsistency.

---

## Step 4: Validate the local collection

Validate the JSON before publishing.

Example:

```bash
python3 -m json.tool postman/User_API.postman_collection.json > /dev/null
```

If the collection is invalid:

```text
COLLECTION_INVALID
```

Stop.

Do not attempt to repair or publish an invalid collection.

---

# Step 5: Inspect the Postman MCP tool schema

Before publishing, inspect the available Postman MCP tools and their required input structure.

Pay particular attention to:

* `putCollection`
* `updateCollectionRequest`
* collection-level `item`
* folder `item`
* request item `id`
* request item `request`
* request-level local `event`
* request-level MCP `events`
* request-level scripts
* collection variables

Do not assume that a valid Postman Collection v2.1 JSON can be passed directly to the MCP tools.

The local Postman collection and Postman MCP tools may have different input requirements.

### Important distinction

The local Postman Collection v2.1 format uses:

```json
"event": [
  {
    "listen": "test",
    "script": {
      "exec": [...]
    }
  }
]
```

The `updateCollectionRequest` MCP operation uses:

```json
"events": [
  {
    "listen": "test",
    "script": {
      "exec": [...]
    }
  }
]
```

Do not confuse these two shapes.

---

# Step 5A: Preserve existing item IDs

The local Postman collection is the source artifact.

When publishing:

1. Read the existing `id` from each folder/request item.
2. Preserve that ID in the MCP payload.
3. Do not regenerate an existing ID.
4. Do not remove an existing ID.
5. Do not modify the local collection during publishing.
6. If a required ID is missing, stop and report the missing ID.

Example:

```json
{
  "id": "get-users-id",
  "name": "Get Users",
  "request": {
    "method": "GET"
  }
}
```

The published request must retain:

```text
get-users-id
```

### Missing ID

If the MCP schema requires an ID and the corresponding local item has no ID:

```text
PUBLISH_FAILED
```

Report:

```text
Missing required ID:
<item path/name>
```

Do not modify the local JSON to add the ID during publishing.

The missing ID should be fixed in the stage that creates the Postman collection.

---

# Step 5B: Preserve the complete request definition

When publishing the local collection, preserve the complete request definition.

For every request, preserve supported fields including:

```text
id
name
request
├── method
├── header
├── body
├── url
├── description
└── auth

event
├── prerequest
│   └── script
│       └── exec
└── test
    └── script
        └── exec

response / examples
```

Do not reconstruct requests from only their names and URLs.

The local collection is the source of truth.

---

# Step 6: Preserve the complete collection structure

When publishing, preserve:

* folder IDs
* request IDs
* request names
* HTTP methods
* URLs
* path parameters
* query parameters
* headers
* request bodies
* authentication
* descriptions
* pre-request scripts
* test scripts
* examples/responses where supported
* nested folders where supported
* request ordering
* collection variables where applicable

Do not delete unrelated Postman requests or folders.

---

# Step 7: Connect to Postman through MCP

Use the Postman MCP tools available in the current Claude Code session.

Do not use:

* Postman REST API directly
* `curl`
* Postman CLI for publishing
* manually constructed HTTP requests
* another external Postman integration

If Postman MCP is unavailable:

```text
POSTMAN_MCP_UNAVAILABLE
```

Stop.

---

# Step 8: Find or create the project collection

Search the configured Postman workspace for the exact project collection name.

Example:

```text
my-express-app
```

### If it does not exist

Create the project collection.

### If it already exists

Reuse it.

Do not create a duplicate collection.

Preserve unrelated folders and requests already inside the project collection.

---

# Step 9: Find or create the API folder

Inside the project collection, find the exact API folder.

Example:

```text
User API
```

### If it does not exist

Create the folder using the ID from the local collection.

### If it already exists

Reuse it.

Do not create a duplicate API folder.

---

# Step 10: Publish the collection structure

Use `putCollection` for the collection-level structure where supported.

Publish:

* project collection
* API folder
* request items
* request definitions
* IDs
* supported request fields
* variables where applicable

Preserve existing request IDs.

Do not assume that `putCollection` will persist every request-level field.

In particular, **do not rely on `putCollection` alone to persist request-level `event` scripts.**

---

# Step 11: Persist request-level scripts

After the collection/folder/request structure has been created or updated, persist request-level scripts using:

```text
mcp__postman__updateCollectionRequest
```

This operation has PATCH semantics and updates only the values supplied.

Required arguments:

```text
requestId
collectionId
```

For script persistence, pass:

```text
requestId
collectionId
events
```

Do not resend unrelated request fields unless they also need to be changed.

## Request ID

Use the existing Postman request ID from the local collection as:

```text
requestId
```

Do not generate a new ID.

## Collection ID

Use the target project collection ID as:

```text
collectionId
```

## Events mapping

For each local request:

```text
local item.event
```

must be mapped to:

```text
updateCollectionRequest.events
```

Example local collection item:

```json
{
  "id": "get-users-id",
  "name": "Get Users",
  "request": {
    "method": "GET"
  },
  "event": [
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          "pm.test('Status is 200', function () {",
          "  pm.response.to.have.status(200);",
          "});"
        ]
      }
    }
  ]
}
```

The MCP update should use:

```json
{
  "requestId": "get-users-id",
  "collectionId": "<project-collection-id>",
  "events": [
    {
      "listen": "test",
      "script": {
        "type": "text/javascript",
        "exec": [
          "pm.test('Status is 200', function () {",
          "  pm.response.to.have.status(200);",
          "});"
        ]
      }
    }
  ]
}
```

### Important

The local field is:

```text
event
```

The MCP parameter is:

```text
events
```

Do not send:

```text
event
```

as the top-level parameter to `updateCollectionRequest`.

---

# Step 11A: Update every request containing events

For every request in the local collection containing:

```text
item.event
```

perform a request-level update.

If there are 13 requests with test events:

```text
13 × updateCollectionRequest
```

should be performed.

If a request has both:

```text
listen: "prerequest"
```

and:

```text
listen: "test"
```

preserve both events in the `events` array.

Do not remove one event merely because the request also contains another event.

---

# Step 11B: Preserve request fields during script updates

When using `updateCollectionRequest` only to persist scripts, pass only:

```text
requestId
collectionId
events
```

Do not unnecessarily resend:

* method
* URL
* headers
* body
* authentication
* description

This reduces the risk of unintentionally changing an already-published request.

The purpose of this operation is to persist request-level scripts.

---

# Step 12: Update existing requests safely

When the API folder already contains requests, identify matching requests using their existing Postman IDs where available.

For requests that already exist:

* preserve their identity
* update their request definition when required
* update their scripts using `updateCollectionRequest`
* do not create duplicates

For missing requests:

* add them using the IDs from the local collection

Do not delete Postman requests unrelated to the current local collection.

Do not delete unrelated API folders.

---

# Step 13: Handle collection variables

The local API collection may contain variables such as:

```text
baseUrl
userId
userEmail
userId2
userEmail2
```

Because the API collection becomes a folder inside the project collection, collection-level variables may need to be promoted to the project collection.

### Shared variables

Variables such as:

```text
baseUrl
```

may be promoted to the project collection when appropriate.

### Conflicts

If the project collection already contains a variable with the same name but a conflicting value:

```text
VARIABLE_CONFLICT
```

Do not silently overwrite the existing variable.

Report:

* variable name
* existing value/scope if available
* incoming value/scope
* reason for conflict

---

# Step 14: Do not publish unverified content

Publishing assumes:

1. API documentation has completed.
2. API tests have been added.
3. API tests have executed successfully.
4. The local collection is valid.

Do not:

* invent endpoints
* invent request bodies
* invent responses
* change assertions
* weaken tests
* modify application source
* publish credentials or secrets
* publish unverified API behavior

The validated local collection is the source artifact.

---

# Step 15: Verify the published structure

After publishing, use Postman MCP to verify:

```text
Workspace
└── <project collection>
    └── <API folder>
        ├── request
        ├── request
        └── ...
```

Verify:

* project collection exists
* correct API folder exists
* expected requests exist
* HTTP methods are correct
* paths are correct
* request bodies are present where expected
* test scripts are present
* pre-request scripts are present where expected
* relevant variables exist
* no duplicate project collection was created
* no duplicate API folder was created
* request IDs are preserved

---

# Step 15A: Verify payload before collection write

Before calling `putCollection`, compare the local request item with the collection payload.

For every request:

```text
Local request:

id      → present
name    → present
request → present
event   → present/absent
```

The collection payload must preserve all supported request fields that are intended to be published.

If a local request contains `event` and the collection payload intentionally omits it because the MCP operation does not reliably persist it, this is acceptable **only if the request-level script persistence step below will handle it**.

Do not claim that the script has been published yet.

---

# Step 15B: Verify request-level update payload

Before calling `updateCollectionRequest`, verify:

```text
Local item.event
        ↓
MCP events
```

For every event verify:

```text
listen
script.type
script.exec
```

If the local request contains a test event:

```text
local.event contains listen="test"
```

then:

```text
events contains listen="test"
```

with the corresponding script.

If the local request contains a prerequest event, preserve it as well.

If an event is missing from the update payload:

```text
PUBLISH_FAILED
```

Report:

```text
Reason: Request event was omitted from the updateCollectionRequest payload.

Request: <request name>
```

Do not call the MCP update with an incomplete event payload.

---

# Step 15C: Verify actual published request

After request-level updates complete, retrieve the published request/collection using the available Postman MCP read operation.

Do not verify only:

```text
request exists
```

Verify the actual request-level scripts.

For every local request containing events, compare:

```text
LOCAL

request.id
request.name
request.method
request.url
event[].listen
event[].script.type
event[].script.exec

        ↓

PUBLISHED

request.id
request.name
request.method
request.url
events/event[].listen
events/event[].script.type
events/event[].script.exec
```

The published representation may expose the events using the Postman read operation's own response shape. Compare the actual event/script content rather than assuming the property name.

---

# Step 15D: Verify every test event

Count test events in the local collection:

```text
Local test events: <N>
```

Count test events in the published collection:

```text
Published test events: <N>
```

The counts must match.

Also verify the actual script content.

If:

```text
Local test events != Published test events
```

return:

```text
PUBLISH_FAILED
```

Reason:

```text
Published collection is missing request test events.
```

Report:

```text
Local test events: <N>
Published test events: <N>
```

If the counts match but script content differs or is empty:

```text
PUBLISH_FAILED
```

Reason:

```text
Published request test script does not match the validated local collection.
```

Request:

```text
<request name>
```

Do not report `PUBLISHED`.

---

# Step 15E: Verify prerequest events

For every local prerequest event:

1. Verify the corresponding published request exists.
2. Verify the prerequest event exists.
3. Verify its script exists.
4. Verify its `exec` content is preserved.

If a local prerequest event is missing after publishing:

```text
PUBLISH_FAILED
```

Do not silently ignore the missing script.

---

# Step 16: Do not silently repair the Postman collection

If scripts are missing after the initial collection write:

1. Determine whether `updateCollectionRequest` is available.
2. If available, use it to persist the request-level `events`.
3. Verify the result with a Postman MCP read operation.
4. If the update operation fails, capture the exact MCP error.
5. If verification still shows missing scripts, return `PUBLISH_FAILED`.

Do not repeatedly call the same failing `putCollection` operation when the failure is known to be caused by request-level event persistence.

Do not manually add scripts through the Postman UI.

Do not modify the local validated collection.

Do not claim success when scripts are missing.

---

# Step 17: Saved response examples

If the local collection contains saved response examples:

```text
item.response
```

preserve them where the available Postman MCP operations explicitly support them.

Do not claim that saved examples were published merely because the request itself exists.

If the required MCP operation for saved examples is unavailable or does not persist them, report the limitation.

Do not modify the local collection to compensate.

Saved response examples are separate from request-level test/prerequest script persistence.

---

# Step 18: Publish success requirement

Publishing is successful only when ALL required conditions are true:

```text
Project collection exists                 ✓
API folder exists                         ✓
Expected requests exist                  ✓
Request IDs preserved                    ✓
Methods/URLs preserved                   ✓
Request bodies preserved                 ✓
Local test events exist                  ✓
Published test events exist              ✓
Test event count matches                 ✓
Test script content is present           ✓
Prerequest scripts preserved             ✓
No duplicate requests                    ✓
No duplicate folders                    ✓
```

A collection with correct requests but missing test scripts is:

```text
PUBLISH_FAILED
```

not:

```text
PUBLISHED
```

---

# Terminal States

Return exactly one primary status:

```text
PUBLISHED
PROJECT_COLLECTION_CREATED
PROJECT_COLLECTION_UPDATED
POSTMAN_MCP_UNAVAILABLE
COLLECTION_MISSING
COLLECTION_INVALID
VARIABLE_CONFLICT
PUBLISH_FAILED
```

Use `PUBLISH_FAILED` when the Postman state does not contain the validated content that was intended to be published.

---

# Rules

* Use Postman MCP only for Postman publishing.
* Use the configured Postman workspace.
* Do not create duplicate project collections.
* Do not create duplicate API folders.
* Preserve unrelated Postman content.
* Treat the local collection as the source artifact.
* Preserve existing item IDs.
* Do not regenerate existing IDs during publishing.
* Do not modify the local collection during publishing.
* Do not modify application source code.
* Do not install application dependencies.
* Do not add credentials or secrets.
* Do not commit.
* Do not push.
* Do not execute API tests during publishing.
* Do not weaken or remove Postman tests.
* Preserve request-level test scripts.
* Preserve request-level prerequest scripts.
* Use `putCollection` for collection structure where appropriate.
* Use `updateCollectionRequest` for request-level `events`.
* Map local `event` to MCP `events`.
* Pass only the fields necessary to `updateCollectionRequest`.
* Preserve request IDs when calling `updateCollectionRequest`.
* Do not silently ignore MCP validation errors.
* Verify the actual published state after writes.
* Do not report success until scripts have been verified.
* Do not start another workflow stage.
* Return the result to the orchestrator.

---

# Output

Report:

```text
Status: <terminal status>

Workspace:
<workspace name>

Project collection:
<project collection name>

API folder:
<API folder name>

Local collection:
<local collection path>

Project collection action:
<created | reused | updated>

API folder action:
<created | reused | updated>

Requests:
- Added: <number>
- Updated: <number>
- Preserved: <number>

Scripts:
- Requests with local events: <number>
- Requests updated with MCP events: <number>
- Local test events: <number>
- Published test events: <number>
- Local prerequest events: <number>
- Published prerequest events: <number>
- Test scripts preserved: <yes/no>
- Prerequest scripts preserved: <yes/no>

Variables:
- Added: <number>
- Updated: <number>
- Conflicts: <number>

Notes:
- <relevant MCP or publishing information>
```

Do not start another workflow stage yourself. Return the result to the orchestrator.
