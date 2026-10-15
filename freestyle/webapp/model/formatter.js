sap.ui.define([], function () {
    "use strict";

    return {
        /**
         * "Firma (ID)" - entspricht der Text-Anordnung "TextFirst" aus Fiori Elements
         */
        textWithId: function (sText, sId) {
            if (!sId) {
                return "";
            }
            return sText ? sText + " (" + sId + ")" : sId;
        }
    };
});
