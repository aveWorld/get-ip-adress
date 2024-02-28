import net from 'net';

const isValidIP = (ip) => net.isIP(ip) === 4 || net.isIP(ip) === 6;

const handleArray = (results) => {
  if (!results) return null;
  if (!Array.isArray(results)) return null;
  if (results.length === 0) return null;
  const ips = results.filter((ip) => typeof ip === 'string' && isValidIP(ip.trim()));
  if (ips.length > 0) {
    console.log('ips', ips);
    return ips[0].trim();
  }
  return null;
};
const handleResults = (results) => {
  if (!results) return null;
  if (Array.isArray(results)) {
    var ip = handleArray(results);
    if (ip) return ip;
  }
  if (typeof results === 'string') {
    if (results.includes(',')) {
      var ip = handleArray(results.split(','));
      if (ip) return ip;
    }
    if (isValidIP(results)) return results;
  }
  return null;
};

const customHeaders = [
  'x-client-ip',
  'x-forwarded-for',
  'forwarded-for',
  'x-forwarded',
  'x-real-ip',
  'cf-connecting-ip',
  'true-client-ip',
  'x-cluster-client-ip',
  'fastly-client-ip',
  'x-appengine-user-ip',
  'Cf-Pseudo-IPv4',
];

const getIPFromHeaders = (req) => {
  //Validate headers
  if (!('headers' in req)) return null;
  if (!req.headers) return null;
  if (typeof req.headers !== 'object') return null;
  const headers = req.headers;
  //looking for the first IP header req.headers.forwarded
  if (headers.forwarded && typeof headers.forwarded === 'string') {
    var ip = handleResults(headers.forwarded);
    if (ip) return ip;
  }
  //Looking through each custom header and returns the valid one
  for (let _i = 0, customHeaders_1 = customHeaders; _i < customHeaders_1.length; _i++) {
    const customHeader = customHeaders_1[_i];
    if (headers[customHeader]) {
      var ip = handleResults(headers[customHeader]);
      if (ip) return ip;
    }
  }
  return null;
};

const getClientIp = (request) => {
  //Validate request
  if (!request) return null;
  if (typeof request !== 'object') return null;
  const req = request;
  //Getting IP from headers
  const ip = getIPFromHeaders(req);
  if (ip) return ip;
  //Getting IP from socket
  if (req.socket && req.socket.remoteAddress && typeof req.socket.remoteAddress === 'string') {
    if (isValidIP(req.socket.remoteAddress)) return req.socket.remoteAddress;
  }
  if (req.info && req.info.remoteAddress && typeof req.info.remoteAddress === 'string') {
    if (isValidIP(req.info.remoteAddress)) return req.info.remoteAddress;
  }
  if (
    req.requestContext &&
    req.requestContext.identity &&
    req.requestContext.identity.sourceIp &&
    typeof req.requestContext.identity.sourceIp === 'string'
  ) {
    if (isValidIP(req.requestContext.identity.sourceIp))
      return req.requestContext.identity.sourceIp;
  }
  return null;
};

export default getClientIp();
