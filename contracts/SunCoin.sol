pragma solidity =0.6.6;

import '@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol';
import './ERC20Permit.sol';


/**
 * @dev Implementation of the Sun Coin (SUN) ERC20 smart contract.
 */
contract SunCoin is ERC20Permit, ERC20Burnable {
  string public constant NAME = 'Sun Coin';
  string public constant SYMBOL = 'SUN';
  string public constant VERSION = '1';
  uint256 public constant INITIAL_BALANCE = 100000000 ether;

  constructor (address initialAccount) public ERC20Permit(NAME, SYMBOL, VERSION) {
    _mint(initialAccount, INITIAL_BALANCE);
  }
}