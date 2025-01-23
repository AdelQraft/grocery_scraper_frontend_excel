import axios from "axios"

export class Environment {
	private static _instance: Environment;

	readonly backendUrl: string;

	private constructor(obj: any) {
		Object.assign(this, obj)
	}

	static async getInstancePromise(): Promise<Environment> {
		// @ts-ignore
		console.log(ENVIRONMENT_DEFINITION_URL)
		if (!this._instance) {
			// @ts-ignore
			await axios.get(ENVIRONMENT_DEFINITION_URL).then((resp: { data: any; }) => {
				console.log(resp.data)
				this._instance = new Environment(resp.data)
			})
		}

		return Environment._instance
	}
}
