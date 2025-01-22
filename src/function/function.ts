import {Functions} from "./functions";

// noinspection JSUnusedGlobalSymbols
/**
 * Retrieve the price for the first item matching a search query given a store name
 * @customfunction
 * @param url The URL of the product, from a known supermarket.
 * @param refQuantity The (reference) quantity of the product, possibly with its units. Standard units apply. standard multipliers are denoted by square brackets.
 * @param refQuantityKind The kind of the (reference) quantity. Valid values are: price-in-local-currency, count, mass, volume, protein-mass, energy.
 * @param [infoToRetrieve] The information to retrieve, comma-separated, in order. Valid values are: price-in-local-currency-slc, count-id, mass-g, volume-L, protein-mass-g, energy-Cal.
 * @param [massToVolumeRatio] The ratio of mass to volume with its units. Standard units apply. standard multipliers are denoted by square brackets.
 * @param [massToCountRatio] The ratio of mass to count with its units. Standard units apply. standard multipliers are denoted by square brackets.
 * @param [makePriceNegative] Make the price negative.
 * @param invocation The custom function handler.
 * @returns Information about the product in the specified information order.
 */
export function getInfoFromUrl(
	url: string,
	refQuantity: string,
	refQuantityKind: string,
	massToCountRatio: string,
	massToVolumeRatio: string,
	infoToRetrieve: string,
	makePriceNegative: boolean,
	invocation: CustomFunctions.StreamingInvocation<number[][]>
): void {
	Functions.instance.getInfoFromUrl(
		url,
		refQuantity,
		refQuantityKind,
		massToCountRatio,
		massToVolumeRatio,
		infoToRetrieve,
		makePriceNegative,
		invocation
	)
}
