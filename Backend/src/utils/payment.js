/**
 * Default Commission Splits (Percentage)
 * Ad Seller pays the full amount.
 * Third Party Broker acts as the middleman and takes commission from BOTH sides.
 * - 80% to Theater Owner (Revenue for showing ad)
 * - 20% to Third Party (10% Broker fee from Seller + 10% Broker fee from Owner)
 * - 0% to Ad Seller (They are the ones paying the total amount)
 * Superadmin acts as the Developer/Platform Owner.
 */
const SPLITS = {
    THEATER_OWNER: 1.00,
    AD_SELLER: 0.00,
    THIRD_PARTY: 0.00,
};

/**
 * Calculates the revenue split based on total amount
 * @param {Number} totalAmount - The total payment amount
 */
export const calculateCommission = (totalAmount) => {
    return {
        theaterOwnerShare: totalAmount * SPLITS.THEATER_OWNER,
        adSellerShare: totalAmount * SPLITS.AD_SELLER,
        thirdPartyShare: totalAmount * SPLITS.THIRD_PARTY,
    };
};

/**
 * Summarizes the payment details for specific periods or types
 * @param {Array} transactions - List of transaction objects
 */
export const summarizePayments = (transactions) => {
    return transactions.reduce((acc, current) => {
        acc.totalAmount += current.amount;
        acc.theaterOwnerTotal += current.theaterOwnerShare;
        acc.adSellerTotal += current.adSellerShare;
        acc.thirdPartyTotal += current.thirdPartyShare;
        return acc;
    }, {
        totalAmount: 0,
        theaterOwnerTotal: 0,
        adSellerTotal: 0,
        thirdPartyTotal: 0,
    });
};
