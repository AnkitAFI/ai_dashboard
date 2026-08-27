import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

class AmazonAdsPDFService:
    @staticmethod
    def generate_executive_report(
        user_name: str, 
        profile_id: str, 
        date_range_str: str,
        campaigns_data: list,
        search_terms_data: list,
        placements_data: list,
        keywords_data: list,
        ai_savings_count: int
    ) -> bytes:
        
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=letter,
            rightMargin=inch,
            leftMargin=inch,
            topMargin=inch,
            bottomMargin=inch
        )
        
        styles = getSampleStyleSheet()
        title_style = styles['Title']
        heading_style = styles['Heading2']
        normal_style = styles['Normal']
        
        # Custom styles
        hero_style = ParagraphStyle(
            'Hero',
            parent=styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor("#0f172a"),
            backColor=colors.HexColor("#f8fafc"),
            spaceBefore=10,
            spaceAfter=10,
            borderPadding=10,
            borderColor=colors.HexColor("#e2e8f0"),
            borderWidth=1
        )
        
        elements = []
        
        # Header / Title
        elements.append(Paragraph(f"<b>Insydz</b> Enterprise Executive Report", title_style))
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(Paragraph(f"<b>Seller Name:</b> {user_name}", normal_style))
        elements.append(Paragraph(f"<b>Profile ID:</b> {profile_id}", normal_style))
        elements.append(Paragraph(f"<b>Date Range:</b> {date_range_str}", normal_style))
        elements.append(Paragraph(f"<b>Generated On:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style))
        elements.append(Spacer(1, 0.5 * inch))
        
        # 1. AI Savings (Hero Section)
        elements.append(Paragraph("🤖 AI Automation Impact", heading_style))
        if ai_savings_count > 0:
            savings_text = f"This month, the Insydz AI automatically intervened <b>{ai_savings_count}</b> times to negate bleeding search terms, optimize bids, and manage automation rules. This automated management has effectively stopped wasted ad spend while you sleep."
        else:
            savings_text = "The AI actively monitored your account this period. Turn on more automation rules to maximize savings!"
        elements.append(Paragraph(savings_text, hero_style))
        elements.append(Spacer(1, 0.4 * inch))
        
        # 2. Campaigns Overview
        elements.append(Paragraph("📊 Campaigns Overview (Top 10 by Spend)", heading_style))
        if campaigns_data:
            c_data = [["Campaign Name", "Status", "Spend (₹)", "Sales (₹)", "ACOS (%)"]]
            # Sort by spend descending
            campaigns_data.sort(key=lambda x: float(x.get('spend', 0) or 0), reverse=True)
            for c in campaigns_data[:10]:
                spend = float(c.get('spend') or 0)
                sales = float(c.get('sales') or 0)
                acos = (spend / sales * 100) if sales > 0 else 0
                
                c_data.append([
                    c.get("campaign_name", "Unknown")[:30], 
                    c.get("state", "N/A"), 
                    f"₹{spend:.2f}", 
                    f"₹{sales:.2f}", 
                    f"{acos:.1f}%"
                ])
            
            c_table = Table(c_data, colWidths=[2.5*inch, 1*inch, 1*inch, 1*inch, 1*inch])
            c_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#3b82f6")),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#f8fafc")),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0"))
            ]))
            elements.append(c_table)
        else:
            elements.append(Paragraph("No campaign data found for this period.", normal_style))
        elements.append(Spacer(1, 0.4 * inch))

        # 3. Placements
        elements.append(Paragraph("🎯 Placements Performance", heading_style))
        if placements_data:
            p_data = [["Placement", "Spend (₹)", "Sales (₹)", "Clicks", "ACOS (%)"]]
            placements_data.sort(key=lambda x: float(x.get('spend', 0) or 0), reverse=True)
            for p in placements_data[:5]:
                spend = float(p.get('spend') or 0)
                sales = float(p.get('sales') or 0)
                acos = (spend / sales * 100) if sales > 0 else 0
                
                p_data.append([
                    p.get("placement", "Unknown")[:30], 
                    f"₹{spend:.2f}", 
                    f"₹{sales:.2f}", 
                    str(p.get('clicks', 0)), 
                    f"{acos:.1f}%"
                ])
            
            p_table = Table(p_data, colWidths=[2.5*inch, 1*inch, 1*inch, 1*inch, 1*inch])
            p_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#10b981")),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#f8fafc")),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0"))
            ]))
            elements.append(p_table)
        else:
            elements.append(Paragraph("No placement data found for this period.", normal_style))
        elements.append(Spacer(1, 0.4 * inch))
        
        # 4. Search Terms (Harvesting)
        elements.append(Paragraph("🔍 Search Terms Harvesting (Top 10 by Spend)", heading_style))
        if search_terms_data:
            s_data = [["Search Term", "Spend (₹)", "Sales (₹)", "Clicks", "ACOS (%)"]]
            search_terms_data.sort(key=lambda x: float(x.get('spend', 0) or 0), reverse=True)
            for s in search_terms_data[:10]:
                spend = float(s.get('spend') or 0)
                sales = float(s.get('sales') or 0)
                acos = (spend / sales * 100) if sales > 0 else 0
                
                s_data.append([
                    s.get("search_term", "Unknown")[:30], 
                    f"₹{spend:.2f}", 
                    f"₹{sales:.2f}", 
                    str(s.get('clicks', 0)), 
                    f"{acos:.1f}%"
                ])
            
            s_table = Table(s_data, colWidths=[2.5*inch, 1*inch, 1*inch, 1*inch, 1*inch])
            s_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#8b5cf6")),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#f8fafc")),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0"))
            ]))
            elements.append(s_table)
        else:
            elements.append(Paragraph("No search term data found for this period.", normal_style))
        elements.append(Spacer(1, 0.4 * inch))

        # 5. Keywords
        elements.append(Paragraph("🏷️ Keywords Performance (Top 10 by Spend)", heading_style))
        if keywords_data:
            k_data = [["Keyword", "Match Type", "Spend (₹)", "Sales (₹)", "ACOS (%)"]]
            keywords_data.sort(key=lambda x: float(x.get('spend', 0) or 0), reverse=True)
            for k in keywords_data[:10]:
                spend = float(k.get('spend') or 0)
                sales = float(k.get('sales') or 0)
                acos = (spend / sales * 100) if sales > 0 else 0
                
                k_data.append([
                    k.get("keyword_text", "Unknown")[:30], 
                    k.get("match_type", "N/A"), 
                    f"₹{spend:.2f}", 
                    f"₹{sales:.2f}", 
                    f"{acos:.1f}%"
                ])
            
            k_table = Table(k_data, colWidths=[2.5*inch, 1*inch, 1*inch, 1*inch, 1*inch])
            k_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f59e0b")),
                ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0,0), (-1,0), 12),
                ('BACKGROUND', (0,1), (-1,-1), colors.HexColor("#f8fafc")),
                ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0"))
            ]))
            elements.append(k_table)
        else:
            elements.append(Paragraph("No keyword data found for this period.", normal_style))
        
        # Build document
        doc.build(elements)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
