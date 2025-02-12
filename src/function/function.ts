import {Functions} from "./functions";
import {waitUntil} from "../utility";

async function waitUntilEnvironmentIsLoaded() {
	await waitUntil(() => !!Functions.instance.itemEndpointUrl)
}

// noinspection JSUnusedGlobalSymbols
/**
 * Retrieve the price for the first item matching a search query given a store name
 * @customfunction
 * @param url The URL of the product, from a known supermarket.
 * @param refQuantity The (reference) quantity of the product, possibly with its units. Standard units apply. standard multipliers are denoted by square brackets.
 * @param refQuantityKind The kind of the (reference) quantity. Valid values are: price-in-local-currency, count, mass, volume, protein-mass, energy.
 * @param [nutritionFactsFallbackSearchQuery] The search query for the nutrition facts if they are not found after looking up with the item code.
 * @param [massToVolumeRatio] The ratio of mass to volume with its units. Standard units apply. standard multipliers are denoted by square brackets.
 * @param [massToCountRatio] The ratio of mass to count with its units. Standard units apply. standard multipliers are denoted by square brackets.
 * @param [infoToRetrieve] The information to retrieve, comma-separated, in order. Valid values are: price-in-local-currency-slc, count-id, mass-g, volume-L, protein-mass-g, energy-Cal.
 * @param [makePriceNegative] Make the price negative.
 * @param invocation The custom function handler.
 * @returns Information about the product in the specified information order.
 */
export function getInfoFromUrl(
	url: string,
	refQuantity: string,
	refQuantityKind: string,
	nutritionFactsFallbackSearchQuery: string,
	massToCountRatio: string,
	massToVolumeRatio: string,
	infoToRetrieve: string,
	makePriceNegative: boolean,
	invocation: CustomFunctions.StreamingInvocation<number[][]>
): void {
	waitUntilEnvironmentIsLoaded().then(() => {
		Functions.instance.getInfoFromUrl(
			url,
			refQuantity,
			refQuantityKind,
			nutritionFactsFallbackSearchQuery,
			massToCountRatio,
			massToVolumeRatio,
			infoToRetrieve,
			makePriceNegative,
			invocation
		)
	})
}
