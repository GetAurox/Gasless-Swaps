import { expect } from "chai";
import { BigNumber } from "ethers";

export interface BigNumAssertionOptions {
  range?: number;
}

/**
 * This function takes in an expected and a resultant value, then determines whether the resultant value is within a given range to the expected value. The default range is 5%, but can be overridden with options
 * @param expected The expected value
 * @param result The returned result value
 * @param options Optional options, to specify the range in percentage points
 */
export const assertBigNumWithRange = (
  expected: string | BigNumber,
  result: string | BigNumber,
  options?: BigNumAssertionOptions
) => {
  if (!(expected instanceof BigNumber)) expected = BigNumber.from(expected);

  if (!(result instanceof BigNumber)) result = BigNumber.from(result);

  const parsedExpected = expected;

  if (options?.range && options?.range < 0.01)
    throw new Error("Assertion range must be greater than 1%");

  //   The percentage of range
  const rangeValue = options?.range ?? 0.05;

  //   The absolute value of the range
  const resultRangeDiff = result.mul(rangeValue * 100).div(100);

  const startOfRange = result.sub(resultRangeDiff);
  const endOfRange = result.add(resultRangeDiff);

  //   Assertions
  expect(parsedExpected).gt(startOfRange);
  expect(parsedExpected).lt(endOfRange);
};
