/**
 * NetDoctor — Curated Diagnostic Steps Knowledge Base
 * 13 modular diagnostic procedures covering all layers of network troubleshooting
 */

import type { CuratedDiagnosticStep } from './types';

export const DIAGNOSTIC_STEPS_LIBRARY: Record<string, CuratedDiagnosticStep> = {
  step_network_adapter: {
    id: 'step_network_adapter',
    stepNumber: 1,
    title: 'Check Network Adapter & Physical Connection',
    layer: 'Physical / Data Link',
    whyNeeded: 'Verifies that your Wi-Fi or Ethernet network card is enabled in software and physically linked to the local router or access point.',
    detailedWhy: 'Before diagnosing IP addresses, DNS servers, or internet routing, we must verify that your network adapter hardware is turned on, has operational drivers, and maintains an active link with your router. If the interface is disabled or disconnected, no data packets can leave your device.',
    instructions: {
      windows: [
        'Press Windows Key + R, type "cmd", and press Enter to open Command Prompt.',
        'Type or paste the command shown below and press Enter.',
        'Check if your Wi-Fi or Ethernet adapter has an Admin State of "Enabled" and State of "Connected".',
        'Copy the output lines and paste them into the submission box below.'
      ],
      macos: [
        'Press Command + Spacebar, type "Terminal", and press Return.',
        'Type or paste the command shown below and press Return.',
        'Locate your active network hardware port (e.g. Wi-Fi or Ethernet).',
        'Copy the output and paste it below.'
      ],
      linux: [
        'Open your terminal emulator (Ctrl + Alt + T).',
        'Type or paste the command below and press Enter.',
        'Verify that your network interface state is "UP" (e.g., wlan0 or eth0).',
        'Copy the output text and paste it into the submission box below.'
      ]
    },
    command: {
      windows: 'netsh interface show interface',
      macos: 'networksetup -listallhardwareports',
      linux: 'ip link show'
    },
    expectedResult: {
      summary: 'Your primary Wi-Fi or Ethernet adapter should show State "Connected" and Admin State "Enabled".',
      sampleOutput: 'Admin State    State          Type             Interface Name\n-------------------------------------------------------------------------\nEnabled        Connected      Dedicated        Wi-Fi'
    },
    visualGuidance: {
      type: 'device_connection',
      title: 'Local Network Interface & Adapter Link',
      description: 'Checks if your device network card has an active physical or wireless link with your local network.',
      altText: 'Diagram illustrating computer interface hardware connection to network access point',
      relatedStepId: 'step_network_adapter'
    },
    rootCauseIdOnFailure: 'rc_no_physical_link'
  },

  step_ip_dhcp: {
    id: 'step_ip_dhcp',
    stepNumber: 2,
    title: 'Check IP Address & DHCP Configuration',
    layer: 'Network (IP / DHCP)',
    whyNeeded: 'Checks whether your local router has assigned your device a valid private IP address or if your device has failed to receive a DHCP lease (APIPA address 169.254.x.x).',
    detailedWhy: 'Every device on a TCP/IP network must possess a unique IP address on the local subnet (e.g. 192.168.1.50) alongside a Subnet Mask and Default Gateway. If your computer displays an IP starting with 169.254, your device failed to reach the router DHCP service and assigned itself a self-assigned link-local address, preventing all external communication.',
    instructions: {
      windows: [
        'In your Command Prompt window, type or paste the command below and press Enter.',
        'Look for the section for your active adapter ("Wireless LAN adapter Wi-Fi" or "Ethernet adapter").',
        'Note the IPv4 Address, Subnet Mask, and Default Gateway lines.',
        'Copy and paste the command output into the submission box below.'
      ],
      macos: [
        'In Terminal, type or paste the command below and press Return.',
        'Review the assigned inet (IPv4) address and default route configuration.',
        'Copy the text output and paste it into the submission area.'
      ],
      linux: [
        'In Terminal, enter the command below and press Enter.',
        'Look for the inet address under your active interface (e.g., wlan0 or eth0).',
        'Copy the interface configuration output and paste it below.'
      ]
    },
    command: {
      windows: 'ipconfig /all',
      macos: 'ifconfig',
      linux: 'ip addr show'
    },
    expectedResult: {
      summary: 'You should see a valid private IPv4 address (e.g., 192.168.1.x or 10.0.0.x) and a Default Gateway IP.',
      sampleOutput: 'Wireless LAN adapter Wi-Fi:\n   IPv4 Address. . . . . . . . . . . : 192.168.1.45\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1\n   DHCP Server . . . . . . . . . . . : 192.168.1.1'
    },
    rootCauseIdOnFailure: 'rc_apipa_dhcp_failure'
  },

  step_gateway_ping: {
    id: 'step_gateway_ping',
    stepNumber: 3,
    title: 'Test Default Gateway (Router) Reachability',
    layer: 'Network (IP / DHCP)',
    whyNeeded: 'Sends ICMP ping test signals to your local router (Default Gateway) to verify local network packet transmission and detect local link failure.',
    detailedWhy: 'The Default Gateway is your device entry point to the rest of the network and the global internet. If pinging your router IP fails (e.g. 192.168.1.1 timed out or unreachable), the issue is located entirely inside your local network (cable, Wi-Fi radio, router crash) and not with your external Internet Service Provider.',
    instructions: {
      windows: [
        'If you do not know your router IP, run "ipconfig | findstr /i Gateway" in Command Prompt (or use the Gateway Finder above).',
        'In Command Prompt, run the ping command targeting your default gateway (typically 192.168.1.1 or 192.168.0.1).',
        'Wait approximately 4 seconds for the 4 reply packets to finish.',
        'Copy the ping output including the statistics summary and paste it below.'
      ],
      macos: [
        'If you do not know your router IP, run "route -n get default | grep gateway" in Terminal (or use the Gateway Finder above).',
        'In Terminal, run the ping command with 4 count packets as shown below.',
        'Wait for the summary statistics indicating 0% packet loss.',
        'Copy and paste the terminal output into the submission box.'
      ],
      linux: [
        'If you do not know your router IP, run "ip route show default" in Terminal (or use the Gateway Finder above).',
        'In Terminal, enter the ping command below and press Enter.',
        'Wait for all 4 ICMP echo replies to return.',
        'Copy the output statistics and paste them below.'
      ]
    },
    command: {
      windows: 'ping -n 4 192.168.1.1',
      macos: 'ping -c 4 192.168.1.1',
      linux: 'ping -c 4 192.168.1.1'
    },
    expectedResult: {
      summary: 'You should receive 4 replies with low latency (under 5ms) and 0% packet loss.',
      sampleOutput: 'Pinging 192.168.1.1 with 32 bytes of data:\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\nReply from 192.168.1.1: bytes=32 time=2ms TTL=64\n\nPing statistics for 192.168.1.1:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)'
    },
    visualGuidance: {
      type: 'gateway_path',
      title: 'Default Gateway (Router) Reachability Path',
      description: 'Sends test packets to your router. Success verifies that your local home connection is working.',
      altText: 'Diagram showing link from Computer to Local Default Gateway Router',
      relatedStepId: 'step_gateway_ping'
    },
    prerequisites: {
      requiredEvidenceKeys: ['adapter_link']
    },
    rootCauseIdOnFailure: 'rc_gateway_unreachable'
  },

  step_dns_lookup: {
    id: 'step_dns_lookup',
    stepNumber: 4,
    title: 'Test Domain Name System (DNS) Resolution',
    layer: 'DNS / Name Translation',
    whyNeeded: 'Tests whether your configured DNS server can successfully convert human-readable website names (e.g. google.com) into numerical IP addresses.',
    detailedWhy: 'Internet routing operates solely on numerical IP addresses. When you enter a URL, the Domain Name System resolves that name into an IP address. If DNS resolution times out or returns NXDOMAIN, your web browser cannot load pages even when the underlying Internet connection is fully operational.',
    instructions: {
      windows: [
        'In Command Prompt, type or paste the nslookup command below and press Enter.',
        'Observe whether a valid IP address is returned under "Non-authoritative answer" or "Addresses".',
        'Copy the entire command output and paste it below.'
      ],
      macos: [
        'In Terminal, run the nslookup or dig command shown below and press Return.',
        'Verify that an IP address is returned for the queried domain name.',
        'Copy the terminal output and paste it into the submission area.'
      ],
      linux: [
        'In Terminal, run the nslookup command below and press Enter.',
        'Check that the DNS server responded with an IP address.',
        'Copy the terminal output and submit below.'
      ]
    },
    command: {
      windows: 'nslookup google.com',
      macos: 'nslookup google.com',
      linux: 'nslookup google.com'
    },
    expectedResult: {
      summary: 'Your DNS server should resolve the hostname and return one or more IPv4/IPv6 addresses.',
      sampleOutput: 'Server:  dns.google\nAddress:  8.8.8.8\n\nNon-authoritative answer:\nName:    google.com\nAddresses:  142.250.190.46'
    },
    visualGuidance: {
      type: 'dns_flow',
      title: 'Domain Name System (DNS) Translation Flow',
      description: 'DNS translates human-readable domain names into numerical IP addresses needed for routing.',
      altText: 'Diagram of domain name being translated by DNS server to IP address',
      relatedStepId: 'step_dns_lookup'
    },
    prerequisites: {
      requiredEvidenceKeys: ['gateway_reachability']
    },
    rootCauseIdOnFailure: 'rc_dns_server_failure'
  },

  step_internet_ping: {
    id: 'step_internet_ping',
    stepNumber: 5,
    title: 'Verify Direct Internet WAN IP Reachability',
    layer: 'Transport / Latency',
    whyNeeded: 'Tests end-to-end data delivery across the global Internet by contacting a reliable public server directly by numerical IP (8.8.8.8), completely bypassing DNS.',
    detailedWhy: 'By pinging a globally reachable numerical IP address like Google Public DNS (8.8.8.8) or Cloudflare (1.1.1.1), we isolate DNS translation from pure IP routing. If this test succeeds but websites still fail to open, we have 100% confirmation that the root cause is a DNS issue.',
    instructions: {
      windows: [
        'In Command Prompt, execute the ping command to 8.8.8.8 shown below.',
        'Observe whether replies are received and check the packet loss percentage.',
        'Copy the ping output and paste it into the submission box.'
      ],
      macos: [
        'In Terminal, run the ping command to 8.8.8.8 with 4 packets.',
        'Check that replies return with consistent round-trip time.',
        'Copy and paste the terminal output below.'
      ],
      linux: [
        'In Terminal, run the ping command to 8.8.8.8 as shown below.',
        'Verify that 0% packet loss is reported in the summary.',
        'Copy the output lines and submit below.'
      ]
    },
    command: {
      windows: 'ping -n 4 8.8.8.8',
      macos: 'ping -c 4 8.8.8.8',
      linux: 'ping -c 4 8.8.8.8'
    },
    expectedResult: {
      summary: 'You should receive 4 replies with low latency (under 50ms) and 0% packet loss.',
      sampleOutput: 'Pinging 8.8.8.8 with 32 bytes of data:\nReply from 8.8.8.8: bytes=32 time=18ms TTL=117\nReply from 8.8.8.8: bytes=32 time=19ms TTL=117\n\nPing statistics for 8.8.8.8:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)'
    },
    visualGuidance: {
      type: 'gateway_path',
      title: 'Direct WAN Numerical IP Reachability (8.8.8.8)',
      description: 'Tests end-to-end routing directly to the global Internet, completely bypassing DNS translation.',
      altText: 'Diagram showing packet route through local router to public Internet IP address',
      relatedStepId: 'step_internet_ping'
    },
    prerequisites: {
      requiredEvidenceKeys: ['adapter_link', 'gateway_reachability']
    },
    rootCauseIdOnFailure: 'rc_isp_wan_outage'
  },

  step_wifi_signal: {
    id: 'step_wifi_signal',
    stepNumber: 6,
    title: 'Check Wi-Fi Signal Strength & Radio Interface',
    layer: 'Physical / Data Link',
    whyNeeded: 'Examines the wireless connection signal strength percentage, radio band (2.4GHz/5GHz/6GHz), transmission rate, and link state.',
    detailedWhy: 'Wireless networks are susceptible to radio frequency interference, wall attenuation, and antenna distance. If signal quality drops below 40% or experiences high frame retries, Wi-Fi connections intermittently drop or suffer severe packet loss.',
    instructions: {
      windows: [
        'In Command Prompt, execute the netsh wlan command below and press Enter.',
        'Check the Signal percentage, Radio type, Channel, and State fields.',
        'Copy the interface details and paste them into the box below.'
      ],
      macos: [
        'In Terminal, run the airport / wdutil command shown below and press Return.',
        'Review the current Wi-Fi SSID, RSSI signal value, and transmission rate.',
        'Copy the output and paste it below.'
      ],
      linux: [
        'In Terminal, run the nmcli device wifi command below and press Enter.',
        'Identify your active Wi-Fi connection and signal strength percentage.',
        'Copy the terminal output and paste it into the submission area.'
      ]
    },
    command: {
      windows: 'netsh wlan show interfaces',
      macos: '/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I',
      linux: 'nmcli dev wifi'
    },
    expectedResult: {
      summary: 'Your Wi-Fi interface should be in state "connected" with a signal strength above 75%.',
      sampleOutput: '    State                  : connected\n    SSID                   : HomeNetwork_5G\n    Radio type             : 802.11ax\n    Authentication         : WPA2-Personal\n    Signal                 : 88%\n    Receive rate (Mbps)    : 866'
    },
    visualGuidance: {
      type: 'device_connection',
      title: 'Wi-Fi Signal & RF Transmission Link',
      description: 'Examines wireless signal percentage and radio band stability between your device and router.',
      altText: 'Diagram showing wireless RF signal link quality between device and access point',
      relatedStepId: 'step_wifi_signal'
    },
    isIntermittentRelevant: true,
    rootCauseIdOnFailure: 'rc_wifi_weak_signal'
  },

  step_ping_latency_jitter: {
    id: 'step_ping_latency_jitter',
    stepNumber: 7,
    title: 'Extended Ping Test for Latency Spikes & Packet Loss',
    layer: 'Transport / Latency',
    whyNeeded: 'Sends 10 consecutive test packets to detect intermittent packet drops, bufferbloat latency spikes, and network jitter.',
    detailedWhy: 'Short 4-packet tests can miss intermittent connection drops. An extended 10-packet test measures round-trip time variance (jitter) and detects micro-disconnects that degrade online gaming, video conferencing, and live streaming.',
    instructions: {
      windows: [
        'In Command Prompt, execute the 10-packet ping command below and press Enter.',
        'Wait approximately 10 seconds for all 10 test packets to complete.',
        'Copy the Minimum, Maximum, and Average round-trip times and paste below.'
      ],
      macos: [
        'In Terminal, run the 10-packet ping command shown below and press Return.',
        'Review the packet loss percentage and round-trip time standard deviation.',
        'Copy the terminal output and paste it below.'
      ],
      linux: [
        'In Terminal, execute the ping command with count 10 below.',
        'Check for consistent round trip times with minimal jitter.',
        'Copy the statistics summary and paste it below.'
      ]
    },
    command: {
      windows: 'ping -n 10 8.8.8.8',
      macos: 'ping -c 10 8.8.8.8',
      linux: 'ping -c 10 8.8.8.8'
    },
    expectedResult: {
      summary: 'All 10 packets should return with 0% loss and steady latency (under 40ms with jitter < 15ms).',
      sampleOutput: 'Ping statistics for 8.8.8.8:\n    Packets: Sent = 10, Received = 10, Lost = 0 (0% loss),\nApproximate round trip times in milli-seconds:\n    Minimum = 16ms, Maximum = 22ms, Average = 18ms'
    },
    visualGuidance: {
      type: 'packet_loss_comparison',
      title: 'Local Gateway vs External WAN Packet Comparison',
      description: 'Comparing packet loss to your local router versus an external IP isolates local interference from ISP issues.',
      altText: 'Diagram comparing local gateway packet loss against external destination packet loss',
      relatedStepId: 'step_ping_latency_jitter'
    },
    isIntermittentRelevant: true,
    rootCauseIdOnFailure: 'rc_bufferbloat_congestion'
  },

  step_trace_route: {
    id: 'step_trace_route',
    stepNumber: 8,
    title: 'Trace Network Path & Hop Latency',
    layer: 'Network (IP / DHCP)',
    whyNeeded: 'Traces every intermediate router hop between your computer and an external destination to identify the exact location of routing delays or packet drops.',
    detailedWhy: 'Network traffic travels across multiple intermediate routers (hops). A traceroute identifies whether a connection bottleneck occurs at Hop 1 (your home router), Hop 2–3 (your local ISP node), or downstream backbone tier-1 carriers.',
    instructions: {
      windows: [
        'In Command Prompt, execute the tracert command shown below and press Enter.',
        'Wait up to 30 seconds for the hops to resolve (or stop after hop 10).',
        'Copy the hop list and latency times and paste them into the submission box.'
      ],
      macos: [
        'In Terminal, enter the traceroute command below and press Return.',
        'Observe the latency recorded across each successive hop.',
        'Copy the output lines and paste them below.'
      ],
      linux: [
        'In Terminal, run the traceroute or tracepath command shown below.',
        'Identify which hop exhibits elevated latency or packet timeouts.',
        'Copy the trace output and submit below.'
      ]
    },
    command: {
      windows: 'tracert -d -h 12 8.8.8.8',
      macos: 'traceroute -n -m 12 8.8.8.8',
      linux: 'traceroute -n -m 12 8.8.8.8'
    },
    expectedResult: {
      summary: 'The trace should reach the destination in under 12 hops with low, steady latency progression.',
      sampleOutput: 'Tracing route to 8.8.8.8 over a maximum of 12 hops:\n  1     1 ms     1 ms     1 ms  192.168.1.1\n  2     8 ms     7 ms     8 ms  10.20.0.1\n  3    14 ms    15 ms    14 ms  172.16.4.1\n  4    18 ms    18 ms    19 ms  8.8.8.8\nTrace complete.'
    },
    rootCauseIdOnFailure: 'rc_packet_loss_hop'
  },

  step_dns_flush: {
    id: 'step_dns_flush',
    stepNumber: 9,
    title: 'Flush and Reset DNS Resolver Cache',
    layer: 'DNS / Name Translation',
    whyNeeded: 'Clears outdated, stale, or corrupted IP mappings stored in your operating system local DNS resolver cache.',
    detailedWhy: 'Operating systems cache DNS lookups to speed up web browsing. If an IP address changes or a temporary lookup error is cached, your device will repeatedly fail to open the website until the local DNS cache is flushed.',
    instructions: {
      windows: [
        'In Command Prompt, type or paste the flushdns command below and press Enter.',
        'Verify that the confirmation message "Successfully flushed the DNS Resolver Cache" appears.',
        'Copy the response and paste it into the submission area below.'
      ],
      macos: [
        'In Terminal, enter the dscacheutil command shown below and press Return.',
        'Enter your administrator password if prompted to clear the system cache.',
        'Submit the output or confirmation below.'
      ],
      linux: [
        'In Terminal, run the systemd-resolve flush command below and press Enter.',
        'Verify that your local resolver cache has been reset.',
        'Submit the output text below.'
      ]
    },
    command: {
      windows: 'ipconfig /flushdns',
      macos: 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder',
      linux: 'sudo resolvectl flush-caches'
    },
    expectedResult: {
      summary: 'You should receive confirmation that the DNS resolver cache was successfully flushed.',
      sampleOutput: 'Windows IP Configuration\n\nSuccessfully flushed the DNS Resolver Cache.'
    },
    isDisruptive: false,
    safety: {
      isDisruptive: false,
      requiresConfirmation: false,
      confirmationReason: 'Resets the operating system local DNS resolver cache to remove obsolete entries.',
      potentialConsequences: 'Subsequent lookups may take a few extra milliseconds as cache repopulates.',
      requiresAdminPrivileges: true,
      recoveryGuidance: 'No recovery needed. New DNS lookups will repopulate the cache automatically.'
    },
    rootCauseIdOnFailure: 'rc_dns_cache_corruption'
  },

  step_ip_release_renew: {
    id: 'step_ip_release_renew',
    stepNumber: 10,
    title: 'Release and Renew DHCP IP Lease',
    layer: 'Network (IP / DHCP)',
    whyNeeded: 'Forces your computer to release its current IP configuration and request a brand new IP lease and gateway settings from your router DHCP server.',
    detailedWhy: 'When IP configurations become desynchronized or conflict with another device on the local network, releasing and renewing the DHCP lease forces a clean handshake with the router to assign a valid, non-conflicting IP address.',
    instructions: {
      windows: [
        'In Command Prompt (Run as Administrator), run the release and renew commands below.',
        'Wait approximately 5 seconds while Windows requests a new lease from the router.',
        'Copy the newly assigned IP configuration and paste it below.'
      ],
      macos: [
        'In Terminal, renew the DHCP lease using the command below or via Network Preferences.',
        'Check that a valid IP address is reassigned.',
        'Paste the result in the box below.'
      ],
      linux: [
        'In Terminal, run the dhclient release and renew commands below with sudo.',
        'Confirm that a fresh IP lease is obtained.',
        'Copy and paste the output below.'
      ]
    },
    command: {
      windows: 'ipconfig /release && ipconfig /renew',
      macos: 'sudo ipconfig set en0 DHCP',
      linux: 'sudo dhclient -r && sudo dhclient'
    },
    expectedResult: {
      summary: 'Your adapter should successfully receive a new IPv4 Address and Default Gateway from DHCP.',
      sampleOutput: 'Windows IP Configuration\n\nEthernet adapter Ethernet:\n   IPv4 Address. . . . . . . . . . . : 192.168.1.112\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1'
    },
    isDisruptive: true,
    disruptiveWarning: 'Releasing your IP address will briefly disconnect your computer from the network for 3-5 seconds while a new lease is requested.',
    safety: {
      isDisruptive: true,
      requiresConfirmation: true,
      confirmationReason: 'Clears the current local IP assignment and requests a fresh lease from your router DHCP server.',
      potentialConsequences: 'All active network connections and downloads will disconnect for 3-5 seconds.',
      prerequisites: ['Active physical or wireless link to router'],
      requiresAdminPrivileges: true,
      recoveryGuidance: 'If an IP address is not re-acquired within 30 seconds, run "ipconfig /renew" or restart your computer.'
    },
    rootCauseIdOnFailure: 'rc_apipa_dhcp_failure'
  },

  step_http_reachability: {
    id: 'step_http_reachability',
    stepNumber: 11,
    title: 'Test Web Server Port & HTTP Response',
    layer: 'Application / Web',
    whyNeeded: 'Tests whether a remote web server is actively accepting HTTP/HTTPS connections on port 80 or 443 and returning a valid HTTP status code.',
    detailedWhy: 'If DNS resolves correctly and ping packets reach the destination server, but web pages still fail to load, the web server software may be offline, returning HTTP 500/502/503 errors, or blocking your IP via a firewall.',
    instructions: {
      windows: [
        'In Command Prompt or PowerShell, run the curl command below and press Enter.',
        'Check the returned HTTP status code (e.g. HTTP/1.1 200 OK or HTTP/2 200).',
        'Copy the header lines and paste them into the box below.'
      ],
      macos: [
        'In Terminal, run the curl command below with the -I header inspection flag.',
        'Observe the returned HTTP response status header.',
        'Copy the output lines and paste them below.'
      ],
      linux: [
        'In Terminal, enter the curl header inspection command below.',
        'Confirm that a valid HTTP 200 or 301/302 status is returned.',
        'Copy the headers and submit below.'
      ]
    },
    command: {
      windows: 'curl -I https://www.google.com',
      macos: 'curl -I https://www.google.com',
      linux: 'curl -I https://www.google.com'
    },
    expectedResult: {
      summary: 'The remote web server should respond with HTTP/2 200 OK or HTTP/1.1 200 OK.',
      sampleOutput: 'HTTP/2 200\ncontent-type: text/html; charset=ISO-8859-1\nserver: gws\ndate: Sun, 10 Oct 2026 12:00:00 GMT'
    },
    rootCauseIdOnFailure: 'rc_target_server_outage'
  },

  step_lan_peer_ping: {
    id: 'step_lan_peer_ping',
    stepNumber: 12,
    title: 'Check Local Subnet ARP Table & Peer Devices',
    layer: 'Local LAN',
    whyNeeded: 'Inspects your local Address Resolution Protocol (ARP) table to verify that your computer can discover and address other devices on the local subnet.',
    detailedWhy: 'When communicating on a local area network (LAN) with printers, shared folders, or peer computers, your device uses ARP to map local IP addresses to physical MAC hardware addresses. If the ARP table is empty or missing peer entries, local subnet routing or client isolation is active.',
    instructions: {
      windows: [
        'In Command Prompt, type or paste the arp command below and press Enter.',
        'Review the list of local Internet Addresses and Physical Addresses.',
        'Copy the ARP table output and paste it below.'
      ],
      macos: [
        'In Terminal, enter the arp command shown below and press Return.',
        'Check that local network devices are visible in the cache.',
        'Copy the output lines and paste them below.'
      ],
      linux: [
        'In Terminal, run the ip neigh command below and press Enter.',
        'Confirm that local peer devices report state "REACHABLE" or "STALE".',
        'Copy the neighbor list and submit below.'
      ]
    },
    command: {
      windows: 'arp -a',
      macos: 'arp -a',
      linux: 'ip neigh show'
    },
    expectedResult: {
      summary: 'You should see active IP and MAC address mappings for your local router and other subnet devices.',
      sampleOutput: 'Interface: 192.168.1.45 --- 0x12\n  Internet Address      Physical Address      Type\n  192.168.1.1           00-11-22-33-44-55     dynamic\n  192.168.1.100         aa-bb-cc-dd-ee-ff     dynamic'
    },
    rootCauseIdOnFailure: 'rc_lan_subnet_mismatch'
  },

  step_adapter_restart: {
    id: 'step_adapter_restart',
    stepNumber: 13,
    title: 'Restart Network Adapter Interface',
    layer: 'Physical / Data Link',
    whyNeeded: 'Performs a software reset of the local network interface card to reload the driver stack and clear transient socket locks.',
    detailedWhy: 'Operating system network stacks can occasionally enter an inconsistent state after sleep/wake cycles or driver crashes. Disabling and re-enabling the adapter reinitializes the hardware interface and flushes socket states cleanly.',
    instructions: {
      windows: [
        'In Command Prompt (Run as Administrator), run the interface restart command below.',
        'Wait 5 seconds for the adapter to re-link to the network.',
        'Submit the outcome confirmation below.'
      ],
      macos: [
        'In Terminal, toggle your network port off and on as shown below.',
        'Wait for the Wi-Fi or Ethernet connection to re-associate.',
        'Paste the result in the submission box below.'
      ],
      linux: [
        'In Terminal, toggle the network interface down and back up with sudo.',
        'Check that the interface reconnects cleanly.',
        'Submit the output below.'
      ]
    },
    command: {
      windows: 'netsh interface set interface "Wi-Fi" disable && netsh interface set interface "Wi-Fi" enable',
      macos: 'networksetup -setairportpower en0 off && networksetup -setairportpower en0 on',
      linux: 'sudo ip link set wlan0 down && sudo ip link set wlan0 up'
    },
    expectedResult: {
      summary: 'The adapter should successfully disable, re-enable, and re-associate with your network.',
      sampleOutput: 'Interface "Wi-Fi" successfully restarted.'
    },
    isDisruptive: true,
    disruptiveWarning: 'Restarting your network adapter will temporarily disconnect all network traffic for approximately 5-10 seconds.',
    safety: {
      isDisruptive: true,
      requiresConfirmation: true,
      confirmationReason: 'Performs a software reset of the local network interface card to reload the driver stack.',
      potentialConsequences: 'All network connections, video calls, and downloads will be disconnected for 5-10 seconds.',
      prerequisites: ['Administrator privileges'],
      requiresAdminPrivileges: true,
      recoveryGuidance: 'If the adapter does not automatically reconnect within 30 seconds, re-enable it in Network Connections or restart your PC.'
    },
    rootCauseIdOnFailure: 'rc_adapter_driver_glitch'
  }
};
