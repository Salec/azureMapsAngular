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
    this._features = this.geoMarkersService.getData();
  }
  _features: atlas.data.Feature<atlas.data.Point, { name: string, description: string }>[];
  popup: atlas.Popup;

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

    //Define an HTML template for a custom popup content laypout.
    var popupTemplate = '<div class="customInfobox"><div class="name">{name}</div>{description}</div>';

    //Wait until the map resources are ready.
    this.map.events.add('ready', () => {



      var dataSource = new atlas.source.DataSource();

      this._features = this.geoMarkersService.getData().resources.map(element => {
        return new atlas.data.Feature(new atlas.data.Point([element['wgs84_pos:long'], element['wgs84_pos:lat']]), {
          name: element['ayto:numero'],
          description: element['ayto:parada']
        },
          element['ayto:numero'])
      });
      dataSource.add(this._features);
      var symbolLayer = new atlas.layer.SymbolLayer(dataSource, null, {
        iconOptions: {
          image: 'pin-red'
        }
      });
      //Add a layer for rendering point data as symbols.
      this.map.sources.add(dataSource);
      this.map.layers.add(symbolLayer);

      //Create a popup but leave it closed so we can update it and display it later.
      this.popup = new atlas.Popup({
        pixelOffset: [0, -18]
      });
      this.map.events.add('click', symbolLayer, symbolClicked);


    });

    var symbolClicked=(e) => {
      //Make sure the event occured on a point feature.
      if (e.shapes && e.shapes.length > 0) {
        var content, coordinate;

        //Check to see if the first value in the shapes array is a Point Shape.
        if (e.shapes[0] instanceof atlas.Shape && e.shapes[0].getType() === 'Point') {
          var properties = e.shapes[0].getProperties();
          content = popupTemplate.replace(/{name}/g, properties.name).replace(/{description}/g, properties.description);
          coordinate = e.shapes[0].getCoordinates();
        } else if (e.shapes[0].type === 'Feature' && e.shapes[0].geometry.type === 'Point') {

          //Check to see if the feature is a cluster.
          if (e.shapes[0].properties.cluster) {
            content = '<div style="padding:10px;">Cluster of ' + e.shapes[0].properties.point_count + ' symbols</div>';
          } else {
            //Feature is likely from a VectorTileSource.
            content = popupTemplate.replace(/{name}/g, properties.name).replace(/{description}/g, properties.description);
          }

          coordinate = e.shapes[0].geometry.coordinates;
        }

        if (content && coordinate) {
          //Populate the popupTemplate with data from the clicked point feature.
          this.popup.setOptions({
            //Update the content of the popup.
            content: content,

            //Update the position of the popup with the symbols coordinate.
            position: coordinate
          });

          //Open the popup.
          this.popup.open(this.map);
        }
      }


    }
  } 

}
