import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#5B6577"))
        
        # Header (pages 2+)
        if self._pageNumber > 1:
            self.drawString(54, 750, "NetDoctor — Phase 3 Completion Report (Structured Diagnosis & Troubleshooting)")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
        # Footer (all pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 45, 558, 45)
        
        self.drawString(54, 32, "Confidential — NetDoctor Project Documentation")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)
        self.restoreState()

def generate_report():
    output_pdf = r"c:\Users\athar\OneDrive\Desktop\NetDoctor\docs\NetDoctor_Phase3_Completion_Report.pdf"
    os.makedirs(os.path.dirname(output_pdf), exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    brand_dark = colors.HexColor("#172033")
    brand_blue = colors.HexColor("#2563EB")
    brand_teal = colors.HexColor("#0F9D9A")
    brand_gray = colors.HexColor("#5B6577")
    bg_light = colors.HexColor("#F7F9FC")
    border_color = colors.HexColor("#E2E8F0")
    success_green = colors.HexColor("#16A34A")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=brand_dark,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=brand_teal,
        spaceAfter=12
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=brand_gray
    )
    
    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=brand_dark,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=brand_dark,
        spaceAfter=4
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11.5,
        textColor=brand_dark,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2
    )
    
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#1E293B")
    )
    
    story = []
    
    # Header
    story.append(Paragraph("NetDoctor", title_style))
    story.append(Paragraph("NETWORK DIAGNOSTIC SYSTEM — PHASE 3 COMPLETION REPORT", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=brand_blue, spaceBefore=0, spaceAfter=6))
    
    # Metadata Table
    meta_data = [
        [
            Paragraph("<b>Phase Completed:</b> Phase 3 (Structured Diagnosis & Troubleshooting)", meta_style),
            Paragraph("<b>Status:</b> 100% Implemented & Verified", meta_style)
        ],
        [
            Paragraph("<b>Test Suites:</b> 60/60 Tests Passed across 5 test suites", meta_style),
            Paragraph("<b>Coverage:</b> 13 Diagnostic Steps, 11 Roadmaps, 12 Root Causes", meta_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))
    
    # Section 1: Executive Summary
    story.append(Paragraph("1. Phase 3 Architecture & Implementation Summary", h1_style))
    story.append(Paragraph(
        "Phase 3 establishes the deterministic diagnostic knowledge and command interpretation engine for NetDoctor. It delivers a comprehensive Curated Networking Knowledge Base across all OSI layers, complete OS command sets for Windows, macOS, and Linux, deterministic regex output parsers, beginner-friendly plain-language translations, and comprehensive root-cause mappings.",
        body_style
    ))
    
    # Section 2: Curated Diagnostic Steps Library Table
    story.append(Paragraph("2. Curated Diagnostic Procedures Library (13 Steps)", h1_style))
    step_data = [
        [Paragraph("<b>Step ID</b>", meta_style), Paragraph("<b>Layer</b>", meta_style), Paragraph("<b>Windows / macOS / Linux Command</b>", meta_style), Paragraph("<b>Key Metric / Target</b>", meta_style)],
        [Paragraph("<code>step_network_adapter</code>", code_style), Paragraph("Physical/Link", meta_style), Paragraph("<code>netsh interface show</code> / <code>networksetup</code> / <code>ip link</code>", code_style), Paragraph("Interface link & admin state", meta_style)],
        [Paragraph("<code>step_ip_dhcp</code>", code_style), Paragraph("IP / DHCP", meta_style), Paragraph("<code>ipconfig /all</code> / <code>ifconfig</code> / <code>ip addr show</code>", code_style), Paragraph("IPv4, Subnet, Gateway, APIPA", meta_style)],
        [Paragraph("<code>step_gateway_ping</code>", code_style), Paragraph("Local Network", meta_style), Paragraph("<code>ping 192.168.1.1</code> (4 packets)", code_style), Paragraph("Router packet loss & latency", meta_style)],
        [Paragraph("<code>step_dns_lookup</code>", code_style), Paragraph("DNS", meta_style), Paragraph("<code>nslookup google.com</code> / <code>dig</code>", code_style), Paragraph("A/AAAA address translation", meta_style)],
        [Paragraph("<code>step_internet_ping</code>", code_style), Paragraph("WAN / Internet", meta_style), Paragraph("<code>ping 8.8.8.8</code> / <code>1.1.1.1</code>", code_style), Paragraph("Direct public IP routing", meta_style)],
        [Paragraph("<code>step_wifi_signal</code>", code_style), Paragraph("Wireless Link", meta_style), Paragraph("<code>netsh wlan show interfaces</code> / <code>nmcli</code>", code_style), Paragraph("SSID, Signal %, Band, Radio", meta_style)],
        [Paragraph("<code>step_ping_latency_jitter</code>", code_style), Paragraph("Transport", meta_style), Paragraph("<code>ping -n 10 8.8.8.8</code> (10 packets)", code_style), Paragraph("Latency jitter & bufferbloat", meta_style)],
        [Paragraph("<code>step_trace_route</code>", code_style), Paragraph("Routing Path", meta_style), Paragraph("<code>tracert 8.8.8.8</code> / <code>traceroute -n</code>", code_style), Paragraph("Hop 1 gateway vs ISP drops", meta_style)],
        [Paragraph("<code>step_dns_flush</code>", code_style), Paragraph("DNS Cache", meta_style), Paragraph("<code>ipconfig /flushdns</code> / <code>dscacheutil</code>", code_style), Paragraph("Clear corrupted resolver cache", meta_style)],
        [Paragraph("<code>step_ip_release_renew</code>", code_style), Paragraph("DHCP Protocol", meta_style), Paragraph("<code>ipconfig /release && renew</code>", code_style), Paragraph("Obtain fresh DHCP IP lease", meta_style)],
        [Paragraph("<code>step_http_reachability</code>", code_style), Paragraph("Application", meta_style), Paragraph("<code>curl -I https://www.google.com</code>", code_style), Paragraph("HTTP 200 OK / port response", meta_style)],
        [Paragraph("<code>step_lan_peer_ping</code>", code_style), Paragraph("Local LAN", meta_style), Paragraph("<code>arp -a</code> / <code>ip neigh show</code>", code_style), Paragraph("ARP cache & subnet discovery", meta_style)],
        [Paragraph("<code>step_adapter_restart</code>", code_style), Paragraph("Interface Reset", meta_style), Paragraph("<code>netsh interface set ... disable/enable</code>", code_style), Paragraph("Reinitialize network driver", meta_style)],
    ]
    step_table = Table(step_data, colWidths=[115, 65, 204, 120])
    step_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    story.append(step_table)
    story.append(Spacer(1, 6))
    
    # Section 3: Deterministic Regex Output Parsers
    story.append(Paragraph("3. Multi-OS Command Output Regex Interpreters", h1_style))
    story.append(Paragraph("• <b>IP & DHCP Parsing:</b> Regex extractors capture IPv4 address, Subnet Mask, Default Gateway, DHCP server, DNS servers, and immediately flag APIPA addresses (<code>169.254.x.x</code>) and Media Disconnected states.", bullet_style))
    story.append(Paragraph("• <b>Ping & Latency Parsing:</b> Parses Windows, macOS, and Linux ping statistics (Packets sent/received/lost, loss %, min/max/avg RTT, TTL). Classifies <code>Request timed out</code>, <code>Destination host unreachable</code>, <code>General failure</code>, and evaluates latency thresholds.", bullet_style))
    story.append(Paragraph("• <b>DNS Parsing:</b> Analyzes <code>nslookup</code>, <code>dig</code>, and <code>host</code> outputs for server IP, resolved A records, and captures error signatures (<code>DNS request timed out</code>, <code>NXDOMAIN</code>, <code>SERVFAIL</code>).", bullet_style))
    story.append(Paragraph("• <b>Trace, Wi-Fi & HTTP Parsing:</b> Detects Hop 1 router timeouts, Wi-Fi signal degradation (<45%), SSID parameters, and HTTP response codes (200 OK vs 500/502/Connection Refused).", bullet_style))
    story.append(Spacer(1, 6))
    
    # Section 4: Root Causes Library Table
    story.append(Paragraph("4. Curated Root Causes, Solutions & Prevention (12 Mappings)", h1_style))
    rc_data = [
        [Paragraph("<b>Root Cause ID</b>", meta_style), Paragraph("<b>Identified Root Cause</b>", meta_style), Paragraph("<b>Verification Step</b>", meta_style)],
        [Paragraph("<code>rc_no_physical_link</code>", code_style), Paragraph("Network adapter disabled, airplane mode, or cable disconnected", meta_style), Paragraph("<code>step_network_adapter</code>", code_style)],
        [Paragraph("<code>rc_apipa_dhcp_failure</code>", code_style), Paragraph("DHCP server lease failure resulting in self-assigned 169.254.x.x", meta_style), Paragraph("<code>step_ip_dhcp</code>", code_style)],
        [Paragraph("<code>rc_gateway_unreachable</code>", code_style), Paragraph("Local default gateway / router unreachable or frozen", meta_style), Paragraph("<code>step_gateway_ping</code>", code_style)],
        [Paragraph("<code>rc_dns_server_failure</code>", code_style), Paragraph("Configured DNS servers unreachable or failing name translation", meta_style), Paragraph("<code>step_dns_lookup</code>", code_style)],
        [Paragraph("<code>rc_dns_cache_corruption</code>", code_style), Paragraph("Corrupted or stale local DNS resolver cache entries", meta_style), Paragraph("<code>step_dns_lookup</code>", code_style)],
        [Paragraph("<code>rc_isp_wan_outage</code>", code_style), Paragraph("Local gateway reachable, but external ISP WAN link is down", meta_style), Paragraph("<code>step_internet_ping</code>", code_style)],
        [Paragraph("<code>rc_wifi_weak_signal</code>", code_style), Paragraph("Weak Wi-Fi signal (<45%) or 2.4GHz radio interference", meta_style), Paragraph("<code>step_wifi_signal</code>", code_style)],
        [Paragraph("<code>rc_bufferbloat_congestion</code>", code_style), Paragraph("Local bandwidth saturation and bufferbloat queuing delay", meta_style), Paragraph("<code>step_ping_latency_jitter</code>", code_style)],
        [Paragraph("<code>rc_packet_loss_hop</code>", code_style), Paragraph("Packet drops occurring on intermediate ISP transit hop", meta_style), Paragraph("<code>step_trace_route</code>", code_style)],
        [Paragraph("<code>rc_target_server_outage</code>", code_style), Paragraph("Target web server down or refusing connections (Internet OK)", meta_style), Paragraph("<code>step_http_reachability</code>", code_style)],
        [Paragraph("<code>rc_lan_subnet_mismatch</code>", code_style), Paragraph("Subnet mismatch or firewall blocking local peer discovery", meta_style), Paragraph("<code>step_lan_peer_ping</code>", code_style)],
        [Paragraph("<code>rc_adapter_driver_glitch</code>", code_style), Paragraph("Operating system network driver stack state inconsistency", meta_style), Paragraph("<code>step_adapter_restart</code>", code_style)],
    ]
    rc_table = Table(rc_data, colWidths=[140, 264, 100])
    rc_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    story.append(rc_table)
    story.append(Spacer(1, 6))
    
    # Section 5: Verification Summary
    story.append(Paragraph("5. Automated Test Verification Summary", h1_style))
    test_data = [
        [Paragraph("<b>Test Suite File</b>", meta_style), Paragraph("<b>Scope & Assertions</b>", meta_style), Paragraph("<b>Status</b>", meta_style)],
        [Paragraph("<code>Phase3KnowledgeBase.test.ts</code>", code_style), Paragraph("13 steps, 11 category roadmaps, 12 root causes, multi-OS commands", meta_style), Paragraph("<b>7/7 PASSED</b>", ParagraphStyle('P1', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
        [Paragraph("<code>Phase3Interpreter.test.ts</code>", code_style), Paragraph("Multi-OS regex parsers (ipconfig, ping, nslookup, tracert, curl, wifi)", meta_style), Paragraph("<b>21/21 PASSED</b>", ParagraphStyle('P2', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
        [Paragraph("<code>Phase2Classification.test.ts</code>", code_style), Paragraph("Problem classifier, typo tolerance, relevance, vague questions", meta_style), Paragraph("<b>23/23 PASSED</b>", ParagraphStyle('P3', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
        [Paragraph("<code>Phase2UI.test.tsx</code>", code_style), Paragraph("Rejection UI, Follow-Up Card interaction", meta_style), Paragraph("<b>3/3 PASSED</b>", ParagraphStyle('P4', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
        [Paragraph("<code>Phase1UI.test.tsx</code>", code_style), Paragraph("Clean Dashboard UI, Roadmap tracking, Step navigation, Modals", meta_style), Paragraph("<b>6/6 PASSED</b>", ParagraphStyle('P5', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
        [Paragraph("Production Build (<code>tsc -b</code>)", meta_style), Paragraph("TypeScript compilation & Vite bundle packaging", meta_style), Paragraph("<b>0 ERRORS</b>", ParagraphStyle('P6', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
    ]
    test_table = Table(test_data, colWidths=[150, 270, 84])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    story.append(test_table)
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print("Phase 3 PDF generated successfully at:", output_pdf)

if __name__ == "__main__":
    generate_report()
