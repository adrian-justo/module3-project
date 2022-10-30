# Module3-add-token-metadata-ts
### What to modify
1. Created token address.
```
const mint = new web3.PublicKey("TOKEN_ADDRESS");
```
2. Name, Symbol, URI for metadata JSON file.
```
const dataV2 = {
    name: "TOKEN_NAME",
    symbol: "TOKEN_SYMBOL",
    uri: "METADATA_URI",
    ...
}
```

### How to run
1. Run `npm install` at the root directory.
2. Run main.js using node: `ts-node main.js`