import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
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
            self.drawString(54, 750, "NetDoctor — Phase 1 Completion Report (UI & Project Foundation)")
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
    output_pdf = r"c:\Users\athar\OneDrive\Desktop\NetDoctor\docs\NetDoctor_Phase1_Completion_Report.pdf"
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
    
    # Custom Brand Styles
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
        fontSize=24,
        leading=28,
        textColor=brand_dark,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=brand_teal,
        spaceAfter=14
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=brand_gray
    )
    
    h1_style = ParagraphStyle(
        'Heading1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=brand_dark,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=brand_blue,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=brand_dark,
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=brand_dark,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3
    )
    
    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#1E293B")
    )
    
    story = []
    
    # Title Header Block
    story.append(Paragraph("NetDoctor", title_style))
    story.append(Paragraph("NETWORK DIAGNOSTIC SYSTEM — PHASE 1 COMPLETION REPORT", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=brand_blue, spaceBefore=0, spaceAfter=10))
    
    # Metadata Box
    meta_data = [
        [
            Paragraph("<b>Project Phase:</b> Phase 1 (UI & Project Foundation)", meta_style),
            Paragraph("<b>Status:</b> Completed & Verified", meta_style)
        ],
        [
            Paragraph("<b>Master Spec:</b> docs/PRD.md", meta_style),
            Paragraph("<b>Architecture:</b> docs/ARCHITECTURE.md", meta_style)
        ],
        [
            Paragraph("<b>Test Coverage:</b> 6/6 Vitest Tests Passed (100%)", meta_style),
            Paragraph("<b>Dev Server:</b> http://localhost:5173", meta_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[240, 264])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_light),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, border_color),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))
    
    # Section 1: Executive Summary
    story.append(Paragraph("1. Executive Summary & Product Identity", h1_style))
    story.append(Paragraph(
        "NetDoctor is a structured network diagnostic and troubleshooting system that converts natural-language problem descriptions into an adaptive, evidence-based troubleshooting workflow. NetDoctor is engineered specifically as a dedicated diagnostic system rather than a generic conversational chatbot.",
        body_style
    ))
    story.append(Paragraph(
        "Phase 1 has established the complete frontend foundation and professional UI structure. The application strictly embodies the <b>Clean Network Dashboard</b> aesthetic, enforcing strict design constraints: zero emojis, zero stickers, zero AI branding, zero confidence scores, and high-contrast professional typography.",
        body_style
    ))
    story.append(Spacer(1, 8))
    
    # Section 2: UI Design System Tokens
    story.append(Paragraph("2. Design System Tokens & Brand Compliance", h1_style))
    palette_data = [
        [Paragraph("<b>Element</b>", meta_style), Paragraph("<b>Token Role</b>", meta_style), Paragraph("<b>Hex Code</b>", meta_style), Paragraph("<b>Compliance Status</b>", meta_style)],
        [Paragraph("Page Background", meta_style), Paragraph("Light Canvas", meta_style), Paragraph("<code>#F7F9FC</code>", code_style), Paragraph("Active & Verified", meta_style)],
        [Paragraph("Card Surfaces", meta_style), Paragraph("White Panels", meta_style), Paragraph("<code>#FFFFFF</code>", code_style), Paragraph("Active & Verified", meta_style)],
        [Paragraph("Primary Text", meta_style), Paragraph("Dark Navy", meta_style), Paragraph("<code>#172033</code>", code_style), Paragraph("Active & Verified", meta_style)],
        [Paragraph("Secondary Text", meta_style), Paragraph("Slate Gray", meta_style), Paragraph("<code>#5B6577</code>", code_style), Paragraph("Active & Verified", meta_style)],
        [Paragraph("Primary Action", meta_style), Paragraph("Network Blue", meta_style), Paragraph("<code>#2563EB</code>", code_style), Paragraph("Active & Verified", meta_style)],
        [Paragraph("Secondary Accent", meta_style), Paragraph("Teal Accent", meta_style), Paragraph("<code>#0F9D9A</code>", code_style), Paragraph("Active & Verified", meta_style)],
        [Paragraph("Borders / Dividers", meta_style), Paragraph("Light Blue-Gray", meta_style), Paragraph("<code>#E2E8F0</code>", code_style), Paragraph("Active & Verified", meta_style)],
    ]
    palette_table = Table(palette_data, colWidths=[120, 110, 110, 164])
    palette_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('TEXTCOLOR', (0, 0), (-1, 0), brand_dark),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    story.append(palette_table)
    story.append(Spacer(1, 10))
    
    # Section 3: Implemented Screens & Components
    story.append(Paragraph("3. Implemented UI Screens & Components", h1_style))
    story.append(Paragraph("<b>A. Home Screen (Landing View):</b>", h2_style))
    story.append(Paragraph("• <b>Hero Header:</b> Clean NetDoctor brand title and 'Network Diagnostic System' subheader with live status badge.", bullet_style))
    story.append(Paragraph("• <b>Natural Language Input:</b> Large, responsive prompt box accepting user-described network issues.", bullet_style))
    story.append(Paragraph("• <b>OS Selector:</b> Radio pill buttons for Windows, macOS, Linux, and Other.", bullet_style))
    story.append(Paragraph("• <b>5 Common Problem Presets:</b> Clickable cards for Wi-Fi disconnection, no internet, slow speeds, DNS errors, and packet loss.", bullet_style))
    story.append(Paragraph("• <b>Network Pipeline Visual:</b> Subtle SVG topology showing Device → Gateway → DNS → Internet.", bullet_style))
    story.append(Spacer(1, 4))
    
    story.append(Paragraph("<b>B. Diagnostic Workspace (Two-Panel Structured Layout):</b>", h2_style))
    story.append(Paragraph("• <b>Left Panel — Diagnostic Roadmap:</b> Sticky sidebar displaying step sequence, progress percentage bar, and visual states (Completed ✓, Current →, Pending ○, Failed ✗, Skipped -).", bullet_style))
    story.append(Paragraph("• <b>Right Panel — Active Step Action Center:</b> Step objective header, category tag, and beginner-friendly OS instructions.", bullet_style))
    story.append(Paragraph("• <b>Monospace Command Box:</b> Terminal container with a 1-click 'Copy' button and animated 'Copied!' feedback.", bullet_style))
    story.append(Paragraph("• <b>Expected Result Card:</b> Explanation and sample output of expected healthy network responses.", bullet_style))
    story.append(Paragraph("• <b>Result Submission Interface:</b> Tabbed layout supporting Quick Buttons, Raw CLI Output paste, and Screenshot dropzone.", bullet_style))
    story.append(Paragraph("• <b>'Why this step?' Drawer:</b> Detailed modal explaining the engineering purpose and isolated network layer without losing session progress.", bullet_style))
    story.append(Paragraph("• <b>Confirmation Modals:</b> Reversible dialogs for 'Stop Diagnosis' and 'Start New Diagnosis'.", bullet_style))
    story.append(Spacer(1, 10))
    
    # Section 4: Testing & Verification
    story.append(Paragraph("4. Testing & Verification Summary", h1_style))
    test_data = [
        [Paragraph("<b>Test Case Scope</b>", meta_style), Paragraph("<b>Target Element</b>", meta_style), Paragraph("<b>Status</b>", meta_style)],
        [Paragraph("Brand & No-AI Compliance", meta_style), Paragraph("Zero AI phrases, no probability ratios, exact titles", meta_style), Paragraph("<b>PASSED</b>", ParagraphStyle('P1', fontName='Helvetica-Bold', fontSize=8.5, textColor=success_green))],
        [Paragraph("OS Selector & Presets", meta_style), Paragraph("Windows/macOS/Linux selector, 5 problem presets", meta_style), Paragraph("<b>PASSED</b>", ParagraphStyle('P2', fontName='Helvetica-Bold', fontSize=8.5, textColor=success_green))],
        [Paragraph("Workspace Transition", meta_style), Paragraph("Launching diagnosis from input or preset card", meta_style), Paragraph("<b>PASSED</b>", ParagraphStyle('P3', fontName='Helvetica-Bold', fontSize=8.5, textColor=success_green))],
        [Paragraph("Step Navigation & Backtracking", meta_style), Paragraph("Next Step, Previous Step, Skip Step controls", meta_style), Paragraph("<b>PASSED</b>", ParagraphStyle('P4', fontName='Helvetica-Bold', fontSize=8.5, textColor=success_green))],
        [Paragraph("'Why this step?' Modal", meta_style), Paragraph("Technical drawer open/close without progress loss", meta_style), Paragraph("<b>PASSED</b>", ParagraphStyle('P5', fontName='Helvetica-Bold', fontSize=8.5, textColor=success_green))],
        [Paragraph("Session Controls & Modals", meta_style), Paragraph("Stop Diagnosis & Start Over confirmation flows", meta_style), Paragraph("<b>PASSED</b>", ParagraphStyle('P6', fontName='Helvetica-Bold', fontSize=8.5, textColor=success_green))],
        [Paragraph("TypeScript Production Build", meta_style), Paragraph("<code>tsc -b && vite build</code> (0 errors, 0 warnings)", meta_style), Paragraph("<b>PASSED</b>", ParagraphStyle('P7', fontName='Helvetica-Bold', fontSize=8.5, textColor=success_green))],
    ]
    test_table = Table(test_data, colWidths=[150, 270, 84])
    test_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
        ('TEXTCOLOR', (0, 0), (-1, 0), brand_dark),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('GRID', (0, 0), (-1, -1), 0.5, border_color),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ]))
    story.append(test_table)
    story.append(Spacer(1, 10))
    
    # Section 5: Phase 2 Preparation
    story.append(Paragraph("5. Decoupled Architecture & Phase 2 Preparation", h1_style))
    story.append(Paragraph(
        "All demonstration data in Phase 1 has been strictly isolated inside <code>client/src/data/mockDiagnosticData.ts</code>. The frontend state management in <code>DiagnosticContext.tsx</code> is architected to seamlessly connect to the backend REST API in subsequent phases.",
        body_style
    ))
    story.append(Paragraph("<b>Next Milestone — Phase 2 (Networking Problem Detection & Validation):</b>", h2_style))
    story.append(Paragraph("• Implement Problem Relevance Validator (networking vs. non-networking rejection).", bullet_style))
    story.append(Paragraph("• Implement Fuzzy Lexicon Matcher for typo tolerance and informal phrasing.", bullet_style))
    story.append(Paragraph("• Implement Vague Query Detector with single targeted follow-up questions.", bullet_style))
    story.append(Paragraph("• Connect OS enforcement to custom CLI instruction generator.", bullet_style))
    
    doc.build(story, canvasmaker=NumberedCanvas)
    print("PDF generated successfully at:", output_pdf)

if __name__ == "__main__":
    generate_report()
