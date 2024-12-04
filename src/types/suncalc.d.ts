declare module "suncalc" {
  export interface Times {
    sunrise: Date;
    sunset: Date;
    [key: string]: Date;
  }

  export interface MoonIllumination {
    fraction: number;
    phase: number;
    angle: number;
  }

  export function getTimes(date: Date, latitude: number, longitude: number): Times;
  export function getMoonIllumination(date: Date): MoonIllumination;
}
