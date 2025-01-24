import {ProductInfo} from "./product_info";

import axios from "axios"

export class Functions {
	private static _ExcelFunctionError: {
		INVALID_VALUE: CustomFunctions.Error
		NOT_AVAILABLE: CustomFunctions.Error
	}

	/*
	const STORE_NAME_TO_DEFAULT_LOCALE_NAME = {
		"metro-canada": "en-CA"
	}

	const HOSTNAME_TO_STORE_NAME = {
		"metro.ca": "metro-canada",
		"www.metro.ca": "metro-canada"
	}
	*/

	private static _instance: Functions

	private _itemEndpointUrl: string

	private constructor() {
		Functions._ExcelFunctionError = {
			INVALID_VALUE: new CustomFunctions.Error(CustomFunctions.ErrorCode.invalidValue),
			NOT_AVAILABLE: new CustomFunctions.Error(CustomFunctions.ErrorCode.notAvailable)
		}
	}

	static get instance() {
		if (!Functions._instance) Functions._instance = new Functions()

		return Functions._instance
	}

	refreshPeriod_s: () => number

	get itemEndpointUrl(): string {
		return this._itemEndpointUrl
	}

	set backendUrl(url: string) {
		this._itemEndpointUrl = url + "/v1/item"
	}

	getInfoFromUrl(
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
			invocation.setResult(Functions._ExcelFunctionError.INVALID_VALUE)
			return
		}

		let infoToRetrieveSplit: string[]
		let reqParams = new URLSearchParams()
		reqParams.append("url", url)
		if (massToCountRatio) reqParams.append("mass-to-count-ratio", massToCountRatio)
		if (massToVolumeRatio) reqParams.append("mass-to-volume-ratio", massToVolumeRatio)
		if (infoToRetrieve) {
			infoToRetrieveSplit = infoToRetrieve.split(",").map((value) => { return value.trim() })
		} else {
			infoToRetrieveSplit = [
				"price-in-local-currency-slc",
				"protein-mass-g",
				"energy-Cal",
			]
		}
		for (const singleInfo of infoToRetrieveSplit) {
			reqParams.append("info", singleInfo)
		}
		reqParams.append(refQuantityKind, refQuantity)

		if (makePriceNegative == null) makePriceNegative = false

		let timeoutID: NodeJS.Timeout
		let that = this;
		(function callApi() {
			axios.get(that._itemEndpointUrl + '?' + reqParams.toString(), { timeout: 0 })
				.then((resp: { data: any }) => {
					const info = new ProductInfo(resp.data)
					invocation.setResult([infoToRetrieveSplit.map((infoName) => {
						let singleInfo = info.getQuantitativeProperty(infoName).valueOf()
						if (infoName === "price-in-local-currency-slc" && makePriceNegative) singleInfo *= -1

						return singleInfo
					})])
				})
				.catch((err) => {
					if (err.response && err.response.status === 400 /* bad request */) {
						invocation.setResult(Functions._ExcelFunctionError.INVALID_VALUE)
					} else {
						invocation.setResult(Functions._ExcelFunctionError.NOT_AVAILABLE)
					}

					return
				})

			timeoutID = setTimeout(callApi, 1000 * that.refreshPeriod_s())
		})()

		invocation.onCanceled = () => {
			clearTimeout(timeoutID)
		}
	}
}
