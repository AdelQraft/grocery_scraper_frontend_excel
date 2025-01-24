"use strict";
(self["webpackChunkgrocery_scraper_frontend_excel"] = self["webpackChunkgrocery_scraper_frontend_excel"] || []).push([["functions"],{

/***/ "./src/function/function.ts":
/*!**********************************!*\
  !*** ./src/function/function.ts ***!
  \**********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getInfoFromUrl: function() { return /* binding */ getInfoFromUrl; }
/* harmony export */ });
/* harmony import */ var _functions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./functions */ "./src/function/functions.ts");


// noinspection JSUnusedGlobalSymbols
/**
 * Retrieve the price for the first item matching a search query given a store name
 * @customfunction
 * @param url The URL of the product, from a known supermarket.
 * @param refQuantity The (reference) quantity of the product, possibly with its units. Standard units apply. standard multipliers are denoted by square brackets.
 * @param refQuantityKind The kind of the (reference) quantity. Valid values are: price-in-local-currency, count, mass, volume, protein-mass, energy.
 * @param [infoToRetrieve] The information to retrieve, comma-separated, in order. Valid values are: price-in-local-currency-slc, count-id, mass-g, volume-L, protein-mass-g, energy-Cal.
 * @param [massToVolumeRatio] The ratio of mass to volume with its units. Standard units apply. standard multipliers are denoted by square brackets.
 * @param [massToCountRatio] The ratio of mass to count with its units. Standard units apply. standard multipliers are denoted by square brackets.
 * @param [makePriceNegative] Make the price negative.
 * @param invocation The custom function handler.
 * @returns Information about the product in the specified information order.
 */
function getInfoFromUrl(url, refQuantity, refQuantityKind, massToCountRatio, massToVolumeRatio, infoToRetrieve, makePriceNegative, invocation) {
  _functions__WEBPACK_IMPORTED_MODULE_0__.Functions.instance.getInfoFromUrl(url, refQuantity, refQuantityKind, massToCountRatio, massToVolumeRatio, infoToRetrieve, makePriceNegative, invocation);
}
CustomFunctions.associate("GETINFOFROMURL", getInfoFromUrl);

/***/ })

},
/******/ function(__webpack_require__) { // webpackRuntimeModules
/******/ var __webpack_exec__ = function(moduleId) { return __webpack_require__(__webpack_require__.s = moduleId); }
/******/ var __webpack_exports__ = (__webpack_exec__("./src/function/function.ts"));
/******/ }
]);
//# sourceMappingURL=functions.js.map