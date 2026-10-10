/**
 * NetDoctor — Networking Lexicon & Typo Mappings
 * Deterministic domain dictionary for fuzzy matching and typo tolerance
 */

export const KNOWN_TYPOS_MAP: Record<string, string> = {
  // Disconnection & Connection typos
  'disconecting': 'disconnecting',
  'disconected': 'disconnected',
  'disconection': 'disconnection',
  'dissconnecting': 'disconnecting',
  'conection': 'connection',
  'conecting': 'connecting',
  'conected': 'connected',
  'connecton': 'connection',
  
  // Internet & Network typos
  'internat': 'internet',
  'intenet': 'internet',
  'internt': 'internet',
  'intre开发者': 'internet',
  'intrnet': 'internet',
  'netwrok': 'network',
  'netowrk': 'network',
  'newtork': 'network',
  
  // Wireless / Wi-Fi typos
  'wierless': 'wireless',
  'wirless': 'wireless',
  'wireles': 'wireless',
  'wfi': 'wifi',
  'wi-fi': 'wifi',
  'wif': 'wifi',
  'wiffi': 'wifi',
  
  // Ping / Latency typos
  'pign': 'ping',
  'png': 'ping',
  'latancy': 'latency',
  'laggg': 'lag',
  'laggy': 'lag',
  'lagging': 'lag',
  'pakeet': 'packet',
  'pakcet': 'packet',
  'pacet': 'packet',
  
  // DNS & Protocol typos
  'workng': 'working',
  'wokring': 'working',
  'wrking': 'working',
  'broswer': 'browser',
  'browsng': 'browsing',
  'websit': 'website',
  'websits': 'websites',
  'routter': 'router',
  'roter': 'router',
  'gatewy': 'gateway',
  'getaway': 'gateway',
  'adpater': 'adapter',
  'adaptr': 'adapter',
  'ethernt': 'ethernet',
  'ethernte': 'ethernet',
};

export const NETWORKING_LEXICON = [
  'wifi', 'wireless', 'internet', 'network', 'router', 'gateway', 'dns', 'ip',
  'dhcp', 'ping', 'latency', 'lag', 'packet', 'loss', 'adapter', 'ethernet',
  'lan', 'wan', 'modem', 'switch', 'subnet', 'disconnecting', 'disconnected',
  'browser', 'website', 'loading', 'connection', 'connected', 'offline', 'online',
  'broadband', 'throughput', 'speed', 'slow', 'bandwidth', 'timeout', 'unreachable'
];

export const NON_NETWORKING_INDICATORS = [
  // Programming & Software Development
  'java', 'python', 'c++', 'c#', 'javascript', 'typescript', 'compiler', 'compiling',
  'nullpointer', 'syntax error', 'stack trace', 'runtime error', 'function', 'variable',
  'git commit', 'merge conflict', 'sql query', 'database schema', 'react component',
  
  // Hardware & Power (non-network)
  'battery', 'charging', 'charger', 'draining', 'overheating', 'fan noise', 'cpu usage',
  'gpu', 'ram upgrade', 'blue screen', 'bsod', 'kernel panic', 'power button', 'keyboard',
  'touchpad', 'mouse pointer', 'trackpad', 'screen brightness', 'monitor display', 'hdmi audio',
  'printer ink', 'paper jam', 'toner', 'cartridge', 'scanner lamp',
  
  // Non-tech / General
  'cook pasta', 'recipe', 'weather forecast', 'bake cake', 'workout', 'headache',
  'flight ticket', 'hotel booking', 'calculator', 'spell check', 'photoshop brush'
];
