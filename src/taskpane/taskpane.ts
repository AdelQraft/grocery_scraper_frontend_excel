import {Functions} from "../function/functions";
import {Environment} from "../environment";

const DEFAULT_REFRESH_PERIOD_s = 600
const DEFAULT_RETRY_PERIOD_ms = 20000

let _refreshPeriodTextField: HTMLInputElement
let _saveRefreshPeriodToWBChkBx: HTMLInputElement

Office.onReady(async () => {
	await Office.addin.setStartupBehavior(Office.StartupBehavior.load)

	_refreshPeriodTextField = <HTMLInputElement>document.getElementById("refresh-period-txt-field")
	_saveRefreshPeriodToWBChkBx = <HTMLInputElement>document.getElementById("save-refresh-period-to-wb-chk-bx")

	await Office.addin.onVisibilityModeChanged(loadGroceryScraperRefreshPeriodIfNeeded)
	_refreshPeriodTextField.onchange = onRefreshPeriodTextFieldChangeOrSaveRefreshPeriodToWBChkBxChange
	_saveRefreshPeriodToWBChkBx.onchange = onRefreshPeriodTextFieldChangeOrSaveRefreshPeriodToWBChkBxChange

	await Environment.getInstancePromise().then((env) => {
		Functions.instance.backendUrl = env.backendUrl
	})
	Functions.instance.refreshPeriod_ms = () => 1000 * parseInt(_refreshPeriodTextField.value)
	Functions.instance.retryPeriod_ms = () => DEFAULT_RETRY_PERIOD_ms

	await Excel.run(async () => {
		const exists = await excelLoadGroceryScraperRefreshPeriod()
		if (!exists) _refreshPeriodTextField.value = DEFAULT_REFRESH_PERIOD_s.toString()
	})
})

async function onRefreshPeriodTextFieldChangeOrSaveRefreshPeriodToWBChkBxChange() {
	await Excel.run(async () => {
		if (_saveRefreshPeriodToWBChkBx.checked) {
			Office.context.document.settings.set(
				"groceryScraperRefreshPeriod",
				_refreshPeriodTextField.value !== null && _refreshPeriodTextField.value !== undefined
					? parseInt(_refreshPeriodTextField.value)
					: 0
			)
		} else {
			Office.context.document.settings.remove("groceryScraperRefreshPeriod")
		}
		Office.context.document.settings.saveAsync()
	})
}

async function loadGroceryScraperRefreshPeriodIfNeeded(
	msg: Office.VisibilityModeChangedMessage
) {
	await Excel.run(async () => {
		if (msg.visibilityMode == "Taskpane") {
			await excelLoadGroceryScraperRefreshPeriod()
		}
	})
}

async function excelLoadGroceryScraperRefreshPeriod(): Promise<Boolean> {
	const refreshPeriod_s = Office.context.document.settings.get("groceryScraperRefreshPeriod")
	const exists = refreshPeriod_s !== null
	if (exists) {
		_refreshPeriodTextField.value = refreshPeriod_s
		_saveRefreshPeriodToWBChkBx.checked = true
	}
	return exists
}
