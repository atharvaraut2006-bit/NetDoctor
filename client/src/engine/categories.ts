/**
 * NetDoctor — MVP Problem Categories (PRD Section 3)
 * Structured definitions and keyword weights for the 11 supported MVP categories
 */

import type { CategoryDefinition, ProblemCategoryKey } from './types';

export const MVP_CATEGORIES: Record<ProblemCategoryKey, CategoryDefinition> = {
  internet_not_working: {
    id: 'internet_not_working',
    displayName: 'Internet Not Working',
    description: 'Complete or general loss of Internet connectivity across applications.',
    primaryKeywords: ['internet', 'net', 'offline', 'disconnected', 'down', 'outage'],
    secondaryKeywords: ['connection', 'loading', 'access', 'broken', 'gone'],
    keyPhrases: [
      'internet not working',
      'internet isn t working',
      'internet is not working',
      'no internet',
      'net is gone',
      'lost internet',
      'cannot access internet',
      'cant browse',
      'cannot browse',
      'internet down',
      'no connection'
    ]
  },

  wifi_connection: {
    id: 'wifi_connection',
    displayName: 'Wi-Fi Connection Problems',
    description: 'Wireless signal drops, association issues, or disconnection from Wi-Fi access points.',
    primaryKeywords: ['wifi', 'wireless', 'wlan', 'ssid', 'hotspot'],
    secondaryKeywords: ['disconnecting', 'disconnects', 'drops', 'dropping', 'signal', 'range', 'reconnecting', 'weak'],
    keyPhrases: [
      'wifi keeps disconnecting',
      'wifi disconnecting',
      'wifi not working',
      'wifi connected but no internet',
      'wireless keeps dropping',
      'wifi drops',
      'wifi problem',
      'cannot connect to wifi',
      'wifi keeps dropping',
      'wifi signal weak'
    ]
  },

  slow_internet: {
    id: 'slow_internet',
    displayName: 'Slow Internet Throughput',
    description: 'Sluggish download/upload speeds, buffering, or reduced bandwidth throughput.',
    primaryKeywords: ['slow', 'speed', 'bandwidth', 'throughput', 'buffering', 'sluggish', 'megabits', 'mbps'],
    secondaryKeywords: ['streaming', 'download', 'upload', 'crawl', 'delay'],
    keyPhrases: [
      'slow internet',
      'internet is slow',
      'internet is extremely slow',
      'network is slow',
      'very slow speed',
      'slow download',
      'streaming buffering',
      'connection is sluggish'
    ]
  },

  high_latency: {
    id: 'high_latency',
    displayName: 'High Ping & Latency',
    description: 'Elevated round-trip ping times, gaming lag, jitter, or high response delays.',
    primaryKeywords: ['ping', 'latency', 'lag', 'ms', 'jitter', 'delay'],
    secondaryKeywords: ['gaming', 'game', 'spike', 'spikes', 'high'],
    keyPhrases: [
      'ping is high',
      'high ping',
      'ping is very high',
      'gaming lag',
      'latency is high',
      'lagging in games',
      'ping spikes',
      'high latency'
    ]
  },

  packet_loss: {
    id: 'packet_loss',
    displayName: 'Packet Loss',
    description: 'Packets dropped in transit causing choppy calls, rubberbanding, or stuttering.',
    primaryKeywords: ['packet', 'loss', 'dropped', 'drops', 'rubberbanding', 'choppy', 'stutter'],
    secondaryKeywords: ['packets', 'voice', 'zoom', 'call', 'discord'],
    keyPhrases: [
      'packet loss',
      'getting packet loss',
      'packets dropping',
      'dropped packets',
      'voice cutting out',
      'discord packet loss'
    ]
  },

  dns_problem: {
    id: 'dns_problem',
    displayName: 'DNS Resolution Problems',
    description: 'Domain name translation failure, DNS server timeouts, or name lookup errors.',
    primaryKeywords: ['dns', 'domain', 'lookup', 'nameserver', 'nslookup', 'resolve', 'resolution', 'hostname'],
    secondaryKeywords: ['server', 'address', 'convert', 'translate', 'err_name_not_resolved'],
    keyPhrases: [
      'dns not working',
      'dns is not working',
      'dns error',
      'dns server not responding',
      'dns lookup failed',
      'domain cannot be resolved',
      'err_name_not_resolved',
      'cannot resolve domain'
    ]
  },

  ip_dhcp_problem: {
    id: 'ip_dhcp_problem',
    displayName: 'IP & DHCP Configuration Issues',
    description: 'Failure to obtain a valid IP lease from DHCP, APIPA self-assigned address, or IP conflicts.',
    primaryKeywords: ['ip', 'dhcp', 'apipa', 'lease', 'subnet', '169.254', 'static', 'address'],
    secondaryKeywords: ['assign', 'assigned', 'renew', 'release', 'conflict'],
    keyPhrases: [
      'not getting an ip address',
      'no ip address',
      'ip address error',
      'dhcp not working',
      'dhcp lookup failed',
      'invalid ip address',
      'self-assigned ip',
      '169.254'
    ]
  },

  router_connectivity: {
    id: 'router_connectivity',
    displayName: 'Router & Gateway Connectivity',
    description: 'Inability to reach the local Default Gateway, router interface, or modem link.',
    primaryKeywords: ['router', 'gateway', 'modem', '192.168', '10.0.0', 'default gateway'],
    secondaryKeywords: ['unreachable', 'reboot', 'admin', 'portal', 'blinking'],
    keyPhrases: [
      'cannot reach router',
      'cannot reach my router',
      'gateway unreachable',
      'router not responding',
      'router down',
      'cannot open router page',
      'default gateway timeout'
    ]
  },

  network_adapter: {
    id: 'network_adapter',
    displayName: 'Network Adapter Problems',
    description: 'Network interface card (NIC) hardware, driver disabled, or adapter configuration fault.',
    primaryKeywords: ['adapter', 'nic', 'ethernet card', 'driver', 'interface', 'device manager'],
    secondaryKeywords: ['disabled', 'missing', 'unrecognized', 'hardware'],
    keyPhrases: [
      'network adapter not working',
      'network adapter isn t working',
      'adapter disabled',
      'no network adapter',
      'nic not working',
      'ethernet adapter missing',
      'network card error'
    ]
  },

  website_connectivity: {
    id: 'website_connectivity',
    displayName: 'Specific Website Connectivity',
    description: 'Single website or specific port/app inaccessible while general internet remains available.',
    primaryKeywords: ['website', 'site', 'webpage', 'page', 'google', 'youtube', 'url', 'web'],
    secondaryKeywords: ['open', 'load', 'loading', 'blocked', 'refused'],
    keyPhrases: [
      'website won t open',
      'websites won t open',
      'one website won t open',
      'websites will not open',
      'cant open website',
      'specific website not loading',
      'some websites not opening'
    ]
  },

  lan_connectivity: {
    id: 'lan_connectivity',
    displayName: 'LAN & Local Network Connectivity',
    description: 'Inability to communicate with local peers, file shares, or local network devices.',
    primaryKeywords: ['lan', 'local', 'subnet', 'intranet', 'peer', 'share', 'nas'],
    secondaryKeywords: ['computer', 'printer', 'local network', 'fileshare', 'smb'],
    keyPhrases: [
      'cannot connect to another computer on my lan',
      'lan connectivity',
      'local network problem',
      'cannot see other computers',
      'file share unreachable',
      'local network device offline'
    ]
  }
};
