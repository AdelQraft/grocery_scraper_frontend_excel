export class ProductInfo {
	name: String
	url: String
	priceInLocalCurrency_slc: Number
	count_id: Number
	mass_g: Number
	volume_L: Number
	proteinMass_g: Number
	energy_Cal: Number

	constructor(src: any) {
		Object.assign(this, src)
	}

	getQuantitativeProperty(repr: String): Number {
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
