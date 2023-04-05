import "../interfaces/IForwardingSwapProxy.sol";

// ! Deprecated, keeping for potential future use
library OneInchDecoder {
    // Had issues with: bytes4 testSig = abi.decode(_swapParams.data[:4], (bytes4));
    // https://github.com/ethereum/solidity/issues/6012
    function abiDecodeSig(bytes memory _data)
        private
        pure
        returns (bytes4 sig)
    {
        assembly {
            sig := mload(add(_data, add(0x20, 0)))
        }
    }

    function _updateToTokenSwapParams(
        IForwardingSwapProxy.SwapParams calldata _toTokenSwapParams,
        uint256 updatedAmount,
        uint256 updatedValue
    ) internal returns (IForwardingSwapProxy.SwapParams memory) {
        // Decoded and updated amount
        bytes4 sig = abiDecodeSig(_toTokenSwapParams.data);

        // if (sig == bytes4(keccak256("unoswa)))

        (
            address srcToken,
            uint256 amount,
            uint256 minReturn,
            bytes32[] memory pools
        ) = abi.decode(
                _toTokenSwapParams.data[4:],
                (address, uint256, uint256, bytes32[])
            );

        bytes memory data = abi.encodeWithSelector(
            sig,
            srcToken,
            updatedAmount,
            minReturn,
            pools
        );

        return
            IForwardingSwapProxy.SwapParams(
                _toTokenSwapParams.to,
                updatedAmount,
                updatedValue,
                data
            );
    }

    // https://ethereum.stackexchange.com/questions/48576/solidity-assembly-question-mstore
    function updateData(
        bytes memory _data,
        uint256 _amount,
        uint256 _minReturn
    ) public view returns (bytes memory) {
        uint256 gasBef = gasleft();
        assembly {
            mstore(add(_data, 68), _amount)
            mstore(add(_data, 100), _minReturn)
        }
        uint256 gasAft = gasleft();

        return _data;
    }
}
