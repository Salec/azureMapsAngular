import { TestBed } from '@angular/core/testing';

import { GeoMarkersService } from './geo-markers.service';

describe('GeoMarkersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GeoMarkersService = TestBed.get(GeoMarkersService);
    expect(service).toBeTruthy();
  });
});
