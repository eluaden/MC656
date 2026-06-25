export type GeoPoint = {
  lat: number;
  lng: number;
};

export interface DataSourceAdapter<TResult> {
  fetch(point: GeoPoint): Promise<TResult>;
}
