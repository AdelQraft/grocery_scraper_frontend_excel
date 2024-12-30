import * as querystring from "node:querystring";

const axios = require("axios")
const refreshPeriod_s = require("../taskpane/taskpane").refreshPeriod_s;

const ExcelFunctionError  = {
	VALUE_ERROR: new CustomFunctions.Error(CustomFunctions.ErrorCode.invalidValue),
	NOT_AVAILABLE: new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable)
}

const superMarketNameToDefaultLocale = {
	"metro-canada": "en-CA"
}

const INFO_PARAM_ALLOWED_VALUES = new Set(["price", "protein-mass", "energy", "url"])
function singleInfoIsValid(singleInfo: string) {
	return singleInfo in INFO_PARAM_ALLOWED_VALUES;
}

/**
 * Retrieve the price for the first item matching a search query given a supermarket name
 * @customfunction
 * @param superMarketName The name of the supermarket. Valid-values are: metro-canada.
 * @param searchQuery The search query.
 * @param quantity The quantity of the product.
 * @param quantityUnits The units of the quantity of the product (1, m, L and their multiples).
 * @param [infoToRetrieve] The information to retrieve, comma-separated, in order. Valid values are: price, protein-mass, energy, url. Price is in supermarket's currency. Protein mass and energy are always given in grams and food calories respectively.
 * @param [localeName] The standard locale name for the search query.
 * @param [makePriceNegative] Make the price negative.
 * @param invocation The custom function handler.
 * @returns Information about the product in the specified information order.
 */
export function getInfo(
	superMarketName: string,
	searchQuery: string,
	quantity: number,
	quantityUnits: string,
	infoToRetrieve: string,
	localeName: string,
	makePriceNegative: boolean,
	invocation: CustomFunctions.StreamingInvocation<number[][]>
): void {
	superMarketName = superMarketName.toLowerCase();
	searchQuery = searchQuery.toLowerCase();
	infoToRetrieve = infoToRetrieve?.toLowerCase();
	localeName = localeName?.toLowerCase();

	if (localeName == null) localeName = superMarketNameToDefaultLocale[superMarketName];

	// abort if the current supermarket name is valid (known)
	if (!(superMarketName in superMarketNameToDefaultLocale)) {
		invocation.setResult(ExcelFunctionError.VALUE_ERROR);
		return;
	}

	let infoToRetrieveSplit: string[];
	let reqParams = new URLSearchParams();
	reqParams.append("supermarket-name", superMarketName);
	if (infoToRetrieve == null) {
		infoToRetrieveSplit = ["price", "protein-mass", "energy", "url"];
		reqParams.append("info", "price");
		reqParams.append("info", "protein-mass-g");
		reqParams.append("info", "energy-Cal");
		reqParams.append("info", "url");
	} else {
		infoToRetrieveSplit = infoToRetrieve.split(",");
		for (const singleInfo in infoToRetrieveSplit) {
			if (!singleInfoIsValid(singleInfo)) {
				invocation.setResult(ExcelFunctionError.VALUE_ERROR);
				return;
			}
			reqParams.append("info", singleInfo);
		}
	}
	reqParams.append("search-query", searchQuery);

	if (makePriceNegative == null) makePriceNegative = false;

	let timeoutID: NodeJS.Timeout;
	(function callApi() {
		axios.get(process.env.BACKEND_URL, reqParams)
			.then((r) => {
				const info: ProductInfo = r.data;
				invocation.setResult([
					infoToRetrieveSplit.map((infoName) => {
						let singleInfo = info[infoName];
						if (infoName === "price" && makePriceNegative) singleInfo *= -1;
						return singleInfo;
					})
				]);
			})
			.catch(() => {
				invocation.setResult(ExcelFunctionError.NOT_AVAILABLE);
				return;
			})

		timeoutID = setTimeout(callApi, 1000 * refreshPeriod_s());
	})();

	invocation.onCanceled = () => {
		clearTimeout(timeoutID);
	};
}
