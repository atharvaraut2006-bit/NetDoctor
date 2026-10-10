/**
 * NetDoctor — Phase 1 Demonstration & Mock Data
 * Cleanly decoupled from future diagnostic engine (Phase 3/4)
 */

import type { CommonProblem, DiagnosticStep, RoadmapStepItem } from '../types/diagnostic';

export const COMMON_PROBLEMS: CommonProblem[] = [
  {
    id: 'wifi_no_internet',
    title: 'Wi-Fi connected but no internet',
    description: 'Device is connected to the local wireless network, but web pages cannot load.',
    iconName: 'wifi',
    defaultCategoryKey: 'wifi_connection',
    defaultCategoryName: 'Wi-Fi Connection Problems'
  },
  {
    id: 'internet_not_working',
    title: 'Internet not working',
    description: 'Complete loss of connection across all applications and websites.',
    iconName: 'globe',
    defaultCategoryKey: 'internet_not_working',
    defaultCategoryName: 'Internet Not Working'
  },
  {
    id: 'slow_internet',
    title: 'Slow Internet & High Latency',
    description: 'Connections drop or load very slowly with high ping times.',
    iconName: 'gauge',
    defaultCategoryKey: 'slow_internet',
    defaultCategoryName: 'Slow Internet Throughput'
  },
  {
    id: 'dns_issues',
    title: 'DNS / Website resolution failure',
    description: 'Specific websites fail to open, or DNS lookup timeouts occur.',
    iconName: 'server',
    defaultCategoryKey: 'dns_problem',
    defaultCategoryName: 'DNS Resolution Problems'
  },
  {
    id: 'packet_loss',
    title: 'Frequent Disconnections / Packet Loss',
    description: 'Network drops intermittently during streaming, calling, or gaming.',
    iconName: 'activity',
    defaultCategoryKey: 'packet_loss',
    defaultCategoryName: 'Packet Loss'
  }
];

export const DEMO_DIAGNOSTIC_STEPS: DiagnosticStep[] = [
  {
    id: 'step_1_network_interface',
    stepNumber: 1,
    title: 'Check Network Adapter & Physical Connection',
    category: 'Physical / Data Link Layer',
    whyNeeded: 'This verifies whether your Wi-Fi or Ethernet network adapter is enabled, connected to an active router, and capable of transmitting data packets.',
    detailedWhy: 'Before diagnosing software, IP settings, or DNS configurations, we must ensure your computer hardware interface has an active physical or wireless link with your local router. If the adapter is disabled or disconnected, all higher-level network communication will fail.',
    instructions: {
      windows: [
        'Click the Windows Start button or press the Windows key.',
        'Type "cmd" or "Command Prompt" in the search box.',
        'Click Command Prompt to open the terminal window.',
        'Type the command shown below and press Enter.',
        'Copy the result and paste it into the submission area below.'
      ],
      macos: [
        'Press Command + Spacebar to open Spotlight search.',
        'Type "Terminal" and press Return.',
        'Enter the command shown below and press Return.',
        'Copy the output text and paste it into the submission box.'
      ],
      linux: [
        'Open your preferred terminal emulator (Ctrl + Alt + T).',
        'Type the command shown below and press Enter.',
        'Copy the command output and paste it into the submission box.'
      ]
    },
    command: {
      windows: 'netsh interface show interface',
      macos: 'networksetup -listallhardwareports',
      linux: 'ip link show'
    },
    expectedResult: {
      summary: 'You should see your Wi-Fi or Ethernet adapter listed with an "Enabled" and "Connected" state.',
      sampleOutput: 'Admin State    State          Type             Interface Name\n-------------------------------------------------------------------------\nEnabled        Connected      Dedicated        Wi-Fi'
    },
    defaultStatus: 'COMPLETED'
  },
  {
    id: 'step_2_ip_configuration',
    stepNumber: 2,
    title: 'Check IP Address & DHCP Configuration',
    category: 'Network Layer (IP/DHCP)',
    whyNeeded: 'This checks whether your router has assigned a valid local IP address (like 192.168.1.x) or if your computer is stuck with an automatic private address (169.254.x.x).',
    detailedWhy: 'Every device on a network requires a unique IP address provided by the router (DHCP server). If your computer displays an IP starting with 169.254, it failed to obtain an address from the router, meaning no network communication is possible.',
    instructions: {
      windows: [
        'In your open Command Prompt window, type the command below.',
        'Press Enter to execute.',
        'Look for the section titled "Wireless LAN adapter Wi-Fi" or "Ethernet adapter".',
        'Copy the output lines and paste them below.'
      ],
      macos: [
        'In Terminal, enter the command shown below and press Return.',
        'Look for your active network interface (typically en0).',
        'Copy the IP configuration text and submit below.'
      ],
      linux: [
        'In your terminal, enter the command below and press Enter.',
        'Look for your wireless interface (e.g., wlan0) or Ethernet (eth0).',
        'Copy the output and paste it below.'
      ]
    },
    command: {
      windows: 'ipconfig',
      macos: 'ipconfig getifaddr en0',
      linux: 'ip addr show'
    },
    expectedResult: {
      summary: 'You should see a valid IPv4 Address (e.g., 192.168.1.15) and a Default Gateway (e.g., 192.168.1.1).',
      sampleOutput: 'Wireless LAN adapter Wi-Fi:\n   IPv4 Address. . . . . . . . . . . : 192.168.1.45\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1'
    },
    defaultStatus: 'CURRENT'
  },
  {
    id: 'step_3_gateway_connectivity',
    stepNumber: 3,
    title: 'Test Default Gateway (Router) Reachability',
    category: 'Local Network Routing',
    whyNeeded: 'This sends 4 test signals to your local router (Default Gateway) to verify that data packets can travel from your computer to the router without packet loss.',
    detailedWhy: 'Your Default Gateway is the entry door to the rest of the world. If you cannot reach your router IP (192.168.1.1), the problem is strictly inside your home/office local network, not with the external Internet provider.',
    instructions: {
      windows: [
        'Enter the ping command targeting your default gateway.',
        'Press Enter and wait 5 seconds for the 4 reply packets.',
        'Copy the ping statistics summary and paste it below.'
      ],
      macos: [
        'In Terminal, enter the ping command below and press Return.',
        'Press Ctrl + C after 4 packets if it does not automatically stop.',
        'Copy the packet transmission summary.'
      ],
      linux: [
        'In terminal, run the ping command below.',
        'Check that 0% packet loss is reported.',
        'Paste the output in the result submission area.'
      ]
    },
    command: {
      windows: 'ping 192.168.1.1',
      macos: 'ping -c 4 192.168.1.1',
      linux: 'ping -c 4 192.168.1.1'
    },
    expectedResult: {
      summary: 'You should receive 4 successful replies with low latency (under 5ms) and 0% packet loss.',
      sampleOutput: 'Pinging 192.168.1.1 with 32 bytes of data:\nReply from 192.168.1.1: bytes=32 time=2ms TTL=64\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\n\nPing statistics for 192.168.1.1:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)'
    },
    defaultStatus: 'PENDING'
  },
  {
    id: 'step_4_dns_resolution',
    stepNumber: 4,
    title: 'Test Domain Name System (DNS) Resolution',
    category: 'DNS / Name Translation',
    whyNeeded: 'This tests whether your network can translate human-readable website names (such as google.com) into numerical IP addresses.',
    detailedWhy: 'Computers communicate using numerical IP addresses. When you type google.com, DNS servers translate it to an IP address. If DNS is failing, websites will not open even if your physical internet connection is working perfectly.',
    instructions: {
      windows: [
        'In Command Prompt, type the nslookup command below.',
        'Press Enter to query your configured DNS server.',
        'Submit the output response below.'
      ],
      macos: [
        'In Terminal, type nslookup or dig as shown below.',
        'Press Return to perform the DNS query.',
        'Copy the server response.'
      ],
      linux: [
        'In terminal, run the nslookup command.',
        'Verify that an IP address is returned for the queried domain.',
        'Paste the result below.'
      ]
    },
    command: {
      windows: 'nslookup google.com',
      macos: 'nslookup google.com',
      linux: 'nslookup google.com'
    },
    expectedResult: {
      summary: 'Your DNS server should resolve the domain and return an IP address (e.g., 142.250.190.46).',
      sampleOutput: 'Server:  dns.google\nAddress:  8.8.8.8\n\nNon-authoritative answer:\nName:    google.com\nAddresses: 142.250.190.46'
    },
    defaultStatus: 'PENDING'
  },
  {
    id: 'step_5_internet_connectivity',
    stepNumber: 5,
    title: 'Verify Direct Internet IP Connectivity',
    category: 'WAN / Global Internet Reachability',
    whyNeeded: 'This tests end-to-end data delivery across the global Internet by contacting a reliable public server directly by its numerical IP address.',
    detailedWhy: 'Pinging a known public IP (like Google Public DNS at 8.8.8.8) bypasses the local DNS resolver. If this test succeeds but websites still fail, the root cause is 100% confirmed to be a DNS configuration issue.',
    instructions: {
      windows: [
        'In Command Prompt, run the ping command to 8.8.8.8.',
        'Press Enter and observe the round-trip times.',
        'Copy the summary statistics.'
      ],
      macos: [
        'Run the ping command with 4 count packets in Terminal.',
        'Copy the resulting round-trip statistics.'
      ],
      linux: [
        'Run the ping command to 8.8.8.8 in terminal.',
        'Submit the packet loss percentage below.'
      ]
    },
    command: {
      windows: 'ping 8.8.8.8',
      macos: 'ping -c 4 8.8.8.8',
      linux: 'ping -c 4 8.8.8.8'
    },
    expectedResult: {
      summary: 'You should receive 4 replies with consistent latency and 0% packet loss.',
      sampleOutput: 'Pinging 8.8.8.8 with 32 bytes of data:\nReply from 8.8.8.8: bytes=32 time=18ms TTL=117\nReply from 8.8.8.8: bytes=32 time=19ms TTL=117\n\nPing statistics for 8.8.8.8:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)'
    },
    defaultStatus: 'PENDING'
  }
];

export const INITIAL_DEMO_ROADMAP: RoadmapStepItem[] = [
  {
    id: 'step_1_network_interface',
    stepNumber: 1,
    title: 'Check Network Adapter',
    status: 'COMPLETED',
    resultSummary: 'Wi-Fi adapter is active and connected.'
  },
  {
    id: 'step_2_ip_configuration',
    stepNumber: 2,
    title: 'Check IP Configuration',
    status: 'CURRENT'
  },
  {
    id: 'step_3_gateway_connectivity',
    stepNumber: 3,
    title: 'Test Default Gateway',
    status: 'PENDING'
  },
  {
    id: 'step_4_dns_resolution',
    stepNumber: 4,
    title: 'Test DNS Resolution',
    status: 'PENDING'
  },
  {
    id: 'step_5_internet_connectivity',
    stepNumber: 5,
    title: 'Verify Internet Connectivity',
    status: 'PENDING'
  }
];
