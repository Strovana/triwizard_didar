require("@nomiclabs/hardhat-ethers");
require("dotenv").config(); // Optional: for .env support

module.exports = {
  solidity: "0.8.20",
  networks: {
    polygon_amoy: {
      url: "https://rpc-amoy.polygon.technology", // or from Alchemy/Infura
      accounts: [process.env.PRIVATE_KEY], // NEVER commit real keys!
    },
  },
};
