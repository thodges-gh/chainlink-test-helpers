# Chainlink Test Helpers

Source for external Chainlinked contract testing helpers.

Click [here](https://docs.chain.link/docs/getting-started) to get started writing Chainlinked contracts.

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

#### linkContract

```javascript
let link = await h.linkContract(defaultAccount)
await link.transfer(rc.address, totalPayment)
```
