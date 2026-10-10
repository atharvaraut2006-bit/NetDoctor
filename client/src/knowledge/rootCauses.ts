/**
 * NetDoctor — Root Causes & Solutions Knowledge Base
 * 12 curated network failure modes, step-by-step fix procedures, and prevention tips
 */

import type { RootCauseRecord } from './types';

export const ROOT_CAUSES_LIBRARY: Record<string, RootCauseRecord> = {
  rc_no_physical_link: {
    id: 'rc_no_physical_link',
    problemTitle: 'Network Adapter Disabled or Disconnected',
    rootCause: 'The computer network interface card is either disabled in software or lacks a physical/wireless connection to the router.',
    technicalExplanation: 'The physical or data link layer (Layer 1/2) is inactive. The operating system reports that the network adapter is turned off, in airplane mode, or disconnected from the Ethernet cable or Wi-Fi access point.',
    solutionSteps: [
      'Ensure Airplane Mode is turned off and your Wi-Fi or Ethernet switch is turned on.',
      'Check that your Ethernet cable is securely clicked into both your computer and router ports.',
      'Open Network Connections (Windows: ncpa.cpl) and ensure your Wi-Fi/Ethernet adapter is right-clicked and set to "Enable".',
      'If using Wi-Fi, select your network name (SSID) and reconnect with your security password.'
    ],
    verificationStepId: 'step_network_adapter',
    preventionRecommendations: [
      'Keep your network adapter drivers updated from your computer manufacturer support page.',
      'Avoid pulling or bending Ethernet cables around sharp desk corners.'
    ]
  },

  rc_apipa_dhcp_failure: {
    id: 'rc_apipa_dhcp_failure',
    problemTitle: 'DHCP Lease Failure (APIPA 169.254.x.x)',
    rootCause: 'The computer failed to obtain an IP address from the router DHCP server and assigned itself a self-assigned Automatic Private IP Address (169.254.x.x).',
    technicalExplanation: 'When a device connects to a network, it broadcasts DHCP Discover packets to request an IP address. If the router DHCP service does not reply, the OS falls back to APIPA (169.254.0.0/16), which only permits local ad-hoc communication and has no default gateway to reach the Internet.',
    solutionSteps: [
      'Restart your local router by unplugging its power cord for 30 seconds, then plugging it back in.',
      'Release and renew your IP configuration by running: ipconfig /release followed by ipconfig /renew.',
      'Ensure that your network adapter IPv4 properties are configured to "Obtain an IP address automatically (DHCP)".',
      'Check if other devices on the same network are receiving valid IP addresses (e.g. 192.168.1.x).'
    ],
    verificationStepId: 'step_ip_dhcp',
    preventionRecommendations: [
      'Ensure your router DHCP pool has sufficient available IP addresses for all connected devices.',
      'Avoid setting static IP configurations unless specifically required for network equipment.'
    ]
  },

  rc_gateway_unreachable: {
    id: 'rc_gateway_unreachable',
    problemTitle: 'Local Router / Default Gateway Unreachable',
    rootCause: 'The computer has a configured Gateway IP address but cannot exchange ICMP packets with the local router.',
    technicalExplanation: 'The default gateway is the local router IP that handles all traffic leaving your local subnet. Inability to ping the gateway indicates a local router freeze, severe Wi-Fi packet drop, or an incorrect static gateway IP setting.',
    solutionSteps: [
      'Power cycle your home router: unplug power for 30 seconds and allow 2 minutes for it to fully boot.',
      'If connected via Wi-Fi, move closer to the router or test with an Ethernet cable to eliminate radio interference.',
      'Verify that your Default Gateway IP matches your router local IP address (typically 192.168.1.1 or 192.168.0.1).',
      'Disable any third-party antivirus or firewall software temporarily to ensure local ICMP packets are not being blocked.'
    ],
    verificationStepId: 'step_gateway_ping',
    preventionRecommendations: [
      'Place your router in a central, elevated location away from metal objects and microwaves.',
      'Regularly reboot your home router once every month to prevent memory fragmentation.'
    ]
  },

  rc_dns_server_failure: {
    id: 'rc_dns_server_failure',
    problemTitle: 'DNS Server Unresponsive or Misconfigured',
    rootCause: 'The configured DNS servers are not answering name resolution queries, preventing domain names like google.com from translating to IP addresses.',
    technicalExplanation: 'Direct IP routing to public addresses (such as 8.8.8.8) is functional, but UDP port 53 DNS queries to your configured DNS server are timing out or failing. This makes all domain-name-based web browsing appear broken.',
    solutionSteps: [
      'Change your DNS server addresses to reliable public DNS resolvers:',
      '  • Primary DNS: 8.8.8.8 (Google Public DNS) or 1.1.1.1 (Cloudflare)',
      '  • Secondary DNS: 8.8.4.4 or 1.0.0.1',
      'Flush your local DNS cache by running: ipconfig /flushdns in Command Prompt.',
      'Restart your web browser and attempt to load https://www.google.com.'
    ],
    verificationStepId: 'step_dns_lookup',
    preventionRecommendations: [
      'Configure reliable public DNS servers (1.1.1.1 or 8.8.8.8) directly on your router settings for all home devices.',
      'Disable third-party DNS altering software or unneeded browser VPN extensions.'
    ]
  },

  rc_dns_cache_corruption: {
    id: 'rc_dns_cache_corruption',
    problemTitle: 'Corrupted Local DNS Resolver Cache',
    rootCause: 'The local operating system DNS cache contains outdated or negative lookup records for specific domains.',
    technicalExplanation: 'Operating systems maintain an in-memory cache of previous DNS resolutions. If a domain IP recently changed or a temporary lookup error was recorded, the OS will continue returning the failed record until the cache TTL expires or is explicitly flushed.',
    solutionSteps: [
      'Flush the DNS cache on Windows by running: ipconfig /flushdns in Command Prompt.',
      'On macOS, run: sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder in Terminal.',
      'On Linux, run: sudo resolvectl flush-caches in Terminal.',
      'Clear your browser cache and DNS cache (e.g. chrome://net-internals/#dns in Chrome).'
    ],
    verificationStepId: 'step_dns_lookup',
    preventionRecommendations: [
      'Flush DNS cache after changing router or network connections.',
      'Clear browser browsing data periodically if domain redirection issues occur.'
    ]
  },

  rc_isp_wan_outage: {
    id: 'rc_isp_wan_outage',
    problemTitle: 'Internet Service Provider (WAN) Link Disconnected',
    rootCause: 'The local router is working and reachable, but the external Internet Service Provider (ISP) WAN connection is down.',
    technicalExplanation: 'Local network communication between your computer and router succeeds with 0% packet loss, but packets sent to global Internet IP addresses (8.8.8.8) time out. This indicates that the WAN fiber/DSL/cable link between your modem/ONT and the ISP central office is disconnected or suffering an outage.',
    solutionSteps: [
      'Check the lights on your modem/router: look for the "WAN", "Internet", or "PON/LOS" LED indicator.',
      'If the Internet/LOS light is red or blinking, contact your Internet Service Provider to check for an area outage.',
      'Reboot your modem and router: unplug both devices for 60 seconds, then plug the modem in first, followed by the router.',
      'Ensure the external optical fiber, coaxial, or DSL cable entering your home is securely connected to the modem.'
    ],
    verificationStepId: 'step_internet_ping',
    preventionRecommendations: [
      'Keep your ISP support hotline and account number saved for rapid reporting during area outages.',
      'Use a surge protector for modem and router power supplies to protect against line voltage spikes.'
    ]
  },

  rc_wifi_weak_signal: {
    id: 'rc_wifi_weak_signal',
    problemTitle: 'Weak Wi-Fi Signal or Radio Frequency Interference',
    rootCause: 'The wireless link signal strength is degraded (below 50%) due to distance, physical obstacles, or 2.4GHz channel congestion.',
    technicalExplanation: 'Wi-Fi radio waves degrade when passing through concrete walls, metal framing, or when competing with neighboring access points on overlapping 2.4GHz channels (1, 6, 11). This causes high packet error rates, frame retries, and dropped connections.',
    solutionSteps: [
      'Move your device closer to the wireless router or eliminate line-of-sight obstructions.',
      'Connect to the 5 GHz or 6 GHz Wi-Fi band instead of 2.4 GHz for higher speed and lower interference.',
      'Change your router Wi-Fi channel in the router admin panel to an uncongested channel (1, 6, or 11 on 2.4GHz, or 36-48 on 5GHz).',
      'Consider using a Wi-Fi mesh node or Ethernet powerline adapter if working far from the main router.'
    ],
    verificationStepId: 'step_wifi_signal',
    preventionRecommendations: [
      'Position your router centrally in your home, at least 3-5 feet above floor level.',
      'Avoid placing routers near metal cabinets, mirrors, cordless phones, or microwave ovens.'
    ]
  },

  rc_bufferbloat_congestion: {
    id: 'rc_bufferbloat_congestion',
    problemTitle: 'Local Bandwidth Saturation & Bufferbloat',
    rootCause: 'Heavy downloads, cloud backups, or multiple streaming devices are saturating router buffer queues, causing severe latency spikes.',
    technicalExplanation: 'When Internet bandwidth upload/download capacity is maxed out, router queues fill up (bufferbloat), introducing 100ms–1000ms of queuing delay and random packet drops for all other connected network traffic.',
    solutionSteps: [
      'Check if other devices or background apps (Steam, Windows Update, cloud sync, torrents) are downloading or uploading.',
      'Pause large background file downloads and cloud synchronization while gaming or video calling.',
      'Enable Quality of Service (QoS) or Smart Queue Management (SQM / CAKE / FQ-CoDel) in your router admin settings.',
      'Test your speed on an Ethernet connection to verify if maximum ISP subscribed bandwidth is being reached.'
    ],
    verificationStepId: 'step_ping_latency_jitter',
    preventionRecommendations: [
      'Enable SQM (Smart Queue Management) on routers that support OpenWrt or modern router firmware.',
      'Schedule large cloud backups or game updates during off-peak overnight hours.'
    ]
  },

  rc_packet_loss_hop: {
    id: 'rc_packet_loss_hop',
    problemTitle: 'Packet Loss on Upstream ISP Transit Routing Hop',
    rootCause: 'Data packets are being dropped by an intermediate ISP node or transit peering exchange along the routing path.',
    technicalExplanation: 'The traceroute indicates that Hop 1 (local router) has 0% loss, but starting at Hop 2, 3, or downstream peering points, packets experience high latency or 100% loss. This represents ISP routing congestion or hardware fault outside your local network.',
    solutionSteps: [
      'Run a traceroute (tracert 8.8.8.8) and note which specific hop begins dropping packets.',
      'Restart your router to obtain a new public IP lease and potentially a different ISP routing gateway.',
      'Contact your ISP technical support and provide the traceroute log demonstrating the specific failing hop.',
      'If using a VPN, switch to a different server location to bypass the congested transit route.'
    ],
    verificationStepId: 'step_trace_route',
    preventionRecommendations: [
      'Use a reputable DNS resolver (1.1.1.1) with Anycast routing to optimize route selection.',
      'Monitor recurring packet loss periods (e.g. peak evening hours) to document ISP SLA violations.'
    ]
  },

  rc_target_server_outage: {
    id: 'rc_target_server_outage',
    problemTitle: 'Target Web Server Offline or Refusing Connections',
    rootCause: 'Your general Internet connection and DNS are working normally, but the specific destination web server is down or returning HTTP errors.',
    technicalExplanation: 'Ping to 8.8.8.8 and DNS lookups for other websites succeed with 0% loss. However, HTTP connections to the specific URL return HTTP 500/502/503 or "Connection Refused", confirming that the remote server or web application is experiencing an outage.',
    solutionSteps: [
      'Check status tracking websites like Downdetector (downdetector.com) to verify if the service is down globally.',
      'Attempt opening the website in an Incognito / Private browsing window to rule out browser cookie/extension conflicts.',
      'Try accessing the website using a different device or cellular mobile data connection.',
      'Wait 15-30 minutes for the website administrators to restore service.'
    ],
    verificationStepId: 'step_http_reachability',
    preventionRecommendations: [
      'Check official status dashboards (e.g. status.cloud.google.com, status.aws.com) when major web apps fail.',
      'Keep browser extensions updated and disable problematic proxy add-ons.'
    ]
  },

  rc_lan_subnet_mismatch: {
    id: 'rc_lan_subnet_mismatch',
    problemTitle: 'Local Subnet Mismatch or Firewall Blocking LAN Traffic',
    rootCause: 'The device is on a different local IP subnet (e.g. 192.168.1.x vs 192.168.0.x) or the OS firewall is blocking local peer discovery.',
    technicalExplanation: 'Devices on a local network can only communicate directly if they share the same subnet address and mask (e.g. 192.168.1.0/24). If your network has multiple routers, guest Wi-Fi isolation, or a strict Public network firewall profile, local peer discovery and file sharing will be blocked.',
    solutionSteps: [
      'Ensure your computer network profile is set to "Private Network" rather than "Public Network" in Windows Settings.',
      'Verify that both your device and target device (printer/PC) are connected to the same Wi-Fi SSID and not a Guest network.',
      'Check that both devices have IP addresses within the same subnet (e.g. both 192.168.1.xxx) and Subnet Mask 255.255.255.0.',
      'Disable "AP Isolation" or "Client Isolation" in your router Wi-Fi settings if devices cannot see each other.'
    ],
    verificationStepId: 'step_lan_peer_ping',
    preventionRecommendations: [
      'Use a single unified router/switch topology rather than cascading multiple secondary routers with conflicting DHCP servers.',
      'Set static IP leases on your router for persistent LAN devices like printers and NAS storage.'
    ]
  },

  rc_adapter_driver_glitch: {
    id: 'rc_adapter_driver_glitch',
    problemTitle: 'Network Adapter Driver State Inconsistency',
    rootCause: 'The operating system network stack or hardware driver entered a frozen or desynchronized state after power sleep or system update.',
    technicalExplanation: 'The physical hardware is present and cables/signals are intact, but the Windows/macOS network driver socket stack failed to reinitialize properly after a power state change, dropping network bindings.',
    solutionSteps: [
      'Disable and re-enable your network adapter in Network Connections or Device Manager.',
      'Run a network reset (Windows: Settings → Network & Internet → Advanced network settings → Network reset).',
      'Restart your computer to reload the kernel network drivers cleanly.',
      'Download and install the latest official network driver from your computer manufacturer.'
    ],
    verificationStepId: 'step_adapter_restart',
    preventionRecommendations: [
      'Disable "Allow the computer to turn off this device to save power" in Device Manager under Adapter Power Management.',
      'Keep your system BIOS/UEFI and chipset drivers updated.'
    ]
  }
};
