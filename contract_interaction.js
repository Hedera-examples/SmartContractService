require("dotenv").config();
const {
  AccountBalanceQuery,
  AccountId,
  Client,
  ContractCallQuery,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractId,
  PrivateKey,
} = require("@hashgraph/sdk");
const { exit } = require("process");
const fs = require("fs");

const MAX_GAS = 100000;
const HBAR_TO_TINYBAR = 100000000;

const accountId = AccountId.fromString(process.env.ACCOUNT_ID);
const privateKey = PrivateKey.fromString(process.env.PRIVATE_KEY);

const client = Client.forTestnet().setOperator(accountId, privateKey);

async function main() {
  let executionTimesTx = [];
  let executionTimesQuery = [];

  // Get SC address from contract_address.txt
  const contractIdString = fs.readFileSync("contract_address.txt");
  const contractId = ContractId.fromString(contractIdString);

  // Get account's balance before submitting setter transactions
  const balanceQuery = new AccountBalanceQuery().setAccountId(accountId);
  const accountBalanceBeforeTx = await balanceQuery.execute(client);

  // Update this account's age via deployed SC
  const timeBeforeSetAgeTx = performance.now();
  const setAgeTx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(MAX_GAS)
    .setFunction("setAge", new ContractFunctionParameters().addUint256(27));
  const setAgeSubmit = await setAgeTx.execute(client);
  const timeAfterSetAgeTx = performance.now();
  const setAgeRx = await setAgeSubmit.getReceipt(client);
  console.log("Set age transaction status: " + setAgeRx.status.toString());

  executionTimesTx = [
    ...executionTimesTx,
    timeAfterSetAgeTx - timeBeforeSetAgeTx,
  ];
  console.log(
    "Execution time: " +
      Math.round(executionTimesTx[executionTimesTx.length - 1]) +
      " ms"
  );

  // Update this account's name and surname via deployed SC
  const timeBeforeSetNameTx = performance.now();
  const setNameTx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(MAX_GAS)
    .setFunction("setName", new ContractFunctionParameters().addString("John"));
  const setNameSubmit = await setNameTx.execute(client);
  const timeAfterNameTx = performance.now();
  const setNameRx = await setNameSubmit.getReceipt(client);
  console.log("Set name transaction status: " + setNameRx.status.toString());

  executionTimesTx = [
    ...executionTimesTx,
    timeAfterNameTx - timeBeforeSetNameTx,
  ];
  console.log(
    "Execution time: " +
      Math.round(executionTimesTx[executionTimesTx.length - 1]) +
      " ms"
  );

  const timeBeforeSetSurnameTx = performance.now();
  const setSurnameTx = new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(MAX_GAS)
    .setFunction(
      "setSurname",
      new ContractFunctionParameters().addString("Doe")
    );
  const setSurnameSubmit = await setSurnameTx.execute(client);
  const timeAfterSetSurnameTx = performance.now();
  const setSurnameRx = await setSurnameSubmit.getReceipt(client);
  console.log(
    "Set surname transaction status: " + setSurnameRx.status.toString()
  );

  executionTimesTx = [
    ...executionTimesTx,
    timeAfterSetSurnameTx - timeBeforeSetSurnameTx,
  ];
  console.log(
    "Execution time: " +
      Math.round(executionTimesTx[executionTimesTx.length - 1]) +
      " ms"
  );

  // Log average execution time for setter transactions
  let sumTx = 0;
  for (let i = 0; i < executionTimesTx.length; i++) {
    sumTx += executionTimesTx[i];
  }
  console.log("--------------------------------------------------");
  console.log(
    "Average execution time for setter transactions: " +
      Math.round(sumTx / executionTimesTx.length) +
      " ms"
  );

  // Log average fee for setter transactions
  const accountBalanceAfterTx = await balanceQuery.execute(client);
  console.log(
    "Average fee for setter transactions " +
      (
        (accountBalanceBeforeTx.hbars.toTinybars() -
          accountBalanceAfterTx.hbars.toTinybars()) /
        HBAR_TO_TINYBAR /
        3
      ).toFixed(2) +
      " ℏ \n"
  );

  // Query age, name and surname of current account
  const accountBalanceBeforeQuery = await balanceQuery.execute(client);

  const timeBeforeAgeQuery = performance.now();
  const ageQuery = new ContractCallQuery()
    .setContractId(contractId)
    .setGas(MAX_GAS)
    .setFunction(
      "getAge",
      new ContractFunctionParameters().addAddress(accountId.toSolidityAddress())
    );
  const ageQuerySubmit = await ageQuery.execute(client);
  const timeAfterAgeQuery = performance.now();
  const ageQueryResult = ageQuerySubmit.getUint256(0);
  console.log("Here's the age you've asked for: " + ageQueryResult);

  executionTimesQuery = [
    ...executionTimesQuery,
    timeAfterAgeQuery - timeBeforeAgeQuery,
  ];
  console.log(
    "Execution time: " +
      Math.round(executionTimesQuery[executionTimesQuery.length - 1]) +
      " ms"
  );

  const timeBeforeNameQuery = performance.now();
  const nameQuery = new ContractCallQuery()
    .setContractId(contractId)
    .setGas(MAX_GAS)
    .setFunction(
      "getName",
      new ContractFunctionParameters().addAddress(accountId.toSolidityAddress())
    );
  const nameQuerySubmit = await nameQuery.execute(client);
  const timeAfterNameQuery = performance.now();
  const nameQueryResult = nameQuerySubmit.getString(0);
  console.log("Here's the name you've asked for: " + nameQueryResult);

  executionTimesQuery = [
    ...executionTimesQuery,
    timeAfterNameQuery - timeBeforeNameQuery,
  ];
  console.log(
    "Execution time: " +
      Math.round(executionTimesQuery[executionTimesQuery.length - 1]) +
      " ms"
  );

  const timeBeforeSurnameQuery = performance.now();
  const surnameQuery = new ContractCallQuery()
    .setContractId(contractId)
    .setGas(MAX_GAS)
    .setFunction(
      "getSurname",
      new ContractFunctionParameters().addAddress(accountId.toSolidityAddress())
    );
  const surnameQuerySubmit = await surnameQuery.execute(client);
  const timeAfterSurnameQuery = performance.now();
  const surnameQueryResult = surnameQuerySubmit.getString(0);
  console.log("Here's the surname you've asked for: " + surnameQueryResult);

  executionTimesQuery = [
    ...executionTimesQuery,
    timeAfterSurnameQuery - timeBeforeSurnameQuery,
  ];
  console.log(
    "Execution time: " +
      Math.round(executionTimesQuery[executionTimesQuery.length - 1]) +
      " ms"
  );

  // Log average execution time for getter transactions
  let sumQuery = 0;
  for (let i = 0; i < executionTimesQuery.length; i++) {
    sumQuery += executionTimesQuery[i];
  }
  console.log("--------------------------------------------------");
  console.log(
    "Average execution time for getter transactions: " +
      Math.round(sumQuery / executionTimesQuery.length) +
      " ms"
  );

  // Log average fee for getter transactions
  const accountBalanceAfterQuery = await balanceQuery.execute(client);
  console.log(
    "Average fee for getter transactions " +
      (
        (accountBalanceBeforeQuery.hbars.toTinybars() -
          accountBalanceAfterQuery.hbars.toTinybars()) /
        HBAR_TO_TINYBAR /
        3
      ).toFixed(2) +
      " ℏ \n"
  );

  exit();
}

main();
