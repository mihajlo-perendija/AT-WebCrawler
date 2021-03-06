import { RealEstateService } from 'src/app/services/RealEstate.service';
import { Component, OnInit } from '@angular/core';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Color, Label } from 'ng2-charts';
import { webSocket } from 'rxjs/webSocket';
import { environment } from '../../../environments/environment';
import { WSMessage } from 'src/app/model/WSMessage.model';
import { Statistics } from 'src/app/model/Statistics.model';
import { DataRequestDTO } from 'src/app/model/DataRequestDTO.model';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  websocket = webSocket(this.getWebsocketUrl());
  propertyStatistic: Statistics;
  // LOCATION
  LocationOptions: ChartOptions = {
    responsive: true,
  };
  LocationLabels: Label[] = [];
  LocationType: ChartType = 'bar';
  LocationLegend = true;
  LocationPlugins = [];
  LocationColors: Color[]=[{
    backgroundColor:"#0000FF",
    hoverBackgroundColor:"#FF0",
    borderColor:"#F0FF68",
    hoverBorderColor:"#00F"
}];
  LocationData: ChartDataSets[] = [
    { data: [], label: 'Locations' }
  ];


  // PRICE
  PriceOptions: ChartOptions = {
    responsive: true,
  };
  PriceLabels: Label[] = [];
  PriceType: ChartType = 'bar';
  PriceLegend = true;
  PricePlugins = [];
  PriceColors: Color[]=[{
    backgroundColor:"#0000FF",
    hoverBackgroundColor:"#FF0",
    borderColor:"#F0FF68",
    hoverBorderColor:"#00F"
}];
  PriceData: ChartDataSets[] = [
    { data: [], label: 'Price' }
  ];


  // STATE
  StateOptions: ChartOptions = {
    responsive: true,
  };
  StateLabels: Label[] = [];
  StateType: ChartType = 'bar';
  StateLegend = true;
  StatePlugins = [];
  StateColors: Color[]=[{
    backgroundColor:"#0000FF",
    hoverBackgroundColor:"#FF0",
    borderColor:"#F0FF68",
    hoverBorderColor:"#00F"
}];
  StateData: ChartDataSets[] = [
    { data: [], label: 'State of property' }
  ];



  // TYPE
  TypeOptions: ChartOptions = {
    responsive: true,
  };
  TypeLabels: Label[] = [];
  TypeType: ChartType = 'bar';
  TypeLegend = true;
  TypePlugins = [];
  TypeColors: Color[]=[{
    backgroundColor:"#0000FF",
    hoverBackgroundColor:"#FF0",
    borderColor:"#F0FF68",
    hoverBorderColor:"#00F"
}];
  TypeData: ChartDataSets[] = [
    { data: [], label: 'Type of property' }
  ];



  // AREA
  AreaOptions: ChartOptions = {
    responsive: true,
  };
  AreaLabels: Label[] = [];
  AreaType: ChartType = 'bar';
  AreaLegend = true;
  AreaPlugins = [];
  AreaColors: Color[]=[{
    backgroundColor:"#0000FF",
    hoverBackgroundColor:"#FF0",
    borderColor:"#F0FF68",
    hoverBorderColor:"#00F"
}];
  AreaData: ChartDataSets[] = [
    { data: [], label: 'Property area' }
  ];



  // SIZE
  SizeOptions: ChartOptions = {
    responsive: true,
  };
  SizeLabels: Label[] = [];
  SizeType: ChartType = 'bar';
  SizeLegend = true;
  SizePlugins = [];
  SizeColors: Color[]=[{
    backgroundColor:"#0000FF",
    hoverBackgroundColor:"#FF0",
    borderColor:"#F0FF68",
    hoverBorderColor:"#00F"
}];
  SizeData: ChartDataSets[] = [
    { data: [], label: 'Property size' }
  ];



  // LAND
  LandOptions: ChartOptions = {
    responsive: true,
  };
  LandLabels: Label[] = [];
  LandType: ChartType = 'bar';
  LandLegend = true;
  LandPlugins = [];
  LandColors: Color[]=[{
    backgroundColor:"#0000FF",
    hoverBackgroundColor:"#FF0",
    borderColor:"#F0FF68",
    hoverBorderColor:"#00F"
}];
  LandData: ChartDataSets[] = [
    { data: [], label: 'Land area' }
  ];



  constructor(private realEstateService: RealEstateService) { 
    this.websocket.asObservable().subscribe(
      data => {
        const message = data as WSMessage;
        if (message.type === 'Statistic') {
          this.propertyStatistic = message.statistic;
          console.log(this.propertyStatistic);
          this.fillInCharts();
        }
      },
      err => console.log(err),
      () => console.log('WS connection closed')
    );
  }

  ngOnInit() {
    var message: DataRequestDTO = new DataRequestDTO();
    message.content = ["properties/city-nekretnine.json","properties/info-nekretnine.json", "properties/021-nekretnine.json"];
    message.ontology = "STATISTICS:SORT-VIEWS-DESC";
    this.realEstateService.startStatistics(message).subscribe(
      (data: any) => {
        console.log(data);
      },
      (error) => {
        alert(error);
      }
    );
  }



  getWebsocketUrl() {
    var loc = window.location, new_uri;
    if (loc.protocol === 'https:') {
      new_uri = 'wss:';
    } else {
      new_uri = 'ws:';
    }
    new_uri += '//' + loc.host;
    new_uri += loc.pathname + 'ws';
    //console.log(new_uri);
    return environment.production ? new_uri : environment.WS_URL;
  }

  fillInCharts(){
    // Location
    for(var key in this.propertyStatistic.location){
      if (this.propertyStatistic.location.hasOwnProperty(key) && this.propertyStatistic.location[key]!=null) {
        this.LocationLabels.push(key);
        this.LocationData[0].data.push(this.propertyStatistic.location[key]);
      }
    }

    const ordered = {};
    const unordered = this.propertyStatistic.price;
    Object.keys(unordered).sort((a,b) => {
      return Number.parseInt(a.split('-')[0]) < Number.parseInt(b.split('-')[0]) ? -1 : 1
    }).forEach(function(key) {
      ordered[key] = unordered[key];
    });
    // Price
    for(var key in ordered){
      if (ordered.hasOwnProperty(key) && ordered[key]!=null) {
        this.PriceLabels.push(key);
        this.PriceData[0].data.push(ordered[key]);
      }
    }

    // State
    for(var key in this.propertyStatistic.state){
      if (this.propertyStatistic.state.hasOwnProperty(key) && this.propertyStatistic.state[key]!=null) {
        this.StateLabels.push(key);
        this.StateData[0].data.push(this.propertyStatistic.state[key]);
      }
    }

    const orderedArea = {};
    const unorderedArea = this.propertyStatistic.area;
    Object.keys(unorderedArea).sort((a,b) => {
      return Number.parseInt(a.split('-')[0]) < Number.parseInt(b.split('-')[0]) ? -1 : 1
    }).forEach(function(key) {
      orderedArea[key] = unorderedArea[key];
    });
    // Area
    for(var key in orderedArea){
      if (orderedArea.hasOwnProperty(key) && orderedArea[key]!=null) {
        this.AreaLabels.push(key);
        this.AreaData[0].data.push(orderedArea[key]);
      }
    }


    const orderedSize = {};
    const unorderedSize = this.propertyStatistic.size;
    Object.keys(unorderedSize).sort((a,b) => {
      return Number.parseInt(a.split('-')[0]) < Number.parseInt(b.split('-')[0]) ? -1 : 1
    }).forEach(function(key) {
      orderedSize[key] = unorderedSize[key];
    });
    // Size
    for(var key in orderedSize){
      if (orderedSize.hasOwnProperty(key) && orderedSize[key]!=null) {
        this.SizeLabels.push(key);
        this.SizeData[0].data.push(orderedSize[key]);
      }
    }

    // Land
    for(var key in this.propertyStatistic.land){
      if (this.propertyStatistic.land.hasOwnProperty(key) && this.propertyStatistic.land[key]!=null) {
        this.LandLabels.push(key);
        this.LandData[0].data.push(this.propertyStatistic.land[key]);
      }
    }

    // Type
    for(var key in this.propertyStatistic.type){
      if (this.propertyStatistic.type.hasOwnProperty(key) && this.propertyStatistic.type[key]!=null) {
        this.TypeLabels.push(key);
        this.TypeData[0].data.push(this.propertyStatistic.type[key]);
      }
    }
  }
}
