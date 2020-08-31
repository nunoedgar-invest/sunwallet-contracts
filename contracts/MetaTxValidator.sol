pragma solidity =0.6.6;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IPermitERC20.sol";
import "./TransferHelper.sol";
import "./EIP712MetaTransaction.sol";


contract MetaTxValidator is EIP712MetaTransaction, Ownable {
  bool private _isPaused;
  uint256 private _necessarySunCoins;

  mapping (address => bool) private _senderBlockedForMeta;

  IPermitERC20 private _sunCoin;

  modifier metaTxValidation(address signer, uint256 amount, address token) {
    require(_tokensApproved(signer, amount, token), 'metaTxValidation: tokens are blocked.');
    require(_hasEnoughPairToken(signer, amount, token), 'metaTxValidation: user has not enough tokens.');
    _;
  }

  modifier permitTxValidation(address signer, address owner, address token) {
    require(_tokensNotApproved(signer, token), 'permitTxValidation: tokens are blocked.');
    _;
  }

  // -----------------------------------------
  // CONSTRUCTOR
  // -----------------------------------------

  constructor (address _sun) internal {
    _sunCoin = IPermitERC20(_sun);
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

  function setSunCoinAddress(address sunCoin) external onlyOwner {
    _sunCoin = IPermitERC20(sunCoin);
  }

  // -----------------------------------------
  // SETTERS (Meta transactions)
  // -----------------------------------------

  function tokenTransfer(
    address to,
    uint256 amount,
    address token
  )
    external
    metaTxValidation(msgSender(), amount, token)
  {
    TransferHelper.safeTransferFrom(token, msgSender(), to, amount);
  }

  function tokenPermit(
    address spender,
    address owner,
    uint256 value,
    uint256 deadline,
    uint8 v,
    bytes32 r,
    bytes32 s,
    address token
  )
    external
    permitTxValidation(msgSender(), owner, token)
  {
    IPermitERC20(token).permit(owner, spender, value, deadline, v, r, s);
  }

  // -----------------------------------------
  // INTERNAL
  // -----------------------------------------

  function _senderBlocked(address sender) private view returns (bool) {
    return _senderBlockedForMeta[sender];
  }

  function _hasEnoughSunTokens(address sender) private view returns (bool) {
    return _sunCoin.balanceOf(sender) >= _necessarySunCoins;
  }

  function _hasEnoughPairToken(address sender, uint256 amount, address token) private view returns (bool) {
    uint256 balance = IPermitERC20(token).balanceOf(sender);
    return balance >= amount;
  }

  function _tokensApproved(address sender, uint256 amount, address token) private view returns (bool) {
    uint256 allowance = IPermitERC20(token).allowance(sender, address(this));
    return allowance >= amount;
  }

  function _tokensNotApproved(address sender, address token) private view returns (bool) {
    uint256 allowance = IPermitERC20(token).allowance(sender, address(this));
    return allowance == 0;
  }

  function _preMetaTxValidation(address sender) internal virtual override {
    super._preMetaTxValidation(sender);


    require(sender != address(0), "_preMetaTxValidation: invalid address.");
    require(_isPaused == false, "_preMetaTxValidation: meta transactions paused!");
    require(!_senderBlocked(sender), "_preMetaTxValidation: not allowed for meta transfers.");
    require(_hasEnoughSunTokens(sender), '_preMetaTxValidation: invalid sender address.');
  }

  // -----------------------------------------
  // GETTERS
  // -----------------------------------------

  function necessarySunCoins() external view returns (uint256) {
    return _necessarySunCoins;
  }

  function senderBlocked(address sender) external view returns (bool) {
    return _senderBlocked(sender);
  }

  function tokensApproved(address sender, uint256 amount, address token) external view returns (bool) {
    return _tokensApproved(sender, amount, token);
  }

  function tokensNotApproved(address sender, address token) external view returns (bool) {
    return _tokensNotApproved(sender, token);
  }

  function sunCoin() external view returns (address) {
    return address(_sunCoin);
  }

  function isPaused() external view returns (bool) {
    return _isPaused;
  }
}