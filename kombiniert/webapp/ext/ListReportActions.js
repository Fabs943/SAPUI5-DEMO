sap.ui.define([], function () {
    "use strict";

    // Eigene Aktion im List Report (Fiori Elements) -> springt auf die Freestyle-Seite derselben App
    return {
        openScanMode: function () {
            this.routing.navigateToRoute("ScanPage");
        }
    };
});
