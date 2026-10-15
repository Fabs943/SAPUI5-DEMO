sap.ui.define([
    "./BaseController",
    "../model/formatter"
], function (BaseController, formatter) {
    "use strict";

    return BaseController.extend("demo.orders.freestyle.controller.Detail", {
        formatter: formatter,

        onInit: function () {
            this.getRouter().getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sOrderId = oEvent.getParameter("arguments").orderId;
            var oView = this.getView();

            oView.bindElement({
                path: "/Orders(" + encodeURIComponent(sOrderId) + ")",
                parameters: {
                    $expand: "Customer($select=CompanyName,ContactName)"
                },
                events: {
                    dataRequested: function () {
                        oView.setBusy(true);
                    },
                    dataReceived: function (oDataEvent) {
                        oView.setBusy(false);
                        // Bestellung existiert nicht -> "Nicht gefunden" anzeigen
                        if (oDataEvent.getParameter("error") || !oView.getBindingContext()) {
                            this.getRouter().getTargets().display("notFound");
                        }
                    }.bind(this)
                }
            });
        },

        onItemsUpdateFinished: function (oEvent) {
            var iTotal = oEvent.getParameter("total");
            this.byId("itemsTableHeader").setText(this.getText("itemsTableTitle", [iTotal]));
        }
    });
});
