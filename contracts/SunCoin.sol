pragma solidity =0.6.6;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "./ERC20Permit.sol";


/**
 * @dev Implementation of the Sun Coin (SUN) ERC20 smart contract.
 */
contract SunCoin is ERC20Permit, ERC20Burnable {
  uint256 private constant INITIAL_BALANCE = 100000000 ether;

  constructor (
    string memory name,
    string memory symbol,
    address initialAccount
  ) public ERC20Permit(name, symbol) {
    _mint(initialAccount, INITIAL_BALANCE);
  }
}