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
            self.drawString(54, 750, "NetDoctor — Phase 2 Completion Report (Problem Detection & Validation)")
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
    output_pdf = r"c:\Users\athar\OneDrive\Desktop\NetDoctor\docs\NetDoctor_Phase2_Completion_Report.pdf"
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
        fontSize=13,
        leading=16,
        textColor=brand_dark,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=brand_blue,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=brand_dark,
        spaceAfter=5
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=brand_dark,
        leftIndent=12,
        firstLineIndent=-8,
        spaceAfter=2.5
    )
    
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#1E293B")
    )
    
    story = []
    
    # Header
    story.append(Paragraph("NetDoctor", title_style))
    story.append(Paragraph("NETWORK DIAGNOSTIC SYSTEM — PHASE 2 COMPLETION REPORT", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=brand_blue, spaceBefore=0, spaceAfter=8))
    
    # Metadata Table
    meta_data = [
        [
            Paragraph("<b>Phase Completed:</b> Phase 2 (Problem Detection & Validation)", meta_style),
            Paragraph("<b>Status:</b> 100% Implemented & Verified", meta_style)
        ],
        [
            Paragraph("<b>Test Suites:</b> 32/32 Tests Passed across 3 test suites", meta_style),
            Paragraph("<b>Target Categories:</b> 11 MVP Categories Recognized", meta_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))
    
    # Section 1: Executive Summary
    story.append(Paragraph("1. Phase 2 Implementation Summary", h1_style))
    story.append(Paragraph(
        "Phase 2 delivers a deterministic, explainable natural-language problem understanding and validation pipeline for NetDoctor. Before any diagnostic tests are performed, the system validates the problem scope, rejects non-networking issues, tolerates spelling errors, asks single targeted follow-up questions for vague queries, and outputs a structured Validated Problem Context ready for Phase 3.",
        body_style
    ))
    
    # Section 2: 11 MVP Categories Table
    story.append(Paragraph("2. Supported 11 MVP Problem Categories", h1_style))
    cat_data = [
        [Paragraph("<b>Category Key</b>", meta_style), Paragraph("<b>Display Name</b>", meta_style), Paragraph("<b>Sample Natural Language Input</b>", meta_style)],
        [Paragraph("<code>internet_not_working</code>", code_style), Paragraph("Internet Not Working", meta_style), Paragraph('"My internet is completely down and offline"', meta_style)],
        [Paragraph("<code>wifi_connection</code>", code_style), Paragraph("Wi-Fi Connection Problems", meta_style), Paragraph('"WiFi keeps disconnecting from router"', meta_style)],
        [Paragraph("<code>slow_internet</code>", code_style), Paragraph("Slow Internet Throughput", meta_style), Paragraph('"The internet speed is extremely slow and buffering"', meta_style)],
        [Paragraph("<code>high_latency</code>", code_style), Paragraph("High Ping & Latency", meta_style), Paragraph('"My ping is very high and gaming lag is bad"', meta_style)],
        [Paragraph("<code>packet_loss</code>", code_style), Paragraph("Packet Loss", meta_style), Paragraph('"Getting 20% packet loss in Discord calls"', meta_style)],
        [Paragraph("<code>dns_problem</code>", code_style), Paragraph("DNS Resolution Failure", meta_style), Paragraph('"DNS server not responding, cannot resolve domain"', meta_style)],
        [Paragraph("<code>ip_dhcp_problem</code>", code_style), Paragraph("IP & DHCP Issues", meta_style), Paragraph('"Computer is stuck with 169.254 self-assigned IP"', meta_style)],
        [Paragraph("<code>router_connectivity</code>", code_style), Paragraph("Router & Gateway", meta_style), Paragraph('"Cannot reach my default gateway at 192.168.1.1"', meta_style)],
        [Paragraph("<code>network_adapter</code>", code_style), Paragraph("Network Adapter Issues", meta_style), Paragraph('"My Wi-Fi network adapter isn\'t working or recognized"', meta_style)],
        [Paragraph("<code>website_connectivity</code>", code_style), Paragraph("Specific Website Issue", meta_style), Paragraph('"One specific website won\'t open but others load"', meta_style)],
        [Paragraph("<code>lan_connectivity</code>", code_style), Paragraph("LAN / Local Network", meta_style), Paragraph('"Cannot connect to another computer on my LAN"', meta_style)],
    ]
    cat_table = Table(cat_data, colWidths=[120, 130, 254])
    cat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    story.append(cat_table)
    story.append(Spacer(1, 8))
    
    # Section 3: Non-Networking Validation & Typo Tolerance
    story.append(Paragraph("3. Validation, Vague Queries & Typo Tolerance", h1_style))
    story.append(Paragraph("• <b>Non-Networking Rejection:</b> Queries such as <i>'My Java code has an error'</i>, <i>'Laptop battery is draining'</i>, <i>'How do I cook pasta?'</i>, and <i>'Printer out of ink'</i> are rejected with a beginner-friendly alert without entering the workspace.", bullet_style))
    story.append(Paragraph("• <b>Vague Query Handling:</b> Generic inputs (<i>'Internet not working'</i>, <i>'Network problem'</i>, <i>'Net is gone'</i>, <i>'WiFi problem'</i>) trigger a single targeted clarification question (<i>'Is the problem occurring on one device or multiple devices?'</i>).", bullet_style))
    story.append(Paragraph("• <b>Typo & Fuzzy Tolerance:</b> Misspellings like <code>disconecting</code> → <code>disconnecting</code>, <code>internat</code> → <code>internet</code>, <code>pign</code> → <code>ping</code>, <code>wierless</code> → <code>wireless</code>, and <code>workng</code> → <code>working</code> are corrected automatically.", bullet_style))
    story.append(Paragraph("• <b>Compound Disambiguation:</b> Complex queries like <i>'WiFi is connected but websites will not open'</i> correctly prioritize DNS/Internet resolution rather than physical Wi-Fi link drops.", bullet_style))
    story.append(Spacer(1, 8))
    
    # Section 4: Testing & Verification Summary
    story.append(Paragraph("4. Automated Test Verification Summary", h1_style))
    test_data = [
        [Paragraph("<b>Test Suite File</b>", meta_style), Paragraph("<b>Coverage Scope</b>", meta_style), Paragraph("<b>Status</b>", meta_style)],
        [Paragraph("<code>Phase2Classification.test.ts</code>", code_style), Paragraph("11 Categories, Non-Networking, Typos, Vague queries, Context Handoff", meta_style), Paragraph("<b>23/23 PASSED</b>", ParagraphStyle('P1', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
        [Paragraph("<code>Phase2UI.test.tsx</code>", code_style), Paragraph("Rejection Alerts, Follow-Up Card UI, Typo Workspace Transition", meta_style), Paragraph("<b>3/3 PASSED</b>", ParagraphStyle('P2', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
        [Paragraph("<code>Phase1UI.test.tsx</code>", code_style), Paragraph("Regression Test Suite: Branding, Roadmap, Step Navigation, Modals", meta_style), Paragraph("<b>6/6 PASSED</b>", ParagraphStyle('P3', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
        [Paragraph("Production Build (<code>tsc -b</code>)", meta_style), Paragraph("Full client build validation", meta_style), Paragraph("<b>0 ERRORS</b>", ParagraphStyle('P4', fontName='Helvetica-Bold', fontSize=8, textColor=success_green))],
    ]
    test_table = Table(test_data, colWidths=[150, 270, 84])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ('TOPPADDING', (0, 0), (-1, -1), 3.5),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    story.append(test_table)
    story.append(Spacer(1, 8))
    
    # Section 5: Structure for Phase 3
    story.append(Paragraph("5. Problem Context Package Structure (Phase 3 Handoff)", h1_style))
    story.append(Paragraph(
        "Phase 2 outputs a strongly-typed <code>ValidatedProblemContext</code> object containing: <code>originalDescription</code>, <code>normalizedDescription</code>, <code>category</code> (key), <code>categoryDisplayName</code>, <code>operatingSystem</code>, <code>followUpAnswer</code>, <code>isOSSupported</code>, and <code>contextSummary</code>. Phase 3 (Structured Diagnosis & Troubleshooting) will consume this context directly to generate custom roadmap procedures.",
        body_style
    ))
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print("Phase 2 PDF generated successfully at:", output_pdf)

if __name__ == "__main__":
    generate_report()
