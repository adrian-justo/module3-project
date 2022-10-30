import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from '@solana/spl-token';
import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { readFileSync } from 'fs';

(async () => {
    // Step 1: Connect to cluster and initialize sender and receiver
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    // get Keypair from path
    const dev = JSON.parse(
        readFileSync(process.env.HOME + "/.config/solana/devnet.json", "utf8")
    );
    const fromWallet = Keypair.fromSecretKey(Uint8Array.from(dev));

    // get wallet public key argument and check if arg provided is valid
    let toWallet;
    try {
        toWallet = new PublicKey(process.argv[2]);
    } catch (error) {
        console.log('Please specify a valid wallet address to be transferred of SPL token');
        return;
    }

    // Step 2: Airdrop SOL into your from wallet
    const fromAirdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
    // Wait for airdrop confirmation
    await connection.confirmTransaction(fromAirdropSignature, { commitment: "confirmed" });

    // Step 3: Create new token mint and get the token account of the fromWallet address
    //If the token account does not exist, create it
    const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);
    console.log(`splToken: ${mint}`);

    const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromWallet,
        mint,
        fromWallet.publicKey
    )
    console.log(`splTokenAccount: ${fromTokenAccount.address}`);

    //Step 4: Mint a new token to the from account
    let signature = await mintTo(
        connection,
        fromWallet,
        mint,
        fromTokenAccount.address,
        fromWallet.publicKey,
        10 * LAMPORTS_PER_SOL,
        []
    );
    console.log('mint tx:', signature);

    //Step 5: Get the token account of the to-wallet address and if it does not exist, create it
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, toWallet);

    //Step 6: Transfer the new token to the to-wallet's token account that was just created
    // Transfer the new token to the "toTokenAccount" we just created
    signature = await transfer(
        connection,
        fromWallet,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromWallet.publicKey,
        10 * LAMPORTS_PER_SOL,
        []
    );
    console.log('transfer tx:', signature);
})();