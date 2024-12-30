const DEFAULT_REFRESH_PERIOD_S = 600

let refreshPeriodTextField: HTMLInputElement;
let saveRefreshPeriodToWBChkBx: HTMLInputElement;

function refreshPeriod_s() {
	return refreshPeriodTextField.value;
}

module.exports = { refreshPeriod_s };

Office.onReady(() => {
	refreshPeriodTextField = <HTMLInputElement>document.getElementById("refresh-period-txt-field");
	saveRefreshPeriodToWBChkBx = <HTMLInputElement>document.getElementById("save-refresh-period-to-wb-chk-bx");

	Excel.run(async (_) => {
		const exists = await excelLoadGroceryScraperRefreshPeriod();
		if (!exists) refreshPeriodTextField.value = String(DEFAULT_REFRESH_PERIOD_S);
	});
});

Office.addin.setStartupBehavior(Office.StartupBehavior.load);

async function excelLoadGroceryScraperRefreshPeriod(): Promise<Boolean> {
	const refreshPeriod_s = Office.context.document.settings.get("groceryScraperRefreshPeriod");
	const exists = refreshPeriod_s !== null;
	if (exists) {
		refreshPeriodTextField.value = refreshPeriod_s;
		saveRefreshPeriodToWBChkBx.checked = true;
	}
	return exists;
}

Office.addin.onVisibilityModeChanged(async (msg: Office.VisibilityModeChangedMessage) => {
	await Excel.run(async (_) => {
		if (msg.visibilityMode == "Taskpane") {
			await excelLoadGroceryScraperRefreshPeriod()
		} else {
			if (saveRefreshPeriodToWBChkBx.checked) {
				Office.context.document.settings.set(
					"groceryScraperRefreshPeriod",
					refreshPeriodTextField.value !== null && refreshPeriodTextField.value !== undefined
						? Number(refreshPeriodTextField.value)
						: 0
				);
			} else {
				Office.context.document.settings.remove("groceryScraperRefreshPeriod");
			}
			Office.context.document.settings.saveAsync()
		}
	});
});
