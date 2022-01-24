//
// Copyright (C) 2013 KONICA MINOLTA, INC. All rights reserved.
//
//

var psfPrefix = "psf";
var psfNs = "http://schemas.microsoft.com/windows/2003/08/printing/printschemaframework";
var pskPrefix = "psk";
var pskNs = "http://schemas.microsoft.com/windows/2003/08/printing/printschemakeywords";
var xsdPrefix = "xsd";
var xsdNs = "http://www.w3.org/2001/XMLSchema";
var xsiPrefix = "xsi";
var xsiNs = "http://www.w3.org/2001/XMLSchema-instance";
var privPrefix = "ns0000";
var privNs = "http://schemas.konicaminolta.jp/windows/printing/printschema/Devmode";

var printerModel;

var configFileFeatures = ["PageOrientation", "PageMediaSize", "PageInputBin", "PageMediaType",
                          "JobDuplexAllDocumentsContiguously", "JobStapleAllDocuments", "PageOutputColor",
                          "PageResolution", "JobNUpAllDocumentsContiguously", "PagePoster", "DocumentBinding",
                          "JobHolePunch", "PageOutputBin"];

var PERF_OPTIMIZE = true;

//Global Variables
var _QPB;
var _DPB;
var _UPB;
var _printTicket = null;
var _flowDirection;
var _PnpDefaults;

function validatePrintTicket(printTicket, scriptContext) {
    if (PERF_OPTIMIZE)
    {
        _UPB = getUserPropertyBag(scriptContext);
        _QPB = scriptContext.QueueProperties;
        _DPB = scriptContext.DriverProperties;
        _printTicket = printTicket;
    }

    //get current model from QPB
    getPrinterDevice();

    //If Device Option was changed, checksum list for PT will be refreshed.
    checkIfDeviceOptionWasChanged();

    var isAlreadyValidated = false;

    if (_UPB != null) {
        var checksumPTfromUPB = getChecksumListFromUserProp();
        var checksumPT = getHashCode(printTicket);

        // Check if checksumPTfromUPB is same as checksumPT
        for (var i = 0; i < checksumPTfromUPB.length; ++i) {
            if (checksumPTfromUPB[i] == checksumPT) {
                isAlreadyValidated = true;
                break;
            }
        }
    }

    var returnValue = 1;
    if (!isAlreadyValidated) {
        var constraints = getJSONfromStreamPropertyBag(_DPB, "UICstJSON_" + printerModel + ".txt");
        if (verifyOptions(printTicket, scriptContext, constraints)) {
            returnValue = 2;
        }

        // add model to print ticket
        addOrReplaceParameterInit(printTicket.XmlNode.documentElement, printerModel, privPrefix + ":JobCurrentModel");

        if (_UPB != null) {
            var newChecksumVal = getHashCode(printTicket);
            setNewChecksumValIntoUserProp(_UPB, newChecksumVal, checksumPTfromUPB);
        }
    }
    return returnValue;
}

function completePrintCapabilities(printTicket, scriptContext, printCapabilities) {
    if (PERF_OPTIMIZE) {
        _QPB = scriptContext.QueueProperties;
        _DPB = scriptContext.DriverProperties;
        _UPB = getUserPropertyBag(scriptContext);
        _printTicket = printTicket;
    }
    // Get current PDL from QPB
    var pdl = getPDLInfo(scriptContext);

    setSelectionNamespace(printCapabilities.XmlNode, "psf", psfNs);

    // Fix paper sizes
    if (pdl === "XPS" || pdl === "PCL") {
        fixPaperSizes(printCapabilities.XmlNode);
    }

    // Get current model from QPB
    getPrinterDevice();

    //get customproperties for Model
    var customPropertiesObj = getCustomPropertiesObj(_DPB, _UPB);

    // Get custom properties default values from DPB
    var customDefault = getCustomPropertiesDefaultObj(_DPB);

    //get display names here
    getDisplayNameList(printCapabilities.XmlNode, "ns0000:JobDisplayName001");

    // Add psk items to print capabilities
    addPskProperties(printCapabilities, customPropertiesObj.psk);

    var docElement = printCapabilities.XmlNode.documentElement;
    var scopes = ["Job", "Page"];

    for (var i = 0; i < scopes.length; ++i) {
        var scope = scopes[i];
        var scopeCustomProps = customPropertiesObj.custom[scope];
        var paramInitName = scope + "KM" + scope + "CustomProperties";

        if (scopeCustomProps) {
            addStringParamDefForKMCustomProperty(docElement, makePrefixAndName(privPrefix, paramInitName), customDefault[scope], scopeCustomProps, scope);
        }
    }

    var paramInits = customPropertiesObj["custom"]["Page"]["paraminits"];
    var OutCustomPaperSizeWidth;
    var OutCustomPaperSizeHeight;

    for (var i = 0; i < paramInits.length; i++) {
        if(paramInits[i].name == "OutPSizeW")
        {
            OutCustomPaperSizeWidth = paramInits[i];
            if(pdl == "PS")
            {
                fixCustomPaperSize(printCapabilities.XmlNode, "psk:PageMediaSizePSWidth", OutCustomPaperSizeWidth);
            }
            else
            {
                fixCustomPaperSize(printCapabilities.XmlNode, "psk:PageMediaSizeMediaSizeWidth", OutCustomPaperSizeWidth);
            }
        }

        if(paramInits[i].name == "OutPSizeH")
        {
            OutCustomPaperSizeHeight = paramInits[i];
            if (pdl == "PS")
            {
                fixCustomPaperSize(printCapabilities.XmlNode, "psk:PageMediaSizePSHeight", OutCustomPaperSizeHeight);
            }
            else
            {
                fixCustomPaperSize(printCapabilities.XmlNode, "psk:PageMediaSizeMediaSizeHeight", OutCustomPaperSizeHeight);
            }
        }
    }

    //set Device Setting constraints in the Print Capabilities
    setDeviceSettingConstraint(printTicket, printCapabilities);
}


var displayNameList;

//populates the displayNameList with displayNames from JobDisplayName
//only DisplayName00x are added,
function getDisplayNameList(capsOrTicketNode, featureName)
{
    var jobDisplayNode = capsOrTicketNode.selectSingleNode("//psf:Feature[@name='" + featureName + "']");
    if(jobDisplayNode != null)
    {
        var displayNamePrefix = "ns0000:DisplayName";
        var displayString = "";

        var optionNodes = jobDisplayNode.selectNodes("psf:Option");
        var len = optionNodes.length;

        for(var i = 0; i < len; i++){
            var optionNode = optionNodes[i];
            var optionName = optionNode.getAttribute("name");

            if (optionName.indexOf(displayNamePrefix) == -1) {
                break;
            }
            else {
                var DisplayPropertyValueNode = optionNode.selectSingleNode("psf:Property[@name='psk:DisplayName']/psf:Value");
                if (DisplayPropertyValueNode != null) {
                    displayString += DisplayPropertyValueNode.text;
                }
            }
        }

        displayNameList = displayString.split(",");
    }
}

//Sets the min and max values of the custom paper sizes of the Original Size to be same as in Output Paper Size
function fixCustomPaperSize(capsOrTicketNode, paramDefName, OutCustomPaperSizeDimension) {
    if (OutCustomPaperSizeDimension == null)
        return;

    var pageMediaSizeNode = capsOrTicketNode.selectSingleNode("//psf:ParameterDef[@name='" + paramDefName + "']");

    if (pageMediaSizeNode == null)
        return;

    var maxPropertyValueNode = pageMediaSizeNode.selectSingleNode("psf:Property[@name='psf:MaxValue']/psf:Value");
    if (maxPropertyValueNode != null) {
        var dpbPropertyValue = OutCustomPaperSizeDimension["maxval"];
        if (dpbPropertyValue != null) {
            maxPropertyValueNode.text = dpbPropertyValue;
        }
    }

    var minPropertyValueNode = pageMediaSizeNode.selectSingleNode("psf:Property[@name='psf:MinValue']/psf:Value");
    var defaultPropertyValueNode = pageMediaSizeNode.selectSingleNode("psf:Property[@name='psf:DefaultValue']/psf:Value");

    var dpbPropertyValue = OutCustomPaperSizeDimension["minval"];

    if ((minPropertyValueNode != null) && (dpbPropertyValue != null)) {
        minPropertyValueNode.text = dpbPropertyValue;
    }

    if ((defaultPropertyValueNode != null) && (dpbPropertyValue != null)) {
        defaultPropertyValueNode.text = dpbPropertyValue;
    }
}

function convertPrintTicketToDevMode(printTicket, scriptContext, devModeProperties) {
    if (PERF_OPTIMIZE) {
        _QPB = scriptContext.QueueProperties;
        _DPB = scriptContext.DriverProperties;
        _UPB = getUserPropertyBag(scriptContext);
        _printTicket = printTicket;
    }
    //get current model from QPB
    getPrinterDevice();

    var rootElement = printTicket.XmlNode.documentElement;
    var devModeValues = {};

    var customPropertiesObj = getCustomPropertiesObj(_DPB, _UPB);
    var pskCustomProperties = customPropertiesObj.psk;

    var features = pskCustomProperties["features"];
    var featuresValues = {};

    if (features) {
        for (var i = 0; i < features.length; ++i) {
            var feature = features[i];
            var featureName = feature.name;
            var featureNode = null;

            if (feature.parentFeature != null) {
                featureNode = getElementNode(rootElement, psfPrefix + ":Feature", feature.parentFeature);
                featureNode = getElementNode(featureNode, psfPrefix + ":Feature", feature.name);
            } else {
                featureNode = getElementNode(rootElement, psfPrefix + ":Feature", feature.name);
            }

            if (featureNode != null) {
                var featureSetting = getSelectedOptionOfFeature(featureNode);
                featuresValues[featureName] = featureSetting;
            }
        }
        var pskFeatures = {};
        pskFeatures["features"] = featuresValues;
        devModeValues["Psk"] = JSONStringify(pskFeatures);
    }

    // get custom properties from PrintTicket
    var paramInitList = getAllParameterInit(rootElement);
    if (paramInitList) {

        var scopes = ["Job", "Page"];
        for (var i = 0; i < scopes.length; ++i) {
            var scope = scopes[i];
            var paramInitName = "ns0000:" + scope + "KM" + scope + "CustomProperties";

            // get scope count
            var countName = "ns0000:" + scope + "KM" + scope + "CustomCount"
            var scopeCount = getParameterInitValue(printTicket.XmlNode.documentElement, countName);

            for (var cnt = 0; cnt < scopeCount; cnt++) {
                //add padding
                var pad = "000";
                var count = "" + cnt;
                count = pad.substring(0, pad.length - count.length) + count;
                var paramDefName = paramInitName + count;

                for (var j = 0; j < paramInitList.length; j++) {
                    var paramInitProperty = paramInitList[j].attributes[0].nodeValue;
                    if (paramInitProperty == paramDefName) {
                        devModeValues[scope] = paramInitList[j].nodeTypedValue;
                        break;
                    }
                }
            }
        }
    }

    // add model to devmode
    devModeValues["Model"] = printerModel;
    // save to devmode propertybag
    devModeProperties.SetString("AllValues", JSONStringify(devModeValues));
}

function convertDevModeToPrintTicket(devModeProperties, scriptContext, printTicket) {
    if (PERF_OPTIMIZE) {
        _QPB = scriptContext.QueueProperties;
        _DPB = scriptContext.DriverProperties;
        _UPB = getUserPropertyBag(scriptContext);
        _printTicket = printTicket;
    }
    //get current model from QPB
    getPrinterDevice();

    //get customproperties for Model
    var customPropertiesObj = getCustomPropertiesObjPsk(_DPB, _UPB);

    //get psk from customproperties
    var pskCustomProperties = customPropertiesObj.psk;

    //get devModeValues
    var devModeValues = getDevModeItemValue(devModeProperties);

    //check from UPB if driver is installed
    var isOverrideWithPnpDefaults = !checkIsPnpDefaultsSet() && checkPnpDefaults();

    //if DevMode is empty, override with Point and Print Server Defaults
    if (isOverrideWithPnpDefaults)
    {
        overrideWithPnpDefaults(pskCustomProperties);
    }

    var pskCustom = null;
    try {
        pskCustom = eval("(" + devModeValues["Psk"] + ")");
    }
    catch (e) {
        return 1;
    }

    // get devmode model
    var devModeModel = null;
    try {
        devModeModel = devModeValues["Model"];
    }
    catch (e) {
        return 1;
    }

    // get PrintTicket Model
    var ptModelNode = getElementNode(printTicket.XmlNode, psfPrefix + ":ParameterInit", privPrefix + ":JobCurrentModel");
    var ptModel;
    if (ptModelNode) {
        var firstChild = ptModelNode.selectSingleNode(psfPrefix + ":Value").firstChild;
        ptModel = firstChild == null ? "" : firstChild.nodeValue;
    }

    // total customproperties node count
    var customNodeCount;

    // check for model change
    if (printerModel == devModeModel && printerModel == ptModel) {
        //copy devmode and upb as is
        addPSKCustomToTicket(printTicket, pskCustomProperties, pskCustom, _UPB);

        var scopes = ["Job", "Document", "Page"];

        for (var i = 0; i < scopes.length; ++i) {
            var scope = scopes[i];
            var paramInitName = scope + "KM" + scope + "CustomProperties";

            if (devModeValues[scope]) {
                var custom = null;
                try {
                    custom = eval("(" + devModeValues[scope] + ")");
                }
                catch (e) {
                    continue;
                }
                // get Scope features from devmode
                var devModefeature = custom["features"];

                // get Scope paraminits from devmode
                var devModeparaminit = custom["paraminits"];

                var scopeItem = {};
                scopeItem["features"] = devModefeature;
                scopeItem["paraminits"] = devModeparaminit;

                //check size, create new node if size limit exceed
                var paramValueFull = trim(JSONStringify(scopeItem));
                var paramValues = splitIntoChunks(paramValueFull, Constants.NODE_MAX_LENGTH);

                for (var j = 0; j < paramValues.length; j++) {
                    customNodeCount = j;
                    //add padding
                    var pad = "000";
                    var count = "" + j;
                    count = pad.substring(0, pad.length - count.length) + count;
                    var paramDefName = paramInitName + count;

                    var finalParamValue;
                    if (paramValues[j])
                        finalParamValue = paramValues[j];
                    else
                        finalParamValue = "";

                    // append devmode to print ticket
                    addOrReplaceParameterInit(printTicket.XmlNode.documentElement, finalParamValue, privPrefix + ":" + paramDefName);
                }
                // add count of customproperties node to print ticket
                customNodeCount++;
                addOrReplaceParameterInit(printTicket.XmlNode.documentElement, "" + customNodeCount, privPrefix + ":" + scope + "KM" + scope + "CustomCount");
            }
        }
    }
    else {
        // Get current PDL from QPB
        var pdl = getPDLInfo(scriptContext);

        //get customproperties for Model
        customPropertiesObj = getCustomPropertiesObjCustom(_DPB, _UPB);

        if (isOverrideWithPnpDefaults)
        {
            //override with Point and Print Server Defaults
            overrideCustomPropertiesWithPnpDefaults(customPropertiesObj);
        }

        //create psk PrintTicket
        addPSKCustomPropertiesToTicket(printTicket, pskCustomProperties, pskCustom, _UPB, pdl);

        var scopes = ["Job", "Document", "Page"];

        for (var i = 0; i < scopes.length; ++i) {
            var scope = scopes[i];
            var scopeCustomProps = customPropertiesObj.custom[scope];
            var paramInitName = scope + "KM" + scope + "CustomProperties";

            if (scopeCustomProps) {
                var custom;
                if (devModeValues != null) {
                    try {
                        custom = eval("(" + devModeValues[scope] + ")");
                    }
                    catch (e) {
                        continue;
                    }
                }

                //check size, create new node if size limit exceed
                var paramValueFull = trim(JSONStringify(custom));
                var paramValues = splitIntoChunks(paramValueFull, Constants.NODE_MAX_LENGTH);

                for (var j = 0; j < paramValues.length; j++) {
                    customNodeCount = j;
                    //add padding
                    var pad = "000";
                    var count = "" + j;
                    count = pad.substring(0, pad.length - count.length) + count;
                    var paramDefName = paramInitName + count;

                    var finalParamValue;
                    if (paramValues[j])
                        finalParamValue = paramValues[j];
                    else
                        finalParamValue = "";

                    var modelChanged = true;
                    if ((printerModel == devModeModel && ptModel == undefined) ||
                        (printerModel == devModeModel && printerModel == ptModel)) {
                        modelChanged = false;
                    }
                    // append devmode to print ticket
                    addKMCustomParameterInitToTicket(printTicket, scopeCustomProps, paramDefName, custom, _UPB, modelChanged);
                }
                // add count of customproperties node to print ticket
                customNodeCount++;
                addOrReplaceParameterInit(printTicket.XmlNode.documentElement, "" + customNodeCount, privPrefix + ":" + scope + "KM" + scope + "CustomCount");
            }
        }

        if (isOverrideWithPnpDefaults) {
            overridePrintTicketSettings(printTicket);
            //set flag to indicate that driver has been installed with Point and Print Default Overrides
            //_UPB.SetString(Constants.IS_PNP_DEFAULTS_SET, "true");
            overridePnPLanguage();
        }
    }

    ApplyAdminCustomize(printTicket);

    // add model to print ticket
    addOrReplaceParameterInit(printTicket.XmlNode.documentElement, printerModel, privPrefix + ":JobCurrentModel");
}

/*******************************************************************************/
/*                                                                             */
/* Print Ticket / Capabilities Functions                                       */
/*                                                                             */
/*******************************************************************************/
function verifyOptions(printTicket, scriptContext, constraints) {
    var customPaperTypes = getCustomPaperTypes(_QPB);

    //get current model from QPB
    //getPrinterDevice();

    //get customproperties for Model
    var customPropertiesObj = getCustomPropertiesObj(_DPB, _UPB);

    var changesMade = false;

    // Get settings from PrintTicket
    var settingsArray = GetSettingsArray(printTicket, customPropertiesObj);

    var featureIndexDict = constraints.j;
    var constraintRules = constraints.r;

    // Perform constraints
    for (var j = 0; j < constraintRules.length; j++) {
        var constraint = constraintRules[j];

        var numANDBlocksTrue = 0;
        var isBooklet = false;

        for (var k = 0; k < constraint.length - 1; ++k) {
            var leftSide = ProvideValue(settingsArray, constraint[k]["s"], customPaperTypes);
            if (!evaluate(constraint[k], stripNamespace(leftSide))) {
                // An AND-block failed.. bail out
                break;
            } else {
                ++numANDBlocksTrue;

                if (GetFeatureName(constraint[k]["s"]) == Constants.JOB_LAYOUT.NAME ||
                    GetFeatureName(constraint[k]["s"]) == Constants.JOB_BOOKLET.NAME) {
                    isBooklet = true;
                }
            }
        }

        // After processing all AND-blocks, check if the number of AND-blocks that
        // became true matches the total number of AND-blocks. If yes, the whole group is true
        if (constraint.length > 1 && numANDBlocksTrue == constraint.length - 1) {
            // Peform change here..
            var dependentSetting = constraint[constraint.length - 1];
            var dependentSettingName = dependentSetting["s"];
            var dependentSettingValue = dependentSetting["t"];

            if (settingsArray[GetFeatureName(dependentSettingName)] != dependentSettingValue && dependentSettingValue != "PT_KEYWORD_NOT_DEFINED") {
                settingsArray[GetFeatureName(dependentSettingName)] = GetOptionName(dependentSettingName, dependentSettingValue);

                changesMade = true;
            }
            if (isBooklet && (GetFeatureName(dependentSettingName) == Constants.JOB_DUPLEX_ALL_DOCUMENTS_CONTIGUOUSLY.NAME)) {
                if (dependentSettingValue != "PT_KEYWORD_NOT_DEFINED") {
                    settingsArray[Constants.JOB_DUPLEX_ALL_DOCUMENTS_CONTIGUOUSLY.NAME] = GetOptionName(dependentSettingName, dependentSettingValue);
                    if (settingsArray[Constants.JOB_LAYOUT.NAME] != null)
                    {
                        settingsArray[Constants.JOB_LAYOUT.NAME] = Constants.JOB_LAYOUT.OFF;
                    }
                    else if (settingsArray[Constants.JOB_BOOKLET.NAME] != null)
                    {
                        settingsArray[Constants.JOB_BOOKLET.NAME] = Constants.JOB_BOOKLET.OFF;
                    }

                    changesMade = true;
                }
            }
        }
    }

    // =========== SAVE VALUES BACK TO TICKET ================
    // 1. GPD/PPD defined settings
    for (var i = 0; i < configFileFeatures.length; ++i) {
        if (settingsArray[configFileFeatures[i]]) {
            setSelectedOptionName(getFeature(printTicket, makePrefixAndName(pskPrefix, configFileFeatures[i])), settingsArray[configFileFeatures[i]]);
        }
    }

    // 2. "psk:" settings in DPB
    var settingTypes = ["features", "paraminits"];
    var pskCustomProperties = customPropertiesObj["psk"];
    if (pskCustomProperties) {
        for (var i = 0; i < settingTypes.length; ++i) {
            var type = settingTypes[i];
            var pskSettings = pskCustomProperties[type];
            if (pskSettings) {
                var pskSettingName = pskSettings["name"];
                for (var j = 0; j < pskSettings.length; ++j) {
                    if (type == "feature") {
                        setSelectedOptionName(getFeature(printTicket, makePrefixAndName(pskPrefix, pskSettingName)), settingsArray[stripNamespace(pskSettingName)]);
                    } else {
                        // Currently we do not have psk: param inits in the DPB.
                    }
                }
            }
        }
    }

    // 3. KM custom (always DPB defined)
    // Save KM custom to PrintTicket
    var scopes = ["Job", "Document", "Page"];
    var docElement = printTicket.XmlNode.documentElement;

    // total customproperties node count
    var customNodeCount;

    for (var i = 0; i < scopes.length; ++i) {
        var scope = scopes[i];
        var paramInitName = scope + "KM" + scope + "CustomProperties";
        var obj = {};

        for (var j = 0; j < settingTypes.length; ++j) {
            var type = settingTypes[j];
            obj[type] = {};
            if (customPropertiesObj["custom"][scope] != null) {
                var settings = customPropertiesObj["custom"][scope][type];
                for (var k in settings) {
                    var settingName = settings[k].name;

                    if (type == "features") {
                        var optionList = settings[k].options;
                        for (var l = 0; l < optionList.length; l++) {
                            //check if current option is valid 
                            if (optionList[l].name == settingsArray[settingName]) {
                                obj[type][settingName] = settingsArray[settingName];
                                break;
                            }
                            obj[type][settingName] = settings[k]["default"];
                        }
                    }
                    else {
                        obj[type][settingName] = settingsArray[settingName];
                    }
                }
            }
        }

        if (customPropertiesObj["custom"][scope]) {
            //check size, create new node if size limit exceed
            var paramValueFull = trim(JSONStringify(obj));
            var paramValues = splitIntoChunks(paramValueFull, Constants.NODE_MAX_LENGTH);

            for (var j = 0; j < paramValues.length; j++) {
                customNodeCount = j;

                //add padding
                var pad = "000";
                var count = "" + j;
                count = pad.substring(0, pad.length - count.length) + count;
                var paramDefName = paramInitName + count;

                var finalParamValue;
                if (paramValues[j])
                    finalParamValue = paramValues[j];
                else
                    finalParamValue = "";

                addOrReplaceParameterInit(docElement, finalParamValue, makePrefixAndName(privPrefix, paramDefName));
            }
            // add count of customproperties node to print ticket
            customNodeCount++;
            addOrReplaceParameterInit(docElement, "" + customNodeCount, privPrefix + ":" + scope + "KM" + scope + "CustomCount");
        }
    }

    var xml = printTicket.XmlNode.xml;

    return changesMade;
}

// Evaluates an OR-block. Returns on first true.
function evaluate(constraint, leftSide) {
    // Strict-Type check here because values can also be null.
    if (leftSide === undefined)
        return false;
    var retVal = false;
    var s = constraint.s;
    var e = constraint.e;
    var c = constraint.c;
    for (var i = 0; i < e.length; ++i) {
        var operator = e[i];
        var rightSide = stripNamespace(c[i]);
        if (s == Constants.PHYSICAL_OUTPUT_CUSTOM_PAPER_SIZE_WIDTH.NAME || s == Constants.PHYSICAL_OUTPUT_CUSTOM_PAPER_SIZE_HEIGHT.NAME) {
            rightSide = rightSide * 100;
        }
        switch (operator) {
            case 0:
                retVal = leftSide == rightSide;
                break;
            case 1:
                retVal = leftSide != rightSide;
                break;
            case 2:
                retVal = leftSide <= rightSide;
                break;
            case 3:
                retVal = leftSide < rightSide;
                break;
            case 4:
                retVal = leftSide > rightSide;
                break;
            case 5:
                retVal = leftSide >= rightSide;
                break;
            default:
                retVal = false;
        }

        if (retVal) {
            return true;
        }
    }
    return false;
}

function paperSize(name, width, height) {
    this.name = name;
    this.width = width;
    this.height = height;
}

// XPS/PCL only.
// Fixes the values of paper sizes that are not exactly represented in GPD/PPD
// Ex: SRA3 to 320x450mm (this is for mm-based papers that do not have a GPD keyword)
// <JIRA 26> Add new paper size SRA4
function fixPaperSizes(capsOrTicketNode) {
    var sizes = [
        new paperSize("psk:ISOA0", 841000, 1189000),
        new paperSize("psk:ISOA1", 594000, 841000),
        new paperSize("psk:JISB1", 728000, 1030000),
        new paperSize("psk:JISB2", 515000, 728000),
        new paperSize("psk:JISB3", 364000, 515000),
        new paperSize("ns0000:ROC16K", 195000, 270000),
        new paperSize("ns0000:ROC8K", 270000, 390000),
        new paperSize("psk:JapanYou3Envelope", 98000, 148000),
        new paperSize("ns0000:JapanKaku1Envelope", 270000, 382000),
        new paperSize("ns0000:SPFOLIO", 215900, 322300),
        new paperSize("ns0000:P8QUATX13", 209550, 330200),
        new paperSize("ns0000:KAI16", 185000, 260000),
        new paperSize("ns0000:KAI32", 130000, 185000),
        new paperSize("ns0000:P8EIGHTHX13QUAT", 206375, 336550),
        new paperSize("ns0000:P220MMX330MM", 220000, 330000),
        new paperSize("ns0000:WIDEA3", 302100, 425100),
        new paperSize("ns0000:WIDEA4", 212550, 302100),
        new paperSize("ns0000:WIDEA5", 151050, 212550),
        new paperSize("ns0000:WIDEB4", 262100, 369100),
        new paperSize("ns0000:WIDEB5", 184550, 262100),
        new paperSize("ns0000:WIDEP11X17", 284500, 436900),
        new paperSize("ns0000:WIDEP8HALFX11", 218450, 284500),
        new paperSize("ns0000:WIDEP5HALFX8HALF", 142250, 218450),
        new paperSize("ns0000:FBA4TAB", 225500, 297000),
        new paperSize("ns0000:FBLETTERTAB", 231400, 279400),
        new paperSize("psk:ISOSRA3", 320000, 450000),
        new paperSize("psk:ISOSRA4", 225000, 320000)
    ];

    var pageMediaSizeNode = capsOrTicketNode.selectSingleNode("//psf:Feature[@name='psk:PageMediaSize']");

    if (pageMediaSizeNode == null)
        return;

    for (var i = 0; i < sizes.length; ++i) {
        var optionNode = pageMediaSizeNode.selectSingleNode("psf:Option[@name='" + sizes[i].name + "']");
        if (optionNode != null) {
            var widthValueNode =
                optionNode.selectSingleNode("psf:ScoredProperty[@name='psk:MediaSizeWidth']/psf:Value");
            var heightValueNode =
                optionNode.selectSingleNode("psf:ScoredProperty[@name='psk:MediaSizeHeight']/psf:Value");

            if (widthValueNode != null && heightValueNode != null) {
                widthValueNode.text = sizes[i].width;
                heightValueNode.text = sizes[i].height;
            }
        }
    }
}

function getCustomPaperTypes(queueProperties) {
    try {
        return getJSONFromPropertyBag(queueProperties, Constants.CUSTOM_PAPER_TYPES);
    } catch (e) {
        var obj = [];
        for (var i = 1; i <= 19; ++i) {
            obj.push({
                DisplayName: "",
                Type: "psk:Plain"
            });
        }
        return obj;
    }
}

function getCustomPropertiesObj(driverProperties, userProperties) {
    // get generic and model-specific information
    var customPropertiesObj = {}
    customPropertiesObj["psk"] = {}
    customPropertiesObj["custom"] = {}

    //Get current model from UPB
    var currentModel = getStringFromPropertyBag(userProperties, "CurrentModel");

    var Job = "";

    if (userProperties != null && currentModel != null && currentModel == printerModel) {
        Job = getStringFromPropertyBag(userProperties, "jobCustomProps");
    }

    var Page = "";

    if (userProperties != null && currentModel != null && currentModel == printerModel) {
        Page = getStringFromPropertyBag(userProperties, "pageCustomProps");
    }

    customPropertiesObj["psk"] = getJSONfromStreamPropertyBag(driverProperties, "pskProperties_" + printerModel + ".txt");

    if (_printTicket != null)
    {
        overrideRTLPskProperties(customPropertiesObj);
    }

    if (Job == "") {
        Job = getJSONStringfromStreamPropertyBag(driverProperties, "jobCustomProps_" + printerModel + ".txt");

        if (userProperties != null) {
            userProperties.SetString("jobCustomProps", Job);
        }
    }
    customPropertiesObj["custom"]["Job"] = eval("(" + Job + ")");

    if (Page == "") {
        Page = getJSONStringfromStreamPropertyBag(driverProperties, "pageCustomProps_" + printerModel + ".txt");

        if (userProperties != null) {
            userProperties.SetString("pageCustomProps", Page);
        }
    }
    customPropertiesObj["custom"]["Page"] = eval("(" + Page + ")");

    //Set Current Model
    if (userProperties != null) {
        userProperties.SetString("CurrentModel", printerModel);
    }

    return customPropertiesObj;
}

function overrideRTLPskProperties(propertiesObj)
{
    //RM3361 Disable usage of RTL Properties
     return;

    var rtlObject = getRTLDefaultsObject();

    propertiesObj["RTL"] = rtlObject;

    _flowDirection = getFlowDirection(rtlObject);

    if (_flowDirection == "RTL")
    {
        var pskFeatures = propertiesObj["psk"]["features"];
        var rtlFeatures = rtlObject["features"];
        for(var rtlFeature in rtlFeatures)
        {
            for(var pskFeature in pskFeatures)
            {
                if (pskFeatures[pskFeature]["name"] == rtlFeature)
                {
                    pskFeatures[pskFeature]["default"] = rtlFeatures[rtlFeature];
                }
            }
        }
    }
}

function checkPnpDefaults()
{
    _PnpDefaults = _QPB.GetString("PnPServerDefaults");

    try {
        _PnpDefaults = eval("(" + _PnpDefaults + ")");
        return true;
    }
    catch (e) {
    }
    return false;
}

function overrideWithPnpDefaults(propertiesObj)
{
    var features = propertiesObj.features;
    for (var idx in features)
    {
        var temp = 0;
        var feature = features[idx];
        feature["default"] = _PnpDefaults[feature.name];
    }
}

function overrideCustomPropertiesWithPnpDefaults(propertiesObj)
{
    var customProperties = propertiesObj["custom"];
    var aScope = ["Job", "Page"];
    var aDefaults = ["features","paraminits"];

    for (var x in aScope)
    {
        var scopeName = aScope[x];
        for(var y in aDefaults)
        {
            var initName = aDefaults[y];
            var features = customProperties[scopeName][initName];
            for(var z in features)
            {
                var feature = features[z];
                var featureName = "ns0000:" + scopeName + feature["name"];
                var overriddenDefaultValue = _PnpDefaults[featureName];

                if (overriddenDefaultValue == undefined) continue;

                if (typeof overriddenDefaultValue == "string")
                {
                    feature["default"] = stripNamespace(overriddenDefaultValue);
                }
                else
                {
                    feature["default"] = overriddenDefaultValue;
                }
            }
        }
    }
}

function overridePrintTicketSettings(printTicket)
{
    for(var featureIndex in _PnpDefaults)
    {
        var feature = printTicket[stripNamespace(featureIndex)];
        if (feature != null)
        {
            try
            {
                printTicket[stripNamespace(featureIndex)] = _PnpDefaults[featureIndex];
            }
            catch (e)
            {
            }
            continue;
        }

        var featureNode;
        featureNode = printTicket.xmlNode.selectSingleNode("//psf:Feature[@name='" + featureIndex + "']");
        if (featureNode != null)
        {
            var optionNode = featureNode.selectSingleNode("psf:Option");
            if (optionNode != null) {
                optionNode.attributes[0].nodeValue = _PnpDefaults[featureIndex];
            }

            continue;
        }

        featureNode = printTicket.xmlNode.selectSingleNode("//psf:ParameterInit[@name='" + featureIndex + "']");
        if (featureNode != null)
        {
            continue;
        }

        if (featureIndex == "psk:PageMediaSizeMediaSizeWidth" || featureIndex == "psk:PageMediaSizeMediaSizeHeight")
        {
            overrideCustomPaperSize(printTicket.xmlNode, featureIndex, _PnpDefaults[featureIndex]);
        }

    }
}

function overrideCustomPaperSize(capsOrTicketNode,key,value)
{
    var pageMediaSizeNode = capsOrTicketNode.selectSingleNode("//psf:Feature[@name='psk:PageMediaSize']");

    if (pageMediaSizeNode == null)
        return;

    var optionNode = pageMediaSizeNode.selectSingleNode("psf:Option[@name='" + "psk:CustomMediaSize" + "']");

    if (optionNode == null)
        return;

    var searchString = "";
    if (key == "psk:PageMediaSizeMediaSizeWidth")
    {
        searchString = "psf:ScoredProperty[@name='psk:MediaSizeWidth']/psf:Value";
    }
    else if (key == "psk:PageMediaSizeMediaSizeHeight")
    {
        searchString = "psf:ScoredProperty[@name='psk:MediaSizeHeight']/psf:Value";
    }
    else
    {
        return;
    }

    var valueNode = optionNode.selectSingleNode(searchString);

    if (valueNode == null)
        return;

    valueNode.text = value;
}

function overridePnPLanguage() {
    var pnpLanguage = _PnpDefaults[Constants.UPB_USER_LANGUAGE];

    if (pnpLanguage == null) return;
    if (pnpLanguage == "") return;

    _UPB.SetString(Constants.UPB_USER_LANGUAGE, pnpLanguage);
}

function getPTFlowDirection(RTLObject)
{
    var lanugagesList = RTLObject["languages"];

    var featureNode = getElementNode(_printTicket.XmlNode, psfPrefix + ":Feature", privPrefix + ":JobLocale");
    var locale = stripNamespace(getSelectedOptionOfFeature(featureNode));

    for (var language in lanugagesList)
    {
        if (locale.indexOf(language) != -1) return "RTL";
    }

    return "LTR";
}

function getFlowDirection(RTLObject)
{
    // Get from UPB->FlowDirection
    flowdirection = getStringFromPropertyBag(_UPB, "FlowDirection");

    // If UPB->FlowDirection is null, get flow direction from Print Ticket->Locale
    if (flowdirection == null) return getPTFlowDirection(RTLObject);

    switch(flowdirection)
    {
        // If flow direction is neither RTL nor LTR, get flow direction from Print Ticket->Locale
        case "":
        case "auto":
            return getPTFlowDirection(RTLObject);
        // If flow direction is correct return flow direction.
        default:
            return flowdirection;
    }
}

function getRTLDefaultsObject()
{
    temp = getJSONStringfromStreamPropertyBag(_DPB, "localeDefault.txt");
    localeDefaultObj = eval("(" + temp + ")");

    return localeDefaultObj["FlowDirection_RTL"];
}

function getCustomPropertiesObjPsk(driverProperties, userProperties) {
    // get generic and model-specific information
    var customPropertiesObj = {}
    customPropertiesObj["psk"] = {}
    customPropertiesObj["custom"] = {}

    Psk = getJSONStringfromStreamPropertyBag(driverProperties, "pskProperties_" + printerModel + ".txt");
    customPropertiesObj["psk"] = eval("(" + Psk + ")");

    if (_printTicket != null) {
        overrideRTLPskProperties(customPropertiesObj);
    }

    return customPropertiesObj;
}

function getCustomPropertiesObjCustom(driverProperties, userProperties) {
    // get generic and model-specific information
    var customPropertiesObj = {}
    customPropertiesObj["psk"] = {}
    customPropertiesObj["custom"] = {}

    //Get current model from UPB
    var currentModel = getStringFromPropertyBag(userProperties, "CurrentModel");

    var Job = "";

    if (userProperties != null && currentModel != null && currentModel == printerModel) {
        try {
            Job = userProperties.GetString("jobCustomProps");
        }
        catch (e) {
            Job = "";
        }
    }

    var Page = "";

    if (userProperties != null && currentModel != null && currentModel == printerModel) {
        try {
            Page = userProperties.GetString("pageCustomProps");
        }
        catch (e) {
            Page = "";
        }
    }

    if (Job == "") {
        Job = getJSONStringfromStreamPropertyBag(driverProperties, "jobCustomProps_" + printerModel + ".txt");

        if (userProperties != null) {
            userProperties.SetString("jobCustomProps", Job);
        }
    }
    customPropertiesObj["custom"]["Job"] = eval("(" + Job + ")");

    if (Page == "") {
        Page = getJSONStringfromStreamPropertyBag(driverProperties, "pageCustomProps_" + printerModel + ".txt");

        if (userProperties != null) {
            userProperties.SetString("pageCustomProps", Page);
        }
    }
    customPropertiesObj["custom"]["Page"] = eval("(" + Page + ")");

    //Set Current Model
    if (userProperties != null) {
        userProperties.SetString("CurrentModel", printerModel);
    }

    return customPropertiesObj;
}

function getCustomPropertiesDefaultObj(driverProperties) {
    // get generic and model-specific information
    var jobCustomPropDefault = getJSONfromStreamPropertyBag(driverProperties, "jobDefault_" + printerModel + ".txt");
    var pageCustomPropDefault = getJSONfromStreamPropertyBag(driverProperties, "pageDefault_" + printerModel + ".txt");

    var customDefault = {}
    customDefault["Job"] = jobCustomPropDefault;
    customDefault["Page"] = pageCustomPropDefault;
    return customDefault;
}

function updateCustomProperties(mainPropertyList, modelPropertyList) {
    if (modelPropertyList == null || modelPropertyList == undefined) {
        // no model specific updates
        return mainPropertyList;
    }

    // process features and paraminits
    var settingTypes = ["features", "paraminits"];
    for (var i = 0; i < settingTypes.length; ++i) {
        var settings = settingTypes[i];
        var mainListFeatures = mainPropertyList[settings];
        var modelListFeatures = modelPropertyList[settings];
        if (modelListFeatures != null) {
            for (var j = 0; j < modelListFeatures.length; j++) {
                var featureModel = modelListFeatures[j];

                if (featureModel["action"] != null &&
                    featureModel["action"] == "add") {
                    // add series specific item
                    mainPropertyList[settings].push(featureModel);
                    continue;
                }

                for (var k = 0; k < mainListFeatures.length; k++) {
                    if (mainListFeatures[k]["name"] == featureModel["name"]) {
                        // replace element
                        mainPropertyList[settings][k] = modelListFeatures[j];
                    }
                }
            }
        }
    }
    return mainPropertyList;
}

function updateCustomPropertiesDefault(mainPropertyList, modelPropertyList) {
    if (modelPropertyList == null || modelPropertyList == undefined) {
        // no model specific updates
        return mainPropertyList;
    }

    // process features and paraminits
    var settingTypes = ["features", "paraminits"];
    for (var i = 0; i < settingTypes.length; ++i) {
        var settings = settingTypes[i];
        var modelListFeatures = modelPropertyList[settings];
        if (modelListFeatures != null) {
            for (var featureModel in modelListFeatures) {
                // add or replace value
                mainPropertyList[settings][featureModel] = modelListFeatures[featureModel];
            }
        }
    }
    return mainPropertyList;
}

function GetSettingsArray(printTicket, customProperties) {
    var settingsArray = [];

    if (printTicket != null) {
        var docElement = printTicket.XmlNode.documentElement;
        //Get features and parameter init items from print ticket
        var ticketSettings = docElement.childNodes;
        for (var settingIndex = 0; settingIndex < ticketSettings.length; settingIndex++) {
            var settingName = ticketSettings[settingIndex].attributes[0].nodeValue;

            if (checkIfSkipSetting(settingName) == false) {
                var isFeature = ticketSettings[settingIndex].baseName == "Feature";
                if (isFeature) {
                    var featureFromTicket = getFeature(printTicket, settingName);
                    var selectedOption = getSelectedOption(featureFromTicket);
                    if (selectedOption != null) {
                        settingsArray[stripNamespace(settingName)] = getNodeNameWithPrefix(printTicket.XmlNode, selectedOption);
                    }
                } else { // parameterInit
                    var paramInitValue = getParameterInitValue(docElement, settingName);
                    settingsArray[stripNamespace(settingName)] = paramInitValue;
                }
            }
        }

        //Get KM Custom Properties
        if (customProperties) {
            var scope = ["Job", "Document", "Page"];
            for (var i = 0; i < scope.length; ++i) {
                try {
                    // get scope count
                    var countName = "ns0000:" + scope[i] + "KM" + scope[i] + "CustomCount"
                    var scopeCount = getParameterInitValue(printTicket.XmlNode.documentElement, countName);

                    for (var cnt = 0; cnt < scopeCount; cnt++) {
                        //add padding
                        var pad = "000";
                        var count = "" + cnt;
                        count = pad.substring(0, pad.length - count.length) + count;

                        var paramInitName = scope[i] + "KM" + scope[i] + "CustomProperties" + count;
                        var value = getParameterInitValue(docElement, makePrefixAndName(privPrefix, paramInitName));
                        var obj = eval("(" + value + ")");

                        // Move all items to settingsArray
                        if (obj.features) {
                            var features = obj.features;
                            for (var key in features) {
                                settingsArray[key] = features[key];
                            }
                        }
                        if (obj.paraminits) {
                            var paraminits = obj.paraminits;
                            for (var key in paraminits) {
                                settingsArray[key] = paraminits[key];
                            }
                        }
                    }

                } catch (e) {
                }
            }
        }
    }

    // get device settings from queue property bag
    var deviceSettings = getJSONFromPropertyBag(_DPB, Constants.DEVICE_SETTING_LIST);

    for (var i = 0; i < deviceSettings.length; ++i) {
        settingsArray[deviceSettings[i]] = _QPB.GetString(deviceSettings[i]);
    }

    return settingsArray;
}

function checkIfSkipSetting(settingName) {

    if (settingName == "ns0000:PageDevmodeSnapshot" ||
        settingName.indexOf("DisplayName") == settingName.length - 11 ||
        settingName.indexOf("CustomProperties") != -1) {
        return true;
    }

    return false;
}

function getMediaType(customPaperTypes, settingsArray) {
    var pageInputBinToJobTrayMapping =
        {
            "ns0000:TRAY1": Constants.MEDIA_TYPE.TRAY0_MEDIA_TYPE,
            "ns0000:TRAY2": Constants.MEDIA_TYPE.TRAY1_MEDIA_TYPE,
            "ns0000:TRAY3": Constants.MEDIA_TYPE.TRAY2_MEDIA_TYPE,
            "ns0000:TRAY4": Constants.MEDIA_TYPE.TRAY3_MEDIA_TYPE,
            "ns0000:TRAYLCT": Constants.MEDIA_TYPE.TRAY4_MEDIA_TYPE,
            "ns0000:MANUALFEED": Constants.MEDIA_TYPE.TRAY5_MEDIA_TYPE
        };

    // Get Selected Tray First
    var selectedTray = settingsArray[Constants.PAPER_INPUT_BIN.NAME];
    var paperType = settingsArray[Constants.MEDIA_TYPE.NAME];

    if (!paperType) {
        return Constants.MEDIA_TYPE.PLAIN;
    }

    if (selectedTray) {
        // First if the tray is not Auto, get the matching PageMediaType from the selected tray
        if (selectedTray !== Constants.PAPER_INPUT_BIN.AUTO_SELECT) {
            var jobTray = pageInputBinToJobTrayMapping[selectedTray];
            if (settingsArray[jobTray]) {
                paperType = settingsArray[jobTray];
            }
        }

        // If custom paper type selected, mimic that selected paper
        if (paperType.indexOf(Constants.MEDIA_TYPE.CUSTOM_PAPER) != -1) {
            return paperType;
            //TODO GetCustomPaperType was never implemented. Expected behavior is currently unclear, it is assumed to be used for
            //CustomTypeXX(01-19) papers. However they are not yet supported and is different from CustomTypeX(1-6)
            //return GetCustomPaperType(Constants.MEDIA_TYPE.NAME, paperType, customPaperTypes);
        }
        // Else, ordinary paper. Return as-is
        else {
            return paperType;
        }
    }

    return Constants.MEDIA_TYPE.PLAIN;
}

var featureArr = {};
function getFeature(printTicketOrCapability, featureName) {
    if (featureArr[featureName] != null) {
        return featureArr[featureName];
    }

    var name = getNameWithNamespaceFromName(printTicketOrCapability.XmlNode, featureName);
    if (name == null || name.namespace == null || name.name == null) {
        return null;
    }

    featureArr[featureName] = printTicketOrCapability.GetFeature(name.name, name.namespace);
    return featureArr[featureName];
}

function getSelectedOption(feature) {
    if (feature == null) {
        return null;
    }

    var SelectedOption = null;

    try {
        SelectedOption = feature.SelectedOption;
    }
    catch (e) {
    }

    return SelectedOption;
}

function addPskProperties(printCapabilities, pskProperties) {
    var docElement = printCapabilities.XmlNode.documentElement;
    var parentNode = docElement;

    // process paraminits
    var parameterInits = pskProperties["paraminits"];
    if (parameterInits != null) {
        for (var i = 0; i < parameterInits.length; i++) {
            var parameterInit = parameterInits[i];
            addOrReplaceParameterDef(parentNode, parameterInit);
        }
    }

    // Features
    var features = pskProperties["features"];
    if (features != null) {
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            parentNode = docElement;
            if (feature.parentFeature != null) {
                parentNode = getElementNode(parentNode, psfPrefix + ":Feature", feature.parentFeature);
                if (parentNode == null)
                    continue;
            }

            //set display name from dispID
            if (displayNameList != null) {
                feature.displayName = displayNameList[feature.dispID];

                if (feature.options != null) {
                    for (var j = 0; j < feature.options.length; j++) {
                        var tempOption = feature.options[j];
                        tempOption.displayName = displayNameList[tempOption.dispID];
                    }
                }
            }

            addFeature(parentNode, feature, false);
        }
    }
}

function addOrReplaceParameterDef(parentNode, parameterDef) {

    var parameterDefNode = getParameterDef(parentNode, parameterDef.name);

    //if paramDef exists, update with items from pskProperties
    if (parameterDefNode != null) {

        if (parameterDef.maxval != null) {
            var propertyValueNode = parameterDefNode.selectSingleNode("psf:Property[@name='psf:MaxValue']/psf:Value");
            propertyValueNode.text = parameterDef.maxval;
        }

        if (parameterDef.minval != null) {
            var propertyValueNode = parameterDefNode.selectSingleNode("psf:Property[@name='psf:MinValue']/psf:Value");
            propertyValueNode.text = parameterDef.minval;
        }

        if (parameterDef["default"] != null) {
            var propertyValueNode = parameterDefNode.selectSingleNode("psf:Property[@name='psf:DefaultValue']/psf:Value");
            propertyValueNode.text = parameterDef["default"];
        }

        if (parameterDef.displayName != null) {
            var propertyValueNode = parameterDefNode.selectSingleNode("psf:Property[@name='psk:DisplayName']/psf:Value");
            propertyValueNode.text = parameterDef.displayName;
        }

        if (parameterDef.type != null) {
            var propertyValueNode = parameterDefNode.selectSingleNode("psf:Property[@name='psf:DataType']/psf:Value");
            propertyValueNode.text = makePrefixAndName(xsdPrefix, parameterDef.type);
        }
    }
    else {
        //add the paramdefNode
        parameterDefNode = xmlAddChildElementWithName(parentNode, psfNs, "ParameterDef", parameterDef.name);

        if (parameterDef.maxval != null && parameterDef.type != null) {
            addProperty(parameterDefNode, psfPrefix, "MaxValue", parameterDef.type, parameterDef.maxval);
        }

        if (parameterDef.minval != null && parameterDef.type != null) {
            addProperty(parameterDefNode, psfPrefix, "MinValue", parameterDef.type, parameterDef.minval);
        }

        if (parameterDef["default"] != null && parameterDef.type != null) {
            addProperty(parameterDefNode, psfPrefix, "DefaultValue", parameterDef.type, parameterDef["default"]);
        }

        if (parameterDef.displayName != null) {
            addProperty(parameterDefNode, pskPrefix, "DisplayName", "string", parameterDef.displayName);
        }

        if (parameterDef.type != null) {
            addProperty(parameterDefNode, psfPrefix, "DataType", "QName", makePrefixAndName(xsdPrefix, "string"));
        }

    }
}

function getParameterDef(parentNode, name) {
    var query = "/psf:PrintCapabilities/psf:ParameterDef[@name='" + name + "']";
    var resultNode = parentNode.selectSingleNode(query);
    if (resultNode) {
        return resultNode;
    }
    return null;
}

function xmlAddChildElementWithName(parentNode, tagNamespace, tagName, name) {
    var childElement = xmlAddChildElement(parentNode, tagNamespace, tagName);
    childElement.setAttribute("name", name);
    parentNode.appendChild(childElement);
    return childElement;
}

function xmlAddChildElement(parentNode, tagNamespace, tagName) {
    var document = parentNode.ownerDocument;
    var childElement = document.createNode(1, getNameWithPrefix(document, tagNamespace, tagName), tagNamespace);
    parentNode.appendChild(childElement);
    return childElement;
}

function getNameWithPrefix(xmlNode, namespace, name) {
    var prefix = getPrefixFromNamespace(xmlNode, namespace);

    if (prefix == null) {
        return null;
    }

    return makePrefixAndName(prefix, name);
}


function addProperty(parentNode, propertyPrefix, propertyName, propertyType, propertyValue) {
    if (propertyValue == null) {
        return null;
    }

    var propertyNode = xmlAddChildElementWithName(parentNode, psfNs, "Property", makePrefixAndName(propertyPrefix, propertyName));
    var valueNode = xmlAddChildElement(propertyNode, psfNs, "Value");
    xmlAddAttributeToElement(valueNode, xsiNs, "type", makePrefixAndName(xsdPrefix, propertyType));
    valueNode.text = propertyValue;
}

function xmlAddAttributeToElement(parentNode, attributeNamespace, attributeName, value) {
    var document = parentNode.ownerDocument;
    var attributeNode = document.createNode(2, getNameWithPrefix(document, attributeNamespace, attributeName), attributeNamespace);

    attributeNode.value = value;
    parentNode.setAttributeNode(attributeNode);
}

function addParameterDefProperty(parentNode, property) {
    var propertyNode = xmlAddChildElementWithName(parentNode, psfNs, "Property", property.name);
    if (property.value != null) {
        var valueNode = xmlAddChildElement(propertyNode, psfNs, "Value");
        xmlAddAttributeToElement(valueNode, xsiNs, "type", property.type);
        valueNode.text = property.value;
    }
}

function getElementNode(parentNode, tag, elementName) {
    var name = getNameWithNamespaceFromName(parentNode, elementName)
    if (name == null || name.name == null || name.namespace == null) {
        return null;
    }
    var node = searchByAttributeName(parentNode, tag, name.namespace, name.name);
    return node;
}

function searchByAttributeName(node, tagName, keywordNamespace, nameAttribute) {
    /// <summary>
    ///      Search for a node that with a specific tag name and containing a
    ///      specific 'name' attribute
    ///      e.g. &lt;Bar name=\"ns:Foo\"&gt; is a valid result for the following search:
    ///           Retrieve elements with tagName='Bar' whose nameAttribute='Foo' in
    ///           the namespace corresponding to prefix 'ns'.
    /// </summary>
    /// <param name="node" type="IXMLDOMNode">
    ///     Scope of the search i.e. the parent node.
    /// </param>
    /// <param name="tagName" type="String">
    ///     Restrict the searches to elements with this tag name.
    /// </param>
    /// <param name="keywordNamespace" type="String">
    ///     The namespace in which the element's name is defined.
    /// </param>
    /// <param name="nameAttribute" type="String">
    ///     The 'name' attribute to search for.
    /// </param>
    /// <returns type="IXMLDOMNode" mayBeNull="true">
    ///     IXMLDOMNode on success, 'null' on failure.
    /// </returns>
    if (!node ||
        !tagName ||
        !keywordNamespace ||
        !nameAttribute) {
        return null;
    }

    // Please refer to:
    // http://blogs.msdn.com/b/benkuhn/archive/2006/05/04/printticket-names-and-xpath.aspx
    // for more information on this XPath query.
    var xPathQuery = "descendant::"
                    + tagName
                    + "[substring-after(@name,':')='"
                    + nameAttribute
                    + "']"
                    + "[name(namespace::*[.='"
                     + keywordNamespace
                     + "'])=substring-before(@name,':')]"
    ;

    return node.selectSingleNode(xPathQuery);
}

function addFeature(parentNode, feature, isPrintTicket) {
    var featureNode = xmlAddChildElementWithName(parentNode, psfNs, "Feature", feature.name);
    addFeatureProperty(featureNode, feature, isPrintTicket);
    if (feature.subFeatures != null) {
        for (var i = 0; i < feature.subFeatures.length; i++) {
            var subFeature = feature.subFeatures[i];
            addFeature(featureNode, subFeature, isPrintTicket);
        }
    }
}

function addFeatureProperty(parentNode, feature, isPrintTicket) {
    if (!isPrintTicket) {
        addProperty(parentNode, pskPrefix, "DisplayName", "string", feature.displayName);

        if (feature.pickMany == null || feature.pickMany == "false") {
            addProperty(parentNode, psfPrefix, "SelectionType", "QName", makePrefixAndName(pskPrefix, "PickOne"));
        } else if (feature.pickMany == "true") {
            addProperty(parentNode, psfPrefix, "SelectionType", "QName", makePrefixAndName(pskPrefix, "PickMany"));
        }
    }

    addFeatureOptions(parentNode, feature.options, isPrintTicket);
}

function addFeatureOptions(parentNode, options, isPrintTicket) {
    if (options == null) {
        return;
    }

    if (options.length === undefined) {
        var option = options[0];
        var optionNode;
        if (option.name != null) {
            optionNode = xmlAddChildElementWithName(parentNode, psfNs, "Option", option.name);
        } else {
            optionNode = xmlAddChildElement(parentNode, psfNs, "Option");
        }
        if (!isPrintTicket) {
            addProperty(optionNode, pskPrefix, "DisplayName", "string", option.displayName);
        }
        addScoredProperty(optionNode, option.scoredProperties);
    } else {
        for (var i = 0; i < options.length; i++) {
            var option = options[i];
            var optionNode;
            if (option.name != null) {
                optionNode = xmlAddChildElementWithName(parentNode, psfNs, "Option", option.name);
            } else {
                optionNode = xmlAddChildElement(parentNode, psfNs, "Option");
            }
            if (!isPrintTicket) {
                addProperty(optionNode, pskPrefix, "DisplayName", "string", option.displayName);
            }
            addScoredProperty(optionNode, option.scoredProperties);
        }
    }
}

function addScoredProperty(parentNode, scoredProperties) {
    if (scoredProperties == null) {
        return;
    }

    for (var i = 0; i < scoredProperties.length; i++) {
        var scoredProperty = scoredProperties[i];

        var scoredPropertyNode = xmlAddChildElementWithName(parentNode, psfNs, "ScoredProperty", scoredProperty.name);
        if (scoredProperty.value != null) {
            var valueNode = xmlAddChildElement(scoredPropertyNode, psfNs, "Value");
            if (scoredProperty.type != null) {
                xmlAddAttributeToElement(valueNode, xsiNs, "type", makePrefixAndName(xsdPrefix, scoredProperty.type));
            }
            else {
                xmlAddAttributeToElement(valueNode, xsiNs, "type", makePrefixAndName(xsdPrefix, "QName"));
            }
            valueNode.text = scoredProperty.value;
            scoredPropertyNode.appendChild(valueNode);
        }
        if (scoredProperty.parameterRef != null) {
            var parameterRefNode = xmlAddChildElementWithName(scoredPropertyNode, psfNs, "ParameterRef", scoredProperty.parameterRef);
        }
    }
}

function addStringParamDefForKMCustomProperty(parentNode, name, defaultValues, jsonCapabilities, scope) {
    var defaultValuesFullString = trim(JSONStringify(defaultValues));
    var defaultValuesArray = splitIntoChunks(defaultValuesFullString, Constants.NODE_MAX_LENGTH);
    var jsonCapabilitiesFullString = trim(JSONStringify(jsonCapabilities));
    var jsonCapabilitiesArray = splitIntoChunks(jsonCapabilitiesFullString, Constants.NODE_MAX_LENGTH);

    var maxIndex = jsonCapabilitiesArray.length;
    if (defaultValuesArray.length > jsonCapabilitiesArray.length) {
        maxIndex = defaultValuesArray.length;
    }

    // add customprop count
    var paramDefCount = xmlAddChildElementWithName(parentNode, psfNs, "ParameterDef", makePrefixAndName(privPrefix, scope + "KM" + scope + "CustomCount"));
    addProperty(paramDefCount, psfPrefix, "DataType", "QName", makePrefixAndName(xsdPrefix, "integer"));
    addProperty(paramDefCount, psfPrefix, "Multiple", "integer", 1);
    addProperty(paramDefCount, psfPrefix, "MaxValue", "integer", 65535);
    addProperty(paramDefCount, psfPrefix, "MinValue", "integer", 1);
    addProperty(paramDefCount, psfPrefix, "Mandatory", "QName", makePrefixAndName(pskPrefix, "Optional"));
    addProperty(paramDefCount, psfPrefix, "UnitType", "string", "count");
    addProperty(paramDefCount, psfPrefix, "DefaultValue", "integer", maxIndex);

    for (var i = 0; i < maxIndex; i++) {
        //add padding
        var pad = "000";
        var count = "" + i;
        count = pad.substring(0, pad.length - count.length) + count;
        var paramDefName = name + count;

        var finalDefaultValues;
        if (defaultValuesArray[i])
            finalDefaultValues = defaultValuesArray[i];
        else
            finalDefaultValues = "";

        var finalJsonCapabilities;
        if (jsonCapabilitiesArray[i])
            finalJsonCapabilities = jsonCapabilitiesArray[i];
        else
            finalJsonCapabilities = "";

        var paramDef = xmlAddChildElementWithName(parentNode, psfNs, "ParameterDef", paramDefName);
        addProperty(paramDef, psfPrefix, "DataType", "QName", makePrefixAndName(xsdPrefix, "string"));
        addProperty(paramDef, psfPrefix, "MaxLength", "integer", 65535);
        addProperty(paramDef, psfPrefix, "MinLength", "integer", 1);
        addProperty(paramDef, psfPrefix, "Mandatory", "QName", makePrefixAndName(pskPrefix, "Optional"));
        addProperty(paramDef, psfPrefix, "UnitType", "string", "json");
        addProperty(paramDef, psfPrefix, "DefaultValue", "string", finalDefaultValues);
        addProperty(paramDef, privPrefix, "Capabilities", "string", finalJsonCapabilities);
    }
}

function makePrefixAndName(prefix, name) {
    return prefix + ":" + name;
}

function addPSKCustomToTicket(printTicket, customProperties, devModeValues, userProperties) {

    // Features
    var features = customProperties["features"];
    if (features != null) {
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            var parentNode = printTicket.XmlNode.documentElement;

            // Begin processing
            if (feature.parentFeature != null) {
                parentNode = getElementNode(parentNode, makePrefixAndName(psfPrefix, "Feature"), feature.parentFeature);
                if (parentNode == null)
                    continue;
            }

            if (getElementNode(parentNode, "psf:Feature", feature.name) == null) {
                var devmode = null;
                if (devModeValues != null) {
                    try {
                        devmode = devModeValues["features"];
                    }
                    catch (e) {
                        return;
                    }
                }
                addCustomToPrintTicket(parentNode, feature, devmode, userProperties);
            }
        }
    }
}

function addCustomToPrintTicket(parentNode, feature, devModeValues, userProperties) {
    // get value from UPB and DPB
    var value = getStringFromPropertyBag(userProperties, feature.name);

    if (value != null && feature.storage == "user") {
        // set upb value
        var featureWithSelectedOption = {};
        featureWithSelectedOption["name"] = feature.name;

        var selectedOption = {};
        selectedOption["name"] = value;

        featureWithSelectedOption.options = new Array(1);
        featureWithSelectedOption.options[0] = selectedOption;
        // set UPB value as PrintTicket value
        addFeature(parentNode, featureWithSelectedOption, true);

    } else {
        // set devmode value
        try {
            var selectedOption = null;
            var devModeSetting = null;

            try {
                devModeSetting = devModeValues[feature.name];
            }
            catch (e) {
            }

            if (devModeSetting != null) {
                for (var i = 0; i < feature.options.length; i++) {
                    if (feature.options[i]["name"] == devModeSetting) {
                        selectedOption = feature.options[i];
                        break;
                    }
                }
            }

            if (selectedOption) {
                var featureWithSelectedOption = new Object();
                featureWithSelectedOption.name = feature.name;
                featureWithSelectedOption.options = new Array(1);
                featureWithSelectedOption.options[0] = selectedOption;
                addFeature(parentNode, featureWithSelectedOption, true);
            }
        } catch (e) {
            return null;
        }
    }
}

function addPSKCustomPropertiesToTicket(printTicket, customProperties, devModeValues, userProperties, pdl) {
    // Features
    var features = customProperties["features"];
    if (features != null) {
        for (var i = 0; i < features.length; i++) {
            var feature = features[i];
            var parentNode = printTicket.XmlNode.documentElement;

            // Begin processing
            if (feature.parentFeature != null) {
                parentNode = getElementNode(parentNode, makePrefixAndName(psfPrefix, "Feature"), feature.parentFeature);
                if (parentNode == null)
                    continue;
            }

            if (getElementNode(parentNode, "psf:Feature", feature.name) == null) {
                var devmode = null;
                if (devModeValues != null) {
                    try {
                        devmode = devModeValues["features"];
                    }
                    catch (e) { }

                    // Do not add DocumentBinding in the print ticket if the PDL is PCL or PS.
                    // This causes shifting in wide paper sizes which causes cropping issues.
                    if ((pdl == "PCL" || pdl == "PS") && feature.name == "DocumentBinding" && userProperties == null) {
                        feature.options[0]["name"] = "psk:none";
                    }
                }
                addCustomFeatureToPrintTicket(parentNode, feature, devmode, userProperties, pdl);
            }
        }
    }
}

function addCustomFeatureToPrintTicket(parentNode, feature, devModeValues, userProperties, pdl) {
    // get value from UPB and DPB
    var value = getStringFromPropertyBag(userProperties, feature.name);
    var defaultValue = feature["default"];

    if (value != null && feature.storage == "user") {

        var featureWithSelectedOption = {};
        featureWithSelectedOption["name"] = feature.name;

        var selectedOption = {};
        selectedOption["name"] = value;

        featureWithSelectedOption.options = new Array(1);
        featureWithSelectedOption.options[0] = selectedOption;
        // set UPB value as PrintTicket value
        addFeature(parentNode, featureWithSelectedOption, true);

    } else if (defaultValue != null) {
        try {
            var selectedOption = null;
            var devModeSetting = null;

            try {
                devModeSetting = devModeValues[feature.name];
            }
            catch (e) { }

            if (devModeSetting != null) {
                for (var i = 0; i < feature.options.length; i++) {
                    if (feature.options[i]["name"] == devModeSetting) {
                        selectedOption = feature.options[i];
                        break;
                    }
                }
            }

            if (selectedOption == null) {
                // Nothing was saved in devmode prop bag yet, use default property.
                for (var i = 0; i < feature.options.length; i++) {
                    if (feature.options[i]["name"] == defaultValue) {
                        selectedOption = feature.options[i];
                        break;
                    }
                }
            }
            if (selectedOption) {
                if ((pdl == "PCL" || pdl == "PS") && stripNamespace(feature.name) == Constants.JOB_NUP_ALL_DOCUMENTS_CONTIGUOUSLY.NAME && userProperties == null) {
                    selectedOption.name = "ns0000:_1";
                    selectedOption.scoredProperties[0].value = "1";
                }

                var featureWithSelectedOption = new Object();
                featureWithSelectedOption.name = feature.name;
                featureWithSelectedOption.options = new Array(1);
                featureWithSelectedOption.options[0] = selectedOption;
                addFeature(parentNode, featureWithSelectedOption, true);
            }
        } catch (e) {
            return null;
        }
    }
}

function addKMCustomParameterInitToTicket(printTicket, customProperties, ptParamInitName, devModeValues, userProperties, modelChanged) {

    // add features to JSON string
    var settingTypes = ["features", "paraminits"];
    var obj = {};
    for (var i = 0; i < settingTypes.length; ++i) {
        var settingType = customProperties[settingTypes[i]];
        obj[settingTypes[i]] = {};

        for (var j = 0; j < settingType.length; ++j) {
            var setting = settingType[j];
            var settingName = setting.name;

            // get stored value from propertybag
            var storedValue = null;
            if (setting["storage"] == "user") {
                storedValue = getStringFromPropertyBag(userProperties, settingName);

                if (setting["type"] == "integer" && storedValue != null) {
                    var intValue = parseInt(storedValue);
                    if (!isNaN(intValue)) {
                        storedValue = intValue;
                    }
                }
            }
            else {
                if (devModeValues != null) {
                    try {
                        //Special handling to swap between Device and Driver Booklet
                        if(settingName == Constants.JOB_LAYOUT.NAME && 
                            devModeValues[settingTypes[i]][settingName] == undefined) {
                            storedValue = devModeValues[settingTypes[i]][Constants.JOB_BOOKLET.NAME] == Constants.JOB_BOOKLET.ON ?
                                Constants.JOB_LAYOUT.ON : Constants.JOB_LAYOUT.OFF;
                        } 
                        else if (settingName == Constants.JOB_BOOKLET.NAME &&
                            devModeValues[settingTypes[i]][settingName] == undefined) {
                            storedValue = devModeValues[settingTypes[i]][Constants.JOB_LAYOUT.NAME] == Constants.JOB_LAYOUT.ON ?
                                Constants.JOB_BOOKLET.ON : Constants.JOB_BOOKLET.OFF;
                        }
                        else {
                            storedValue = devModeValues[settingTypes[i]][settingName];
                        }
                    }
                    catch (e) { }
                }
            }

            if (storedValue != null) {
                obj[settingTypes[i]][settingName] = storedValue;

                if (modelChanged == true) {
                    if (i == 0 && settingName == "Hold") {
                        if (setting["default"] != null) {
                            obj[settingTypes[i]][settingName] = setting["default"];
                        }
                    }

                    if (i == 1 && settingName == "KMJobID") {
                        obj[settingTypes[i]][settingName] = setting["default"];
                    }

                    if (i == 1 && settingName == "HoldKey") {
                        obj[settingTypes[i]][settingName] = setting["default"];
                    }

                    if (i == 1 && settingName == "KMUsername") {
                        obj[settingTypes[i]][settingName] = setting["default"];
                    }

                    if (i == 1 && settingName == "KMUserkey2") {
                        obj[settingTypes[i]][settingName] = setting["default"];
                    }

                    if (i == 1 && settingName == "SectName") {
                        obj[settingTypes[i]][settingName] = setting["default"];
                    }

                    if (i == 1 && settingName == "SectKey2") {
                        obj[settingTypes[i]][settingName] = setting["default"];
                    }
                }

            } else {
                if (setting["default"] != null) {
                    obj[settingTypes[i]][settingName] = setting["default"];
                } else {
                    obj[settingTypes[i]][settingName] = null;
                }
            }
        }
    }

    // append paraminit to print ticket
    addOrReplaceParameterInit(printTicket.XmlNode.documentElement, JSONStringify(obj), privPrefix + ":" + ptParamInitName);
}

function addOrReplaceParameterInit(parentNode, parameterValue, parameterInitName, type) {
    var oldNode = getParameterInit(parentNode, parameterInitName);
    if (oldNode) {
        parentNode.removeChild(oldNode);
    }

    // do not add parameterinit if there is no value (to prevent errors in the print ticket)
    if (parameterValue != null && parameterValue.length > 0) {
        var parameterInitNode = xmlAddChildElementWithName(parentNode, psfNs, "ParameterInit", parameterInitName);
        var valueNode = xmlAddChildElement(parameterInitNode, psfNs, "Value");
        if (!type) {
            type = "string";
        }
        xmlAddAttributeToElement(valueNode, xsiNs, "type", makePrefixAndName(xsdPrefix, type));
        valueNode.text = parameterValue;
    }
}

function getParameterInit(parentNode, name) {
    var query = "/psf:PrintTicket/psf:ParameterInit[@name='" + name + "']";
    var resultNode = parentNode.selectSingleNode(query);
    if (resultNode) {
        return resultNode;
    }
    return null;
}

function getPrinterDevice() {
    if (!printerModel) { // check if printerModel is undefined or blank
        var modelName = getStringFromPropertyBag(_QPB, "Config_Model");
        printerModel = getSeriesName(_DPB, modelName);
    }
}

function getSeriesName(driverProperties, modelName) {
    var modelInfo = getJSONFromPropertyBag(driverProperties, "Model_" + modelName);
    return modelInfo.ReferenceSeries == null ? modelInfo.Series : modelInfo.ReferenceSeries;
}

function ProvideValue(settingsArray, settingName, customPaperTypes) {
    if (stripNamespace(settingName) == Constants.PHYSICAL_OUTPUT_PAPER_SIZE.NAME) {
        if (settingsArray[Constants.OUTPUT_PAPER_SIZE.NAME] == Constants.OUTPUT_PAPER_SIZE.USE_PAPER_SIZE)
            return settingsArray[Constants.PAGE_MEDIA_SIZE.NAME];
        else
        {
            var outputPaperSize = settingsArray[Constants.OUTPUT_PAPER_SIZE.NAME]
            return outputPaperSize == "UserPaper" ? "CustomMediaSize" : outputPaperSize;
        }
    }
    else if (stripNamespace(settingName) == Constants.PHYSICAL_OUTPUT_CUSTOM_PAPER_SIZE_WIDTH.NAME) {
        if (settingsArray[Constants.OUTPUT_PAPER_SIZE.NAME] == Constants.OUTPUT_PAPER_SIZE.USE_PAPER_SIZE)
            return settingsArray[Constants.PAGE_MEDIA_SIZE_MEDIA_SIZE_WIDTH.NAME];
        else
            return settingsArray[Constants.PAGE_OUTPUT_CUSTOM_PAPER_SIZE_WIDTH.NAME];
    }
    else if (stripNamespace(settingName) == Constants.PHYSICAL_OUTPUT_CUSTOM_PAPER_SIZE_HEIGHT.NAME) {
        if (settingsArray[Constants.OUTPUT_PAPER_SIZE.NAME] == Constants.OUTPUT_PAPER_SIZE.USE_PAPER_SIZE)
            return settingsArray[Constants.PAGE_MEDIA_SIZE_MEDIA_SIZE_HEIGHT.NAME];
        else
            return settingsArray[Constants.PAGE_OUTPUT_CUSTOM_PAPER_SIZE_HEIGHT.NAME];
    }
    else if (stripNamespace(settingName) == Constants.PHYSICAL_OUTPUT_ORIENTATION.NAME) {
        var orientation = settingsArray[Constants.PAGE_ORIENTATION.NAME];
        var combination = settingsArray[Constants.JOB_NUP_ALL_DOCUMENTS_CONTIGUOUSLY.NAME];
        if ((orientation == Constants.PAGE_ORIENTATION.PORTRAIT && (combination == Constants.JOB_NUP_ALL_DOCUMENTS_CONTIGUOUSLY.NONE ||
                                                                    combination == Constants.JOB_NUP_ALL_DOCUMENTS_CONTIGUOUSLY._4IN1 ||
                                                                    combination == Constants.JOB_NUP_ALL_DOCUMENTS_CONTIGUOUSLY._9IN1 ||
                                                                    combination == Constants.JOB_NUP_ALL_DOCUMENTS_CONTIGUOUSLY._16IN1)) ||
            (orientation == Constants.PAGE_ORIENTATION.LANDSCAPE && (combination == Constants.JOB_NUP_ALL_DOCUMENTS_CONTIGUOUSLY._2IN1 ||
                                                                     combination == Constants.JOB_NUP_ALL_DOCUMENTS_CONTIGUOUSLY._6IN1))) {
            return Constants.PAGE_ORIENTATION.PORTRAIT;
        }
        else {
            return Constants.PAGE_ORIENTATION.LANDSCAPE;
        }
    }
    else if (stripNamespace(settingName) === Constants.MEDIA_TYPE.NAME) {
        settingsArray[Constants.MEDIA_TYPE.NAME] = getMediaType(customPaperTypes, settingsArray);
    }
    return settingsArray[GetFeatureName(settingName)];
}

//Sets the Device Setting Constraints in the Print Capabilities
//Parameters:
//scriptContext - used to get the Config setting values from the Queue Property Bag
//printTicket - used to get the Feature setting values
//printCapabilities - will be updated with the Device Setting constraints
function setDeviceSettingConstraint(printTicket, printCapabilities) {

    //get the values for the Feature settings in the Print Ticket and Config settings in the Queue Property Bag
    var settings = GetSettingsArray(printTicket);

    //get the Device Setting Constraints
    var deviceSettingConstraints = getDeviceSettingConstraints(getStringFromPropertyBag(_DPB, "DeviceSettingConstraintsJSON"));

    //evaluate the constraint conditions and update the constrained attribute of the Feature Option in the Print Capabilities
    for (var i = 0; i < deviceSettingConstraints.length; i++) {
        var isTrue = evaluateConditions(settings, deviceSettingConstraints[i].conditions);

        if (isTrue) {
            updateDeviceSettingConstraint(printCapabilities, deviceSettingConstraints[i].options);
        }
    }
}

//Get the Device Setting Constraints from the JSON string from the Queue Property Bag
//Parameters:
//strConstraints - the JSON string containing the Device Setting Constraints
//includePrintTicket - used to determine if settings from the Print Ticket will be included in the evaluation
function getDeviceSettingConstraints(strConstraints, includePrintTicket) {
    var deviceSettingConstraints = new Array();
    var jsonConstraints = eval("(" + strConstraints + ")");
    var jsonConstraintsRoot = jsonConstraints["r"];

    for (var i = 0; i < jsonConstraintsRoot.length; i++) {
        var constraint = constructDeviceSettingConstraint(jsonConstraintsRoot[i]["i"]);

        if (constraint.isConfig == true) {
            deviceSettingConstraints.push(constraint);
        }
    }

    return deviceSettingConstraints;
}

//Evaluates the Device Constraint conditions
//Parameters:
//settings - contains the values for the Feature and Config settings
//conditions - the conditions for the constraint to be satisfied
function evaluateConditions(settings, conditions) {
    for (var i = 0; i < conditions.length; i++) {
        var feature = conditions[i].feature;
        var operators = conditions[i].operators;
        var options = conditions[i].options;

        var actualValue = settings[feature];

        var orValue = false;

        for (var j = 0; j < operators.length; j++) {
            // Since this is a chain of || operators, we bail out on first true.
            if (evaluateExpression(options[j], operators[j], actualValue)) {
                orValue = true;
                break;
            }
        }

        // Since this is a chain of && operators, we bail out on first false.
        if (!orValue)
            return false;
    }

    return true;
}

//Set the Device Setting constraints in the Print Capabilities
//Parameters:
//printCapabilities - will be updated with the Device Setting constraints
//options - contains the feature options to be set as Device Setting constraint
function updateDeviceSettingConstraint(printCapabilities, options) {
    var rootNode = printCapabilities.XmlNode.documentElement;

    var feature = options.feature;
    var options = options.options;

    var xPathQueryFeature = "//" + psfPrefix + ":Feature[@name='" + feature + "']";

    for (var i = 0; i < options.length; i++) {
        var xPathQueryOption = "/" + psfPrefix + ":Option[@name='" + options[i] + "']"
        var node = rootNode.selectSingleNode(xPathQueryFeature + xPathQueryOption);

        if (node != null) {
            node.setAttribute("constrained", "psk:DeviceSettings");
        }
    }
}

//Construct the Device Setting Constraint object
//Parameter:
//constraint - the Device Setting Constraint containing the Conditions and Options to be updated
function constructDeviceSettingConstraint(constraint) {
    var constraintObj = new ConstraintObject();
    var conditions = new Array();
    var constraintOptions = new ConstraintOptionsObject();

    var isConfig = true;

    for (var i = 0; i < constraint.length; i++) {
        if (i < constraint.length - 1) {
            var feature = constraint[i]["s"];

            if (feature.indexOf("Config_") != 0) {
                isConfig = false;
            }

            var condition = new ConditionsObject();
            condition.feature = feature;
            condition.operators = constraint[i]["e"];
            condition.options = constraint[i]["c"];

            conditions.push(condition);
        } else {
            constraintOptions.feature = constraint[i]["s"];
            constraintOptions.options = constraint[i]["t"];
        }
    }

    constraintObj.conditions = conditions;
    constraintObj.options = constraintOptions;
    constraintObj.isConfig = isConfig;

    return constraintObj;
}

//Evaluates the expressions in the Device Setting Constraint condition
//Parameters:
//option - the setting value in the condition
//operator - the operator to be used for evaluation
//actualValue - the actual value of the setting from the Queue Property Bag or from the Print Ticket
function evaluateExpression(option, operator, actualValue) {
    var evaluation = false;

    switch (operator) {
        case "==":
            evaluation = actualValue == option;
            break;
        case "!=":
            evaluation = actualValue != option;
            break;
        case "<=":
            evaluation = actualValue <= option;
            break;
        case "<":
            evaluation = actualValue < option;
            break;
        case ">":
            evaluation = actualValue > option;
            break;
        case ">=":
            evaluation = actualValue >= option;
            break;
        default:
            evaluation = false;
    }

    return evaluation;
}

//Object used to store the Device Setting Constraint
//Parameters:
//conditions - the conditions needed to satisfy the constraint
//options - the options to be updated if the conditions are satisfied
//isConfig - used to determine if the constraint contains conditions from the Print Ticket
function ConstraintObject(conditions, options, isConfig) {
    this.conditions = conditions;
    this.options = options;
    this.isConfig = isConfig;
}

//Object used to store the Options to be updated if the Device Setting Constraint conditions are satisfied
//Parameters:
//feature - the feature whose options will be updated
//options - the options to be set as Device Constraints
function ConstraintOptionsObject(feature, options) {
    this.feature = feature;
    this.options = options;
}

//Object used to store the Device Setting Constraint conditions
//Parameters:
//feature - the feature to be checked
//operators - the operators used to evaluate the feature setting value
//options - feature setting values that satisfy the conditions
function ConditionsObject(feature, operators, options) {
    this.feature = feature;
    this.operators = operators;
    this.options = options;
}

function getAllParameterInit(parentNode) {
    var query = "/psf:PrintTicket/psf:ParameterInit";
    var resultNode = parentNode.selectNodes(query);
    if (resultNode) {
        return resultNode;
    }
    return null;
}

function getAllFeatures(parentNode) {
    var query = "/psf:PrintTicket/psf:Feature";
    var resultNode = parentNode.selectNodes(query);
    if (resultNode) {
        return resultNode;
    }
    return null;
}

function ApplyAdminCustomize(printTicket) {
    var adminCustomizeSettings = getJSONFromPropertyBag(_QPB, Constants.ADMIN_CUSTOMIZE.QPB_NAME);

    if (_UPB == null || _QPB == null || !adminCustomizeSettings)
        return;

    var customProperties = (getCustomPropertiesObjCustom(_DPB, _UPB)).custom;

    var adminCustomizeHash = hashCode(JSONStringify(adminCustomizeSettings));
    var adminCustomizeUPBHash = getCheckSumPropertyFromUPB(Constants.ADMIN_CUSTOMIZE.UPB_HASH_NAME);
    var isPTChanged = false;
    var isHashChanged = adminCustomizeHash != adminCustomizeUPBHash;
    if (isHashChanged)
    {
        _UPB.SetString(Constants.ADMIN_CUSTOMIZE.UPB_OPENED_BY_PE, "false");
        _UPB.SetString(Constants.ADMIN_CUSTOMIZE.UPB_OPENED_BY_WSDA, "false");
    }

    var isOpenedByPEStr = getStringFromPropertyBag(_UPB, Constants.ADMIN_CUSTOMIZE.UPB_OPENED_BY_PE);
    var isOpenedByPE = isOpenedByPEStr != null && isOpenedByPEStr == "true" ? true : false;
    var isOpenedByWSDAStr = getStringFromPropertyBag(_UPB, Constants.ADMIN_CUSTOMIZE.UPB_OPENED_BY_WSDA);
    var isOpenedByWSDA = isOpenedByWSDAStr != null && isOpenedByWSDAStr == "true" ? true : false;

    var isDefaultAlreadyApplied = isOpenedByPE || isOpenedByWSDA;

    var windowsUserLogin = getStringFromPropertyBag(_UPB, Constants.ADMIN_CUSTOMIZE.UPB_WINDOWS_LOGIN_ID);

    //START <JIRAv1.2 120> Special handling for 2 color, make sure that PageOutputColor is set to Color
    if (adminCustomizeSettings[Constants.PAGE_OUTPUT_COLOR.NAME_WITH_NAMESPACE] != null &&
        adminCustomizeSettings[Constants.JOB_TWO_COLOR.NAME_WITH_NAMESPACE] != null &&
        adminCustomizeSettings[Constants.JOB_TWO_COLOR.NAME_WITH_NAMESPACE][Constants.ADMIN_CUSTOMIZE.VALUE] ==
        Constants.JOB_TWO_COLOR.ON_WITH_NAMESPACE)
    {
        adminCustomizeSettings[Constants.PAGE_OUTPUT_COLOR.NAME_WITH_NAMESPACE]
            [Constants.ADMIN_CUSTOMIZE.VALUE] = Constants.PAGE_OUTPUT_COLOR.FULL_COLOR_WITH_NAMESPACE;
    }
    //END <JIRAv1.2 120>

    for (var i in adminCustomizeSettings) {
        var newValue = adminCustomizeSettings[i][Constants.ADMIN_CUSTOMIZE.VALUE];
        var isLocked = adminCustomizeSettings[i][Constants.ADMIN_CUSTOMIZE.MODE] ==
            Constants.ADMIN_CUSTOMIZE.MODE_LOCK ? true : false;
        var isDefault = adminCustomizeSettings[i][Constants.ADMIN_CUSTOMIZE.MODE] ==
            Constants.ADMIN_CUSTOMIZE.MODE_DEFAULT ? true : false;

        //Change value if Locked
        //If Default and was changed from previous value
        //If Default and has not yet been processed by PE
        if (isLocked || (isDefault && isHashChanged) || (isDefault && !isDefaultAlreadyApplied)) {
            try {
                var featureNode = printTicket.xmlNode.selectSingleNode("//psf:Feature[@name='" + i + "']");
                if (featureNode != null) {

                    if(!IsValidFeatureOption(stripNamespace(i), stripNamespace(newValue)))
                        continue;

                    var optionNode = featureNode.selectSingleNode("psf:Option");
                    if (optionNode != null && optionNode.attributes[0].nodeValue != newValue) {
                        optionNode.attributes[0].nodeValue = newValue;
                        isPTChanged = true;
                        continue;
                    }
                }

                var noNamespaceFeature = GetFeatureName(i);
                var noNamespaceValue = GetOptionName(i, newValue);
                //Special handling if Use Windows Login is selected
                if (noNamespaceFeature == Constants.ADMIN_CUSTOMIZE.UPB_USE_WINDOWS_LOGIN_ID)
                {
                    noNamespaceFeature = "KMUsername";
                    if (noNamespaceValue == "true" &&
                        windowsUserLogin != null && windowsUserLogin != "")
                        noNamespaceValue = windowsUserLogin;
                    else
                        noNamespaceValue = getStringFromPropertyBag(_UPB, "KMUsername");
                }

                //Special handling to swap device and driver booklet
                if (noNamespaceFeature == Constants.JOB_BOOKLET.NAME &&
                    !IsValidCustomPropertiesOption(customProperties.Job.features, noNamespaceFeature, noNamespaceValue))
                {
                    noNamespaceFeature = Constants.JOB_LAYOUT.NAME;
                    if (noNamespaceValue == Constants.JOB_BOOKLET.ON)
                        noNamespaceValue = Constants.JOB_LAYOUT.ON;
                    else
                        noNamespaceValue = Constants.JOB_LAYOUT.OFF;
                }
                else if (noNamespaceFeature == Constants.JOB_LAYOUT.NAME &&
                    !IsValidCustomPropertiesOption(customProperties.Job.features, noNamespaceFeature, noNamespaceValue))
                {
                    noNamespaceFeature = Constants.JOB_BOOKLET.NAME;
                    if (noNamespaceValue == Constants.JOB_LAYOUT.ON)
                        noNamespaceValue = Constants.JOB_BOOKLET.ON;
                    else
                        noNamespaceValue = Constants.JOB_BOOKLET.OFF;
                }

                var scopeItems = ["Job", "Page"];
                var isFeatureFound = false;

                var isValid = IsValidCustomPropertiesOption(customProperties.Job.features, noNamespaceFeature, noNamespaceValue) ||
                IsValidCustomPropertiesOption(customProperties.Page.features, noNamespaceFeature, noNamespaceValue);

                for (var j = 0; j < scopeItems.length && !isFeatureFound; j++) {
                    var tempString = "ns0000:" + scopeItems[j] + "KM" + scopeItems[j] + "CustomCount";
                    var customPropsCount = printTicket.xmlNode.selectSingleNode("//psf:ParameterInit[@name='" + tempString + "']").nodeTypedValue;

                    for (var k = 0; k < customPropsCount; k++) {
                        var pad = "000";
                        var count = "" + k;
                        count = pad.substring(0, pad.length - count.length) + count;
                        tempString = "ns0000:" + scopeItems[j] + "KM" + scopeItems[j] + "CustomProperties" + count;
                        var customPropsNode = printTicket.xmlNode.selectSingleNode("//psf:ParameterInit[@name='" + tempString + "']/psf:Value");

                        var customPropsFeature = eval("(" + customPropsNode.text + ")")["features"];
                        var customPropsParaminit = eval("(" + customPropsNode.text + ")")["paraminits"];

                        if (customPropsFeature != null && customPropsFeature[noNamespaceFeature] != null && isValid) {
                            customPropsFeature[noNamespaceFeature] = noNamespaceValue;
                            isFeatureFound = true;
                        }
                        else if (customPropsParaminit != null && customPropsParaminit[noNamespaceFeature] != null) {
                            customPropsParaminit[noNamespaceFeature] = noNamespaceValue;
                            isFeatureFound = true;
                        }
                        else
                            continue;

                        if (isFeatureFound) {
                            var items = {};
                            items["features"] = customPropsFeature;
                            items["paraminits"] = customPropsParaminit;
                            customPropsNode.nodeTypedValue = trim(JSONStringify(items));
                            isPTChanged = true;
                            break;
                        }
                    }
                }
            }
            catch (e) {
                //do nothing
            }
        }
    }

    if (isPTChanged) {
        var constraints = getJSONfromStreamPropertyBag(_DPB, "UICstJSON_" + printerModel + ".txt");
        verifyOptions(printTicket, null, constraints);
    }

    _UPB.SetString(Constants.ADMIN_CUSTOMIZE.UPB_HASH_NAME, adminCustomizeHash);
}

function IsValidFeatureOption(featureName, value) {
    if ((featureName == Constants.JOB_DUPLEX_ALL_DOCUMENTS_CONTIGUOUSLY.NAME && value == Constants.JOB_BOOKLET.ON) ||
        (featureName == Constants.JOB_DUPLEX_ALL_DOCUMENTS_CONTIGUOUSLY.NAME && value == Constants.JOB_LAYOUT.ON) ||
        (featureName == Constants.PAGE_OUTPUT_COLOR.NAME && value == Constants.JOB_TWO_COLOR.ON))
        return false;
    return true;
}

function IsValidCustomPropertiesOption(featureList, featureName, value) {
    for (var i = 0; i < featureList.length; i++) {
        if (featureList[i].name == featureName) {
            for (var j = 0; j < featureList[i].options.length; j++) {
                if (featureList[i].options[j].name == value) {
                    return true;
                }
            }
            break;
        }
    }
    return false;
}

/*******************************************************************************/
/*                                                                             */
/* XML Functions                                                               */
/*                                                                             */
/*******************************************************************************/
function setSelectionNamespace(xmlNode, prefix, namespace) {
    /// <summary>
    ///     This function sets the 'SelectionNamespaces' property on the XML Node.
    ///     For more details: http://msdn.microsoft.com/en-us/library/ms756048(VS.85).aspx
    /// </summary>
    /// <param name="xmlNode" type="IXMLDOMNode">
    ///     The node on which the property is set.
    /// </param>
    /// <param name="prefix" type="String">
    ///     The prefix to be associated with the namespace.
    /// </param>
    /// <param name="namespace" type="String">
    ///     The namespace to be added to SelectionNamespaces.
    /// </param>
    xmlNode.setProperty(
        "SelectionNamespaces",
        "xmlns:"
            + prefix
            + "='"
            + namespace
            + "'"
        );
}

function getParameterInitValue(parentNode, name) {
    var query = "/psf:PrintTicket/psf:ParameterInit[@name='" + name + "']/psf:Value";
    var resultNode = parentNode.selectSingleNode(query);
    if (resultNode) {
        var type = null;
        var typeAttribute = resultNode.getAttribute(xsiPrefix + ":type");
        if (typeAttribute == null) {
            type = "string";
        } else {
            type = stripNamespace(typeAttribute);
        }

        if (type == "integer")
            return Number(resultNode.text);
        return resultNode.text;
    }
    return null;
}

function getNameWithNamespaceFromName(xmlNode, nodeName) {
    var parts = nodeName.split(":", 2);
    var prefixValue = parts.length > 1 ? parts[0] : null;
    var nameValue = parts.length > 1 ? parts[1] : parts[0];

    var namespaceValue = getNamespaceFromPrefix(xmlNode, prefixValue);
    return { namespace: namespaceValue, name: nameValue };
}


function getNamespaceFromPrefix(xmlNode, prefix) {
    if (xmlNode == null) {
        return null;
    }

    var rootNode = xmlNode.ownerDocument ? xmlNode.ownerDocument.documentElement : xmlNode.documentElement;
    var xPathQuery = "namespace::node()[name(.)='" + prefix + "']";
    var namespaceNode = rootNode.selectSingleNode(xPathQuery);

    if (namespaceNode == null) {
        return null;
    }

    return namespaceNode.value;
}

function stripNamespace(name) {
    if (name === undefined)
        return name;

    try {
        var colonPos = name.indexOf(":");
        if (colonPos == -1) {
            return name;
        }
        var temp = name.substring(colonPos + 1);
        return temp;
    } catch (e) {
        return name;
    }
}

var FeatureNameMapping = {
    "PageOutPSize": "OutPSize",
    "PageOutPSizeW": "OutPSizeW",
    "PageOutPSizeH": "OutPSizeH",
    "PageScaling": "Scaling",
    "JobOffset": "Offset",
    "JobHold": "Hold",
    "JobBoxType": "BoxType",
    "JobNupBorder": "NupBorder",
    "PagePostMargin": "PostMargin",
    "JobRotate180": "Rotate180",
    "JobDelBlkPaper": "DelBlkPaper",
    "JobLayout": "Layout",
    "JobBooklet": "Booklet",
    "JobBlType": "BlType",
    "JobMaintainOrgSize": "MaintainOrgSize",
    "JobBindShift": "BindShift",
    "JobCStapleFold": "CStapleFold",
    "JobFolding": "Folding",
    "JobFoldPages": "FoldPages",
    "JobFCoverMode": "FCoverMode",
    "JobFCoverTray": "FCoverTray",
    "JobBCoverMode": "BCoverMode",
    "JobBCoverTray": "BCoverTray",
    "JobPIFront": "PIFront",
    "JobPIBack": "PIBack",
    "JobOHPInter": "OHPInter",
    "JobOHPOpTray": "OHPOpTray",
    "JobWatermark": "Watermark",
    "JobTColor": "TColor",
    "JobTColorType": "TColorType",
    "JobTonerSave": "TonerSave",
    "JobUserAuth": "UserAuth",
    "JobCertSrvNum": "CertSrvNum",
    "JobBSMode": "BSMode",
    "JobBSSame": "BSSame",
    "JobBSUnit": "BSUnit",
    "JobEdgeMatch": "EdgeMatch",
    "JobWmStyle": "WmStyle",
    "JobWmColor": "WmColor",
    "JobWmTextBox": "WmTextBox",
    "JobWmSharing": "WmSharing",
    "JobWmTrans": "WmTrans",
    "JobWm1stPOnly": "Wm1stPOnly",
    "JobWmRepeat": "WmRepeat",
    "JobKMJobID": "KMJobID",
    "JobHoldKey": "HoldKey",
    "JobBoxFName": "BoxFName",
    "JobBoxNum": "BoxNum",
    "JobKMUsername": "KMUsername",
    "JobKMUserkey2": "KMUserkey2",
    "JobSectName": "SectName",
    "JobSectKey2": "SectKey2",
    "JobEnhancedServerSettingKey": "EnhancedServerSettingKey",
    "JobBSFront": "BSFront",
    "JobBSBack": "BSBack",
    "JobWmName": "WmName",
    "JobWmText": "WmText",
    "JobWmFont": "WmFont",
    "JobWmIndex": "WmIndex",
    "JobWmColorR": "WmColorR",
    "JobWmColorG": "WmColorG",
    "JobWmColorB": "WmColorB",
    "JobWmSize": "WmSize",
    "JobWmTransP": "WmTransP",
    "JobWmPosX": "WmPosX",
    "JobWmPosY": "WmPosY",
    "JobWmAngle": "WmAngle",
    "PageOrgPSizeU": "OrgPSizeU",
    "PageOutPSizeU": "OutPSizeU",
    "PageScalingVal": "ScalingVal"
};

function GetFeatureName(FeatureName) {
    if (FeatureName === undefined)
        return FeatureName;

    var temp = FeatureNameMapping[stripNamespace(FeatureName)];
    if (temp === undefined)
        return stripNamespace(FeatureName);

    return temp;
}

function GetOptionName(FeatureName, OptionName) {
    if (FeatureName === undefined)
        return OptionName;
    if (OptionName === undefined)
        return OptionName;

    var temp = FeatureNameMapping[stripNamespace(FeatureName)];
    if (temp === undefined)
        return OptionName;

    return stripNamespace(OptionName);
}

function getNodeNameWithPrefix(xmlNode, node) {
    if (node == null) {
        return null;
    }

    var nameValue = node.Name;

    // special case for JobNUp
    if (nameValue == "" && node.PagesPerSheet !== null)
        return node.PagesPerSheet;

    var prefixValue = getPrefixFromNamespace(xmlNode, node.NamespaceUri);

    return makePrefixAndName(prefixValue, nameValue);
}

function getPrefixFromNamespace(xmlNode, namespace) {
    if (xmlNode == null) {
        return null;
    }

    var rootNode = xmlNode.ownerDocument ? xmlNode.ownerDocument.documentElement : xmlNode.documentElement;
    var xPathQuery = "namespace::node()[.='" + namespace + "']";
    var namespaceNode = rootNode.selectSingleNode(xPathQuery);

    if (namespaceNode == null) {
        return null;
    }

    return namespaceNode.baseName;
}

function setSelectedOptionName(feature, option) {
    if (feature == null || feature.SelectedOption == null || feature.SelectedOption.XmlNode == null) {
        return null;
    }

    feature.SelectedOption.XmlNode.setAttribute("name", option);
}

/*******************************************************************************/
/*                                                                             */
/* CheckSum Utilities                                                          */
/*                                                                             */
/*******************************************************************************/
function checkIfDeviceOptionWasChanged() {
    /// <summary>
    ///    Check if Device option was changed just before the JS Constraints was called
    ///    by preparing the following two checksum values:
    ///      1. checksum value which is store in User Property Bag.
    ///      2. checksum value which is calculated with based on queue property bag's states.
    ///    If Device option was changed, this function try to refresh checksum of PT.
    /// </summary>
    /// <param name="scriptContext" type="IPrinterScriptContext(Object)">
    ///     Scope of the search i.e. the parent node.
    /// </param>
    /// <returns type="None">
    ///     No value is returned.
    /// </returns>

    if (_UPB != null) {
        var deviceSettingsQPBValues = getDeviceSettingsValuesFromQPB();
        var checksumQPB = hashCode(deviceSettingsQPBValues);
        var checksumUPB = getCheckSumPropertyFromUPB(Constants.CHECKSUM_FOR_DEVICE_PROP);
        if (checksumUPB == "" || checksumQPB != checksumUPB) {
            // Refresh checksum of PT, and input new device option checksum in User Property Bag.
            _UPB.SetString(Constants.CHECKSUM_FOR_DEVICE_PROP, checksumQPB);
            _UPB.SetString(Constants.CHECKSUM, "");
        }
    }
}

function getDeviceSettingsValuesFromQPB() {
    var deviceOptionListObj = getJSONFromPropertyBag(_DPB, Constants.DEVICE_SETTING_LIST);
    var deviceSettingsValues = ""; // Device Option Values(i.e. "Config_HardDisk=Installed,Config_Model=C754,...")
    var valueName;
    // Get Queue Property List
    // String type
    for (i = 0; i < deviceOptionListObj.length; i++) {
        try {
            valueName = getStringFromPropertyBag(_QPB, deviceOptionListObj[i]);
            deviceSettingsValues += deviceOptionListObj[i] + "=" + valueName;
        } catch (e) {
        }
        deviceSettingsValues += ",";
    }
    return deviceSettingsValues;
}

function getChecksumListFromUserProp() {
    var checksumValString = getCheckSumPropertyFromUPB(Constants.CHECKSUM);
    return checksumValString.split(/;/);
}

function getCheckSumPropertyFromUPB(userPropKey) {
    try {
        var checkSumValString = getStringFromPropertyBag(_UPB, userPropKey);
    } catch (e) {
        _UPB.SetString(userPropKey, "");
        var checkSumValString = "";
    }
    return checkSumValString;
}

function hashCode(inputValue) {
    var hash = 0;
    var length = inputValue.length;
    if (length == 0) return hash;

    for (i = 0; i < length; i++) {
        hash = ((hash << 5) - hash) + inputValue.charCodeAt(i);
        //char = inputValue.charCodeAt(i);
        //hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

function getHashCode(printTicket) {
    var copyOfPT = printTicket.XmlNode.childNodes[printTicket.XmlNode.childNodes.length - 1].xml
    copyOfPT = copyOfPT.replace(/<psf:PrintTicket(.*?)>/, "").replace(/<psf:ParameterInit name="ns0000:PageDevmodeSnapshot">(.*?)<\/psf:ParameterInit>/, "").replace(/<\/psf:PrintTicket>/, "");

    return hashCode(copyOfPT);
}

function setNewChecksumValIntoUserProp(userProperties, newChecksumVal, checksumList) {
    for (var i = 0; i < checksumList.length; ++i) {
        if (newChecksumVal == checksumList[i]) {
            return;
        }
    }
    writeCheckSumStringFromUserProp(userProperties, newChecksumVal, checksumList);
    return;
}

function writeCheckSumStringFromUserProp(userProperties, newChecksumVal, checksumList) {
    try {
        if (checksumList.length < 100) {
            var checksumValString = userProperties.GetString(Constants.CHECKSUM);
            if (checksumValString == "") {
                userProperties.SetString(Constants.CHECKSUM, newChecksumVal);
            } else {
                userProperties.SetString(Constants.CHECKSUM, checksumValString + ";" + newChecksumVal);
            }
        } else {
            var checksumList = "";
            for (var i = 1; i <= 99; i++) {
                checksumList += checksumList[i] + ";";
            }
            checksumList += newChecksumVal;
            userProperties.SetString(Constants.CHECKSUM, checksumList);
        }
    } catch (e) {
        userProperties.SetString(Constants.CHECKSUM, newChecksumVal);
    }
    return;
}

/*******************************************************************************/
/*                                                                             */
/* Utilities                                                          */
/*                                                                             */
/*******************************************************************************/
function savePSKCustomPropertyValuesFromPrintTicket(printTicket, customProperties, devModeValues, userProperties) {

    var rootElement = printTicket.XmlNode.documentElement;

    // process paraminits
    var paramInits = customProperties["paraminits"];

    if (paramInits) {
        for (var i = 0; i < paramInits.length; i++) {
            var paramInit = paramInits[i];
            var paramInitName = paramInit["name"];
            var parameterInitNode = getElementNode(rootElement, psfPrefix + ":ParameterInit", makePrefixAndName(pskPrefix, paramInitName));

            if (parameterInitNode) {
                var valueNode = parameterInitNode.selectSingleNode(psfPrefix + ":Value");
                var child = valueNode.firstChild;
                if (child) {
                    if (paramInit.storage == "user") {
                        userProperties.SetString(paramInitName, child.nodeValue);
                    }
                    else {
                        devModeValues[paramInitName] = child.nodeValue;
                    }
                }
            }
            else {
                //if not in PT but in devmode, remove from devmode
                delete devModeValues[paramInitName];
            }
        }
    }

    // process features
    var features = customProperties["features"];

    if (features) {
        for (var i = 0; i < features.length; ++i) {
            //Get items from the ticket based on feature
            var feature = features[i];
            var featureName = feature.name;
            var featureNode = null;

            if (feature.parent != null) {
                // If it has a parent feature, get that node first, then get the actual node.
                featureNode = getElementNode(rootElement, psfPrefix + ":Feature", feature.parent);
                featureNode = getElementNode(featureNode, psfPrefix + ":Feature", feature.name);
            } else {
                // It is a root feature, get it directly from rootElement.
                featureNode = getElementNode(rootElement, psfPrefix + ":Feature", feature.name);
            }

            if (featureNode != null) {
                var featureSetting = getSelectedOptionOfFeature(featureNode);
                if (feature.storage == "user") {
                    userProperties.SetString(featureName, featureSetting);
                }
                else {
                    devModeValues[featureName] = featureSetting;
                }
            }
            else {
                //if in devmode but not in PT, remove from devmode
                delete devModeValues[featureName];
            }
        }
    }
}

function getSelectedOptionOfFeature(featureNode) {
    for (var i = 0; i < featureNode.childNodes.length; ++i) {
        var childNode = featureNode.childNodes[i];
        if (childNode.nodeName == "psf:Option") {
            return childNode.getAttribute("name");
        }
    }
    return null;
}

function saveKMCustomPropertiesFromPrintTicket(printTicket, customProperties, paramInitName, devModeValues, userProperties) {
    var rootElement = printTicket.XmlNode;

    //get customproperty from PrintTicket
    var parameterInitNode = getElementNode(rootElement, psfPrefix + ":ParameterInit", paramInitName);

    if (parameterInitNode) {
        var valueNode = parameterInitNode.selectSingleNode(psfPrefix + ":Value");
        var child = valueNode.firstChild;
        if (child) {
            var jsonValue = child.nodeValue;
            var jsonProperties = eval("(" + jsonValue + ")");

            // cross reference json with custom properties in DPB

            if (customProperties["paraminits"] != null) {
                // process paraminits
                SaveCustomToPropertyBag(jsonProperties["paraminits"], customProperties["paraminits"], devModeValues, userProperties);
            }

            if (customProperties["features"] != null) {
                //process features
                SaveCustomToPropertyBag(jsonProperties["features"], customProperties["features"], devModeValues, userProperties);
            }
        }
    }
}

// Saves custom property value to Property Bag only if property exists in DPB of model.
function SaveCustomToPropertyBag(jsonPropertyValues, customProperties, devModeValues, userProperties) {
    for (var j = 0; j < customProperties.length; ++j) {
        var customProperty = customProperties[j];
        var customPropertyName = customProperty.name;
        var jsonPropertyValue = jsonPropertyValues[customPropertyName];

        if (customProperty.storage == "user") {
            if (jsonPropertyValue == null) {
                userProperties.SetString(customPropertyName, "");
            }
            else {
                userProperties.SetString(customPropertyName, jsonPropertyValue);
            }
        }
        else {
            devModeValues[customPropertyName] = jsonPropertyValue;
        }
    }
}

function getDevModeItemValue(devModeProperties) {
    var allValues = getStringFromPropertyBag(devModeProperties, "AllValues");
    try {
        var temp = String(allValues);
        temp = temp.replace(/\n|\r/g, "");
        var tempevals = eval("(" + temp + ")")
        return tempevals;
    }
    catch (e) {
        return {};
    }
}

function checkIsPnpDefaultsSet() {
    var value = getStringFromPropertyBag(_UPB, Constants.IS_PNP_DEFAULTS_SET);
    try {
        if (value == "true")
        {
            return true;
        }
    }
    catch (e) {
    }
    return false;
}

function getUserPropertyBag(scriptContext, id) {
    try {
        return scriptContext.UserProperties;
    }
    catch (f) {
        return null;
    }
}

function getJSONfromStreamPropertyBag(propertyBag, propertyFile) {
    return eval("(" + getJSONStringfromStreamPropertyBag(propertyBag, propertyFile) + ")");
}

function getJSONStringfromStreamPropertyBag(propertyBag, propertyFile) {
    var streamValue = propertyBag.GetReadStream(propertyFile);
    var value = "";
    var cbRead = 1024;
    while (true) {
        var tempValue = streamValue.Read(cbRead);

        if (tempValue == "" || tempValue == null) {
            break;
        }

        value = value + String.fromCharCode.apply(null, tempValue);
    }
    return value;
}

function getJSONFromPropertyBag(propertyBag, propertyName) {
    var strCustomProperties = getStringFromPropertyBag(propertyBag, propertyName);
    var jsonCustomProperties;
    try{
        jsonCustomProperties = eval("(" + strCustomProperties + ")");
    }
    catch (e) {
        jsonCustomProperties = "";
    }


    return jsonCustomProperties;
}

function getStringFromPropertyBag(propertyBag, name) {
    try {
        var str = propertyBag.GetString(name);
        return str;
    } catch (e) {
        return null;
    }
}

function JSONStringify(obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {

        // simple data type
        if (t == "string") obj = '"' + EscapeString(obj) + '"';
        return String(obj);

    }
    else {
        // recurse array or object
        var json = [], isArray = (obj && obj.constructor == Array);

        if (isArray) {
            // array
            for (var i = 0; i < obj.length; ++i) {
                var v = JSONStringify(obj[i]);
                json.push(String(v));
            }
            return ("[" + String(json) + "]");
        }
        else {
            // object
            for (var n in obj) {
                var v = JSONStringify(obj[n]);
                json.push('"' + n + '":' + String(v));
            }
            return ("{" + String(json) + "}");
        }
    }
}

function EscapeString(s) {
    if (s == null) return null;
    return s.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"")
}

function getPDLInfo(scriptContext) {
    var driverInfoLines = _DPB.GetString("DriverInfo");
    var startIndex = driverInfoLines.indexOf("PDL") + 4;
    var endIndex = driverInfoLines.indexOf("\n", startIndex);
    var pdlInfo = driverInfoLines.substring(startIndex, endIndex);
    return pdlInfo;
}

function trim(inputString) {
    return inputString.replace(/^\s+|\s+$/g, '');
}

function splitIntoChunks(stringToSplit, chunkLength) {
    if (stringToSplit.length <= chunkLength) {
        var arr = [];
        arr[0] = stringToSplit;
        return arr;
    }
    else {
        var beginning = stringToSplit.substring(0, chunkLength);
        var remaining = stringToSplit.substring(chunkLength, stringToSplit.length);

        var arr = [];
        arr[0] = beginning;

        var returnArr = arr.concat(splitIntoChunks(remaining, chunkLength));

        return returnArr;
    }
}

/*******************************************************************************/
/*                                                                             */
/* Constants                                                                   */
/*                                                                             */
/*******************************************************************************/
var Constants = {
    CHECKSUM: "ChecksumValOfPT",
    CHECKSUM_FOR_DEVICE_PROP: "ChecksumValOfDeviceProp",
    DEVICE_SETTING_LIST: "DeviceSettings",
    CUSTOM_PAPER_TYPES: "CustomPaperTypes",
    SUPPORT_OFF: "support:Off",
    PAGE_ORIENTATION: {
        NAME: "PageOrientation",
        PORTRAIT: "psk:Portrait",
        LANDSCAPE: "psk:Landscape"
    },
    JOB_NUP_ALL_DOCUMENTS_CONTIGUOUSLY: {
        NAME: "JobNUpAllDocumentsContiguously",
        NONE: "ns0000:_1",
        _2IN1: "ns0000:_2",
        _4IN1: "ns0000:_4",
        _6IN1: "ns0000:_6",
        _9IN1: "ns0000:_9",
        _16IN1: "ns0000:_16"
    },
    PHYSICAL_OUTPUT_PAPER_SIZE: {
        NAME: "PhysicalOutputPaperSize"
    },
    PHYSICAL_OUTPUT_CUSTOM_PAPER_SIZE_WIDTH: {
        NAME: "PhysicalOutputCustomPaperSizeWidth"
    },
    PHYSICAL_OUTPUT_CUSTOM_PAPER_SIZE_HEIGHT: {
        NAME: "PhysicalOutputCustomPaperSizeHeight"
    },
    PHYSICAL_OUTPUT_ORIENTATION: {
        NAME: "PhysicalOutputOrientation",
        PORTRAIT: "Portrait",
        LANDSCAPE: "Landscape"
    },
    BINDING_LENGTH: {
        NAME: "BindingLength",
        SHORT: "Short",
        LONG: "Long"
    },
    BINDING: {
        NAME: "DocumentBinding",
        TOP: "psk:BindTop",
        LEFT: "psk:BindLeft",
        RIGHT: "psk:BindRight"
    },
    MEDIA_TYPE: {
        NAME: "PageMediaType",
        CUSTOM_PAPER: "ns0000:CustomType",
        PLAIN: "psk:Plain",
        PLAIN_2ND: "ns0000:Plain_2nd",
        TRAY0_MEDIA_TYPE: "ns0000:JobInputBin0000_MediaType",
        TRAY1_MEDIA_TYPE: "ns0000:JobInputBin0001_MediaType",
        TRAY2_MEDIA_TYPE: "ns0000:JobInputBin0002_MediaType",
        TRAY3_MEDIA_TYPE: "ns0000:JobInputBin0003_MediaType",
        TRAY4_MEDIA_TYPE: "ns0000:JobInputBin0004_MediaType",
        TRAY5_MEDIA_TYPE: "ns0000:JobInputBin0005_MediaType"
    },
    PAPER_INPUT_BIN : {
        NAME: "PageInputBin",
        AUTO_SELECT: "psk:AutoSelect",
        TRAY1: "ns0000:TRAY1",
        TRAY2: "ns0000:TRAY2",
        TRAY3: "ns0000:TRAY3",
        TRAY4: "ns0000:TRAY4",
        TRAYLCT: "ns0000:TRAYLCT",
        MANUALFEED: "ns0000:MANUALFEED"
    },
    OUTPUT_PAPER_SIZE: {
        NAME: "OutPSize",
        USE_PAPER_SIZE: "UsePaperSize"
    },
    PAGE_OUTPUT_CUSTOM_PAPER_SIZE_WIDTH: {
        NAME: "OutPSizeW"
    },
    PAGE_OUTPUT_CUSTOM_PAPER_SIZE_HEIGHT: {
        NAME: "OutPSizeH"
    },
    PAGE_MEDIA_SIZE: {
        NAME: "PageMediaSize"
    },
    PAGE_MEDIA_SIZE_MEDIA_SIZE_WIDTH: {
        NAME: "PageMediaSizeMediaSizeWidth"
    },
    PAGE_MEDIA_SIZE_MEDIA_SIZE_HEIGHT: {
        NAME: "PageMediaSizeMediaSizeHeight"
    },
    PAGE_OUTPUT_COLOR: {
        NAME: "PageOutputColor",
        NAME_WITH_NAMESPACE: "psk:PageOutputColor",
        FULL_COLOR_WITH_NAMESPACE: "psk:Color",
        GRAYSCALE_WITH_NAMESPACE: "psk:Grayscale"
    },
    JOB_DUPLEX_ALL_DOCUMENTS_CONTIGUOUSLY: {
        NAME: "JobDuplexAllDocumentsContiguously"
    },
    JOB_LAYOUT: {
        NAME: "Layout",
        ON: "Bl4in1",
        OFF: "Off"
    },
    JOB_BOOKLET: {
        NAME: "Booklet",
        ON: "On",
        OFF: "Off"
    },
    JOB_TWO_COLOR: {
        NAME: "TColor",
        ON: "On",
        OFF: "Off",
        NAME_WITH_NAMESPACE: "ns0000:JobTColor",
        ON_WITH_NAMESPACE: "ns0000:On"
    },
    NODE_MAX_LENGTH: 65535,
    IS_PNP_DEFAULTS_SET: "IsPnPDefaultsSet",
    UPB_USER_LANGUAGE: "UserLanguage",
    ADMIN_CUSTOMIZE: {
        QPB_NAME: "AdministratorCustomize",
        UPB_HASH_NAME: "AdministratorCustomizeHash",
        UPB_USE_WINDOWS_LOGIN_ID: "UseWindowsLoginID",
        UPB_WINDOWS_LOGIN_ID: "WindowsLoginID",
        UPB_OPENED_BY_PE: "OpenedByPE",
        UPB_OPENED_BY_WSDA: "OpenedByWSDA",
        MODE: "Mode",
        MODE_LOCK: "Lock",
        MODE_DEFAULT: "Default",
        VALUE: "Value"
    }
}
