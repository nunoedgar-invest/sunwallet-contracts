pragma solidity =0.6.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./IPermitERC20.sol";
import "./EIP712MetaTransaction.sol";


contract MetaTxValidator is EIP712MetaTransaction, Ownable {
  using SafeERC20 for IPermitERC20;

  bool private _isPaused;
  uint256 private _necessarySunCoins;

  mapping (address => bool) private _senderBlockedForMeta;

  IPermitERC20 private _sunCoin;

  modifier metaTxValidation(address signer, uint256 amount, IPermitERC20 token) {
    require(_isPaused == false, "metaTxValidation: meta transactions paused!");
    require(_senderAllowed(signer), "metaTxValidation: not allowed for meta transfers.");
    require(_hasEnoughSunTokens(signer), 'metaTxValidation: invalid sender address.');
    require(_tokensApproved(signer, amount, token), 'metaTxValidation: tokens are blocked.');
    require(_hasEnoughPairToken(signer, amount, token), 'metaTxValidation: user has not enough tokens.');
    _;
  }

  modifier permitTxValidation(address signer, address owner, IPermitERC20 token) {
    require(signer == owner, "permitTxValidation: signer is not the owner!");
    require(_isPaused == false, "permitTxValidation: meta transactions paused!");
    require(_senderAllowed(signer), "permitTxValidation: not allowed for meta transfers.");
    require(_hasEnoughSunTokens(signer), 'permitTxValidation: invalid sender address.');
    require(_tokensNotApproved(signer, token), 'permitTxValidation: tokens are blocked.');
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

  function toggleSenderAccessForMeta(address sender, bool isBlocked) external onlyOwner {
    _senderBlockedForMeta[sender] = isBlocked;
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
    metaTxValidation(msgSender(), amount, token)
  {
    token.safeTransferFrom(msgSender(), to, amount);
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
    permitTxValidation(msgSender(), owner, token)
  {
    token.permit(owner, spender, value, deadline, v, r, s);
  }

  // -----------------------------------------
  // INTERNAL
  // -----------------------------------------

  function _senderAllowed(address sender) private view returns (bool) {
    return sender != address(0) && _senderBlockedForMeta[sender] == false;
  }

  function _hasEnoughSunTokens(address sender) private view returns (bool) {
    return _sunCoin.balanceOf(sender) >= _necessarySunCoins;
  }

  function _hasEnoughPairToken(address sender, uint256 amount, IPermitERC20 token) private view returns (bool) {
    uint256 balance = token.balanceOf(sender);
    return balance >= amount;
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