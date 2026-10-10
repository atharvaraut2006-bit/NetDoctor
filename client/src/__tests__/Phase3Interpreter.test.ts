import { describe, it, expect } from 'vitest';
import {
  parseAdapterOutput,
  parseIpConfigOutput,
  parsePingOutput,
  parseDnsOutput,
  parseTraceOutput,
  parseWifiOutput,
  parseHttpOutput,
  interpretCommandOutput,
  interpretQuickOption
} from '../engine/interpreters';

describe('Phase 3 — Command Output Interpreters & Regex Parsers', () => {
  describe('Network Adapter & Physical Link Parser (adapterParser)', () => {
    it('detects disconnected single interface row (e.g. McAfee VPN Disconnected)', () => {
      const sample = 'Enabled        Disconnected   Dedicated    McAfee VPN';
      const result = parseAdapterOutput(sample);
      expect(result.isConnected).toBe(false);
      expect(result.isDisconnected).toBe(true);
      expect(result.activeAdapterName).toBe('McAfee VPN');
      expect(result.state).toBe('Disconnected');
      expect(result.adminState).toBe('Enabled');
    });

    it('detects connected primary Wi-Fi adapter in full netsh table', () => {
      const sample = `
Admin State    State          Type             Interface Name
-------------------------------------------------------------------------
Enabled        Connected      Dedicated        Wi-Fi
Enabled        Disconnected   Dedicated        Ethernet
Enabled        Disconnected   Dedicated        McAfee VPN
`;
      const result = parseAdapterOutput(sample);
      expect(result.isConnected).toBe(true);
      expect(result.isDisconnected).toBe(false);
      expect(result.activeAdapterName).toBe('Wi-Fi');
      expect(result.state).toBe('Connected');
      expect(result.adminState).toBe('Enabled');
    });

    it('detects all primary adapters disconnected', () => {
      const sample = `
Admin State    State          Type             Interface Name
-------------------------------------------------------------------------
Enabled        Disconnected   Dedicated        Wi-Fi
Enabled        Disconnected   Dedicated        Ethernet
`;
      const result = parseAdapterOutput(sample);
      expect(result.isConnected).toBe(false);
      expect(result.isDisconnected).toBe(true);
    });

    it('detects disabled primary adapter', () => {
      const sample = `
Admin State    State          Type             Interface Name
-------------------------------------------------------------------------
Disabled       Disconnected   Dedicated        Wi-Fi
`;
      const result = parseAdapterOutput(sample);
      expect(result.isConnected).toBe(false);
      expect(result.isDisabled).toBe(true);
    });

    it('parses Linux ip link show format', () => {
      const sample = `
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP mode DEFAULT group default qlen 1000
3: wlan0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN mode DORMANT group default qlen 1000
`;
      const result = parseAdapterOutput(sample);
      expect(result.isConnected).toBe(true);
      expect(result.activeAdapterName).toBe('eth0');
    });
  });
  describe('IP & DHCP Configuration Parser (ipConfigParser)', () => {
    it('correctly parses valid Windows ipconfig output', () => {
      const sample = `
Windows IP Configuration

Wireless LAN adapter Wi-Fi:
   Connection-specific DNS Suffix  . : lan
   Link-local IPv6 Address . . . . . : fe80::1024:88ff:fe22:3344%12
   IPv4 Address. . . . . . . . . . . : 192.168.1.105
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
`;
      const result = parseIpConfigOutput(sample);
      expect(result.ipv4).toBe('192.168.1.105');
      expect(result.subnetMask).toBe('255.255.255.0');
      expect(result.defaultGateway).toBe('192.168.1.1');
      expect(result.isApipa).toBe(false);
      expect(result.isDisconnected).toBe(false);
    });

    it('robustly parses full multi-adapter output with disconnected Bluetooth and active Wi-Fi', () => {
      const fullSample = `
Windows IP Configuration

   Host Name . . . . . . . . . . . . : DESKTOP-MAIN
   Primary Dns Suffix  . . . . . . . : 
   Node Type . . . . . . . . . . . . : Hybrid

Ethernet adapter Bluetooth Network Connection:

   Media State . . . . . . . . . . . : Media disconnected
   Connection-specific DNS Suffix  . : 
   Description . . . . . . . . . . . : Bluetooth Device (Personal Area Network)

Wireless LAN adapter Wi-Fi:

   Connection-specific DNS Suffix  . : lan
   Description . . . . . . . . . . . : Intel(R) Wi-Fi 6 AX201 160MHz
   Physical Address. . . . . . . . . : AA-BB-CC-DD-EE-FF
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 172.16.36.16(Preferred) 
   Subnet Mask . . . . . . . . . . . : 255.255.240.0
   Default Gateway . . . . . . . . . : 172.16.32.1
   DHCP Server . . . . . . . . . . . : 172.16.32.1
   DNS Servers . . . . . . . . . . . : 172.16.32.1
                                       8.8.8.8
`;
      const result = parseIpConfigOutput(fullSample);
      expect(result.ipv4).toBe('172.16.36.16');
      expect(result.subnetMask).toBe('255.255.240.0');
      expect(result.defaultGateway).toBe('172.16.32.1');
      expect(result.isApipa).toBe(false);
      expect(result.isDisconnected).toBe(false);
    });

    it('detects APIPA self-assigned address (169.254.x.x)', () => {
      const sample = `
Ethernet adapter Ethernet:
   Connection-specific DNS Suffix  . :
   Autoconfiguration IPv4 Address. . : 169.254.45.120
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
   Default Gateway . . . . . . . . . :
`;
      const result = parseIpConfigOutput(sample);
      expect(result.ipv4).toBe('169.254.45.120');
      expect(result.isApipa).toBe(true);
      expect(result.defaultGateway).toBeUndefined();
    });

    it('detects Media Disconnected state when all adapters are disconnected', () => {
      const sample = `
Wireless LAN adapter Wi-Fi:
   Media State . . . . . . . . . . . : Media disconnected
   Connection-specific DNS Suffix  . :
`;
      const result = parseIpConfigOutput(sample);
      expect(result.isDisconnected).toBe(true);
    });

    it('parses Linux ip addr show output', () => {
      const sample = `
2: wlan0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default qlen 1000
    inet 192.168.0.45/24 brd 192.168.0.255 scope global dynamic wlan0
       valid_lft 86340sec preferred_lft 86340sec
`;
      const result = parseIpConfigOutput(sample);
      expect(result.ipv4).toBe('192.168.0.45');
      expect(result.isApipa).toBe(false);
    });
  });

  describe('Ping & Latency Parser (pingParser)', () => {
    it('parses successful Windows ping statistics with 0% loss', () => {
      const sample = `
Pinging 192.168.1.1 with 32 bytes of data:
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64
Reply from 192.168.1.1: bytes=32 time=2ms TTL=64
Reply from 192.168.1.1: bytes=32 time=1ms TTL=64
Reply from 192.168.1.1: bytes=32 time=2ms TTL=64

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),
Approximate round trip times in milli-seconds:
    Minimum = 1ms, Maximum = 2ms, Average = 1ms
`;
      const result = parsePingOutput(sample);
      expect(result.packetsSent).toBe(4);
      expect(result.packetsReceived).toBe(4);
      expect(result.packetsLost).toBe(0);
      expect(result.lossPercentage).toBe(0);
      expect(result.avgRtt).toBe(1);
      expect(result.isTimeout).toBe(false);
      expect(result.isUnreachable).toBe(false);
    });

    it('parses partial ping reply lines without summary block', () => {
      const sample = `
Reply from 8.8.8.8: bytes=32 time=11ms TTL=113
Reply from 8.8.8.8: bytes=32 time=9ms TTL=113
Reply from 8.8.8.8: bytes=32 time=8ms TTL=113
`;
      const result = parsePingOutput(sample);
      expect(result.packetsSent).toBe(3);
      expect(result.packetsReceived).toBe(3);
      expect(result.packetsLost).toBe(0);
      expect(result.lossPercentage).toBe(0);
      expect(result.avgRtt).toBeCloseTo(9.3, 1);
      expect(result.ttl).toBe(113);
    });

    it('detects Request timed out with 100% loss', () => {
      const sample = `
Pinging 192.168.1.1 with 32 bytes of data:
Request timed out.
Request timed out.
Request timed out.
Request timed out.

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss),
`;
      const result = parsePingOutput(sample);
      expect(result.packetsLost).toBe(4);
      expect(result.lossPercentage).toBe(100);
      expect(result.isTimeout).toBe(true);
    });

    it('detects Destination host unreachable', () => {
      const sample = `
Pinging 192.168.1.50 with 32 bytes of data:
Reply from 192.168.1.105: Destination host unreachable.
Reply from 192.168.1.105: Destination host unreachable.

Ping statistics for 192.168.1.50:
    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss),
`;
      const result = parsePingOutput(sample);
      expect(result.isUnreachable).toBe(true);
    });

    it('parses Unix / macOS ping output format', () => {
      const sample = `
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=18.4 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=17.9 ms
64 bytes from 8.8.8.8: icmp_seq=3 ttl=117 time=19.1 ms
64 bytes from 8.8.8.8: icmp_seq=4 ttl=117 time=18.2 ms

--- 8.8.8.8 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 17.912/18.400/19.123/0.450 ms
`;
      const result = parsePingOutput(sample);
      expect(result.packetsSent).toBe(4);
      expect(result.packetsReceived).toBe(4);
      expect(result.lossPercentage).toBe(0);
      expect(result.avgRtt).toBeCloseTo(18.4, 1);
    });
  });

  describe('DNS Resolution Parser (dnsParser)', () => {
    it('parses successful nslookup response with resolved A records', () => {
      const sample = `
Server:  dns.google
Address:  8.8.8.8

Non-authoritative answer:
Name:    google.com
Addresses:  142.250.190.46
          2607:f8b0:4004:835::200e
`;
      const result = parseDnsOutput(sample);
      expect(result.server).toBe('dns.google');
      expect(result.serverAddress).toBe('8.8.8.8');
      expect(result.resolvedName).toBe('google.com');
      expect(result.ipAddresses).toContain('142.250.190.46');
      expect(result.isTimeout).toBe(false);
      expect(result.isNxDomain).toBe(false);
    });

    it('detects DNS request timed out', () => {
      const sample = `
Server:  UnKnown
Address:  192.168.1.1

DNS request timed out.
    timeout was 2 seconds.
DNS request timed out.
    timeout was 2 seconds.
*** Request to UnKnown timed-out
`;
      const result = parseDnsOutput(sample);
      expect(result.isTimeout).toBe(true);
      expect(result.ipAddresses.length).toBe(0);
    });

    it('detects Non-existent domain (NXDOMAIN)', () => {
      const sample = `
Server:  dns.google
Address:  8.8.8.8

*** dns.google can't find thisdomaindoesnotexist12345.com: Non-existent domain
`;
      const result = parseDnsOutput(sample);
      expect(result.isNxDomain).toBe(true);
    });
  });

  describe('Traceroute Parser (traceParser)', () => {
    it('parses clean multi-hop traceroute', () => {
      const sample = `
Tracing route to 8.8.8.8 over a maximum of 12 hops:
  1     1 ms     1 ms     1 ms  192.168.1.1
  2     8 ms     7 ms     8 ms  10.20.0.1
  3    14 ms    15 ms    14 ms  172.16.4.1
  4    18 ms    18 ms    19 ms  8.8.8.8
Trace complete.
`;
      const result = parseTraceOutput(sample);
      expect(result.totalHops).toBe(4);
      expect(result.destinationReached).toBe(true);
      expect(result.isHop1Timeout).toBe(false);
    });

    it('detects Hop 1 local gateway timeout', () => {
      const sample = `
Tracing route to 8.8.8.8 over a maximum of 12 hops:
  1     *        *        *     Request timed out.
  2     *        *        *     Request timed out.
`;
      const result = parseTraceOutput(sample);
      expect(result.isHop1Timeout).toBe(true);
      expect(result.destinationReached).toBe(false);
    });
  });

  describe('Wi-Fi Interface Parser (wifiParser)', () => {
    it('parses active Wi-Fi interface details', () => {
      const sample = `
There is 1 interface on the system:

    Name                   : Wi-Fi
    Description            : Intel(R) Wi-Fi 6 AX201 160MHz
    GUID                   : 8e5f2a1b-3c4d-5e6f-7a8b-9c0d1e2f3a4b
    Physical address       : 00:11:22:33:44:55
    State                  : connected
    SSID                   : HomeNetwork_5G
    BSSID                  : aa:bb:cc:dd:ee:ff
    Radio type             : 802.11ax
    Authentication         : WPA2-Personal
    Cipher                 : CCMP
    Connection mode        : Profile
    Channel                : 36
    Receive rate (Mbps)    : 866
    Transmit rate (Mbps)   : 866
    Signal                 : 88%
`;
      const result = parseWifiOutput(sample);
      expect(result.state).toBe('connected');
      expect(result.ssid).toBe('HomeNetwork_5G');
      expect(result.signalPercentage).toBe(88);
      expect(result.radioType).toBe('802.11ax');
      expect(result.isWeakSignal).toBe(false);
      expect(result.isDisconnected).toBe(false);
    });

    it('detects weak Wi-Fi signal (<45%)', () => {
      const sample = `
    State                  : connected
    SSID                   : DistantNetwork
    Signal                 : 32%
`;
      const result = parseWifiOutput(sample);
      expect(result.signalPercentage).toBe(32);
      expect(result.isWeakSignal).toBe(true);
    });
  });

  describe('HTTP / Curl Parser (httpParser)', () => {
    it('parses HTTP 200 response header', () => {
      const sample = `
HTTP/2 200 
content-type: text/html; charset=ISO-8859-1
server: gws
`;
      const result = parseHttpOutput(sample);
      expect(result.statusCode).toBe(200);
      expect(result.isSuccess).toBe(true);
    });

    it('detects connection refused error', () => {
      const sample = `curl: (7) Failed to connect to 192.168.1.200 port 80: Connection refused`;
      const result = parseHttpOutput(sample);
      expect(result.isConnectionRefused).toBe(true);
      expect(result.isSuccess).toBe(false);
    });
  });

  describe('Master Command Interpreter & Plain Language Generation', () => {
    it('evaluates valid ipconfig output to SUCCESS with plain language explanation', () => {
      const sample = `
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 192.168.1.45
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Default Gateway . . . . . . . . . : 192.168.1.1
`;
      const res = interpretCommandOutput('step_ip_dhcp', 'windows', sample);
      expect(res.outcomeType).toBe('SUCCESS');
      expect(res.isPassed).toBe(true);
      expect(res.summary).toContain('Valid IP Address');
      expect(res.plainLanguageExplanation).toContain('valid private IP address');
      expect(res.plainLanguageExplanation).not.toContain('AI');
      expect(res.plainLanguageExplanation).not.toContain('confidence');
    });

    it('evaluates APIPA ipconfig output to APIPA failure and maps root cause', () => {
      const sample = `
Wireless LAN adapter Wi-Fi:
   IPv4 Address. . . . . . . . . . . : 169.254.12.34
   Subnet Mask . . . . . . . . . . . : 255.255.0.0
`;
      const res = interpretCommandOutput('step_ip_dhcp', 'windows', sample);
      expect(res.outcomeType).toBe('APIPA');
      expect(res.isPassed).toBe(false);
      expect(res.rootCauseId).toBe('rc_apipa_dhcp_failure');
      expect(res.plainLanguageExplanation).toContain('169.254');
    });

    it('evaluates ping timeout to TIMEOUT and maps gateway root cause', () => {
      const sample = `
Pinging 192.168.1.1 with 32 bytes of data:
Request timed out.
Request timed out.

Ping statistics for 192.168.1.1:
    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)
`;
      const res = interpretCommandOutput('step_gateway_ping', 'windows', sample);
      expect(res.outcomeType).toBe('TIMEOUT');
      expect(res.isPassed).toBe(false);
      expect(res.rootCauseId).toBe('rc_gateway_unreachable');
    });

    it('evaluates disconnected adapter output (e.g. McAfee VPN) to DISCONNECTED failure and maps root cause', () => {
      const sample = 'Enabled        Disconnected   Dedicated    McAfee VPN';
      const res = interpretCommandOutput('step_network_adapter', 'windows', sample);
      expect(res.outcomeType).toBe('DISCONNECTED');
      expect(res.isPassed).toBe(false);
      expect(res.rootCauseId).toBe('rc_no_physical_link');
      expect(res.summary).toContain('Network adapter is disconnected');
      expect(res.plainLanguageExplanation).toContain('McAfee VPN');
      expect(res.plainLanguageExplanation).toContain('disconnected');
    });

    it('evaluates connected Wi-Fi adapter output to SUCCESS', () => {
      const sample = `
Admin State    State          Type             Interface Name
-------------------------------------------------------------------------
Enabled        Connected      Dedicated        Wi-Fi
`;
      const res = interpretCommandOutput('step_network_adapter', 'windows', sample);
      expect(res.outcomeType).toBe('SUCCESS');
      expect(res.isPassed).toBe(true);
      expect(res.summary).toContain('Network adapter is active and connected');
      expect(res.plainLanguageExplanation).toContain('Wi-Fi');
    });

    it('evaluates unrecognized non-command text to UNRECOGNIZED_OUTPUT without false positive pass', () => {
      const gibberish = 'hello i am Atharva TRAut';
      
      // Test Step 1: Adapter check
      const adapterRes = interpretCommandOutput('step_network_adapter', 'windows', gibberish);
      expect(adapterRes.outcomeType).toBe('UNRECOGNIZED_OUTPUT');
      expect(adapterRes.isPassed).toBe(false);
      expect(adapterRes.summary).toContain('Unrecognized command output');
      expect(adapterRes.plainLanguageExplanation).toContain('does not match the expected command output');

      // Test Step 2: IP Config check
      const ipRes = interpretCommandOutput('step_ip_dhcp', 'windows', gibberish);
      expect(ipRes.outcomeType).toBe('UNRECOGNIZED_OUTPUT');
      expect(ipRes.isPassed).toBe(false);
      expect(ipRes.summary).toContain('Unrecognized command output');

      // Test Step 3: Gateway Ping check
      const pingRes = interpretCommandOutput('step_gateway_ping', 'windows', gibberish);
      expect(pingRes.outcomeType).toBe('UNRECOGNIZED_OUTPUT');
      expect(pingRes.isPassed).toBe(false);
      expect(pingRes.summary).toContain('Unrecognized command output');

      // Test Step 4: DNS check
      const dnsRes = interpretCommandOutput('step_dns_lookup', 'windows', gibberish);
      expect(dnsRes.outcomeType).toBe('UNRECOGNIZED_OUTPUT');
      expect(dnsRes.isPassed).toBe(false);
      expect(dnsRes.summary).toContain('Unrecognized command output');
    });

    it('handles Quick Option selections cleanly', () => {
      const successRes = interpretQuickOption('step_dns_lookup', 'SUCCESS');
      expect(successRes.outcomeType).toBe('SUCCESS');
      expect(successRes.isPassed).toBe(true);

      const failRes = interpretQuickOption('step_dns_lookup', 'FAILURE');
      expect(failRes.outcomeType).toBe('FAILURE');
      expect(failRes.isPassed).toBe(false);
      expect(failRes.rootCauseId).toBe('rc_dns_server_failure');
    });
  });
});
