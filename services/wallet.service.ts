import { walletRepo } from "@/repo/wallet.repo";
import { UserService } from "@/services/user.service";
import {
	IBalancesSummary,
	IShare,
	ITransaction,
	IUser,
	Transaction,
} from "@/types";
import { getNonNullValue, simplifyFraction } from "@/utils";

export class WalletService {
	/**
	 * Calculates the outstanding balances (who owes money to whom) from a list of transactions.
	 *
	 * Purpose:
	 * - Produce a minimal set of directed debts between members after netting out mutual obligations.
	 * - Example: If A owes B 10 and B owes A 6, final result records A owes B 4 (and removes B→A).
	 *
	 * Inputs:
	 * - transactions: Array where each item is a pairwise summary between two members with these fields:
	 *   - from: userId of the debtor (the person who owes)
	 *   - to: userId of the creditor (the person who is owed)
	 *   - owed: positive number representing amount still owed from 'from' to 'to' for that pair
	 *   - paid: not used here (this function focuses only on outstanding owed amounts)
	 * - usersMap: Map<userId, IUser> used only to populate final user objects for output.
	 *
	 * Output shape (IBalancesSummary["owes"]):
	 * - Array of objects with:
	 *   - user: IUser (the debtor)
	 *   - amount: number (sum of all amounts the user owes to others)
	 *   - transactions: Array<{ user: IUser; amount: number }> (creditors and how much is owed to each)
	 *
	 * Internal data structures:
	 * - owesMap: Map<debtorUserId, { transactions: { user: creditorUserId; amount: number }[] }>
	 *   Accumulates directed edges from debtor to creditor, merging and netting where possible.
	 *
	 * Detailed process:
	 * 1) Iterate over each transaction (from, to, owed).
	 * 2) Skip if owed === 0 (no outstanding debt).
	 * 3) If both 'from' and 'to' already exist in owesMap, attempt to find and net a reverse edge
	 *    in toInOwesMap.transactions for user 'from'.
	 *    - If reverse amount equals current owed, remove the reverse edge entirely (they cancel out).
	 *    - If reverse > owed, reduce reverse by owed (netting out partial amount).
	 *    - If reverse < owed, remove reverse and add (owed - reverse) as a forward edge from→to.
	 * 4) If only 'from' exists, append a new forward edge from→to with amount owed.
	 * 5) If only 'to' exists, try to find reverse edge and net similarly; otherwise initialize 'from'.
	 * 6) If neither exists, initialize 'from' with a new forward edge.
	 * 7) After processing all items, transform owesMap into the final array with populated IUser objects and
	 *    a top-level 'amount' which is the sum of all outgoing owed amounts per debtor.
	 *
	 * Edge cases handled:
	 * - owed === 0 are ignored.
	 * - Users with no outstanding edges are omitted from output.
	 * - Multiple small edges between the same pair are aggregated in the final sum.
	 *
	 * Complexity:
	 * - Time: O(N * K) worst-case where N = number of transactions and K = average list size searched for reverse edges.
	 * - Space: O(U + E) where U is number of users involved, E is number of resulting directed edges.
	 *
	 * Example:
	 * - Input transactions:
	 *   [ { from: 'A', to: 'B', owed: 10 }, { from: 'B', to: 'A', owed: 6 } ]
	 * - Output owes:
	 *   [ { user: A, amount: 4, transactions: [{ user: B, amount: 4 }] } ]
	 */
	public static getOwedBalances(
		transactions: Array<Transaction>,
		usersMap: Map<string, IUser>
	): IBalancesSummary["owes"] {
		// Build the owesMap to track all outstanding debts between users
		// Structure: Map<userId, { transactions: [{ user: creditorId, amount: owedAmount }] }>
		const owesMap = new Map<
			string,
			{ transactions: { user: string; amount: number }[] }
		>();
		// Iterate over each transaction and progressively build the owesMap
		transactions.forEach((transaction) => {
			// Extract debtor (from) and creditor (to) user IDs for this transaction
			const from = transaction.from;
			const to = transaction.to;
			// Retrieve existing buckets (if any) for both users in the owesMap
			const fromInOwesMap = owesMap.get(from);
			const toInOwesMap = owesMap.get(to);
			// Ignore transactions where there is no outstanding owed amount
			if (transaction.owed !== 0) {
				if (fromInOwesMap && toInOwesMap) {
					// Both users already have buckets in owesMap; try to net out mutual debts
					const fromInToBucketOfOwesMap =
						toInOwesMap.transactions.find(
							(t: any) => t.user === from
						);
					if (fromInToBucketOfOwesMap) {
						const prevAmount = fromInToBucketOfOwesMap.amount;
						const newAmount = transaction.owed;
						if (prevAmount === newAmount) {
							// remove 'from' from 'to' bucket
							toInOwesMap.transactions =
								toInOwesMap.transactions.filter(
									(t: any) => t.user !== from
								);
						} else if (prevAmount > newAmount) {
							// reduce amount of 'from' in 'to' bucket
							fromInToBucketOfOwesMap.amount =
								prevAmount - newAmount;
						} else if (prevAmount < newAmount) {
							// remove 'from' from 'to' bucket and add reduced amount to 'from' bucket
							toInOwesMap.transactions =
								toInOwesMap.transactions.filter(
									(t: any) => t.user !== from
								);
							fromInOwesMap.transactions.push({
								user: to,
								amount: newAmount - prevAmount,
							});
						}
					} else {
						// No prior reverse debt; simply record that 'from' owes 'to'
						fromInOwesMap.transactions.push({
							user: to,
							amount: transaction.owed,
						});
					}
				} else if (fromInOwesMap) {
					// Only 'from' has a bucket; append this owed entry
					fromInOwesMap.transactions.push({
						user: to,
						amount: transaction.owed,
					});
				} else if (toInOwesMap) {
					// Only 'to' has a bucket; check if there is an opposite entry to net out
					const fromInToBucketOfOwesMap =
						toInOwesMap.transactions.find(
							(t: any) => t.user === from
						);
					if (fromInToBucketOfOwesMap) {
						const prevAmount = fromInToBucketOfOwesMap.amount;
						const newAmount = transaction.owed;
						if (prevAmount === newAmount) {
							// remove 'from' from 'to' bucket
							toInOwesMap.transactions =
								toInOwesMap.transactions.filter(
									(t: any) => t.user !== from
								);
						} else if (prevAmount > newAmount) {
							fromInToBucketOfOwesMap.amount =
								prevAmount - newAmount;
						} else {
							// kick 'from' from the bucket
							toInOwesMap.transactions =
								toInOwesMap.transactions.filter(
									(t: any) => t.user !== from
								);
							// add 'to' to the map
							owesMap.set(from, {
								transactions: [
									{
										user: to,
										amount: newAmount - prevAmount,
									},
								],
							});
						}
					} else {
						// Neither user has a corresponding reverse entry; initialize 'from' bucket
						owesMap.set(from, {
							transactions: [
								{
									user: to,
									amount: transaction.owed,
								},
							],
						});
					}
				} else {
					// Neither 'from' nor 'to' have buckets yet; initialize 'from' with current owed entry
					owesMap.set(from, {
						transactions: [
							{
								user: to,
								amount: transaction.owed,
							},
						],
					});
				}
			}
		});
		// Convert the owesMap to the final array format with user details and aggregated amounts

		// Transform owesMap entries into the output structure with populated user details
		return Array.from(owesMap, ([fromUser, fromUserObject]) => ({
			user: fromUser,
			...fromUserObject,
		}))
			.map((obj) => {
				// For each debtor, compute total amount owed by summing all sub-transactions
				return {
					user: getNonNullValue(usersMap.get(obj.user)),
					amount: obj.transactions
						.map((t) => t.amount)
						.reduce((a, b) => a + b, 0),
					// Populate each sub-transaction with user object of creditor
					transactions: obj.transactions.map((t) => {
						return {
							user: getNonNullValue(usersMap.get(t.user)),
							amount: t.amount,
						};
					}),
				};
			})
			.filter((obj) => obj.amount > 0 && obj.transactions.length > 0);
	}
	/**
	 * Calculates comprehensive balance summaries showing what each user gives and gets in total.
	 *
	 * Purpose:
	 * - Provide a clear view of net positions for each member, not just debts.
	 * - For each user, compute how much they "give" (outgoing value) and how much they "get" (incoming value)
	 *   across pairwise interactions.
	 *
	 * Differences vs getOwedBalances:
	 * - getOwedBalances focuses on outstanding debts only (owed field), minimizing edges.
	 * - getSummaryBalances presents a symmetric view of financial flow using (paid + owed) to capture
	 *   complete interactions and then nets per-user totals.
	 *
	 * Inputs:
	 * - transactions: Each item includes:
	 *   - from: payer userId
	 *   - to: payee userId
	 *   - paid: amount actually paid by 'from'
	 *   - owed: amount that 'to' should have paid but is owed to 'from' (included to reflect total flow)
	 *   We use (paid + owed) as the magnitude of the interaction for a pair.
	 * - usersMap: Map<userId, IUser> for populating final user objects.
	 *
	 * Output shape (IBalancesSummary["balances"]):
	 * - Array of objects with:
	 *   - user: IUser
	 *   - gives: number (net outgoing after subtracting incoming)
	 *   - gets: number (net incoming after subtracting outgoing)
	 *   - transactions: Array<{ user: IUser; gives: number; gets: number }>
	 *     reflecting the pairwise components before netting at the user level.
	 *
	 * Internal data structures:
	 * - balancesMap: Map<userId, { transactions: { user: userId; gives: number; gets: number }[] }>
	 *   For each directed pair (from→to), we add one entry in 'from' (gives) and a reciprocal entry in 'to' (gets).
	 *   When a reciprocal already exists, we net them to avoid double counting.
	 *
	 * Detailed process:
	 * 1) For each transaction, compute amount = paid + owed.
	 * 2) If both 'from' and 'to' buckets exist and reciprocal entries exist, net them:
	 *    - If prior gives(from→to) equals new amount, remove both entries (they cancel).
	 *    - If prior > new, reduce prior gives and counterpart gets by the difference.
	 *    - If prior < new, convert the surplus into gets(for from) and gives(for to).
	 * 3) If buckets are missing, initialize them and add appropriate gives/gets entries.
	 * 4) After processing all, compute per-user totals:
	 *    - givesInTotal = sum(gives) - sum(gets) if positive, else 0
	 *    - getsInTotal = sum(gets) - sum(gives) if positive, else 0
	 * 5) Populate IUser details for users and per-transaction counterparts.
	 *
	 * Edge cases handled:
	 * - Users with zero net (gives=0 and gets=0) are filtered out.
	 * - Multiple interactions between the same pair are coalesced through netting.
	 *
	 * Complexity:
	 * - Time: O(N * K) worst-case due to lookups in per-user transaction arrays.
	 * - Space: O(U + E) similar to getOwedBalances where E is number of pair entries maintained.
	 *
	 * Example:
	 * - Input: A→B with paid=100, owed=0; B→A with paid=60, owed=20 (amounts: 100, 80)
	 * - Net per-user:
	 *   A gives 100, gets 80 => gives=20, gets=0
	 *   B gives 80, gets 100 => gives=0, gets=20
	 */
	public static getSummaryBalances(
		transactions: Array<Transaction>,
		usersMap: Map<string, IUser>
	): IBalancesSummary["balances"] {
		// Build the balancesMap to track all financial exchanges between users
		// Structure: Map<userId, { transactions: [{ user: otherUserId, gives: amount, gets: amount }] }>
		const balancesMap = new Map<
			string,
			{ transactions: { user: string; gives: number; gets: number }[] }
		>();
		// Iterate over each transaction to build pairwise gives/gets between users
		transactions.forEach((transaction) => {
			// Extract payer (from) and payee (to)
			const from = transaction.from;
			const to = transaction.to;
			// Lookup existing buckets for both users
			const fromInBalancesMap = balancesMap.get(from);
			const toInBalancesMap = balancesMap.get(to);
			if (fromInBalancesMap && toInBalancesMap) {
				// Both users present; try to net out mutual gives/gets between them
				const fromInToBucketOfBalancesMap =
					toInBalancesMap.transactions.find((t) => t.user === from);
				const toInFromBucketOfBalancesMap =
					fromInBalancesMap.transactions.find((t) => t.user === to);
				if (
					fromInToBucketOfBalancesMap &&
					toInFromBucketOfBalancesMap
				) {
					const prevAmount = fromInToBucketOfBalancesMap.gives;
					const newAmount = transaction.paid + transaction.owed;
					if (prevAmount === newAmount) {
						// kick both from each others bucket
						toInBalancesMap.transactions =
							toInBalancesMap.transactions.filter(
								(t) => t.user !== from
							);
						fromInBalancesMap.transactions =
							fromInBalancesMap.transactions.filter(
								(t) => t.user !== to
							);
					} else if (prevAmount > newAmount) {
						fromInToBucketOfBalancesMap.gives =
							prevAmount - newAmount;
						toInFromBucketOfBalancesMap.gets =
							prevAmount - newAmount;
					} else {
						fromInToBucketOfBalancesMap.gives = 0;
						fromInToBucketOfBalancesMap.gets =
							newAmount - prevAmount;
						toInFromBucketOfBalancesMap.gives =
							newAmount - prevAmount;
						toInFromBucketOfBalancesMap.gets = 0;
					}
				} else {
					// No mutual entries; add fresh gives/gets entries for both directions
					fromInBalancesMap.transactions.push({
						user: to,
						gives: transaction.paid + transaction.owed,
						gets: 0,
					});
					toInBalancesMap.transactions.push({
						user: from,
						gives: 0,
						gets: transaction.paid + transaction.owed,
					});
				}
			} else if (fromInBalancesMap) {
				// Only 'from' present; append to 'from' and initialize 'to'
				fromInBalancesMap.transactions.push({
					user: to,
					gives: transaction.paid + transaction.owed,
					gets: 0,
				});
				balancesMap.set(to, {
					transactions: [
						{
							user: from,
							gives: 0,
							gets: transaction.paid + transaction.owed,
						},
					],
				});
			} else if (toInBalancesMap) {
				// Only 'to' present; append to 'to' and initialize 'from'
				toInBalancesMap.transactions.push({
					user: from,
					gives: 0,
					gets: transaction.paid + transaction.owed,
				});
				balancesMap.set(from, {
					transactions: [
						{
							user: to,
							gives: transaction.paid + transaction.owed,
							gets: 0,
						},
					],
				});
			} else {
				// Neither user present; initialize buckets for both with reciprocal entries
				balancesMap.set(from, {
					transactions: [
						{
							user: to,
							gives: transaction.paid + transaction.owed,
							gets: 0,
						},
					],
				});
				balancesMap.set(to, {
					transactions: [
						{
							user: from,
							gives: 0,
							gets: transaction.paid + transaction.owed,
						},
					],
				});
			}
		});
		// Convert balancesMap to final format with calculated net gives/gets and user details

		// For each user, compute totals and net values (gives vs gets)
		return Array.from(balancesMap, ([fromUser, fromUserObject]) => {
			const gives = fromUserObject.transactions
				.map((t: any) => t.gives)
				.reduce((a: number, b: number) => a + b, 0);
			const gets = fromUserObject.transactions
				.map((t: any) => t.gets)
				.reduce((a: number, b: number) => a + b, 0);
			const givesInTotal = gives > gets ? gives - gets : 0;
			const getsInTotal = gets > gives ? gets - gives : 0;
			return {
				user: fromUser,
				gives: givesInTotal,
				gets: getsInTotal,
				...fromUserObject,
			};
		})
			.filter((obj) => obj.gives > 0 || obj.gets > 0)
			.map((obj) => {
				// Populate final objects with user details and child transaction user details
				return {
					user: getNonNullValue(usersMap.get(obj.user)),
					gives: obj.gives,
					gets: obj.gets,
					transactions: obj.transactions.map((t) => {
						return {
							user: getNonNullValue(usersMap.get(t.user)),
							gives: t.gives,
							gets: t.gets,
						};
					}),
				};
			});
	}
	/**
	 * Generates a comprehensive financial summary for a group including expenditure, balances, and shares.
	 *
	 * What this returns:
	 * - expenditure: Total amount spent in the group (aggregate of expenses).
	 * - balances:
	 *   - owes: Result of getOwedBalances() — directed outstanding debts between members.
	 *   - balances: Result of getSummaryBalances() — net gives/gets view per member.
	 * - shares: Member-wise contributions as absolute amount, percentage, simplified fraction, and opacity.
	 *
	 * Why both owes and balances?
	 * - owes helps drive settlements (who should pay whom and how much, after netting).
	 * - balances offers a holistic view of who funded the group vs who benefited overall.
	 *
	 * Process:
	 * 1) Fetch expenditure and summarized pairwise transactions concurrently for performance.
	 * 2) Extract unique userIds involved (both as payers and payees) from the transactions.
	 * 3) Build usersMap: Map of userId -> IUser for decorating results with user details.
	 * 4) Compute balances.owes using getOwedBalances(transactions, usersMap).
	 * 5) Compute balances.balances using getSummaryBalances(transactions, usersMap).
	 * 6) Compute shares using getShares({ groupId, totalAmount: expenditure, usersMap }).
	 * 7) Return the consolidated object for client consumption.
	 */
	public static async getGroupSummary(groupId: string): Promise<{
		expenditure: number;
		balances: IBalancesSummary;
		shares: Array<IShare>;
	}> {
		// Fetch aggregated expenditure and summarized pairwise transactions concurrently for performance
		const [expenditure, allTransactionsForGroup] = await Promise.all([
			walletRepo.getTotalExpenditureForGroup(groupId),
			walletRepo.getAllTransactionsSummaryForGroup(groupId),
		]);
		// Extract unique member IDs from all transactions (both payers and payees)
		const membersIds = Array.from(
			new Set(
				allTransactionsForGroup
					.map((t) => t.from)
					.concat(allTransactionsForGroup.map((t) => t.to))
			)
		);
		// Build a convenient map of userId -> IUser for quick lookups while populating results
		const usersMap = await UserService.getUsersMapForUserIds(membersIds);
		// Compute both types of balances using helper functions (owes and net balances)
		const balances = {
			owes: WalletService.getOwedBalances(
				allTransactionsForGroup,
				usersMap
			),
			balances: WalletService.getSummaryBalances(
				allTransactionsForGroup,
				usersMap
			),
		};
		// Compute member-wise contribution shares for the group
		const shares = await WalletService.getShares({
			groupId,
			totalAmount: expenditure,
			usersMap,
		});
		// Return the consolidated group summary
		return { expenditure, balances, shares };
	}
	/**
	 * Retrieves all transactions for a group along with the total expenditure.
	 *
	 * Returns:
	 * - expenditure: Aggregate expense amount for the group.
	 * - transactions: Full list of transactions (not netted), useful for audit and reporting.
	 *
	 * Use cases:
	 * - Detailed reports and CSV exports.
	 * - Audit/reconciliation flows where raw entries are needed.
	 * - Debugging or validating summarized views.
	 *
	 * Performance:
	 * - Fetches expenditure and transactions concurrently to reduce latency.
	 */
	public static async getAllGroupTransactions(
		groupId: string
	): Promise<{ expenditure: number; transactions: Array<ITransaction> }> {
		// Fetch total expenditure and full list of transactions concurrently
		const [expenditure, transactions] = await Promise.all([
			walletRepo.getTotalExpenditureForGroup(groupId),
			walletRepo.getAllTransactionsForGroup(groupId),
		]);
		// Return raw transactions with the aggregate expenditure
		return { expenditure, transactions };
	}
	/**
	 * Calculates individual contribution shares for each group member with visual representations.
	 *
	 * Purpose:
	 * - Show how the total expenditure breaks down per user in multiple convenient formats for UI.
	 *
	 * Inputs:
	 * - groupId: Group identifier to fetch raw shares for each member.
	 * - totalAmount: Sum of all expenses in the group (used to compute percentages and fractions).
	 * - usersMap: Map<userId, IUser> to populate user details in the result.
	 *
	 * Output:
	 * - Array sorted by contribution amount (desc) with fields:
	 *   - user: IUser
	 *   - amount: number (absolute contribution)
	 *   - percentage: number (to 2 decimals), computed as (amount / totalAmount) * 100
	 *   - fraction: string, simplified fraction like "1/3" based on amount:totalAmount
	 *   - opacity: number in [0.3, 1.0], for chart emphasis based on contribution magnitude
	 *
	 * Detailed process:
	 * 1) Fetch raw per-user shares from the repository.
	 * 2) Compute min and max contribution to derive a range for visual opacity scaling.
	 * 3) Populate each share with user details, percentage, and simplified fraction.
	 * 4) Compute opacity using linear scaling: range==0 => 1 for all; else scale to [0.3, 1.0].
	 * 5) Sort by amount descending to highlight top contributors.
	 *
	 * Edge cases:
	 * - totalAmount === 0 will result in 0% and a fraction of 0/0 (simplifyFraction should handle gracefully per util).
	 * - All contributions equal => range === 0 -> opacity = 1 for everyone.
	 *
	 * Complexity:
	 * - Time: O(U log U) due to final sort (U = number of members), mapping steps are O(U).
	 */
	public static async getShares({
		groupId,
		totalAmount,
		usersMap,
	}: {
		groupId: string;
		totalAmount: number;
		usersMap: Map<string, IUser>;
	}): Promise<Array<IShare>> {
		// Fetch raw share data from repository
		const shares = await walletRepo.getSharesForGroup(groupId);

		// Calculate min/max amounts for opacity scaling in visual representations
		const max = Math.max(...shares.map((s) => s.amount));
		const min = Math.min(...shares.map((s) => s.amount));
		const range = max - min;
		// Populate shares with user details and calculated values
		const populatedShares = shares.map((share) => {
			return {
				user: getNonNullValue(usersMap.get(share.user)),
				amount: share.amount,
				// Calculate percentage contribution (rounded to 2 decimal places)
				percentage: +((share.amount / totalAmount) * 100).toFixed(2),
				// Generate simplified fraction representation for better readability
				fraction: simplifyFraction(
					`${share.amount.toFixed(2)}/${totalAmount}`
				),
			};
		});

		// Add opacity values for visual representation and sort by contribution amount
		return (
			populatedShares
				.map((share) => {
					return {
						user: share.user,
						amount: share.amount,
						percentage: share.percentage,
						fraction: share.fraction,
						// Calculate opacity for visual charts (0.3 to 1.0 scale)
						// Higher contributors get higher opacity for better visual emphasis
						opacity:
							range === 0 // If all contributions are equal
								? 1 // Set full opacity for everyone
								: ((share.amount - min) / range) * 0.7 + 0.3, // Scale from 0.3 to 1.0
					};
				})
				// Sort by contribution amount (highest contributors first)
				.sort((a, b) => b.amount - a.amount)
		);
	}
}
