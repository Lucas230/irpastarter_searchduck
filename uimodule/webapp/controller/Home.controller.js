sap.ui.define(
    ["./BaseController", "sap/ui/model/json/JSONModel", "sap/m/MessageBox"],
  
    function (Controller, JSONModel, MessageBox) {
      "use strict";
  
      return Controller.extend(
        "irpastarter.searchDuck.controller.Home",
        {
          onInit: function () {
            this.getRouter()
              .getRoute("RouteHome")
              .attachPatternMatched(this.handleRouteMatched, this);
          },
  
          handleRouteMatched: async function () {
            let oCardForm = this.getView().byId("card-form");
            oCardForm.setBusy(true);
  
            let oData = {
              invocationContext: "${invocation_context}",
              input: {
                search: ""
              },
            };
            this.setModel(new JSONModel(oData), "ViewModel");
  
            oCardForm.setBusy(false);
          },
  
          handleSendAutomation: async function (oEvent) {
            let oButton = oEvent.getSource();
            oButton.setEnabled(false);
  
            let bValid = this.validateForm();
            if (bValid) {
              let oCardForm = this.byId("card-form");
              this.enableFormFields(false);
              oCardForm.setBusy(true);
              await this.startAutomation().then(() => {
                oCardForm.setBusy(false);
                this.enableFormFields(true);
                oButton.setEnabled(true);
              });
            } else {
              oButton.setEnabled(true);
            }
          },
  
          startAutomation: async function () {
            let oHeaders = new Headers();
            oHeaders.append("Content-Type", "application/json");
  
            let oData = this.getModel("ViewModel").getData();
  
            let oRequestOptions = {
              method: "POST",
              headers: oHeaders,
              body: JSON.stringify(oData),
            };
  
            try {
              let response = await fetch(
                this.getBaseURL() + "/IRPA-SearchDuckGo/runs",
                oRequestOptions
              );
              let parsed = await response.json();
              if (!response.ok) {
                MessageBox.error("Erro ao iniciar automação:" + error.toString());
              } else {
                //MessageBox.success(this.getI18nText("msgBoxSuccess"));
                MessageBox.success("Automação inciada com sucesso!", {
                  onClose: () => {
                    this.handleRouteMatched();
                  },
                });
              }
            } catch (error) {
              MessageBox.error("Erro ao iniciar automação:" + error.toString());
            }
          },
  
          validateForm: function () {
            let oAutomationForm = this.byId("automation-form");
            let oFormContainer = oAutomationForm.getFormContainers()[0];
            let aFields = [];
            oFormContainer.getFormElements().forEach((oFormElement) => {
              aFields.push(...oFormElement.getFields());
            });
  
            let aValid = [];
            aFields.forEach((oField) => {
                if (oField.getValue()) {
                  oField.setValueState("None");
                  aValid.push(true);
                } else {
                  oField.setValueState("Error");
                  oField.setValueStateText("");
                  aValid.push(false);
                }
            });
  
            return aValid.every((element) => element);
          },
          
          enableFormFields: function (bValue) {
            let oAutomationForm = this.byId("automation-form");
            let oFormContainer = oAutomationForm.getFormContainers()[0];
            let aFields = [];
            oFormContainer.getFormElements().forEach((oFormElement) => {
              aFields.push(...oFormElement.getFields());
            });
            aFields.forEach((oField) => {
              oField.setEnabled(bValue);
            });
        },
          getBaseURL: function () {
            let appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            let appPath = appId.replaceAll(".", "/");
            let appModulePath = jQuery.sap.getModulePath(appPath);
            return appModulePath;
          },
  
          getI18nText: function (sI18nKey) {
            let oResourceBundle = this.getOwnerComponent()
              .getModel("i18n")
              .getResourceBundle();
  
            let sI18nText = oResourceBundle.getText(sI18nKey);
            return sI18nText;
          },
        }
      );
    }
  );
  