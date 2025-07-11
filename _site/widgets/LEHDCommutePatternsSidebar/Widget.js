//javascript for controlling Census LEHD Commute Patterns WebMap
//written by Bill Hereth April 2021


var dCategoryOptions = [
  { label: "where Salt Lake City residents work"          , name: "Residents Work", value: "work_who_live_in", selected: true },
  { label: "where people who work in Salt Lake City live" , name: "Workers Live"  , value: "live_who_work_in"                 }
];
``
sDefaultCategory = "work_who_live_in"; //must be same as "selected" above

var dDisplayOptions = [
  { label: "Number of People"                    , name: "Number of People"       , value: "number"    , labeltype: 'number' , selected: true },
  { label: "Zone's share of Salt Lake City total", name: "Zone Share of People"   , value: "percent_sa", labeltype: 'percent'                 },
  { label: "Share within each zone"              , name: "Share of People in Zone", value: "percent_mu", labeltype: 'percent'                 }
];

sDefaultDisplay = "number"; //must be same as "selected" above

var dMapUnitOptions = [
  { label: "City level"                  , name: "City"                  , name_plural: "Cities"                 , value: "city"      , fieldname: "CODE3"     , minScaleForLabels: 3000000, selected: true },
  //{ label: "County"                      , name: "County"                , name_plural: "County"                 , value: "county"    , fieldname: "FIRST_NAME", minScaleForLabels:  800000                 },
  { label: "Census Large District level" , name: "Census Large District" , name_plural: "Census Large Districts" , value: "ld"        , fieldname: "DLRG_NAME" , minScaleForLabels:  800000                 },
  { label: "Census Medium District level", name: "Census Medium District", name_plural: "Census Medium Districts", value: "md"        , fieldname: "DMED_NAME" , minScaleForLabels:  800000                 },
  { label: "Census Small District level" , name: "Census Small District" , name_plural: "Census Small Districts" , value: "sd"        , fieldname: "DSML_NAME" , minScaleForLabels:  800000                 },
  { label: "Census Tract level"          , name: "Census Tract"          , name_plural: "Census Tracts"          , value: "tract"     , fieldname: "GEOID20"   , minScaleForLabels:  800000                 },
  { label: "Census Block Group level"    , name: "Census Block Group"    , name_plural: "Census Block Groups"    , value: "blockgroup", fieldname: "GEOID"     , minScaleForLabels:  150000                 }
];

sDefaultMapUnit = "city"; //must be same as "selected" above

sDefaultArea = "SLC";

sLegendName = "";

//Variables
var sidebar; //sidebar widget

var curCategory   = '';
var curArea       = '';
var curDisplay    = '';
var curTAZ        =  0;
var lyrAreas;
var lyrNumber;
var lyrSAPercent;      //Layer for selected area distribution percents
var lyrMUPercent;      //Layer for map unit distribution percents
var lyrCurrentDisplay; //current layer being displayed (either lyrNumber or lyrPercent)

var sAreasLayerName       = "Municipalities and Townships";
var sAreasLayerNameCounty = "Counties";
//var sBGNumberLayerName    = "BlockGroup CommutePatterns Number";
//var sBGPercentMULayerName = "BlockGroup CommutePatterns Percent MapUnit";
//var sBGPercentSALayerName = "BlockGroup CommutePatterns Percent SelectedArea";
//var sTCNumberLayerName    = "Tract CommutePatterns Number";
//var sTCPercentMULayerName = "Tract CommutePatterns Percent MapUnit";
//var sTCPercentSALayerName = "Tract CommutePatterns Percent SelectedArea";
//var sCTNumberLayerName    = "City CommutePatterns Number";
//var sCTPercentMULayerName = "City CommutePatterns Percent MapUnit";
//var sCTPercentSALayerName = "City CommutePatterns Percent SelectedArea";

var sBGNumberLayerName    = "2022 LEHD BlockGroup CommutePatterns Number";
var sBGPercentMULayerName = "2022 LEHD BlockGroup CommutePatterns Percent MapUnit";
var sBGPercentSALayerName = "2022 LEHD BlockGroup CommutePatterns Percent SelectedArea";
var sTCNumberLayerName    = "2022 LEHD Tract CommutePatterns Number";
var sTCPercentMULayerName = "2022 LEHD Tract CommutePatterns Percent MapUnit";
var sTCPercentSALayerName = "2022 LEHD Tract CommutePatterns Percent SelectedArea";
var sSDNumberLayerName    = "2022 LEHD SD CommutePatterns Number";
var sSDPercentMULayerName = "2022 LEHD SD CommutePatterns Percent MapUnit";
var sSDPercentSALayerName = "2022 LEHD SD CommutePatterns Percent SelectedArea";
var sMDNumberLayerName    = "2022 LEHD MD CommutePatterns Number";
var sMDPercentMULayerName = "2022 LEHD MD CommutePatterns Percent MapUnit";
var sMDPercentSALayerName = "2022 LEHD MD CommutePatterns Percent SelectedArea";
var sLDNumberLayerName    = "2022 LEHD LD CommutePatterns Number";
var sLDPercentMULayerName = "2022 LEHD LD CommutePatterns Percent MapUnit";
var sLDPercentSALayerName = "2022 LEHD LD CommutePatterns Percent SelectedArea";
var sCTNumberLayerName    = "2022 LEHD City CommutePatterns Number";
var sCTPercentMULayerName = "2022 LEHD City CommutePatterns Percent MapUnit";
var sCTPercentSALayerName = "2022 LEHD City CommutePatterns Percent SelectedArea";
//var sCCNumberLayerName    = "2022 LEHD County CommutePatterns Number";
//var sCCPercentMULayerName = "2022 LEHD County CommutePatterns Percent MapUnit";
//var sCCPercentSALayerName = "2022 LEHD County CommutePatterns Percent SelectedArea";

var layerInfosObject;

var fnAreaID      = "CODE3"       ; //field name for TAZID

//Typical Colors
var sCLightGrey   = "#EEEEEE";
var sCDefaultGrey = "#CCCCCC"     ; //color of default line

var fnWorkWhoLiveInSuffix = '_h';
var fnLiveWhoWorkInSuffix = '_w';
var flWorkWhoLiveInSuffix = '_o';
var flLiveWhoWorkInSuffix = '_d';

//var minScaleForLabels = 187150;
var labelClassOn;
var labelClassOff;
var sCWhite = "#FFFFFF";
var dHaloSize = 1.5;
var sFontSize = "7pt";

//Line Widths
var dLineWidth0 = 0.1;
var dLineWidth1 = 0.7;  //narrowest
var dLineWidth2 = 1.7;
var dLineWidth3 = 2.7;
var dLineWidth4 = 3.7;
var dLineWidth5 = 4.7;
var dLineWidth6 = 5.7;
var dLineWidth7 = 6.7;
var dLineWidth8 = 7.7;
var dLineWidth9 = 8.7;  //widest

var bindata;

var iPixelSelectionTolerance = 5;

/* Blue to Red Gradiant Ramp - 9 Steps (Bert) */
var classbreaks;
var labelclass;
var aClassBreaks = [];
var volumeLabel;

var toptenids = [];

define(['dojo/_base/declare',
    'jimu/BaseWidget',
    'jimu/LayerInfos/LayerInfos',
    'libs/rainbowvis.js',
    'dojo/dom',
    'jimu/PanelManager',
    'jimu/LayerInfos/LayerInfos',
    'esri/tasks/query',
    'esri/tasks/QueryTask',
    'esri/symbols/SimpleFillSymbol',
    'esri/symbols/SimpleLineSymbol',
    'esri/symbols/TextSymbol',
    'esri/symbols/Font',
    'esri/Color',
    'esri/renderers/ClassBreaksRenderer',
    'esri/geometry/Extent',
    'dijit/form/Select',
    'dojox/charting/axis2d/Default',
    'dojo/domReady!'],
function(declare, BaseWidget, LayerInfos, RainbowVis, dom, PanelManager, LayerInfos, Query, QueryTask, SimpleFillSymbol, SimpleLineSymbol, TextSymbol, Font, Color, ClassBreaksRenderer, Extent, Select) {
  //To create a widget, you need to derive from BaseWidget.
  
  return declare([BaseWidget], {
    // DemoWidget code goes here

    //please note that this property is be set by the framework when widget is loaded.
    //templateString: template,

    baseClass: 'jimu-widget-demo',
    
    postCreate: function() {
      this.inherited(arguments);
      console.log('postCreate');
    },

    startup: function() {
      console.log('startup');
      
      this.inherited(arguments);
      this.map.setInfoWindowOnClick(false); // turn off info window (popup) when clicking a feature
      
      //Widen the widget panel to provide more space for charts
      //var panel = this.getPanel();
      //var pos = panel.position;
      //pos.width = 500;
      //panel.setPosition(pos);
      //panel.panelManager.normalizePanel(panel);
      
      sidebar = this;
      var parent  = this;

      //when zoom finishes run changeZoom to update label display
      this.map.on("zoom-end", function (){  
        parent.changeZoom();  
      });
      
      //Initialize Selection Layer, FromLayer, and ToLayer and define selection colors
      layerInfosObject = LayerInfos.getInstanceSync();
      for (var j=0, jl=layerInfosObject._layerInfos.length; j<jl; j++) {
        var currentLayerInfo = layerInfosObject._layerInfos[j];    
        if (currentLayerInfo.title == sAreasLayerName) { //must mach layer title
          lyrAreas = layerInfosObject._layerInfos[j].layerObject;
        } else if (currentLayerInfo.title == sCTNumberLayerName) {
          lyrNumber = layerInfosObject._layerInfos[j].layerObject;
        } else if (currentLayerInfo.title == sCTPercentMULayerName) {
          lyrMUPercent = layerInfosObject._layerInfos[j].layerObject;
        } else if (currentLayerInfo.title == sCTPercentSALayerName) {
          lyrSAPercent = layerInfosObject._layerInfos[j].layerObject;
        }
      }

      //Populate BinData Object
      dojo.xhrGet({
        url: "widgets/LEHDCommutePatternsSidebar/data/bindata.json",
        handleAs: "json",
        load: function(obj) {
            /* here, obj will already be a JS object deserialized from the JSON response */
            console.log('bindata.json');
            bindata = obj;
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });

      dojo.xhrGet({
        url: "widgets/LEHDCommutePatternsSidebar/data/data2022/lehd_citytownshipdata.json", //update this to get the sl data when sl data is selected
        handleAs: "json",
        load: function(obj) {
            /* here, obj will already be a JS object deserialized from the JSON response */
            console.log('citytownshipdata.json');
            dAreaOptions = obj;
            parent.setupAreaDropDown(dAreaOptions);
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });
      
      dojo.xhrGet({
        url: "widgets/LEHDCommutePatternsSidebar/data/data2022/lehd_countydata_number.json",
        handleAs: "json",
        load: function(obj) {
            /* here, obj will already be a JS object deserialized from the JSON response */
            console.log('countydata_number.json');
            dCountyData_number = obj;
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });

      dojo.xhrGet({
        url: "widgets/LEHDCommutePatternsSidebar/data/data2022/lehd_countydata_percent_sa.json",
        handleAs: "json",
        load: function(obj) {
            /* here, obj will already be a JS object deserialized from the JSON response */
            console.log('countydata_percent_sa.json');
            dCountyData_percent_sa = obj;
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });

      dojo.xhrGet({
        url: "widgets/LEHDCommutePatternsSidebar/data/data2022/lehd_countydata_percent_mu.json",
        handleAs: "json",
        load: function(obj) {
            /* here, obj will already be a JS object deserialized from the JSON response */
            console.log('countydata_percent_mu.json');
            dCountyData_percent_mu = obj;
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });

      cmbCategory = new Select({
        id: "selectCategory",
        name: "selectCategoryName",
        options: dCategoryOptions,
        onChange: function(){
            curCategory = this.value;
            parent.updateDisplayLayer();
            parent.setLegendBar();
        }
        }, "cmbCategory");
      curCategory = sDefaultCategory;
      cmbCategory.startup();
      
      cmbDisplay = new Select({
        id: "selectDisplay",
        name: "selectDisplayName",
        options: dDisplayOptions,
        onChange: function(){
            curDisplay = this.value;
            parent.setLegendBar();
            parent.updateDisplayLayer();
        }
        }, "cmbDisplay");
      curDisplay = sDefaultDisplay;
      cmbDisplay.startup();

      cmbMapUnit = new Select({
        id: "selectMapUnit",
        name: "selectMapUnitName",
        options: dMapUnitOptions,
        onChange: function(){
            curMapUnit = this.value;

            parent.hideAllDisplayLayers();

            var _sNumberLayerName    = "";
            var _sPercentSALayerName = "";
            var _sPercentMULayerName = "";
            
            if (curMapUnit == 'blockgroup') { // add condition until other data for map units prepared
              _sNumberLayerName    = sBGNumberLayerName   ;
              _sPercentSALayerName = sBGPercentSALayerName;
              _sPercentMULayerName = sBGPercentMULayerName;
            } else if (curMapUnit == 'sd') {
              _sNumberLayerName    = sSDNumberLayerName   ;
              _sPercentSALayerName = sSDPercentSALayerName;
              _sPercentMULayerName = sSDPercentMULayerName;
            } else if (curMapUnit == 'md') {
              _sNumberLayerName    = sMDNumberLayerName   ;
              _sPercentSALayerName = sMDPercentSALayerName;
              _sPercentMULayerName = sMDPercentMULayerName;
            } else if (curMapUnit == 'ld') {
              _sNumberLayerName    = sLDNumberLayerName   ;
              _sPercentSALayerName = sLDPercentSALayerName;
              _sPercentMULayerName = sLDPercentMULayerName;
            } else if (curMapUnit == 'tract') {
              _sNumberLayerName    = sTCNumberLayerName   ;
              _sPercentSALayerName = sTCPercentSALayerName;
              _sPercentMULayerName = sTCPercentMULayerName;
            } else if (curMapUnit == 'city') {
              _sNumberLayerName    = sCTNumberLayerName   ;
              _sPercentSALayerName = sCTPercentSALayerName;
              _sPercentMULayerName = sCTPercentMULayerName;
            }// else if (curMapUnit == 'county') {
             // _sNumberLayerName    = sCCNumberLayerName   ;
             // _sPercentSALayerName = sCCPercentSALayerName;
             // _sPercentMULayerName = sCCPercentMULayerName;
             //}
            
            for (var j=0, jl=layerInfosObject._layerInfos.length; j<jl; j++) {
              var currentLayerInfo = layerInfosObject._layerInfos[j];    
              if (currentLayerInfo.title == _sNumberLayerName) {
                lyrNumber = layerInfosObject._layerInfos[j].layerObject;
              } else if (currentLayerInfo.title == _sPercentSALayerName) {
                lyrSAPercent = layerInfosObject._layerInfos[j].layerObject;
              } else if (currentLayerInfo.title == _sPercentMULayerName) {
                lyrMUPercent = layerInfosObject._layerInfos[j].layerObject;
              }
            }

            parent.changeZoom();
            parent.setLegendBar();
            parent.updateDisplayLayer();
        }
      }, "cmbMapUnit");
      curMapUnit = sDefaultMapUnit;
      cmbMapUnit.startup();


      // Populate classbreaks object
      dojo.xhrGet({
        url: "widgets/LEHDCommutePatternsSidebar/data/classbreaks.json",
        handleAs: "json",
        load: function(obj) {
            /* here, obj will already be a JS object deserialized from the JSON response */
            console.log('classbreaks.json');
            classbreaks = obj;
            parent.setupClassBreaks();
            parent.updateDisplayLayer();
            parent.setLegendBar();
        },
        error: function(err) {
            /* this will execute if the response couldn't be converted to a JS object,
                or if the request was unsuccessful altogether. */
        }
      });

      // create a text symbol to define the style of labels
      volumeLabel = new TextSymbol();
      volumeLabel.font.setSize(sFontSize);
      volumeLabel.font.setFamily("arial");
      volumeLabel.font.setWeight(Font.WEIGHT_BOLD);
      volumeLabel.setHaloColor(sCWhite);
      volumeLabel.setHaloSize(dHaloSize);

      //Setup empty volume label class for when toggle is off
      labelClassOff = ({
        minScale: dMapUnitOptions[sidebar.getCurMapUnitPos()].minScaleForLabels,
        labelExpressionInfo: {expression: ""}
      })
      labelClassOff.symbol = volumeLabel;
    
      //Create a JSON object which contains the labeling properties. At the very least, specify which field to label using the labelExpressionInfo property. Other properties can also be specified such as whether to work with coded value domains, fieldinfos (if working with dates or number formatted fields, and even symbology if not specified as above)
      labelClassOn = {
        minScale: dMapUnitOptions[sidebar.getCurDisplayPos()].minScaleForLabels,
        labelExpressionInfo: {expression: "$feature.LABEL"}
      };
      labelClassOn.symbol = volumeLabel;
      
      //Check box change events
      dom.byId("chkLabels").onchange = function(isChecked) {
        parent.checkLabel();
      };
      

      //setup click functionality
      this.map.on('click', selectArea);

      function pointToExtent(map, point, toleranceInPixel) {  
        var pixelWidth = parent.map.extent.getWidth() / parent.map.width;  
        var toleranceInMapCoords = toleranceInPixel * pixelWidth;  
        return new Extent(point.x - toleranceInMapCoords,  
          point.y - toleranceInMapCoords,  
          point.x + toleranceInMapCoords,  
          point.y + toleranceInMapCoords,  
          parent.map.spatialReference);  
      }
      
      //Setup Function for Selecting Features
      
      function selectArea(evt) {
        console.log('selectArea');
          
        var query = new Query();  
        query.geometry = pointToExtent(parent.map, evt.mapPoint, iPixelSelectionTolerance);
        query.returnGeometry = false;
        query.outFields = ["*"];
        
        var tblqueryTaskArea = new QueryTask(lyrAreas.url);
        tblqueryTaskArea.execute(query,showAreaResults);
        
        //Segment search results
        function showAreaResults (results) {
          console.log('showAreaResults');
      
          var resultCount = results.features.length;
          if (resultCount>0) {
            //use first feature only
            var featureAttributes = results.features[0].attributes;
            curArea = featureAttributes[fnAreaID];
            lyrAreas.setDefinitionExpression(fnAreaID + "='" + curArea + "'");
            lyrAreas.show();
            cmbArea.set("value", curArea);
            parent.updateDisplayLayer();
            
          }
        }
      }
    },


    setupAreaDropDown: function() {

      cmbArea = new Select({
        id: "selectArea",
        name: "selectAreaName",
        options: dAreaOptions,
        selected: curArea,
        onChange: function(){
            curArea = this.value;

            //update selection drop down
            cmbDisplay.options[1].label = "Zone's share of " + parent.getCurAreaName() + " total";
            cmbDisplay.startup();

            cmbCategory.options[0].label = "where " + parent.getCurAreaName() + " residents work";
            cmbCategory.options[1].label = "where people who work in " + parent.getCurAreaName() + " live";
            cmbCategory.startup();

            //hide all area layers
            for (var j=0, jl=layerInfosObject._layerInfos.length; j<jl; j++) {
              var currentLayerInfo = layerInfosObject._layerInfos[j];    
              if (currentLayerInfo.title == sAreasLayerNameCounty || currentLayerInfo.title == sAreasLayerName) {
                var _lyrTemp = layerInfosObject._layerInfos[j].layerObject;
                _lyrTemp.hide();
              }
            }

            var _sAreaLayerName = '';

            if (curArea.charAt(0)  == 'z') {
              _sAreaLayerName = sAreasLayerNameCounty;
            } else {
              _sAreaLayerName = sAreasLayerName;
            }
            
            for (var j=0, jl=layerInfosObject._layerInfos.length; j<jl; j++) {
              var currentLayerInfo = layerInfosObject._layerInfos[j];    
              if (currentLayerInfo.title == _sAreaLayerName) {
                lyrAreas = layerInfosObject._layerInfos[j].layerObject;
              } else if (currentLayerInfo.title == sAreasLayerNameCounty) {
                var _lyrTemp = layerInfosObject._layerInfos[j].layerObject;
                _lyrTemp.hide();
              }
              
            }

            sidebar.updateAreaSelection();
            sidebar.zoomToArea();
            sidebar.updateDisplayLayer();
        }
        }, "cmbArea");
      curArea = sDefaultArea;
      cmbArea.startup();
      cmbArea.set("value", curArea);
      sidebar.zoomToArea();
    },

    updateAreaSelection: function() {
      lyrAreas.setDefinitionExpression(fnAreaID + "='" + curArea + "'");
      lyrAreas.show();
    },

    numberWithCommas: function(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    getCurAreaName: function() {
      var _curAreaName = dAreaOptions.filter( function(dAreaOptions){return (dAreaOptions['value']==curArea);} );
      return _curAreaName[0]['label'];
    },

    getAreaNameFromCode: function(code3) {
      var _areaName = dAreaOptions.filter( function(dAreaOptions){return (dAreaOptions['value']==code3);} );
      return _areaName[0]['label'];
    },

    getCurAreaResidents: function() {
      var _curAreaResidents = dAreaOptions.filter( function(dAreaOptions){return (dAreaOptions['value']==curArea);} );
      //return rounded value up to next 100
      return Math.ceil(_curAreaResidents[0]['people'+ fnWorkWhoLiveInSuffix]/100)*100;
    },

    getCurAreaWorkers: function() {
      var _curAreaWorkers = dAreaOptions.filter( function(dAreaOptions){return (dAreaOptions['value']==curArea);} );
      //return rounded value up to next 100
      return Math.ceil(_curAreaWorkers[0]['people'+ fnLiveWhoWorkInSuffix]/100)*100;
    },

    getCurSuffix: function() {
      var _curSuffix = '';
      if (curCategory == 'work_who_live_in') {
        _curSuffix = fnWorkWhoLiveInSuffix;
      } else if (curCategory == 'live_who_work_in') {
        _curSuffix = fnLiveWhoWorkInSuffix;
      }
      return _curSuffix;
    },

    getCurDisplayFieldName: function() {
      return curArea + this.getCurSuffix(); 
    },

    hideAllDisplayLayers: function() {
            
      for (var j=0, jl=layerInfosObject._layerInfos.length; j<jl; j++) {
        var currentLayerInfo = layerInfosObject._layerInfos[j];    
        if (currentLayerInfo.title == sBGNumberLayerName    ||
            currentLayerInfo.title == sBGPercentMULayerName ||
            currentLayerInfo.title == sBGPercentSALayerName ||
            currentLayerInfo.title == sTCNumberLayerName    ||
            currentLayerInfo.title == sTCPercentMULayerName ||
            currentLayerInfo.title == sTCPercentSALayerName ||
            currentLayerInfo.title == sSDNumberLayerName    ||
            currentLayerInfo.title == sSDPercentMULayerName ||
            currentLayerInfo.title == sSDPercentSALayerName ||
            currentLayerInfo.title == sMDNumberLayerName    ||
            currentLayerInfo.title == sMDPercentMULayerName ||
            currentLayerInfo.title == sMDPercentSALayerName ||
            currentLayerInfo.title == sLDNumberLayerName    ||
            currentLayerInfo.title == sLDPercentMULayerName ||
            currentLayerInfo.title == sLDPercentSALayerName ||
            currentLayerInfo.title == sCTNumberLayerName    ||
            currentLayerInfo.title == sCTPercentMULayerName ||
            currentLayerInfo.title == sCTPercentSALayerName) { // ||
            //currentLayerInfo.title == sCCNumberLayerName    ||
            //currentLayerInfo.title == sCCPercentMULayerName ||
            //currentLayerInfo.title == sCCPercentSALayerName) {
          _lyr = layerInfosObject._layerInfos[j].layerObject;
          _lyr.hide();
        }
      }      
    },

    updateDisplayLayer: function() {
      console.log('updateDisplayLayer');

      this.hideAllDisplayLayers();

      if (curArea != '' && curCategory != '') {
        if (curDisplay == 'number'){
          lyrCurrentDisplay = lyrNumber;
        } else if (curDisplay == 'percent_mu') {
          lyrCurrentDisplay = lyrMUPercent;
        } else if (curDisplay == 'percent_sa') {
          lyrCurrentDisplay = lyrSAPercent;
        }
        lyrCurrentDisplay.show();
        this.setupLayerRenderingAndLabels();
        this.checkLabel();
        this.updateAreaStats();
      }
    },

    updateAreaStats: function() {


      //query layer for top ten results
      //lyrCurrentDisplay. getCurDisplayFieldName
      
      
      var refID = this.label;
        
      queryTask = new esri.tasks.QueryTask(lyrCurrentDisplay.url);
      
      query = new esri.tasks.Query();
      query.returnGeometry = false; //only need values not shapes
      query.outFields = [dMapUnitOptions[sidebar.getCurMapUnitPos()].fieldname, sidebar.getCurDisplayFieldName()];
      query.where = "1=1";
      query.orderByFields = [sidebar.getCurDisplayFieldName() + " DESC"];
      query.num = 10;
      
      queryTask.execute(query, showStatResults);
      
      parent = this;

      function showStatResults(featureSet) {
        
        var feature, featureId;

        toptenids = [];
  
        for (i = 0; i < featureSet.features.length; i++) { 
          var ft = featureSet.features[i]; 
          
          _html = "<table width=\"225px;\">";

          featureAttributes = featureSet.features[i].attributes;

          //add ids to list of top tens for use in zooming
          toptenids.push(featureAttributes[dMapUnitOptions[sidebar.getCurMapUnitPos()].fieldname]);
        
          //get value of top ten results
          if (featureAttributes[sidebar.getCurDisplayFieldName()] != null) {
            if (dDisplayOptions[sidebar.getCurDisplayPos()].labeltype == "number") {
              _valuetext = sidebar.numberWithCommas(featureAttributes[sidebar.getCurDisplayFieldName()]);
            } else if (dDisplayOptions[sidebar.getCurDisplayPos()].labeltype == "percent") {
              _valuetext = parseFloat(featureAttributes[sidebar.getCurDisplayFieldName()]).toFixed(1)+"%";
            }
          }

          //get name of top ten result, if city then get name from json
          if (dMapUnitOptions[sidebar.getCurMapUnitPos()].name == "City") {
            _displaytext = sidebar.getAreaNameFromCode(featureAttributes[dMapUnitOptions[sidebar.getCurMapUnitPos()].fieldname]);
          } else {
            _displaytext = featureAttributes[dMapUnitOptions[sidebar.getCurMapUnitPos()].fieldname];
          }

          _html = _html + "<tr><td align=\"right\" width=\"25px;\">" + (i+1).toString() + ":</td><td width=\"125px;\">" + _displaytext + "</td><td width=\"75px;\" align=\"right\">" + _valuetext + "</td></tr></table>";

          dom.byId("topten" + (i+1).toString()).innerHTML = _html;
        }
        
        _displayname = dMapUnitOptions[sidebar.getCurMapUnitPos()].name_plural;

        _countystats = "";

        
        if (curCategory == "work_who_live_in") {
          _areaStatsHTML = "<p><strong>Commuters Residing in "  + sidebar.getCurAreaName() +  ": " + sidebar.numberWithCommas(sidebar.getCurAreaResidents()) + "</strong></p>";
          _title = _displayname + " Where " + sidebar.getCurAreaName() + " Residents Work"
          _countystats = _countystats + "<hr/><p><strong>Where " + sidebar.getCurAreaName() + " Residents Work by County*</strong></p><table width=\"330px;\">";
        } else if (curCategory == "live_who_work_in") {
          _areaStatsHTML = "<p><strong>Commuters Working in " + sidebar.getCurAreaName() +  ": " + sidebar.numberWithCommas(sidebar.getCurAreaWorkers())   + "</strong></p>";
          _title = _displayname + " Where People Who Work in " + sidebar.getCurAreaName() + " Live"
          _countystats = _countystats + "<hr/><p><strong>Where People Who Work in " + sidebar.getCurAreaName() + " Live by County*</strong></p><table width=\"330px;\">";
        }
        
        dom.byId("toptentitle").innerHTML = "<hr/><p><strong>Top Ten " + _title + "</strong></p>";
        dom.byId("areastats").innerHTML = _areaStatsHTML;

        //Show County-Level Stats

        if (curDisplay == 'number') {
          dData = dCountyData_number;
        } else if (curDisplay == 'percent_sa') {
          dData = dCountyData_percent_sa;
        } else if (curDisplay == 'percent_mu') {
          dData = dCountyData_percent_mu;
          dom.byId("toptentitle").innerHTML = dom.byId("toptentitle").innerHTML + "<p><strong>(Share of People in Each City)</strong></p>"
          _countystats = _countystats + "<p><strong>(Share of People in Each County)</strong></p><table width=\"330px;\">";
        }

        var _weData   = dData.filter( function(dData){return (dData['WFCounty']=='Weber County');} );
        var _weNumber = _weData[0][sidebar.getCurDisplayFieldName()];

        if (curDisplay == 'number') {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Weber County</td><td width=\"75px;\" align=\"right\">" + sidebar.numberWithCommas(_weNumber) + "</td></tr></table></tr></td>";
        } else  {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Weber County</td><td width=\"75px;\" align=\"right\">" + parseFloat(_weNumber).toFixed(1)+"%" + "</td></tr></table></tr></td>";          
        }
        
        var _daData   = dData.filter( function(dData){return (dData['WFCounty']=='Davis County');} );
        var _daNumber = _daData[0][sidebar.getCurDisplayFieldName()];
      
        if (curDisplay == 'number') {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Davis County</td><td width=\"75px;\" align=\"right\">" + sidebar.numberWithCommas(_daNumber) +"</td></tr></table></tr></td>";
        } else  {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Davis County</td><td width=\"75px;\" align=\"right\">" + parseFloat(_daNumber).toFixed(1)+"%" + "</td></tr></table></tr></td>";          
        }

        var _slData   = dData.filter( function(dData){return (dData['WFCounty']=='Salt Lake County');} );
        var _slNumber = _slData[0][sidebar.getCurDisplayFieldName()];
      
        if (curDisplay == 'number') {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Salt Lake County</td><td width=\"75px;\" align=\"right\">" + sidebar.numberWithCommas(_slNumber) + "</td></tr></table></tr></td>";
        } else  {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Salt Lake County</td><td width=\"75px;\" align=\"right\">" + parseFloat(_slNumber).toFixed(1)+"%" + "</td></tr></table></tr></td>";          
        }

        var _utData   = dData.filter( function(dData){return (dData['WFCounty']=='Utah County');} );
        var _utNumber = _utData[0][sidebar.getCurDisplayFieldName()];
      
        if (curDisplay == 'number') {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Utah County</td><td width=\"75px;\" align=\"right\">" + sidebar.numberWithCommas(_utNumber) + "</td></tr></table></tr></td>";
        } else  {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Utah County</td><td width=\"75px;\" align=\"right\">" + parseFloat(_utNumber).toFixed(1)+"%" + "</td></tr></table></tr></td>";          
        }

        var _owData   = dData.filter( function(dData){return (dData['WFCounty']=='Outside Wasatch Front');} );
        var _owNumber = _owData[0][sidebar.getCurDisplayFieldName()];
      
        if (curDisplay == 'number') {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Other Counties</td><td width=\"75px;\" align=\"right\">" + sidebar.numberWithCommas(_owNumber) + "</td></tr></table></tr></td>";
        } else  {
          _countystats = _countystats + "<tr><td><table width=\"225px;\"><tr><td align=\"left\" width=\"150px;\">Other Counties</td><td width=\"75px;\" align=\"right\">" + parseFloat(_owNumber).toFixed(1)+"%" + "</td></tr></table></tr></td>";          
        }
        
        _countystats = _countystats + "</table><small>*only includes incorporated portions of a county</small>"

        dom.byId("countystats").innerHTML = _countystats;
      }


    },

    topTenZoom: function(customData){
      //get which top ten from id of target, subtract 1 to get position in array
      var _toptenid = parseInt(customData.currentTarget['id'].slice(-2)) - 1;
      console.log("topTenZoom " + _toptenid.toString());
      sidebar.zoomToTopTen(_toptenid);
    },

    topTen01: function() {
      console.log('topTen01');
      console.log(this.label);
    },
    
    setLegendBar: function() {
      console.log('setLegendBar');
            
      if (aClassBreaks.length>0) {
        
        _curCategoryPos = this.getCurCategoryPos();
        _curDisplayPos  = this.getCurDisplayPos();

        _numClasses = aClassBreaks[_curCategoryPos][_curDisplayPos].length;
        
        _sLegendName = "";

        if (curCategory == "work_who_live_in") {
          _sLegendName = "Where " + sidebar.getCurAreaName() + " Residents Work";
        } else if (curCategory == "live_who_work_in") {
          _sLegendName = "Where People Who Work in " + sidebar.getCurAreaName() + " Live";
        }

        _sLegendName = _sLegendName + "<br/>" + dDisplayOptions[_curDisplayPos].name;

        var _sLegendHTML = "";

        for (var i=0; i<_numClasses;i++) {
          _sLegendHTML += "<td width=\"" + (1/_numClasses*100).toString() + "%\" style=\"background-color:" + aClassBreaks[_curCategoryPos][_curDisplayPos][i].symbol.color + "\">&nbsp;</td>";
        }
        
        _sLegendHTML = "<table id=\"tableLegend\" width=\"330px;\">" +
                       "<tbody>" +
                       "     <tr>" +
                       "      <td colspan=" + _numClasses + " align=\"center\">" +
                       "        <div id=\"LegendName\" class=\"thick thicker\">" + _sLegendName +"</div>" +
                       "      </td>" +
                       "    </tr>" +
                       "    <tr>" +
                       "      " + _sLegendHTML +
                       "    </tr>" +
                       "    <tr>" +
                       "      <td colspan=2><small>lowest</small></td>" +
                       "      <td colspan=" + (_numClasses-4).toString() + " align=\"center\"></td>" +
                       "      <td colspan=2 align=\"right\"><small>highest</small></td>" +
                       "    </tr>" +
                       "  </tbody>" +
                       "</table>"

        dom.byId("Legend").innerHTML = _sLegendHTML;
      } else {
        dom.byId("Legend").innerHTML = "";
      }
      
    },

    showLegend: function(){

      var pm = PanelManager.getInstance();
      var bOpen = false;
      
      //Close Legend Widget if open
      for (var p=0; p < pm.panels.length; p++) {
        if (pm.panels[p].label == "Legend") {
          if (pm.panels[p].state != "closed") {
            bOpen=true;
            pm.closePanel(pm.panels[p]);
          }
        }
      }
    
      if (!bOpen) {
        //pm.showPanel(this.appConfig.widgetOnScreen.widgets[WIDGETPOOLID_LEGEND]);
      }
    },

    zoomToArea: function() {
      
      if (dom.byId("chkAutoZoom").checked == true) {
        
        var refID = this.label;
        
        queryTask = new esri.tasks.QueryTask(lyrAreas.url);
        
        query = new esri.tasks.Query();
        query.returnGeometry = true;
        query.outFields = ["*"];
        query.where = fnAreaID + " = '" + curArea + "'";
        
        queryTask.execute(query, showResults);
        
        parent = this;
        
        function showResults(featureSet) {
          
          var feature, featureId;
          
          //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
          if (featureSet.features.length>0) {
            if (featureSet.features[0].geometry.type == "polyline" || featureSet.features[0].geometry.type == "polygon") {
              //clearing any graphics if present. 
              parent.map.graphics.clear(); 
              newExtent = new Extent(featureSet.features[0].geometry.getExtent()) 
                for (i = 0; i < featureSet.features.length; i++) { 
                  var graphic = featureSet.features[i]; 
                  var thisExtent = graphic.geometry.getExtent(); 

                  // making a union of extent or previous feature and current feature. 
                  newExtent = newExtent.union(thisExtent); 
                  parent.map.graphics.add(graphic); 
                } 
              if (sidebar.getCurAreaName().includes("County")){
                parent.map.setExtent(newExtent.expand(1)); 
              } else {
                parent.map.setExtent(newExtent.expand(4)); 
              }
            }
          }
        }
      }
    },

    changeZoom: function(){
      dScale = this.map.getScale();
      if (dScale < dMapUnitOptions[sidebar.getCurMapUnitPos()].minScaleForLabels) {
        //enable the checkbox
        dom.byId("Labels").style.display = "inline";
      } else {
        //diable the checkbox
        dom.byId("Labels").style.display = 'none';
      }
    },


    zoomToTopTen: function(a_toptenid) {
      console.log('zoomToTopTen');
      if (dom.byId("chkAutoZoom").checked == true) {
        
        var refID = this.label;
        
        queryTask = new esri.tasks.QueryTask(lyrCurrentDisplay.url);
        
        query = new esri.tasks.Query();
        query.returnGeometry = true;
        query.outFields = ["*"];
        query.where = dMapUnitOptions[sidebar.getCurMapUnitPos()].fieldname + " = '" + toptenids[a_toptenid] + "'";
        
        queryTask.execute(query, showResults);
        
        parent = this;
        
        function showResults(featureSet) {
          
          var feature, featureId;
          
          //QueryTask returns a featureSet.  Loop through features in the featureSet and add them to the map.
          if (featureSet.features.length>0) {
            if (featureSet.features[0].geometry.type == "polyline" || featureSet.features[0].geometry.type == "polygon") {
              //clearing any graphics if present. 
              parent.map.graphics.clear(); 
              newExtent = new Extent(featureSet.features[0].geometry.getExtent()) 
                for (i = 0; i < featureSet.features.length; i++) { 
                  var graphic = featureSet.features[i]; 
                  var thisExtent = graphic.geometry.getExtent(); 

                  // making a union of extent or previous feature and current feature. 
                  newExtent = newExtent.union(thisExtent); 
                  parent.map.graphics.add(graphic); 
                } 
              parent.map.setExtent(newExtent.expand(4)); 
            }
          }
        }
      }
    },



    checkLabel: function() {
      
      if (dom.byId("chkLabels").checked == true) {
        lyrCurrentDisplay.setLabelingInfo([ labelClassOn  ] );
      } else {
        lyrCurrentDisplay.setLabelingInfo([ labelClassOff ]);
      }
      lyrCurrentDisplay.refresh();
    },

    getCurCategoryPos: function() {
      //https://stackoverflow.com/questions/36419195/how-can-i-get-the-index-from-a-json-object-with-value
      var val = curCategory
      var index = dCategoryOptions.findIndex(function(item, i){
        return item.value === val
      });
      return index;
    },

    getCurDisplayPos: function() {
      //https://stackoverflow.com/questions/36419195/how-can-i-get-the-index-from-a-json-object-with-value
      var val = curDisplay
      var index = dDisplayOptions.findIndex(function(item, i){
        return item.value === val
      });
      return index;
    },

    getCurMapUnitPos: function() {
      //https://stackoverflow.com/questions/36419195/how-can-i-get-the-index-from-a-json-object-with-value
      var val = curMapUnit
      var index = dMapUnitOptions.findIndex(function(item, i){
        return item.value === val
      });
      return index;
    },
    setupClassBreaks:function() {

      console.log('setupClassBreaks');
      
      var defaultLine =  new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, Color.fromHex(sCDefaultGrey), dLineWidth3);

      for (var i=0;i<dCategoryOptions.length;i++) { //store values in order CategoryOptions

        for (var j=0; j<classbreaks.length; j++) {

          if (dCategoryOptions[i].value==classbreaks[j].categoryCode) { //ensure classbreaks matches SECat position
          
            _aClassBreaks = [];
            
            for (var k=0; k<dDisplayOptions.length;k++) { // Totals and Percent
              
              _dvn = dDisplayOptions[k].value; //Totals and Percent
            
              _aBreaks = [];
              _iBreakMin = 0;
              _iBreakMax = 0;
              _sColor = "";
              _sClassField = "";
              _sLabel = "";
              
              var rainbow = new Rainbow(); 
              rainbow.setNumberRange(1, classbreaks[j][_dvn].numClasses);
              rainbow.setSpectrum(classbreaks[j][_dvn].beginColor, classbreaks[j][_dvn].endColor);
              
              for (var l=0; l<classbreaks[j][_dvn].numClasses-1; l++) {
                _sClassFieldFrom = "classMin" + l.toString();
                _sClassFieldTo = "classMin" + (l+1).toString();
                _iBreakMin = classbreaks[j][_dvn][_sClassFieldFrom];
                _iBreakMax = classbreaks[j][_dvn][_sClassFieldTo];
                _sColor = "#" + rainbow.colourAt(l+1);
                if (l==0) {
                  _sLabel = "Less than " + _iBreakMax + classbreaks[j][_dvn].units;
                } else {
                  _sLabel = "From " + sidebar.numberWithCommas(_iBreakMin) + " to " + sidebar.numberWithCommas(_iBreakMax) + classbreaks[j][_dvn].units;
                }
                  
                _aBreaks.push({minValue: _iBreakMin, maxValue: _iBreakMax, symbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, defaultLine, Color.fromHex(_sColor)), label: _sLabel});
              }

              //Max is the min of the last class
              _sLabel = "More than " + sidebar.numberWithCommas(_iBreakMax) + classbreaks[j][_dvn].units;
              _sColor = "#" + rainbow.colourAt(l+1);
              
              //Last Class
              _aBreaks.push({minValue: _iBreakMax, maxValue: Infinity, symbol: new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, defaultLine, Color.fromHex(_sColor)), label: _sLabel});

              _aClassBreaks.push(_aBreaks);
            }

            aClassBreaks.push(_aClassBreaks);
          }
        }
      }

      //this._setupYearsFY();
      
    },
    
    setupLayerRenderingAndLabels: function() {
      console.log('setupLayerRenderingAndLabels');
      
      _curCPos = sidebar.getCurCategoryPos();
      _curDPos  = sidebar.getCurDisplayPos();

      //Set up layer rendering
      aRndr = [];
      aRndr = new ClassBreaksRenderer(null, sidebar.getCurDisplayFieldName());
      if (aClassBreaks.length>0) {
        for (var l=0;l<aClassBreaks[_curCPos][_curDPos].length;l++) {
          aRndr.addBreak(aClassBreaks[_curCPos][_curDPos][l]);
        }
      }
      
      //Setup empty volume label class for when toggle is off
      labelClassOff = ({
        minScale: dMapUnitOptions[sidebar.getCurMapUnitPos()].minScaleForLabels,
        labelExpressionInfo: {expression: ""}
      })
      labelClassOff.symbol = volumeLabel;

      if (dDisplayOptions[sidebar.getCurDisplayPos()].labeltype == 'number') {
        _expression = 'Text($feature["' + sidebar.getCurDisplayFieldName() + '"], "#,###")';
      } else if (dDisplayOptions[sidebar.getCurDisplayPos()].labeltype == 'percent') {
        _expression = 'round($feature["' + sidebar.getCurDisplayFieldName() + '"],1) + "%"';
      }

      //Create a JSON object which contains the labeling properties. At the very least, specify which field to label using the labelExpressionInfo property. Other properties can also be specified such as whether to work with coded value domains, fieldinfos (if working with dates or number formatted fields, and even symbology if not specified as above)
      labelClassOn = {
        minScale: dMapUnitOptions[sidebar.getCurMapUnitPos()].minScaleForLabels,
        labelExpressionInfo: {expression: _expression}
      };
      labelClassOn.symbol = volumeLabel;

      this.setLegendBar();
      this.updateLayerDisplay();

    },

    updateLayerDisplay: function() {
      console.log('updateLayerDisplay');

      lyrCurrentDisplay.setRenderer(aRndr);
      lyrCurrentDisplay.setOpacity(0.5);
      lyrCurrentDisplay.refresh();
      lyrCurrentDisplay.show();
    },
    
    onOpen: function(){
      console.log('onOpen');
    },

    onClose: function(){
      //this.ClickClearButton();
      console.log('onClose');
    },

    onMinimize: function(){
      console.log('onMinimize');
    },

    onMaximize: function(){
      console.log('onMaximize');
    },

    onSignIn: function(credential){
      /* jshint unused:false*/
      console.log('onSignIn');
    },

    onSignOut: function(){
      console.log('onSignOut');
    },

    //added from Demo widget Setting.js
    setConfig: function(config){
      //this.textNode.value = config.districtfrom;
    var test = "";
    },

    getConfigFrom: function(){
      //WAB will get config object through this method
      return {
        //districtfrom: this.textNode.value
      };
    }

  });
});