import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as mjs from "@metaplex-foundation/js";
import * as web3 from "@solana/web3.js";
import * as anchor from '@project-serum/anchor';

export function loadWalletKey(keypairFile: string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
        new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
}

async function main() {
    console.log("let's name some tokens!");
    const myKeypair = loadWalletKey(process.env.HOME + "/.config/solana/devnet.json");
    // paste token public key here
    const mint = new web3.PublicKey("7hRTa1qKGkoozg1Ta6M5wEDcEENZeidkKV2RhWbF7zwj");
    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());
    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);
    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: myKeypair.publicKey,
        payer: myKeypair.publicKey,
        updateAuthority: myKeypair.publicKey,
    }
    // update this to your personal preference
    const dataV2 = {
        name: "Solana Philippine Peso",
        symbol: "SPHP",
        uri: "https://arweave.net/GBLwHWXO_ltT6f_7kxJGtOr4S1NYpE-xKpTVegDOLzw", // json file
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    }

    // get token metadata
    const connection = new web3.Connection("https://api.devnet.solana.com");
    const metadataPda = await mjs.findMetadataPda(mint);
    const metadataAccount = await connection.getAccountInfo(metadataPda);

    let ix;
    if (!metadataAccount) {
        const args = {
            createMetadataAccountArgsV2: {
                data: dataV2,
                isMutable: true
            }
        };
        ix = mpl.createCreateMetadataAccountV2Instruction(accounts, args);
    } else {
        const args = {
            updateMetadataAccountArgsV2: {
                data: dataV2,
                isMutable: true,
                updateAuthority: myKeypair.publicKey,
                primarySaleHappened: true
            }
        };
        ix = mpl.createUpdateMetadataAccountV2Instruction(accounts, args)
    }
    const tx = new web3.Transaction();
    tx.add(ix);
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [myKeypair]);
    console.log('metadata tx', txid);

}

main();