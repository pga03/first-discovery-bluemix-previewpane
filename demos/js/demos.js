/*

Copyright 2015 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://raw.githubusercontent.com/GPII/first-discovery/master/LICENSE.txt
*/

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("demo.firstDiscovery");


    demo.firstDiscovery.prefsServerUrl = {
        production: "http://preferences.mybluemix.net/",
        development: "http://localhost:8081/"
    };

    demo.firstDiscovery.isDevMode = function () {
        var queryString = document.URL.split("?")[1] || ""; // gets the query string
        var params = {};
        fluid.each(queryString.split("&"), function (paramString) {
            var param = paramString.split("=");
            params[param[0]] = param[1];
        });
        return (params.mode === "dev");
    };

    demo.firstDiscovery.init = function (container, auxSchemaGrade, cookieName) {
        container = $(container);
        var unsupportedText = "This browser is currently not supported. Please try using the latest version of Chrome or Safari.";

        if (fluid.textToSpeech.isSupported()) {
            fluid.prefs.create(container, {
                build: {
                    gradeNames: ["gpii.firstDiscovery.auxSchema.prefsServerIntegration"]
                }
            });
        } else {
            container.text(unsupportedText);
        }
    };

    fluid.defaults("demo.firstDiscovery", {
        storeType: "gpii.prefs.gpiiSettingsStore",
        store: {
            url: demo.firstDiscovery.isDevMode() ? demo.firstDiscovery.prefsServerUrl.development : demo.firstDiscovery.prefsServerUrl.production
        }
    });

    /*
     * Create a UI Enhancer and add it to the page
     */
    demo.firstDiscovery.addUIE = function (container, options) {
        fluid.prefs.builder({
            gradeNames: [options.auxSchemaName],
            primarySchema: gpii.firstDiscovery.schemas
        });
        gpii.firstDiscovery.uie(container, {
            store: {
                cookie: {
                    name: options.cookieName
                }
            }
        });
    };

    /*
     * A grade component to handle the integration customizations for the demos.
     */
    fluid.defaults("demo.firstDiscovery.integration", {
        gradeNames: ["fluid.component"],
        demoURL: "",
        distributeOptions: [{
            target: "{that navButtons}.options.modelListeners.currentPanelNum",
            record: {
                listener: "demo.firstDiscovery.integration.showNextButton",
                args: ["{that}", "{change}.value"],
                namespace: "showNextButton",
                priority: "last",
                excludeSource: "init"
            }
        }, {
            target: "{that navButtons}.options.invokers.nextButtonClicked",
            record: {
                funcName: "demo.firstDiscovery.integration.nextTrigger",
                args: ["{that}", 1, "{integration}.options.demoURL"]
            }
        }]
    });

    demo.firstDiscovery.integration.showNextButton = function (that, currentPanelNum) {
        var nextButton = that.locate("next");
        var isLastPanel = currentPanelNum === that.options.panelTotalNum;
        var secondLastPanel = currentPanelNum === (that.options.panelTotalNum - 1);

        if (isLastPanel) {
            gpii.firstDiscovery.navButtons.toggleButtonStates(nextButton, !isLastPanel, that.options.styles.show);
        } else if (secondLastPanel) {
            var nextButtonID = fluid.allocateSimpleId(nextButton),
                nextLabel = that.msgResolver.resolve("next"),
                nextTooltipContent = that.msgResolver.resolve("nextTooltip");

            that.locate("nextLabel").html(nextLabel);
            that.tooltip.applier.change("idToContent." + nextButtonID, nextTooltipContent);
        }
    };

    demo.firstDiscovery.integration.nextTrigger = function (that, toChange, demoURL) {
        if (!that.model.isLastPanel) {
            gpii.firstDiscovery.navButtons.adjustCurrentPanelNum(that, 1);
        } else if (demoURL) {
            window.location.href = demoURL;
        }
    };


    demo.firstDiscovery.initGpiiStore = function (gpiiServerURL) {
        return gpii.firstDiscovery.giiSettingsStore({
            settingsStore: {
                url: gpiiServerURL
            }
        });
    };

    /***************************
     * Demo Integration Grades *
     ***************************/

    fluid.defaults("demo.firstDiscovery.integration.voting", {
        gradeNames: ["demo.firstDiscovery.integration"],
        demoURL: "vote.html",
        // remove the step count component
        distributeOptions: [{
            target: "{that nav}.options.components.stepCount",
            record: {
                type: "fluid.emptySubcomponent"
            }
        }]
    });

    fluid.defaults("demo.firstDiscovery.integration.assessment", {
        gradeNames: ["demo.firstDiscovery.integration"],
        demoURL: "math3-2.html"
    });


    /***************************************
     * Prefs Server Integration Demo:
     * override the relative paths in the
     * prefsServerIntegration aux schema
     */
    fluid.defaults("demo.firstDiscovery.auxSchema.prefsServerIntegration", {
        gradeNames: ["gpii.firstDiscovery.auxSchema.prefsServerIntegration"],
        auxiliarySchema: {
            "terms": {
                // path to templates and messages, relative to where the demo HTML is
                "templatePrefix": "../../src/html",
                "messagePrefix": "../../src/messages"
            }
        }
    });


    fluid.defaults("my.serverConfig", {
        gradeNames: ["fluid.component"],
        saveRequestConfig: {
            url: "http://preferences.mybluemix.net/preferences",
            method: "POST",
            view: ""
        }
    });


})(jQuery, fluid);
