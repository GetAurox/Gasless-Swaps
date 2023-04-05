import "./IERC20Extension.sol";
import "./IVault.sol";

/// @title IUniswapSwapProxy
interface IUniswapSwapProxy {
    /// @notice This function is called by a user to initiate a token swap, its primary usage is for users who have no ETH wanting to purchase _toToken with the _fromToken they currently hold. This is possible through the sponsored transaction model and is described in detail in the readme.
    /// @dev The _gasRefund parameter is the total amount of ETH required for the sponsor TX, approval TX and swap TX. This function then swaps an arbitrary amount of _fromToken to recover this and the fee is transferred to the vault contract.
    /// @param _fromToken The token the user is swapping from
    /// @param _toToken The token the user is swapping into
    /// @param _amount The amount of _fromToken the user would like to swap
    /// @param _gasRefund The total amount of ETH that is required to refund the sponsored transaction
    /// @param _slippage The slippage used for the swaps
    function proxySwapWithFee(
        IERC20Extension _fromToken,
        IERC20Extension _toToken,
        uint256 _amount,
        uint256 _gasRefund,
        uint256 _slippage
    ) external;
}
