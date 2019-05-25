import { Component, OnInit, Input } from '@angular/core';
import * as atlas from 'azure-maps-control';
import { GeoMarkersService } from '../geo-markers.service';
import { environment } from '../../environments/environment';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  key: string = environment["AZURE_MAPS_KEY"]
  map: atlas.Map;
  @Input() set markers(markers: any[]) {
    this._points = this.geoMarkersService.getData();
    console.log(this.markers);
  }
  _points: atlas.data.Point[];

  constructor(private geoMarkersService: GeoMarkersService) { }

  ngOnInit() {
    this.map = new atlas.Map('mapContainer', {
      center: [-73.985708, 40.75773],
      zoom: 1,
      showLogo: false,
      renderWorldCopies: false,
      language: 'en-US',
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: this.key
      }
    });

    //Wait until the map resources are ready.
    this.map.events.add('ready', () => {

      /* Construct a zoom control*/
      var zoomControl = new atlas.control.ZoomControl({ style: atlas.ControlStyle.dark, zoomDelta: 1 })

      /* Add the zoom control to the map*/
      this.map.controls.add(zoomControl, {
        //
        position: atlas.ControlPosition.BottomRight
      });

      /* Add compass control */
      var compassControl = new atlas.control.CompassControl();

      /*Add compass control to the map*/
      this.map.controls.add(compassControl, {
        position: atlas.ControlPosition.BottomLeft
      });

      /*TODO - controlers are not working fine */


      this._points = this.geoMarkersService.getData().resources.map(element => {
        return new atlas.data.Point([element['wgs84_pos:long'], element['wgs84_pos:lat']])
      });

      console.log(this._points);
      var dataSource = new atlas.source.DataSource();
      this.map.sources.add(dataSource);
      /*Add multiple points to the data source*/
      dataSource.add(this._points);

      this.map.layers.add(new atlas.layer.BubbleLayer(dataSource, null, {
        radius: 5,
        strokeColor: "#4288f7",
        strokeWidth: 6, 
        color: "white" 
       }));
    })

  }

}
