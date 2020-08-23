pragma solidity ^0.6.2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./IUniswapV2ERC20.sol";
import "./EIP712MetaTransaction.sol";


contract MetaContract is EIP712MetaTransaction, Ownable {
  uint256 private _necessarySunCoins;
  uint256 private constant _MAX_UINT = 2**256-1;

  IUniswapV2ERC20 private _sunCoin;

  // -----------------------------------------
  // CONSTRUCTOR
  // -----------------------------------------

  constructor (IUniswapV2ERC20 sunCoin) public {
    require(address(sunCoin) != address(0), "MetaContract: the sun coin address can not be zero address!");

    _sunCoin = sunCoin;
  }

  // -----------------------------------------
  // SETTERS
  // -----------------------------------------

  function setNecessaryCoinsAmount(uint256 newAmount) external onlyOwner {
    _necessarySunCoins = newAmount;
  }

  function tokenTransfer(address to, uint256 amount, IUniswapV2ERC20 token) external {
    address from = msgSender();
    require(_sunCoin.balanceOf(from) >= _necessarySunCoins, "tokenTransfer: not allowed for meta transfers");

    token.transferFrom(from, to, amount);
  }

  function tokenPermit(
    IUniswapV2ERC20 token,
    address spender,
    address owner,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s
  )
    external
  {
    token.permit(owner, spender, value, deadline, v, r, s);
  }
}