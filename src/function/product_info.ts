export class ProductInfo {
	name: string
	url: string
	priceInLocalCurrency_slc: number
	count_id: number
	mass_g: number
	volume_L: number
	proteinMass_g: number
	energy_Cal: number

	constructor(src: any) {
		Object.assign(this, src)
	}

	getQuantitativeProperty(repr: string): number {
		switch (repr) {
			case "price-in-local-currency-slc": return this.priceInLocalCurrency_slc
			case "count-id": return this.count_id
			case "mass-g": return this.mass_g
			case "volume-L": return this.volume_L
			case "protein-mass-g": return this.proteinMass_g
			case "energy-Cal": return this.energy_Cal
			default: throw new Error(`don't know how to parse \"${repr}\"`)
		}
	}
}
