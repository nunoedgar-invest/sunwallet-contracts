pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "./ERC20Permit.sol";


/**
 * @dev Implementation of the Sun Coin (SUN) ERC20 smart contract.
 */
contract SunCoin is ERC20Permit, ERC20Burnable {
  constructor (
    string memory name,
    string memory symbol,
    address initialAccount,
    uint256 initialBalance
  ) public ERC20Permit(name, symbol) {
    _mint(initialAccount, initialBalance);
  }
}