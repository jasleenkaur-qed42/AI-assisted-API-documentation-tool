---

name: api-documentation
description: Generate Postman documentation for APIs implemented in the repository.
-----------------------------------------------------------------------------------

# API Documentation

## Goal

Document the API requested by the user in a Postman Collection.

## Workflow

1. Identify the requested API scope.
2. Delegate implementation analysis to `api-analyst`.
3. Generate/update the Postman collection under `postman/`.
4. Use Postman Collection v2.1.
5. Use `{{baseUrl}}` for the API base URL.
6. Include endpoint descriptions, parameters, request bodies, and response examples where supported.
7. Assign a unique `id` to every folder and request item when creating it.
8. Validate the generated JSON.

## Item IDs

Every Postman folder and request item created by this skill must have a unique `id`.

Generate the ID **when the item is created** and write it directly into the Postman collection JSON.

Example folder:

```json
{
  "id": "<unique-folder-id>",
  "name": "User API",
  "item": []
}
```

Example request:

```json
{
  "id": "<unique-request-id>",
  "name": "Get Users",
  "request": {
    "method": "GET",
    "url": "{{baseUrl}}/api/users"
  }
}
```

### ID Rules

* Each folder must have a unique ID.
* Each request must have a unique ID.
* Do not reuse the same ID for different items.
* Prefer a UUID or another valid unique identifier.
* If an existing collection already contains a valid ID for an existing item, preserve that ID.
* When adding a new item to an existing collection, generate an ID for the new item.
* Do not regenerate IDs for existing items during an update.
* IDs must be written into the local Postman collection JSON.
* Do not remove IDs from existing items.

These IDs must remain associated with the same item throughout the API workflow.

`api-testing` must preserve these IDs when adding tests.

`api-postman-publish` must preserve these IDs when publishing to Postman.

## Output Location

Store the Postman collection under:

`postman/`

If the `postman/` directory does not exist:

1. Create the `postman/` directory.
2. Create the Postman collection inside it.

If a relevant Postman collection already exists:

* update the existing collection when appropriate
* do not create a duplicate collection unnecessarily
* preserve existing folder and request IDs
* assign IDs only to newly created folders or requests

## Rules

* Source code is read-only.
* Do not guess API behavior.
* Do not add credentials or real tokens.
* Do not modify application code.
* Do not commit or push.
* Do not remove or regenerate existing Postman item IDs.
* Do not create duplicate requests unnecessarily.
* Do not create duplicate folders unnecessarily.
* Do not start another workflow stage yourself.
* Return the result to the orchestrator.

## Output

Report:

* endpoints documented
* collection path
* whether a new collection was created or an existing collection was updated
* number of new folders created
* number of new requests created
* number of existing IDs preserved
* uncertainties

## Collection Naming

Name the collection file using:

`<resource-name>_API.postman_collection.json`

Examples:

* User API → `postman/User_API.postman_collection.json`
* Product API → `postman/Product_API.postman_collection.json`

Do not start another workflow stage yourself. Return the result to the orchestrator.
