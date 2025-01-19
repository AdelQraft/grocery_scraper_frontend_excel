import {ProductInfo} from "./product_info";

const axios = require("axios")
const refreshPeriod_s = require("../taskpane/taskpane").refreshPeriod_s;

const ITEM_ENDPOINT_URL = process.env.BACKEND_URL + "/v1/item"

const ExcelFunctionError  = {
	VALUE_ERROR: new CustomFunctions.Error(CustomFunctions.ErrorCode.invalidValue),
	NOT_AVAILABLE: new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable)
}

const storeNameToDefaultLocale = {
	"metro-canada": "en-CA"
}

const hostnameToStoreName = {
	"metro.ca": "metro-canada",
	"www.metro.ca": "metro-canada"
}

const INFO_PARAM_NAME_ALLOWED_VALUES = new Set(["name", "url", "price-in-local-currency-slc", "count-id", "mass-g", "volume-L", "protein-mass-g", "energy-Cal"])
function singleInfoIsValid(singleInfo: string) {
	return INFO_PARAM_NAME_ALLOWED_VALUES.has(singleInfo);
}

// noinspection JSUnusedGlobalSymbols
/**
 * Retrieve the price for the first item matching a search query given a store name
 * @customfunction
 * @param url The URL of the product, from a known store.
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
	let hostname = new URL(url).hostname
	if (hostname == null) {
		invocation.setResult(ExcelFunctionError.VALUE_ERROR);
		return
	}

	let infoToRetrieveSplit: string[];
	let reqParams = new URLSearchParams();
	reqParams.append("url", url);
	if (massToCountRatio) reqParams.append("mass-to-count-ratio", massToCountRatio)
	if (massToVolumeRatio) reqParams.append("mass-to-volume-ratio", massToVolumeRatio)
	if (infoToRetrieve) {
		infoToRetrieveSplit = infoToRetrieve.split(",").map((value) => { return value.trim() });
		for (const singleInfo of infoToRetrieveSplit) {
			if (!singleInfoIsValid(singleInfo)) {
				invocation.setResult(ExcelFunctionError.VALUE_ERROR);
				return;
			}

			reqParams.append("info", singleInfo);
		}
	} else {
		infoToRetrieveSplit = [
			"price-in-local-currency-slc",
			"protein-mass-g",
			"energy-Cal",
		];
		for (const singleInfo of infoToRetrieveSplit) {
			reqParams.append("info", singleInfo)
		}

	}
	reqParams.append(refQuantityKind, refQuantity)

	if (makePriceNegative == null) makePriceNegative = false;

	let timeoutID: NodeJS.Timeout;
	(function callApi() {
		axios.get(
			ITEM_ENDPOINT_URL + '?' + reqParams.toString(),
			{
				timeout: 0
			},
		)
			.then((resp: { data: any; }) => {
				const info = new ProductInfo(resp.data);
				invocation.setResult([infoToRetrieveSplit.map((infoName) => {
					let singleInfo = info.getQuantitativeProperty(infoName).valueOf();
					if (infoName === "price-in-local-currency-slc" && makePriceNegative) singleInfo *= -1;

					return singleInfo;
				})]);
			})
			.catch((err) => {
				if (err.response) {
					if (err.response.status === 400 /* bad request */) {
						invocation.setResult(ExcelFunctionError.VALUE_ERROR);
					}
				} else {
					invocation.setResult(ExcelFunctionError.NOT_AVAILABLE);
				}

				return;
			})

		timeoutID = setTimeout(callApi, 1000 * refreshPeriod_s());
	})();

	invocation.onCanceled = () => {
		clearTimeout(timeoutID);
	};
}
