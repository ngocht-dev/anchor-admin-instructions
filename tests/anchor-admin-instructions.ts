import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorAdminInstructions } from "../target/types/anchor_admin_instructions";
import { execSync } from "child_process";
import path from "path";
import {
  mintTo,
  createMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccount,
  getAccount,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  createAccount,
} from "@solana/spl-token";
import fs from "fs";
import { PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

const deploy = () => {
  const workingDirectory = process.cwd();
  const programKeypairPath = path.join(
    workingDirectory,
    "target",
    "deploy",
    "config-keypair.json"
  );
  const programBinaryPath = path.join(
    workingDirectory,
    "target",
    "deploy",
    "config.so"
  );

  const deploy_command = `solana program deploy --url localhost -v --program-id "${programKeypairPath}" "${programBinaryPath}"`;

  try {
    execSync(deploy_command, { stdio: "inherit" });
    console.log("Program deployed successfully");
  } catch (error) {
    console.error("Error deploying program:", error.message);
    throw error;
  }
};

const keyPairFromFile = (filePath) => {
  const rawdata: any = fs.readFileSync(filePath);
  return anchor.web3.Keypair.fromSecretKey(new Uint8Array(JSON.parse(rawdata)));
};

describe("anchor-admin-instructions", () => {
  const provider = anchor.AnchorProvider.env();
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .AnchorAdminInstructions as Program<AnchorAdminInstructions>;

  const [programDataAddress] = anchor.web3.PublicKey.findProgramAddressSync(
    [program.programId.toBytes()],
    new anchor.web3.PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
  );

  const payer = keyPairFromFile("/Users/admin/.config/solana/payer.json");
  const mint = new PublicKey("WaoKNLQVDyBx388CfjaVeyNbs3MT2mPgAhoCfXyUvg8");

  it("initializes program config account", async () => {
    try {
      const [programConfigAddress] =
        anchor.web3.PublicKey.findProgramAddressSync(
          [Buffer.from("admin")],
          program.programId
        );

      const feeDestination = await getOrCreateAssociatedTokenAccount(
        provider.connection,
        payer,
        mint,
        payer.publicKey
      );

      await program.methods
        .initializeAdminConfig()
        .accounts({
          adminConfig: programConfigAddress,
          feeDestination: feeDestination.address,
          authority: provider.wallet.publicKey,
          program: program.programId,
          programData: programDataAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      const configAccount = await program.account.adminConfig.fetch(
        programConfigAddress
      );

      console.log("configAccount: ", configAccount);
    } catch (error) {
      console.error("Program config initialization failed:", error);
      throw error;
    }
  });
});
