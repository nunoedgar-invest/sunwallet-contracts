pragma solidity =0.6.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IPermitERC20 is IERC20 {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;

    function DOMAIN_SEPARATOR() external view returns (bytes32);
    function PERMIT_TYPEHASH() external pure returns (bytes32);
    function nonces(address owner) external view returns (uint256);

    // DAI
    function permit(address owner, address spender, uint256 nonce, uint256 expiry, bool allowed, uint8 v, bytes32 r, bytes32 s) external;
    function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external;
}