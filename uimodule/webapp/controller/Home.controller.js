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
  
            let oUserInfo = await this.getUserInfo();
            let oData = {
              invocationContext: "${invocation_context}",
              input: {
                Username: oUserInfo.displayName,
                Data_de: null,
                Data_ate: null,
                Data_doc: null,
              },
            };
            this.setModel(new JSONModel(oData), "ViewModel");
  
            let oCurrentDate = new Date();
            let oStartDatePicker = this.byId("date-picker-start");
            let oEndDatePicker = this.byId("date-picker-end");
  
            oStartDatePicker.setDateValue(oCurrentDate);
            //oStartDatePicker.setMinDate(oCurrentDate);
            oEndDatePicker.setMinDate(oCurrentDate);
  
            oCardForm.setBusy(false);
          },
  
          getUserInfo: async function () {
            let oMockUserInfo = {
              firstname: "Default",
              lastname: "User",
              email: "default.user@teste.com",
              name: "default.user@teste.com",
              displayName: "Default User (default.user@teste.com)",
            };
  
            try {
              let response = await fetch(
                this.getBaseURL() + "/user-api/currentUser"
              );
              let parsed = await response.json();
              if (!response.ok) {
                return oMockUserInfo;
              } else {
                return parsed;
              }
            } catch (error) {
              return oMockUserInfo;
            }
          },
  
          handleStartDateChange: function (oEvent) {
            let bValid = this.validateDateField(oEvent);
            if (bValid) {
              let oStartDate = oEvent.getSource().getDateValue();
              let oEndDatePicker = this.byId("date-picker-end");
              if (oEndDatePicker.getDateValue() < oStartDate) {
                oEndDatePicker.setValue(null);
                oEndDatePicker.setMinDate(oStartDate);
              }
            }
          },
  
          validateDateField: function (oEvent) {
            let oField = oEvent.getSource();
            let bValid;
            if (oField.getValue() && oField.isValidValue()) {
              oField.setValueState("None");
              oField.setValueStateText("");
              bValid = true;
            } else {
              oField.setValueState("Error");
              oField.setValueStateText("");
              bValid = false;
            }
            return bValid;
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
                this.getBaseURL() + "/Natura-IRPA-EstoqueNegativo/runs",
                oRequestOptions
              );
              let parsed = await response.json();
              if (!response.ok) {
                MessageBox.error(this.getI18nText("msgBoxError"));
              } else {
                //MessageBox.success(this.getI18nText("msgBoxSuccess"));
                MessageBox.success(this.getI18nText("msgBoxSuccess"), {
                  onClose: () => {
                    this.handleRouteMatched();
                  },
                });
              }
            } catch (error) {
              MessageBox.error(this.getI18nText("msgBoxError"));
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
              if (oField.getId().includes("date-picker")) {
                if (oField.getValue() && oField.isValidValue()) {
                  oField.setValueState("None");
                  aValid.push(true);
                } else {
                  oField.setValueState("Error");
                  oField.setValueStateText("");
                  aValid.push(false);
                }
              }
            });
  
            return aValid.every((element) => element);
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
  