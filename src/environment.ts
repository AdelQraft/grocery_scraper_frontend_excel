import axios from "axios"

export class Environment {
	private static _instance: Environment;

	readonly backendUrl: string;

	private constructor(obj: any) {
		Object.assign(this, obj)
	}

	static async getInstancePromise(): Promise<Environment> {
		if (!this._instance) {
			// @ts-ignore
			await axios.get(ENVIRONMENT_DEFINITION_URL).then((resp: { data: any; }) => {
				this._instance = new Environment(resp.data)
			})
		}

		return Environment._instance
	}
}
