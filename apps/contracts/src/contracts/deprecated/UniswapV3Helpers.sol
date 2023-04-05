import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Factory.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";

import "../libraries/TickMath.sol";

// ! Deprecated, not in use currently
// TODO: Update .approve calls to use .safeApprove from SafeERC20.sol
library UniswapV3Helpers {
    using PRBMathUD60x18 for uint256;

    IUniswapV3Factory constant uniswapV3Factory =
        IUniswapV3Factory(0x1F98431c8aD98523631AE4a59f267346ea31F984);

    IERC20 public constant ethContract =
        IERC20(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE);

    IERC20 constant WETH = IERC20(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);

    // https://ethereum.stackexchange.com/questions/98685/computing-the-uniswap-v3-pair-price-from-q64-96-number?rq=1
    // https://github.com/Uniswap/v3-periphery/blob/main/contracts/libraries/OracleLibrary.sol
    // https://docs.uniswap.org/protocol/concepts/V3-overview/oracle
    function getUniswapV3Rate(IERC20 _fromToken, IERC20 _toToken)
        public
        view
        returns (uint256)
    {
        if (_fromToken == ethContract) {
            _fromToken = WETH;
        }
        if (_toToken == ethContract) {
            _toToken = WETH;
        }

        // If a direct pair exists get the exchange rate for it
        uint256 directPairRate = UniswapV3Helpers.getUniswapV3PoolRate(
            _fromToken,
            _toToken
        );

        if (directPairRate != 0) {
            return directPairRate;
        }

        // If a direct pair rate didn't exist and either of the tokens was WETH return now
        if (_fromToken == WETH || _toToken == WETH) {
            return 0;
        }

        uint256 toWETHRate = UniswapV3Helpers.getUniswapV3PoolRate(
            _fromToken,
            WETH
        );
        uint256 fromWETHRate = UniswapV3Helpers.getUniswapV3PoolRate(
            WETH,
            _toToken
        );

        // TODO tokens with different number of decimals
        if (toWETHRate != 0 && fromWETHRate != 0) {
            return toWETHRate.mul(fromWETHRate);
        }

        return 0;
    }

    function getUniswapV3PoolRate(IERC20 _fromToken, IERC20 _toToken)
        internal
        view
        returns (uint256 rate)
    {
        // Defaulting to 3000 fee
        address v3PoolAddress = uniswapV3Factory.getPool(
            address(_fromToken),
            address(_toToken),
            3000
        );

        if (v3PoolAddress == address(0)) {
            return 0;
        }

        uint32[] memory secondsAgo = new uint32[](2);

        secondsAgo[0] = 3600; // from an hour ago
        secondsAgo[1] = 0; // to now

        (int56[] memory tickCumulatives, ) = IUniswapV3Pool(v3PoolAddress)
            .observe(secondsAgo);

        int56 tickCumulativesDelta = tickCumulatives[1] - tickCumulatives[0];

        int24 arithmeticMeanTick = int24(tickCumulativesDelta / 3600);

        return TickMath.getPriceFromTick(arithmeticMeanTick);
    }

    function _inSwapUniswapV3(
        ISwapRouter _swapRouter,
        IERC20 _fromToken,
        IERC20 _toToken,
        // The calculated amountIn: fee percentage + ETH fee in _fromToken's
        uint256 _amountIn,
        // The gas refund amount
        uint256 _amountOutMinimum
    ) private returns (uint256 amountOut) {
        _fromToken.approve(address(_swapRouter), _amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: address(_fromToken),
                tokenOut: address(_toToken),
                fee: 3000,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: _amountIn,
                amountOutMinimum: _amountOutMinimum,
                sqrtPriceLimitX96: 0
            });

        return _swapRouter.exactInputSingle(params);
    }

    function _outSwapUniswapV3(
        ISwapRouter _swapRouter,
        IERC20 _fromToken,
        IERC20 _toToken,
        uint256 _amountOut,
        uint256 _amountInMaximum
    ) private returns (uint256 amountIn) {
        _fromToken.approve(address(_swapRouter), _amountInMaximum);

        ISwapRouter.ExactOutputSingleParams memory outputParams = ISwapRouter
            .ExactOutputSingleParams({
                tokenIn: address(_fromToken),
                tokenOut: address(_toToken),
                fee: 3000,
                recipient: address(this),
                deadline: block.timestamp,
                amountOut: _amountOut,
                amountInMaximum: _amountInMaximum,
                sqrtPriceLimitX96: 0
            });

        return _swapRouter.exactOutputSingle(outputParams);
    }
}
