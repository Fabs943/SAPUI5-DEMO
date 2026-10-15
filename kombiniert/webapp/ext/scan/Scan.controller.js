sap.ui.define([
    "sap/fe/core/PageController"
], function (PageController) {
    "use strict";

    return PageController.extend("demo.orders.combined.ext.scan.Scan", {
        onInit: function () {
            PageController.prototype.onInit.apply(this, arguments);
            // Die Seite selbst ist an keine Bestellung gebunden: Vererbung des Seitenkontexts unterbrechen
            this.byId("orderPanel").setBindingContext(null);
        },

        // Wird von Fiori Elements aufgerufen, sobald die Seite fertig ist: Fokus ins Scan-Feld
        onPageReady: function () {
            this._focusScanInput();
        },

        onScan: function () {
            var oPanel = this.byId("orderPanel");
            var sOrderId = this.byId("scanInput").getValue().trim();

            if (!/^\d+$/.test(sOrderId)) {
                this._showMessage(this._getText("scanInvalid"), "Warning");
                return;
            }

            var oBinding = this.getAppComponent().getModel().bindContext("/Orders(" + sOrderId + ")", null, {
                $expand: "Customer($select=CompanyName)"
            });
            this.getView().setBusy(true);
            oBinding.getBoundContext().requestObject().then(function () {
                if (this._oOrderBinding) {
                    this._oOrderBinding.destroy();
                }
                this._oOrderBinding = oBinding;
                oPanel.setBindingContext(oBinding.getBoundContext());
                oPanel.setVisible(true);
                this._showMessage(this._getText("scanFound", [sOrderId]), "Success");
            }.bind(this)).catch(function () {
                oBinding.destroy();
                oPanel.setVisible(false);
                this._showMessage(this._getText("scanNotFound", [sOrderId]), "Error");
                this._focusScanInput();
            }.bind(this)).finally(function () {
                this.getView().setBusy(false);
            }.bind(this));
        },

        onNext: function () {
            this.byId("orderPanel").setVisible(false);
            this.byId("scanMessage").setVisible(false);
            this.byId("scanInput").setValue("");
            this._focusScanInput();
        },

        onOpenDetails: function () {
            // Zurück in den Fiori-Elements-Teil derselben App: Object Page der Bestellung
            this.routing.navigate(this.byId("orderPanel").getBindingContext());
        },

        onBackToList: function () {
            this.routing.navigateToRoute("OrdersList");
        },

        _showMessage: function (sText, sType) {
            var oMessage = this.byId("scanMessage");
            oMessage.setText(sText);
            oMessage.setType(sType);
            oMessage.setVisible(true);
        },

        _focusScanInput: function () {
            var oInput = this.byId("scanInput");
            setTimeout(function () {
                oInput.focus();
            }, 300);
        },

        _getText: function (sKey, aArgs) {
            return this.getAppComponent().getModel("i18n").getResourceBundle().getText(sKey, aArgs);
        }
    });
});
