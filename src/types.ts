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

  dimensions(query: string): [number, number] {
    const boundingRect = document.querySelector(query)!.getBoundingClientRect();
    const width = boundingRect.width - this.left - this.right;
    const height = boundingRect.height - this.top - this.bottom;
    return [width, height];
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
