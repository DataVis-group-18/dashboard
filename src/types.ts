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

export interface Data {
  shodan: d3.DSVParsedArray<Row>;
  vulnerabilities: d3.DSVParsedArray<Vulnerability>;
  locations: d3.DSVParsedArray<Location>;
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
  summary: string

  constructor(cve: string, count: number, verified: boolean, cvss: number, summary: string) {
    this.cve = cve;
    this.count = count;
    this.verified = verified;
    this.cvss = cvss;
    this.summary = summary;
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

  total(minCVSS: number): number {
    return d3.sum(this.vulns.slice(minCVSS-1));
  }

  dimensions(minCVSS: number): [number, number][] {
    const widths = new Array(minCVSS-1).concat(this.vulns.slice(minCVSS-1))
    return d3.zip([0].concat(Array.from(d3.cumsum(widths))), widths) as [number, number][];
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
