import * as d3 from "d3";

export type Choice = "org" | "isp" | "os" | "location";

export class Margin {
  left: number;
  right: number;
  top: number;
  bottom: number;

  constructor(top: number, right: number, bottom: number, left: number) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  static all(val: number) {
    return new Margin(val, val, val, val);
  }
}

export class Dimensions {
  #width = 0;
  #height = 0;
  margin: Margin;
  elem: HTMLElement;

  constructor(elem: HTMLElement, margin: Margin) {
    this.elem = elem;
    this.margin = margin;
    this.refresh();
  }

  refresh() {
    const rect = this.elem.getBoundingClientRect();
    this.#width = rect.width;
    this.#height = rect.height;
  }

  get width() {
    return this.#width - this.margin.left - this.margin.right;
  }

  get height() {
    return this.#height - this.margin.top - this.margin.bottom;
  }
}

export class Row {
  ip_str: string;
  isp: string;
  org: string;
  os: string;
  port: number;
  timestamp: Date;
  location: number;
  vulns: number[];

  constructor(
    ip_str: string,
    isp: string,
    org: string,
    os: string,
    port: number,
    timestamp: Date,
    location: number,
    vulns: number[]
  ) {
    this.ip_str = ip_str;
    this.isp = isp;
    this.org = org;
    this.os = os;
    this.port = port;
    this.timestamp = timestamp;
    this.location = location;
    this.vulns = vulns;
  }
}

export class Vulnerability {
  cve: string;
  count: number;
  verified: boolean;
  cvss: number;

  constructor(cve: string, count: number, verified: boolean, cvss: number) {
    this.cve = cve;
    this.count = count;
    this.verified = verified;
    this.cvss = cvss;
  }
}

export class LeftPlotObject {
  val: string;
  name: string;
  vulns: number[];

  constructor(val: string, name: string, vulns: number[]) {
    this.val = val;
    this.name = name;
    this.vulns = vulns;
  }

  total(): number {
    return d3.sum(this.vulns);
  }

  dimensions(): [number, number][] {
    return d3.zip([0].concat(Array.from(d3.cumsum(this.vulns))), this.vulns) as [number, number][];
  }
}

export class Location {
  city: string;
  township: string;
  province: string;
  longitude: number;
  latitude: number;
  population: number;
  total_devices: number;

  constructor(
    city: string,
    township: string,
    province: string,
    longitude: number,
    latitude: number,
    population: number,
    total_devices: number
  ) {
    this.township = township;
    this.province = province;
    this.longitude = longitude;
    this.latitude = latitude;
    this.city = city;
    this.population = population;
    this.total_devices = total_devices;
  }
}

export abstract class Plot {
  container: HTMLElement;
  dimensions: Dimensions;
  margin: Margin;

  constructor(elem: HTMLElement, margin: Margin) {
    this.container = elem;
    this.margin = margin;
    this.dimensions = new Dimensions(elem, margin);
  }

  abstract update(): void;
  abstract clear(): void;

  get width() {
    return this.dimensions.width;
  }

  get height() {
    return this.dimensions.height;
  }
}
