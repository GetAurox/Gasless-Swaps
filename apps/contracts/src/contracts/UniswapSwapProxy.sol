import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./libraries/UniswapHelpers.sol";

import "./interfaces/IUniswapSwapProxy.sol";

import "./BaseSwapProxy.sol";

/// @title UniswapSwapProxy
contract UniswapSwapProxy is
    IUniswapSwapProxy,
    AccessControlEnumerable,
    Pausable,
    ReentrancyGuard,
    BaseSwapProxy
{
    // Using Fixed point calculations for these types
    using PRBMathSD59x18 for int256;
    using PRBMathUD60x18 for uint256;
    using SafeERC20 for IERC20Extension;

    using UniswapV2Helpers for IUniswapV2Router02;

    constructor(address _admin) BaseSwapProxy(_admin) {}

    function proxySwapWithFee(
        IERC20Extension _fromToken,
        IERC20Extension _toToken,
        uint256 _amount,
        uint256 _gasRefund,
        uint256 _slippage
    ) external override whenNotPaused nonReentrant {
        require(!isEth(_fromToken), "Swapping from ETH not supported");
        require(_fromToken != _toToken, "_fromToken equal to _toToken");

        _fromToken.safeTransferFrom(_msgSender(), address(this), _amount);

        // Calculate the percentage fee and return the fetched exchange rate of ETH -> _fromToken
        (
            uint256 feeTotalInETH,
            uint256 feeTotalInFromToken
        ) = calculatePercentageFeeInETH(_fromToken, _amount, _gasRefund);

        // Handle the approval to the Uniswap router contract here, so that it will cover both the fee swap and token swap
        _handleApprovalFromThis(_fromToken, address(uniswapV2Router), _amount);

        // Take the fee with Uniswap if one of the tokens isn't ETH and there is a fee total to collect
        if (!isEth(_fromToken) && !isEth(_toToken) && feeTotalInETH > 0) {
            // Apply slippage to the fee total amount, this will be the maximum used amount of _fromToken
            feeTotalInFromToken += feeTotalInFromToken.mul(_slippage);

            (uint256 amountUsedForFee, ) = uniswapV2Router
                ._swapTokensForExactETH(
                    _fromToken,
                    feeTotalInETH,
                    feeTotalInFromToken,
                    address(this)
                );

            // Update the input amount to account for the tokens used to cover the fee
            _amount -= amountUsedForFee;
        }

        // Scale the input _amount to have the same decimals as _toToken
        uint256 scaledAmount = scaleAmountFromTokenDecimals(
            _toToken,
            _amount,
            _getDecimals(_fromToken)
        );

        uint256 toTokenExchangeRate = getExchangeRate(_fromToken, _toToken);

        // Apply the exchange rate and slippage to the scaled amount to derive a minimum output amount
        uint256 amountOutMinimum = scaledAmount.mul(toTokenExchangeRate);
        amountOutMinimum -= amountOutMinimum.mul(_slippage);

        (, uint256 amountReturned) = UniswapHelpers._exactInUniswapHandler(
            _fromToken,
            _toToken,
            _amount,
            amountOutMinimum
        );

        if (isEth(_toToken)) {
            amountReturned -= feeTotalInETH;

            (bool success, ) = _msgSender().call{value: amountReturned}("");
            require(success, "Transfer failed");
        } else {
            _toToken.safeTransfer(_msgSender(), amountReturned);
        }

        // Transfer the vault the fees paid
        vault.paidFees{value: feeTotalInETH}(_msgSender(), feeTotalInETH);
    }
}
