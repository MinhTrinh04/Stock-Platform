declare module "apexcharts" {
  export interface ApexOptions {
    chart?: {
      type?: string;
      height?: number;
      animations?: {
        enabled?: boolean;
      };
      toolbar?: {
        show?: boolean;
        tools?: {
          download?: boolean;
          selection?: boolean;
          zoom?: boolean;
          zoomin?: boolean;
          zoomout?: boolean;
          pan?: boolean;
          reset?: boolean;
        };
      };
      zoom?: {
        enabled?: boolean;
        type?: string;
        autoScaleYaxis?: boolean;
      };
    };
    stroke?: {
      width?: number[];
      curve?: string;
      dashArray?: number[];
    };
    colors?: string[];
    xaxis?: {
      type?: string;
      labels?: {
        datetimeFormatter?: {
          year?: string;
          month?: string;
          day?: string;
          hour?: string;
        };
      };
    };
    yaxis?: {
      labels?: {
        formatter?: (value: number) => string;
      };
    };
    tooltip?: {
      x?: {
        format?: string;
      };
      y?: {
        formatter?: (value: number) => string;
      };
    };
    grid?: {
      borderColor?: string;
    };
  }
}

declare module "react-apexcharts" {
  import { Component } from "react";
  import { ApexOptions } from "apexcharts";

  interface Props {
    options: ApexOptions;
    series: any[];
    type: string;
    height: number;
    width?: string | number;
  }

  export default class ReactApexChart extends Component<Props> {}
}
