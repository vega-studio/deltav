declare module "make-cert" {
  interface MakeCert {
    cert: string;
    key: string;
  }

  function makeCert(hostName: string): MakeCert;

  export = makeCert;
}
