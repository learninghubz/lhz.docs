---
sidebar_position: 1
title: Export API
description: REST API for exporting resources and user activity data
keywords: [API, export, REST, integration, middleware, LMS]
---

# Learninghubz Export API

The Learninghubz Export API is designed to allow system integrators to easily develop middleware for integrating resources and user interactions into their own LMS, following customer-defined business rules.

This update ensures that existing middleware can be modified with minimal development effort, maintaining the core consumption logic, which continues to revolve around timestamps.

Several attributes have been renamed—for instance, `videoid` has been changed to `resourceid`—to reflect that the platform now supports multiple resource formats, not just videos.

A new attribute, `format`, has also been introduced for every resource. Each resource now has a format field indicating its type:
- **Video**: Content to be watched`
- **Course**: Content presented with multiple lessons or sections, including videos and texts
- **Article**: Content to be read
- **Podcast**: Audio content to be listened to

> **IMPORTANT:** To maintain compatibility with current business logic, we recommend that existing middleware only integrate resources and learning evens with the formats "Video", "Course", "Article", and "Podcast". However, other formats—such as Playlists and Covers—can be incorporated to expand integration coverage if desired by the customer.

## Table of Contents

1. [Integration Using Timestamps: The Rolling Window Approach](#integration-using-timestamps-the-rolling-window-approach)
   - [How It Works](#how-it-works)
   - [Example Integration Pattern](#example-integration-pattern)
   - [Visual Representation](#visual-representation)
   - [Rolling Window Benefits](#rolling-window-benefits)
   - [Implementation Considerations](#implementation-considerations)
   - [Handling Failed Synchronizations](#handling-failed-synchronizations)
   - [Best Practices](#best-practices)
2. [Getting API Access Token](#getting-api-access-token)
   - [Authentication and API Call Flow](#authentication-and-api-call-flow)
   - [Prerequisites](#prerequisites)
   - [Documentation Conventions](#documentation-conventions)
3. [Obtaining an Access Token](#obtaining-an-access-token)
   - [Example Credentials](#example-credentials)
   - [Request Structure](#request-structure)
   - [cURL Example](#curl-example)
   - [Response](#response)
4. [Obtaining Learning Resources](#obtaining-learning-resources)
   - [Request Structure](#request-structure-1)
   - [Parameters](#parameters)
   - [cURL Example](#curl-example-1)
   - [Response](#response-1)
   - [Response Fields](#response-fields)
5. [Obtaining User Activity Events](#obtaining-user-activity-events)
   - [Request Structure](#request-structure-2)
   - [Parameters](#parameters-1)
   - [cURL Example](#curl-example-2)
   - [Response](#response-2)
   - [Response Fields](#response-fields-1)

## Integration Using Timestamps: The Rolling Window Approach

The Learninghubz Export API is built around a timestamp-based synchronization model that enables efficient incremental data retrieval. This approach is commonly known as the **rolling window** pattern, where your integration continuously moves forward in time, fetching only new or changed data since the last synchronization.

### How It Works

The API uses Unix epoch timestamps as the foundation for all data queries. Each endpoint accepts a `ts` (timestamp) parameter that acts as a "point in time" marker. When you make a request, the API returns only the records that were created or modified after the specified timestamp.

**Important:** All records are returned ordered by timestamp in ascending order (oldest to newest). This means the last record in the response will always have the highest timestamp, making it easy to determine the starting point for your next sync.

**Basic Flow:**

1. **Initial Sync**: On the first run, set `ts=0` to retrieve all historical data from the platform
2. **Record the Latest Timestamp**: Take the `ts` or `_ts` value from the last record in the response
3. **Subsequent Syncs**: On the next sync, use this timestamp as the new `ts` parameter
4. **Repeat**: Continue this process to maintain an up-to-date copy of the data

### Example Integration Pattern

```
First Request:  GET /GetResources?ts=0
                → Returns 1000 records, latest ts=1727267733

Second Request: GET /GetResources?ts=1727267733
                → Returns 50 new records, latest ts=1727890123

Third Request:  GET /GetResources?ts=1727890123
                → Returns 25 new records, latest ts=1728012456
```

### Visual Representation

The following sequence diagram illustrates the rolling window synchronization pattern with failure handling:

```mermaid
sequenceDiagram
    participant API as Export API
    participant MW as Middleware
    participant LMS as LMS

    Note over API,LMS: Rolling Window Sync

    MW->>MW: Load last timestamp (ts)
    MW->>API: GET /GetResources?ts={timestamp}
    API-->>MW: Resources ordered by ts (oldest to newest)
    
    alt Processing Success
        loop For each resource
            MW->>LMS: UPSERT resource (idempotent)
        end
        MW->>MW: Save last record timestamp
        Note over MW: Ready for next sync
    else Processing Failed
        Note over MW: Keep old timestamp unchanged
        Note over MW: Retry later with same timestamp
    end
```

### Rolling Window Benefits

- **Efficiency**: Only transfer data that has changed since the last sync
- **Scalability**: Minimize bandwidth and processing requirements
- **Reliability**: Resume synchronization from the last known point in case of interruption
- **Simplicity**: No complex change tracking or delta calculation required

### Implementation Considerations

**Timestamp Storage**: Persist the last successful synchronization timestamp in your middleware. This could be stored in:
- A configuration file
- A database table
- Environment variables
- A dedicated state management system

**Sync Frequency**: Determine an appropriate polling interval based on your business requirements:
- Real-time needs: Poll every few minutes
- Regular updates: Poll hourly or daily
- Batch processing: Poll on a scheduled basis (e.g., nightly)

**Handling Large Datasets**: For initial synchronization with `ts=0`, consider:
- Processing results in batches
- Implementing progress tracking
- Adding error handling and retry logic
- Running the initial sync during off-peak hours

**Data Consistency**: The rolling window approach ensures eventual consistency. New records created between polling intervals will be captured in the next sync cycle.

### Handling Failed Synchronizations

Properly handling synchronization failures is critical to maintaining data integrity and avoiding data loss or duplication. Here are recommended strategies for different failure scenarios:

**API Request Failures**

If the API request fails before receiving any data (network errors, timeouts, authentication issues):
- **Do not update your stored timestamp**
- Retry the request with the same timestamp from your last successful sync
- Implement exponential backoff for retries to avoid overwhelming the API
- Log the failure for monitoring and alerting

**Partial Processing Failures**

If you receive data successfully but fail while processing some records:

**Recommended Approach: Idempotent Processing (Simplest and most robust)**
- Design your processing operations to be idempotent (e.g., using UPSERT, INSERT OR REPLACE, or checking if records already exist)
- Process records without transactions or rollbacks
- **Do not update your stored timestamp** if processing fails
- On retry with the same timestamp, previously processed records will simply be reprocessed safely
- This is the simplest approach and handles both partial failures and network interruptions gracefully

**Alternative: Transaction-based Processing (For non-idempotent operations)**
- Only use this if you cannot make your operations idempotent
- Process all records within a database transaction
- Only update the stored timestamp if all records are successfully processed
- If any record fails, roll back the transaction and retry the entire batch with the same timestamp
- Note: This requires more complex error handling and may not be feasible for very large batches

**Example Implementation Pattern (Idempotent):**

```
1. Retrieve current stored timestamp: ts = 1727267733
2. Fetch data: GET /GetResources?ts=1727267733
3. Process each record with idempotent operations:
   - Use UPSERT based on resourceId (or eventTime + username for events)
   - Records already processed will simply update to same values
4. If ALL records processed successfully:
     * Update stored timestamp to last record's ts
5. If ANY record fails:
     * Keep original timestamp (1727267733)
     * Log error and retry later
     * On retry, already-processed records are safely reprocessed
```

**Recommended Practices:**

- **Idempotent processing (highest priority)**: Design your record processing to be idempotent using UPSERT operations or existence checks. This eliminates the need for complex rollback logic and makes retries safe and simple.
- **Atomic timestamp updates**: Only update your stored timestamp after successful processing of all fetched records
- **Error logging**: Maintain detailed logs of sync attempts, including timestamps and failure reasons
- **Alert on repeated failures**: Set up monitoring to alert when syncs fail multiple consecutive times
- **Manual recovery procedures**: Document steps to manually recover from extended failures or data inconsistencies

**Avoiding Common Pitfalls:**

- **Don't update the timestamp before processing all records** - This can lead to data loss if processing fails
- **Don't skip failed records and continue** - Unless you have explicit business logic to handle gaps
- **Don't use the current time as the next timestamp** - Always use the timestamp from the actual data you processed
- **Do design for idempotency** - Use UPSERT operations so retries are safe and simple
- **Do implement retry logic with backoff** - Temporary failures are normal and should be handled gracefully
- **Do maintain audit logs** - Track what was synced and when for troubleshooting

### Best Practices

1. **Always store the timestamp** from your last successful sync
2. **Use the timestamp from the last record** in the response as your next starting point (records are ordered oldest to newest)
3. **Handle deleted items**: Check the `deleted` flag on resources to update your local records
4. **Implement idempotency**: Be prepared to handle duplicate records in case of retry scenarios
5. **Monitor sync lag**: Track the difference between current time and your last sync timestamp to ensure timely updates

## Getting API Access Token

The LHZ Export API is a read-only API with endpoints accessible over the Internet via standard HTTPS, secured with 256-bit (or stronger) certificates. Access is provided through an _access token_.

To access the API, the client first requests an access token. With the token obtained, the client can then use it to access other API endpoints. The response from an API endpoint is in JSON format.

### Authentication and API Call Flow

The following diagram illustrates the complete flow of authenticating and accessing the API:

```mermaid
sequenceDiagram
    participant Client
    participant OAuth as OAuth Server
    participant API as Export API
    
    Client->>OAuth: POST /oauth/token<br/>username, password
    OAuth-->>Client: access_token
    
    Client->>API: GET /GetResources?ts=1727267733<br/>Authorization: Bearer {token}
    API-->>Client: [{resourceId, title, ...}]
    
    Client->>API: GET /GetUserActivityEvents?ts=1727267733<br/>Authorization: Bearer {token}
    API-->>Client: [{eventTime, username, ...}]
```

**Key Points:**
- Get an access token first, then use it for all API calls
- Include the token in the `Authorization: Bearer {token}` header
- Use the `ts` parameter for incremental sync (rolling window)

### Prerequisites

To access the API for development purposes, developers must be familiar with:
- HTTP protocol fundamentals
- URL structure and encoding
- Request/response patterns
- The development tools and frameworks they plan to use

### Documentation Conventions

For the purpose of this documentation:
- A fictitious hub named **RandomCorp** is used as an example
- A user named **ReportIntegration** serves as the example account
- cURL is used to provide request examples

Developers should be able to translate these examples to their framework of choice (C#/.NET, JavaScript, Java, or others).

## Obtaining an Access Token

To obtain an access token, the client needs the following credentials provided by Learninghubz:

- **username**: The login name of the client accessing the API
- **password**: The password for authentication and authorization purposes

These credentials should be requested from Learninghubz prior to accessing the API.

### Example Credentials

- **Username:** `randomcorpreportintegration@randomcorp.pt`
- **Password:** `randompwd`

### Request Structure

With these credentials, make an HTTPS request with the following structure:

- **HTTP Method**: `POST`
- **Endpoint**: `https://api.learninghubz.com/oauth/token`
- **Headers**:
  - `Accept`: `application/json`
  - `Cache-Control`: `no-cache`
  - `Content-Type`: `application/x-www-form-urlencoded`
- **Data**: `username=randomcorp\reportintegration@randomcorp.pt&password=randompwd&grant_type=password`

### cURL Example

```bash
curl -X POST \
  https://api.learninghubz.com/oauth/token \
  -H 'Accept: application/json' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=randomcorp%5Creportintegration%40randomcorp.pt&password=randompwd!!001&grant_type=password'
```

### Response

Upon calling the endpoint, it returns the access token and other information in JSON format:

```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJuYW1laWQiOiJlMDFmZmNlMS0xYmFkLTQ1NmYtOGIyZi1kYTI5NDBkZGVhMzIiLCJ1bmlxdWVfbmFtZSI6ImRlbW9odWJlblxcZGV2ZWxvcGVyQGxlYXJuaW5naHViei5jb20iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL2FjY2Vzc2NvbnRyb2xzZXJ2aWNlLzIwMTAvMDcvY2xhaW1zL2lkZW50aXR5cHJvdmlkZXIiOiJBU1AuTkVUIElkZW50aXR5IiwiQXNwTmV0LklkZW50aXR5LlNlY3VyaXR5U3RhbXAiOiI4YWRjZWU2Ny00N2Q3LTQxZDYtOTYxNy1hZGVmODhlNjM2YTkiLCJyb2xlIjoiaHVicm9vdCIsInByb3ZpZGVySWQiOiI0ZmQ3MjNhZi0xNjc0LTRlNTQtYjQxMS1kYzI0ZWRjOTlkYmYiLCJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjU5ODIyIiwiYXVkIjoiNDE0ZTE5MjdhMzg4NGY2OGFiYzc5ZjcyODM4MzdmZDEiLCJleHAiOjE1MjM0MzcyNzQsIm5iZiI6MTUyMjE0MTI3NH0.l5l-vcsU_VRp1ZeucN4wDLaNMO6UckDuzTcmIDb7nuE",
  "providerId": "4fd723af-1674-4e54-b411-dc24edc99dbf"
}
```

> **NOTE:** The `access_token` is required to call all other endpoints as per the API description. Additional data may be returned that is necessary for calling certain endpoints.

## Obtaining Learning Resources

The HTTPS request to obtain learning resources in the library must have the following structure:

### Request Structure

- **HTTP Method**: `GET`
- **Endpoint**: `https://export-api.learninghubz.com/GetResources?ts={timestamp}`
- **Headers**:
  - `Accept`: `application/json`
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {access_token}`

### Parameters

- **ts** (timestamp): The initial date in Unix epoch format. The endpoint returns all resources that have been created or updated after the supplied date. If the value is `0`, it will return all resources.

> **NOTE:** The `ts` parameter must be in Epoch/POSIX time format. For more information, see: [https://en.wikipedia.org/wiki/Unix_time](https://en.wikipedia.org/wiki/Unix_time)

### cURL Example

```bash
curl --location --request GET 'https://export-api.learninghubz.com/GetResources?ts=0' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
```

### Response

Upon calling the endpoint, it returns all resources in a JSON array ordered by `ts` in ascending order. Only resources created or updated since the provided timestamp are included:

```json
[
  {
    "ts": 1727267733,
    "resourceId": "ceeef920-6241-429f-b34f-b9c6af165d54",
    "format": "Video",
    "type": "video",
    "title": "O Melhor Investimento Que Podemos Fazer",
    "description": "...",
    "theme": "Conteúdos em Português",
    "subject": "Desenvolvimento Pessoal",
    "thumbnailLocation": "http://img.youtube.com/vi/djDTuj8C8iU/maxresdefault.jpg",
    "length": "00:03:02",
    "publicationDate": "2016-08-25T14:43:10.3038375+00:00",
    "deleted": true
  }
]
```

### Response Fields

- **ts**: The timestamp when the resource was recorded, created, or updated (Unix epoch format)
- **resourceId**: The unique identifier of the resource in the platform
- **format**: The resource format type: `"Course"` | `"Video"` | `"Podcast"` | `"Playlist"` | `"Cover"` | `"Article"`
- **type**: The specific type within the defined format. For example, a resource can have format `"Video"` with type `"course"`, or format `"Course"` with type `"course2.0"`. The format is the primary element for importing purposes, while type provides additional context.
- **title**: The title of the resource
- **theme**: The theme category of the resource (e.g., "Leadership") _(optional)_
- **subject**: The subject category of the resource _(optional)_
- **thumbnailLocation**: A URL referencing the hero image of the resource
- **length**: The estimated time required to complete the learning activity. Format: `HH:MM:SS` or seconds. For videos, this is the duration; for courses, the estimated completion time; for podcasts, the audio duration; for articles, the estimated reading time. _(optional)_
- **publicationDate**: The date when the resource was published (ISO 8601 format) _(optional)_
- **deleted**: A boolean flag indicating whether the resource has been deleted (`true`) or is still available (`false`) in the platform

> **NOTE:** Not all resource formats include all fields. For instance, a Cover may not have `length`, `theme`, or `subject`. Optional fields are marked as _(optional)_.

## Obtaining User Activity Events

While learning with resources on the LHZ platform, users watch videos, take courses, listen to podcasts, read articles, and perform many other learning activities.

These activities are composed of multiple learning moments. A learning moment is fundamentally described as the time and date when a user engaged with a resource to learn something, along with the duration of that engagement. We call these moments **User Activity Events**.

These events are exported using the following endpoint.

### Request Structure

- **HTTP Method**: `GET`
- **Endpoint**: `https://export-api.learninghubz.com/GetUserActivityEvents?ts={timestamp}`
- **Headers**:
  - `Accept`: `application/json`
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer {access_token}`

### Parameters

- **ts** (timestamp): The initial date in Unix epoch format. The endpoint returns all user activity events that occurred after the supplied date. If the value is `0`, it will return all events.

> **NOTE:** The `ts` parameter must be in Epoch/POSIX time format. For more information, see: [https://en.wikipedia.org/wiki/Unix_time](https://en.wikipedia.org/wiki/Unix_time)

### cURL Example

```bash
curl --location --request GET 'https://export-api.learninghubz.com/GetUserActivityEvents?ts=1704070800' \
  --header 'Content-Type: application/json' \
  --header 'Accept: application/json' \
  --header 'Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
```

### Response

Upon calling the endpoint, it returns all user activity events that occurred after the provided timestamp in a JSON array, ordered by timestamp in ascending order:

```json
[
  {
    "eventTime": "2024-01-02T00:54:34.503109+00:00",
    "username": "root@learninghubz.com",
    "resourceId": "d2dfe2d2-68c1-4b27-9646-ce9fc3d26958",
    "format": "Video",
    "length": 585,
    "duration": 6,
    "title": "12 Hábitos para 2024",
    "theme": "Bons Hábitos",
    "subject": "Hábitos de Produtividade",
    "type": "video",
    "_ts": 1727440811
  }
]
```

### Response Fields

- **eventTime**: The timestamp when the event occurred in the browser (ISO 8601 format)
- **username**: The username of the user who performed the activity
- **resourceId**: The unique identifier of the resource
- **format**: The resource format type: `"Course"` | `"Video"` | `"Podcast"` | `"Playlist"` | `"Cover"` | `"Article"`
- **length**: The total estimated time in seconds for the learning activity. For videos, this is the video duration; for courses, the estimated completion time; for podcasts, the audio duration; for articles, the estimated reading time. _(optional)_
- **duration**: The duration of this specific event in seconds. For example, if the user watched a video for one minute, the value will be `60`.
- **title**: The title of the resource
- **theme**: The theme category of the resource _(optional)_
- **subject**: The subject category of the resource _(optional)_
- **type**: The specific type within the defined format. For example, a resource can have format `"Video"` with type `"course"`, or format `"Course"` with type `"course2.0"`. The format is the primary element for importing purposes, while type provides additional context.
- **_ts**: The timestamp when the event was recorded in the system (Unix epoch format)

> **NOTE:** Not all event resource formats include all fields. For instance, a Cover may not have `length`, `theme`, or `subject`. Optional fields are marked as _(optional)_.
