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

export class Organisation {
  name: string;
  sev1: number;
  sev2: number;
  sev3: number;
  sev4: number;
  sev5: number;
  sev6: number;
  sev7: number;
  sev8: number;
  sev9: number;
  sev10: number;

  constructor(  name: string, sev1: number, sev2: number, sev3: number, sev4: number, sev5: number, sev6: number,
                sev7: number, sev8: number, sev9: number, sev10: number) {
    this.name = name;
    this.sev1 = sev1;
    this.sev2 = sev2;
    this.sev3 = sev3;
    this.sev4 = sev4;
    this.sev5 = sev5;
    this.sev6 = sev6;
    this.sev7 = sev7;
    this.sev8 = sev8;
    this.sev9 = sev9;
    this.sev10 = sev10;
  }

  total(): number {
    return this.sev1 + this.sev2 + this.sev3 + this.sev4 + this.sev5 + this.sev6 + this.sev7 + this.sev8 + this.sev9 + this.sev10;
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
