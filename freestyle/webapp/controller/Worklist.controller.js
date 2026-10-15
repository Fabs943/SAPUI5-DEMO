sap.ui.define([
    "./BaseController",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/Token",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"
], function (BaseController, formatter, Filter, FilterOperator, Sorter, Token, Spreadsheet, exportLibrary) {
    "use strict";

    var EdmType = exportLibrary.EdmType;

    return BaseController.extend("demo.orders.freestyle.controller.Worklist", {
        formatter: formatter,

        /* =========================================================== */
        /* Tabelle                                                     */
        /* =========================================================== */

        onUpdateFinished: function (oEvent) {
            var iTotal = oEvent.getParameter("total");
            var oBinding = oEvent.getSource().getBinding("items");
            var sTitle = (iTotal !== undefined && oBinding.isLengthFinal())
                ? this.getText("worklistTableTitle", [iTotal])
                : this.getText("worklistTableTitleNoCount");
            this.byId("tableHeader").setText(sTitle);
        },

        onPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            this.getRouter().navTo("detail", {
                orderId: oContext.getProperty("OrderID")
            });
        },

        /* =========================================================== */
        /* Filter                                                      */
        /* =========================================================== */

        onSearch: function () {
            var aFilters = [];

            var aCustomerIds = this.byId("customerFilter").getTokens().map(function (oToken) {
                return oToken.getKey();
            });
            if (aCustomerIds.length) {
                aFilters.push(new Filter({
                    filters: aCustomerIds.map(function (sId) {
                        return new Filter("CustomerID", FilterOperator.EQ, sId);
                    }),
                    and: false
                }));
            }

            var sCountry = this.byId("countryFilter").getValue().trim();
            if (sCountry) {
                aFilters.push(new Filter({
                    path: "ShipCountry",
                    operator: FilterOperator.Contains,
                    value1: sCountry,
                    caseSensitive: false
                }));
            }

            var oDateRange = this.byId("orderDateFilter");
            var oFrom = oDateRange.getDateValue();
            var oTo = oDateRange.getSecondDateValue();
            if (oFrom && oTo) {
                // Bis-Datum inklusive: bis zum Ende des Tages filtern
                var oToEndOfDay = new Date(oTo.getTime());
                oToEndOfDay.setHours(23, 59, 59, 999);
                aFilters.push(new Filter("OrderDate", FilterOperator.BT, oFrom.toISOString(), oToEndOfDay.toISOString()));
            }

            this.byId("ordersTable").getBinding("items").filter(aFilters);
        },

        onResetFilters: function () {
            this.byId("customerFilter").removeAllTokens();
            this.byId("countryFilter").setValue("");
            this.byId("orderDateFilter").setValue("");
            this.onSearch();
        },

        /* =========================================================== */
        /* Wertehilfe Kunde                                            */
        /* =========================================================== */

        onCustomerValueHelp: function () {
            if (!this._pCustomerValueHelp) {
                this._pCustomerValueHelp = this.loadFragment({
                    name: "demo.orders.freestyle.view.fragment.CustomerValueHelp"
                });
            }
            this._pCustomerValueHelp.then(function (oDialog) {
                oDialog.getBinding("items").filter([]);
                oDialog.open();
            });
        },

        onCustomerValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var aFilters = sValue ? [new Filter({
                filters: [
                    new Filter({ path: "CompanyName", operator: FilterOperator.Contains, value1: sValue, caseSensitive: false }),
                    new Filter({ path: "CustomerID", operator: FilterOperator.Contains, value1: sValue, caseSensitive: false })
                ],
                and: false
            })] : [];
            oEvent.getSource().getBinding("items").filter(aFilters);
        },

        onCustomerValueHelpConfirm: function (oEvent) {
            var oMultiInput = this.byId("customerFilter");
            oMultiInput.removeAllTokens();
            (oEvent.getParameter("selectedItems") || []).forEach(function (oItem) {
                var oContext = oItem.getBindingContext();
                oMultiInput.addToken(new Token({
                    key: oContext.getProperty("CustomerID"),
                    text: oContext.getProperty("CompanyName")
                }));
            });
        },

        /* =========================================================== */
        /* Sortierung                                                  */
        /* =========================================================== */

        onOpenSortDialog: function () {
            if (!this._pSortDialog) {
                this._pSortDialog = this.loadFragment({
                    name: "demo.orders.freestyle.view.fragment.SortDialog"
                });
            }
            this._pSortDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onSortConfirm: function (oEvent) {
            var oSortItem = oEvent.getParameter("sortItem");
            var bDescending = oEvent.getParameter("sortDescending");
            this.byId("ordersTable").getBinding("items").sort(
                new Sorter(oSortItem.getKey(), bDescending)
            );
        },

        /* =========================================================== */
        /* Excel-Export                                                */
        /* =========================================================== */

        onExport: function () {
            var oSheet = new Spreadsheet({
                workbook: {
                    columns: [
                        { label: this.getText("colOrderID"), property: "OrderID", type: EdmType.Number },
                        { label: this.getText("colCustomer"), property: "CustomerID", type: EdmType.String },
                        { label: this.getText("colOrderDate"), property: "OrderDate", type: EdmType.DateTime },
                        { label: this.getText("colShippedDate"), property: "ShippedDate", type: EdmType.DateTime },
                        { label: this.getText("colShipCity"), property: "ShipCity", type: EdmType.String },
                        { label: this.getText("colShipCountry"), property: "ShipCountry", type: EdmType.String },
                        { label: this.getText("colFreight"), property: "Freight", type: EdmType.Number, scale: 2 }
                    ]
                },
                dataSource: this.byId("ordersTable").getBinding("items"),
                fileName: this.getText("exportFileName")
            });
            oSheet.build().finally(function () {
                oSheet.destroy();
            });
        }
    });
});
