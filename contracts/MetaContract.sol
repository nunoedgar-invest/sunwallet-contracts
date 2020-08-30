pragma solidity =0.6.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./IPermitERC20.sol";
import "./EIP712MetaTransaction.sol";


contract MetaContract is EIP712MetaTransaction, Ownable {
  using SafeERC20 for IPermitERC20;

  bool private _isPaused;
  uint256 private _necessarySunCoins;

  mapping (address => bool) private _senderAllowedForMeta;

  IPermitERC20 private _sunCoin;

  modifier notPaused() {
    require(_isPaused == false, "notPaused: meta transactions paused!");
    _;
  }

  // -----------------------------------------
  // CONSTRUCTOR
  // -----------------------------------------

  constructor (IPermitERC20 sunCoin) public {
    require(address(sunCoin) != address(0), "MetaContract: the sun coin address can not be zero address!");

    _sunCoin = sunCoin;
  }

  receive () external payable {
    // silence
  }

  fallback () external {
    // silence
  }

  // -----------------------------------------
  // SETTERS (Admin)
  // -----------------------------------------

  function setNecessaryCoinsAmount(uint256 newAmount) external onlyOwner {
    _necessarySunCoins = newAmount;
  }

  function setPausedState(bool isPaused) external onlyOwner {
    _isPaused = isPaused;
  }

  function toggleSenderAccessForMeta(address sender, bool isAllowed) external onlyOwner {
    _senderAllowedForMeta[sender] = isAllowed;
  }

  function setSunCoinAddress(IPermitERC20 sunCoin) external onlyOwner {
    _sunCoin = sunCoin;
  }

  // -----------------------------------------
  // SETTERS (Meta transactions)
  // -----------------------------------------

  function tokenTransfer(
    address to,
    uint256 amount,
    IPermitERC20 token
  )
    external
    notPaused
  {
    address from = msgSender();

    require(_senderAllowed(from), "tokenTransfer: not allowed for meta transfers.");
    require(_hasEnoughSunTokens(from), 'tokenTransfer: invalid sender address.');
    require(_tokensApproved(from, amount, token), 'tokenTransfer: tokens already approved.');

    token.safeTransferFrom(from, to, amount);
  }

  function tokenPermit(
    address spender,
    address owner,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s,
    IPermitERC20 token
  )
    external
    notPaused
  {
    address from = msgSender();

    require(_senderAllowed(from), "tokenPermit: not allowed for meta transfers.");
    require(_hasEnoughSunTokens(from), 'tokenPermit: invalid sender address.');
    require(_tokensNotApproved(from, token), 'tokenPermit: tokens already approved.');

    token.permit(owner, spender, value, deadline, v, r, s);
  }

  // -----------------------------------------
  // INTERNAL
  // -----------------------------------------

  function _senderAllowed(address sender) private view returns (bool) {
    return sender != address(0) && _senderAllowedForMeta[sender];
  }

  function _hasEnoughSunTokens(address sender) private view returns (bool) {
    return _sunCoin.balanceOf(sender) >= _necessarySunCoins;
  }

  function _tokensApproved(address sender, uint256 amount, IPermitERC20 token) private view returns (bool) {
    uint256 allowance = token.allowance(sender, address(this));
    return allowance >= amount;
  }

  function _tokensNotApproved(address sender, IPermitERC20 token) private view returns (bool) {
    uint256 allowance = token.allowance(sender, address(this));
    return allowance == 0;
  }

  // -----------------------------------------
  // GETTERS
  // -----------------------------------------

  function necessarySunCoins() external view returns (uint256) {
    return _necessarySunCoins;
  }

  function senderAllowed(address sender) external view returns (bool) {
    return _senderAllowed(sender);
  }

  function tokensApproved(address sender, uint256 amount, IPermitERC20 token) external view returns (bool) {
    return _tokensApproved(sender, amount, token);
  }

  function tokensNotApproved(address sender, IPermitERC20 token) external view returns (bool) {
    return _tokensNotApproved(sender, token);
  }

  function sunCoin() external view returns (address) {
    return address(_sunCoin);
  }

  function isPaused() external view returns (bool) {
    return _isPaused;
  }
}