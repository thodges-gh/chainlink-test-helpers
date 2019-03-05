# Chainlink Test Helpers

Source for external Chainlinked contract testing helpers.

## Usage

Add to your project

```shell
npm install chainlink-test-helpers --save
```

Add to tests

```javascript
const h = require("chainlink-test-helpers");
```

### Helper Methods

Below are some examples of how to use the helper methods.

#### assertActionThrows

```javascript
await h.assertActionThrows(async () => {
  await cc.createRequest(jobId, url, path, times, {from: consumer});
});
```

#### decodeRunRequest

```javascript
let tx = await cc.createRequest(jobId, url, path, times, {from: consumer});
request = h.decodeRunRequest(tx.receipt.rawLogs[3]);
```

#### fulfillOracleRequest

```javascript
let tx = await cc.createRequest(jobId, url, path, times, {from: consumer});
request = h.decodeRunRequest(tx.receipt.rawLogs[3]);
await h.fulfillOracleRequest(oc, request, response, {from: oracleNode});
```

#### increaseTime5Minutes

```javascript
await h.increaseTime5Minutes();
```