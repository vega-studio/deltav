/**
 * Retrieves just the domain from the URL.
 */
export function getDomain(url: string) {
  // Removing the protocol
  if (url.includes("://")) {
    url = url.split("://")[1];
  }

  // Splitting by slashes and getting the netloc
  const netloc = url.split("/")[0];

  // Splitting the netloc by dots
  const parts = netloc.split(".");

  // Known ccTLDs that have two parts
  // e.g. www.example.co.uk -> example.co.uk
  // NOTE: This list can be expanded.
  const twoPartTlds = [
    "co.uk",
    "com.au",
    "com.br",
    "co.nz",
    "co.za",
    "com.ar",
    "co.jp",
    "co.in",
    "com.sg",
    "com.mx",
  ];

  let domainAndTld;
  if (parts.length > 2) {
    domainAndTld = twoPartTlds.includes(parts.slice(-2).join("."))
      ? parts.slice(-3).join(".")
      : parts.slice(-2).join(".");
  } else {
    domainAndTld = netloc;
  }

  return domainAndTld;
}
