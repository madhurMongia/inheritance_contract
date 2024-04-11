import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "ethers";

const InheritanceContractModule = buildModule("InheritanceContractModule", m => {
  const heir = process.env.INITIAL_HEIR;
  if (!heir) {
    throw Error("heir is required");
  }
  const inheritanceContract = m.contract("InheritanceContract", [heir], {
    value: parseEther(process.env.INHERITANCE_AMOUNT || "0.001")
  });

  return {
    inheritanceContract,
  };
});

export default InheritanceContractModule;

