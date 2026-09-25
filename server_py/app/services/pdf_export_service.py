import io
from datetime import datetime
import pytz
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie
from reportlab.graphics.charts.legends import Legend
from typing import List, Dict

def parse_user_agent(ua: str) -> str:
    if not ua:
        return "Unknown"
    
    ua_lower = ua.lower()
    os = "Unknown OS"
    if "windows" in ua_lower: os = "Windows"
    elif "mac os" in ua_lower or "macintosh" in ua_lower: os = "macOS"
    elif "android" in ua_lower: os = "Android"
    elif "iphone" in ua_lower or "ipad" in ua_lower: os = "iOS"
    elif "linux" in ua_lower: os = "Linux"
    
    browser = "Unknown Browser"
    if "edg" in ua_lower: browser = "Edge"
    elif "opr" in ua_lower or "opera" in ua_lower: browser = "Opera"
    elif "chrome" in ua_lower: browser = "Chrome"
    elif "firefox" in ua_lower: browser = "Firefox"
    elif "safari" in ua_lower and "chrome" not in ua_lower: browser = "Safari"
    
    if os == "Unknown OS" and browser == "Unknown Browser":
        return ua[:30] + "..." if len(ua) > 30 else ua
        
    return f"{browser} on {os}"

def generate_behavior_logs_pdf(logs: List[dict], user_data: Dict[str, dict]) -> io.BytesIO:
    """
    Generate a highly refined, structured PDF report for user behavior logs with charts.
    """
    buffer = io.BytesIO()
    
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
        spaceAfter=15,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        'ReportSubtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=25,
        alignment=1
    )
    
    user_header_style = ParagraphStyle(
        'UserHeader',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#4f46e5'),
        spaceBefore=25,
        spaceAfter=8
    )
    
    mini_summary_style = ParagraphStyle(
        'MiniSummary',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#64748b'),
        spaceAfter=15
    )
    
    cell_style = ParagraphStyle(
        'NormalCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=colors.HexColor('#334155'),
        wordWrap='CJK'
    )
    
    ist = pytz.timezone('Asia/Kolkata')
    
    # Title Page / Header
    elements.append(Paragraph("User Behavior Analytics Report", title_style))
    generated_time = datetime.now(ist).strftime("%B %d, %Y at %I:%M %p")
    elements.append(Paragraph(f"Generated on: {generated_time} (IST)", subtitle_style))
    
    # Group logs by user email and overall stats
    grouped_logs = {}
    overall_event_counts = {}
    
    for log in logs:
        email = log.get('user_email')
        evt = log.get('event_type', 'unknown')
        
        overall_event_counts[evt] = overall_event_counts.get(evt, 0) + 1
        
        if not email:
            continue
        if email not in grouped_logs:
            grouped_logs[email] = []
        grouped_logs[email].append(log)
    
    sorted_emails = sorted(grouped_logs.keys())
    
    # Executive Summary
    total_users = len(sorted_emails)
    total_actions = sum(len(ulogs) for ulogs in grouped_logs.values())
    
    summary_style = ParagraphStyle('Summary', parent=styles['Normal'], fontSize=12, spaceAfter=15)
    elements.append(Paragraph("<b>Executive Summary</b>", styles['Heading2']))
    elements.append(Paragraph(f"Total Unique Active Users: <b>{total_users}</b>", summary_style))
    elements.append(Paragraph(f"Total Logged Actions: <b>{total_actions}</b>", summary_style))
    
    # Pie Chart for overall event breakdown
    if overall_event_counts:
        d = Drawing(400, 200)
        pie = Pie()
        pie.x = 100
        pie.y = 20
        pie.width = 160
        pie.height = 160
        
        data = []
        labels = []
        for k, v in overall_event_counts.items():
            data.append(v)
            labels.append(f"{k} ({v})")
            
        pie.data = data
        pie.labels = labels
        pie.slices.strokeWidth = 0.5
        
        # Add legend
        legend = Legend()
        legend.x = 280
        legend.y = 160
        legend.dx = 8
        legend.dy = 8
        legend.fontName = 'Helvetica'
        legend.fontSize = 10
        legend.boxAnchor = 'nw'
        legend.columnMaximum = 10
        legend.strokeWidth = 1
        legend.strokeColor = colors.black
        legend.deltax = 75
        legend.deltay = 10
        legend.autoXPadding = 5
        legend.yGap = 0
        legend.dxTextSpace = 5
        legend.alignment = 'right'
        
        legend.colorNamePairs = [(pie.slices[i].fillColor, labels[i]) for i in range(len(data))]
        pie.labels = [] 
        
        d.add(pie)
        d.add(legend)
        elements.append(d)
        elements.append(Spacer(1, 20))
        
    elements.append(PageBreak())
    
    # Event Colors mapping
    event_colors = {
        'page_view': '#2563eb', # Blue
        'rage_click': '#dc2626', # Red
        'element_click': '#059669', # Green
        'page_exit': '#d97706', # Orange
    }
    
    # Build tables for each user
    for idx, email in enumerate(sorted_emails):
        u_logs = grouped_logs[email]
        u_info = user_data.get(email, {"name": "Unknown User", "id": "N/A"})
        
        name = u_info["name"]
        u_id = u_info["id"]
        
        # Calculate mini-summary
        u_counts = {}
        for l in u_logs:
            et = l.get('event_type', 'unknown')
            u_counts[et] = u_counts.get(et, 0) + 1
            
        rc = u_counts.get('rage_click', 0)
        pv = u_counts.get('page_view', 0)
        cl = u_counts.get('element_click', 0)
        
        header_text = f"{name} (ID: {u_id}) - {email}"
        elements.append(Paragraph(header_text, user_header_style))
        
        summary_text = f"<b>Total Events:</b> {len(u_logs)} &nbsp;|&nbsp; <b>Page Views:</b> {pv} &nbsp;|&nbsp; <b>Clicks:</b> {cl} &nbsp;|&nbsp; <b>Rage Clicks:</b> {rc}"
        if rc > 0:
            summary_text += f" &nbsp;|&nbsp; <font color='red'><b>Requires Attention ({rc} rage clicks)</b></font>"
            
        elements.append(Paragraph(summary_text, mini_summary_style))
        
        # Table Header
        table_data = [["Date", "Time", "Event Type", "Page Path", "Device/Browser"]]
        
        # Sort logs chronologically for this user
        u_logs.sort(key=lambda x: x.get('created_at', ''))
        
        for log in u_logs:
            ts = log.get('created_at', '')
            try:
                dt = datetime.fromisoformat(str(ts))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=pytz.utc)
                dt = dt.astimezone(ist)
                date_str = dt.strftime("%b %d, %Y")
                time_str = dt.strftime("%I:%M:%S %p")
            except Exception:
                ts_str = str(ts)[:19].replace('T', ' ')
                date_str = ts_str.split(' ')[0] if ' ' in ts_str else ts_str
                time_str = ts_str.split(' ')[1] if ' ' in ts_str else ''
            
            event = log.get('event_type', '')
            path = log.get('page_path', '')
            ua = log.get('user_agent', '')
            parsed_ua = parse_user_agent(ua)
            
            p_path = Paragraph(str(path), cell_style)
            p_ua = Paragraph(parsed_ua, cell_style)
            
            # Color event
            evt_color = event_colors.get(event, '#475569')
            p_event = Paragraph(f'<font color="{evt_color}"><b>{event}</b></font>', cell_style)
            
            table_data.append([date_str, time_str, p_event, p_path, p_ua])
            
        # Table Styling
        col_widths = [75, 75, 100, 250, 260]
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
