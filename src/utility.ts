export function waitUntil(isOk: () => boolean, timeout_ms: number = 100) {
	function poll(resolve: () => void) {
		if (isOk()) resolve()
		else setTimeout(() => poll(resolve), timeout_ms)
	}

	return new Promise(poll as (value: unknown) => void)
}
