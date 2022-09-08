const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("compare", function () {
  it("works", async function () {
    const comparisonFactory = await ethers.getContractFactory("Comparison");
    const optimisedFactory = await ethers.getContractFactory("Optimised");

    const defaultValues = [
      BigNumber.from(50),
      BigNumber.from(60),
      BigNumber.from(75),
      BigNumber.from(100),
      BigNumber.from(150),
      BigNumber.from(500),
      BigNumber.from(0),
    ];

    const defaultIndices = getRandomIndices(10000, 6);

    function getExpected(tokenId) {
      return defaultValues[defaultIndices[tokenId - 1].toNumber()];
    }

    const comparison = await comparisonFactory.deploy(defaultValues);
    await comparison.deployed();

    var originalGas = BigNumber.from(0);
    for (var i = 0; i < defaultValues.length; i++) {
      const tokenIdsWithValue = seperateIndices(defaultIndices, i);
      const tx = await comparison.setStoredIndices(tokenIdsWithValue, i);
      const receipt = await tx.wait();

      originalGas = originalGas.add(receipt.gasUsed);
    }

    const optimised = await optimisedFactory.deploy(defaultValues);
    await optimised.deployed();

    const combinedDefaultIndices = combineIndices(defaultIndices);
    const tx = await optimised.setStoredIndices(combinedDefaultIndices);
    const receipt = await tx.wait();

    var cGasTotal = BigNumber.from(0);
    var oGasTotal = BigNumber.from(0);
    for (let i = 0; i < 10000; i++) {
      var [cGas, oGas] = await checkIndexValue(
        comparison,
        optimised,
        i + 1,
        getExpected(i + 1),
        defaultIndices[i]
      );
      cGasTotal = cGasTotal.add(cGas);
      oGasTotal = oGasTotal.add(oGas);
    }
    cGasTotal = cGasTotal.div(BigNumber.from(10000));
    oGasTotal = oGasTotal.div(BigNumber.from(10000));

    console.log("Original populate storedIndices gas: " + originalGas);
    console.log("Optimised populate storedIndices gas: " + receipt.gasUsed);

    console.log("Original read average gas: " + cGasTotal);
    console.log("Optimised read average gas: " + oGasTotal);
  });
});

async function checkIndexValue(c, o, tokenId, expectedValue, expectedIndex) {
  const txC = await c.measureFindValue(tokenId);
  const receiptC = await txC.wait();

  const txO = await o.measureFindValue(tokenId);
  const receiptO = await txO.wait();

  const valueC = await c.findValue(tokenId);
  const valueO = await o.findValue(tokenId);

  if (!valueC.eq(valueO)) {
    throw "Broke expectation";
  }

  return [receiptC.gasUsed, receiptO.gasUsed];
}

function getRandomIndices(amount, max) {
  const getRandom = () => {
    return Math.round(Math.random() * max);
  };

  const result = [];
  for (var i = 0; i < amount; i++) {
    result.push(BigNumber.from(getRandom()));
  }

  return result;
}

function seperateIndices(defaultIndices, index) {
  const result = [];

  for (var i = 0; i < defaultIndices.length; i++) {
    if (defaultIndices[i].toNumber() == index) {
      result.push(BigNumber.from(i + 1)); // Token ids start at 1 not 0
    }
  }

  return result;
}

function combineIndices(defaultIndices) {
  const result = [];
  const packed = 32;

  const full = Math.floor(defaultIndices.length / packed);
  const partial = defaultIndices.length % packed;

  const index = (full, byte) => {
    return full * packed + byte;
  };

  // Create byte array
  const bytes = [0]; // The token id 0 never has an index.
  for (var i = 0; i < full; i++) {
    for (var j = 0; j < packed; j++) {
      bytes.push(defaultIndices[index(i, j)].toNumber());
    }
  }

  for (var i = 0; i < partial; i++) {
    bytes.push(defaultIndices[index(full, i)].toNumber());
  }

  // Convert byte array in uint256's
  var value = [];
  for (var i = 0; i < bytes.length; i++) {
    value.push(bytes[i]);
    if (value.length == 32) {
      // Reverse because BigNumber.from has MSB @ 0 we want LSB @ 0.
      result.push(BigNumber.from(value.reverse()));
      value = [];
    }
  }

  if (value.length != 0) {
    // Reverse because BigNumber.from has MSB @ 0 we want LSB @ 0.
    result.push(BigNumber.from(value.reverse()));
  }

  return result;
}
