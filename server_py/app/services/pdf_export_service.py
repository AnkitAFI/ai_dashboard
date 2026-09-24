import io
from datetime import datetime
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from typing import List, Dict

def generate_behavior_logs_pdf(logs: List[dict], user_data: Dict[str, dict]) -> io.BytesIO:
    """
    Generate a clean, structured PDF report for user behavior logs.
    `logs` should be sorted chronologically and grouped by user_email in this function.
    `user_data` is a mapping of user_email -> {"name": "Full Name", "id": User ID}
    """
    buffer = io.BytesIO()
    
    # We use landscape to fit columns better
    doc = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=30, leftMargin=30,
        topMargin=30, bottomMargin=30
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'ReportTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=20,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        'ReportSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=30,
        alignment=1
    )
    
    user_header_style = ParagraphStyle(
        'UserHeader',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#4f46e5'),
        spaceBefore=20,
        spaceAfter=10
    )
    
    # Title Page / Header
    elements.append(Paragraph("User Behavior Analytics Report", title_style))
    generated_time = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    elements.append(Paragraph(f"Generated on: {generated_time}", subtitle_style))
    
    # Group logs by user email
    grouped_logs = {}
    for log in logs:
        email = log.get('user_email')
        if not email:
            continue
        if email not in grouped_logs:
            grouped_logs[email] = []
        grouped_logs[email].append(log)
    
    # Sort emails to keep report consistent
    sorted_emails = sorted(grouped_logs.keys())
    
    # Executive Summary
    total_users = len(sorted_emails)
    total_actions = sum(len(ulogs) for ulogs in grouped_logs.values())
    
    summary_style = ParagraphStyle('Summary', parent=styles['Normal'], fontSize=12, spaceAfter=20)
    elements.append(Paragraph("<b>Executive Summary</b>", styles['Heading2']))
    elements.append(Paragraph(f"Total Unique Active Users: {total_users}", summary_style))
    elements.append(Paragraph(f"Total Logged Actions: {total_actions}", summary_style))
    elements.append(Spacer(1, 20))
    elements.append(PageBreak())
    
    # Build tables for each user
    for idx, email in enumerate(sorted_emails):
        u_logs = grouped_logs[email]
        u_info = user_data.get(email, {"name": "Unknown User", "id": "N/A"})
        
        name = u_info["name"]
        u_id = u_info["id"]
        
        header_text = f"{name} (ID: {u_id}) - {email}"
        elements.append(Paragraph(header_text, user_header_style))
        
        # Table Header
        table_data = [["Timestamp", "Event Type", "Page Path", "Device/Browser"]]
        
        # Sort logs chronologically for this user
        u_logs.sort(key=lambda x: x.get('created_at', ''))
        
        for log in u_logs:
            ts = log.get('created_at', '')
            if isinstance(ts, str) and len(ts) > 19:
                ts = ts[:19].replace('T', ' ')
            
            event = log.get('event_type', '')
            path = log.get('page_path', '')
            ua = log.get('user_agent', '')
            if len(ua) > 35:
                ua = ua[:32] + "..."
            
            table_data.append([str(ts), str(event), str(path), str(ua)])
            
        # Table Styling
        # Columns widths (Total width ~ 780 for landscape A4 with 30 margins)
        col_widths = [140, 160, 220, 240]
        t = Table(table_data, colWidths=col_widths, repeatRows=1)
        
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1e293b')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#334155')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
            # Alternating row colors
            * [('BACKGROUND', (0, i), (-1, i), colors.HexColor('#f8fafc')) for i in range(2, len(table_data), 2)]
        ]))
        
        elements.append(t)
        elements.append(Spacer(1, 30))
        
    doc.build(elements)
    buffer.seek(0)
    return buffer
