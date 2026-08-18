import { jsPDF } from 'jspdf';
import {
  PROFILE_INFO,
  EDUCATION_DATA,
  EXPERIENCE_DATA,
  CERTIFICATES_DATA,
  SKILLS_DATA,
  PROJECTS_DATA
} from '../data/portfolioData';

/**
 * Generates an executive, professional multi-page PDF curriculum for Mateus Araujo Santos
 */
export function generateCurriculumPdf(): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const checkPageBreak = (spaceNeeded: number) => {
    if (y + spaceNeeded > pageHeight - margin - 10) {
      doc.addPage();
      y = margin;
      drawPageHeaderDecoration();
    }
  };

  const drawPageHeaderDecoration = () => {
    // Top subtle bar
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(margin, margin - 6, contentWidth, 1.2, 'F');
    doc.setFillColor(79, 70, 229); // Indigo-600
    doc.rect(margin, margin - 6, 35, 1.2, 'F');
  };

  const drawSectionTitle = (title: string, iconSymbol = '■') => {
    checkPageBreak(16);
    y += 4;

    doc.setFillColor(241, 245, 249); // Slate-100
    doc.roundedRect(margin, y - 4, contentWidth, 7.5, 1.5, 1.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(67, 56, 202); // Indigo-700
    doc.text(`${iconSymbol}  ${title.toUpperCase()}`, margin + 3, y + 1.2);

    doc.setDrawColor(79, 70, 229);
    doc.setLineWidth(0.6);
    doc.line(margin + 2.5, y + 3.5, margin + 25, y + 3.5);

    y += 7.5;
  };

  // ================= 1. DOCUMENT HEADER =================
  // Top Accent Bar
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, pageWidth, 5, 'F');

  // Name
  y = 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(PROFILE_INFO.name, margin, y);

  // Professional Title
  y += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(79, 70, 229); // Indigo-600
  doc.text(PROFILE_INFO.title, margin, y);

  // Contact Info Line
  y += 4.8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  const contactText = `Email: ${PROFILE_INFO.email}   |   LinkedIn: ${PROFILE_INFO.linkedin}   |   GitHub: ${PROFILE_INFO.github}   |   Localização: ${PROFILE_INFO.location}`;
  doc.text(contactText, margin, y);

  // Divider
  y += 3;
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.4);
  doc.line(margin, y, margin + contentWidth, y);
  y += 3.5;

  // ================= 2. PERFIL PROFISSIONAL / RESUMO =================
  drawSectionTitle('Perfil Profissional & Síntese Executiva', '●');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.setTextColor(30, 41, 59);

  const bioLines = doc.splitTextToSize(PROFILE_INFO.bioShort, contentWidth);
  doc.text(bioLines, margin, y);
  y += bioLines.length * 4.2;

  // Highlight Box / Citação
  checkPageBreak(14);
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(79, 70, 229);
  doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.2);
  doc.setTextColor(67, 56, 202);
  const quoteText = `"${PROFILE_INFO.quote}"`;
  doc.text(quoteText, margin + 4, y + 6);
  y += 13.5;

  // ================= 3. FORMAÇÃO ACADÊMICA & PÓS-GRADUAÇÕES =================
  drawSectionTitle('Formação Acadêmica & Pós-Graduações', '◆');

  EDUCATION_DATA.forEach((edu) => {
    checkPageBreak(16);

    // Degree Title and Year
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${edu.degree}`, margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(edu.status === 'Concluído' ? 16 : 180, edu.status === 'Concluído' ? 185 : 83, edu.status === 'Concluído' ? 129 : 9);
    const statusText = `[ ${edu.year} — ${edu.status.toUpperCase()} ]`;
    const textWidth = doc.getTextWidth(statusText);
    doc.text(statusText, margin + contentWidth - textWidth, y);

    y += 3.8;

    // Institution
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.2);
    doc.setTextColor(100, 116, 139);
    doc.text(`  Instituição / Modalidade: ${edu.institution}`, margin, y);

    y += 3.8;

    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(51, 65, 85);
    const descLines = doc.splitTextToSize(`  ${edu.description}`, contentWidth - 4);
    doc.text(descLines, margin, y);
    y += descLines.length * 3.8 + 2.5;
  });

  // ================= 4. EXPERIÊNCIA PROFISSIONAL =================
  drawSectionTitle('Experiência Profissional', '▲');

  EXPERIENCE_DATA.forEach((exp) => {
    checkPageBreak(30);

    // Role & Organization
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${exp.role} — ${exp.organization}`, margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(79, 70, 229);
    const periodText = `[ ${exp.period} ]`;
    const pWidth = doc.getTextWidth(periodText);
    doc.text(periodText, margin + contentWidth - pWidth, y);

    y += 4.2;

    // Bullet descriptions
    exp.description.forEach((desc) => {
      checkPageBreak(9);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.2);
      doc.setTextColor(51, 65, 85);
      const itemLines = doc.splitTextToSize(`- ${desc}`, contentWidth - 6);
      doc.text(itemLines, margin + 3, y);
      y += itemLines.length * 3.7 + 1.2;
    });

    // Skills used tags
    checkPageBreak(7);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.8);
    doc.setTextColor(100, 116, 139);
    doc.text(`  Competências aplicadas: ${exp.skillsUsed.join('  •  ')}`, margin + 2, y);
    y += 5.5;
  });

  // ================= 5. PILARES DE COMPETÊNCIAS & HABILIDADES =================
  drawSectionTitle('Competências Principais & Domínios Técnicos', '★');

  SKILLS_DATA.forEach((cat) => {
    checkPageBreak(14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(67, 56, 202);
    doc.text(`▸ ${cat.category}:`, margin, y);
    y += 3.8;

    const skillItems = cat.skills.map((s) => `${s.name} (${s.description})`).join('; ');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const skillLines = doc.splitTextToSize(`  ${skillItems}`, contentWidth - 4);
    doc.text(skillLines, margin, y);
    y += skillLines.length * 3.6 + 2.2;
  });

  // ================= 6. CURSOS, CERTIFICAÇÕES E EDUCAÇÃO =================
  drawSectionTitle('Cursos de Capacitação & Certificações', '✓');

  CERTIFICATES_DATA.forEach((cert) => {
    checkPageBreak(7);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${cert.name}`, margin + 2, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const certDetails = `[ ${cert.issuer} | Carga: ${cert.hours || 'N/A'} | Ano: ${cert.year} — Status: ${cert.status} ]`;
    const cWidth = doc.getTextWidth(certDetails);
    doc.text(certDetails, margin + contentWidth - cWidth, y);
    y += 4.5;
  });

  // ================= 7. MATERIAIS DIDÁTICOS & PROJETOS =================
  drawSectionTitle('Materiais Didáticos & Projetos Digitais', '✦');

  checkPageBreak(12);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  const eduLines = doc.splitTextToSize(
    `Elaboração de apostilas, guias de Engenharia de Prompt, tutoriais de produtividade com ferramentas digitais (Canva, CapCut, Gmail) e desenvolvimento de soluções práticas com Inteligência Artificial.`,
    contentWidth
  );
  doc.text(eduLines, margin, y);
  y += eduLines.length * 3.8 + 2;

  PROJECTS_DATA.slice(0, 3).forEach((proj) => {
    checkPageBreak(11);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${proj.name} (${proj.category})`, margin + 2, y);
    y += 3.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const pDesc = doc.splitTextToSize(`  ${proj.tagline} — Tecnologias: ${proj.technologies.join(', ')}`, contentWidth - 4);
    doc.text(pDesc, margin, y);
    y += pDesc.length * 3.5 + 2;
  });

  // ================= PAGE NUMBERING & FOOTERS =================
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - margin + 2, margin + contentWidth, pageHeight - margin + 2);

    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    const footerLeft = `Currículo Vitae Oficial — ${PROFILE_INFO.name} (${PROFILE_INFO.headline.slice(0, 45)}...)`;
    const footerRight = `Página ${i} de ${totalPages}`;
    doc.text(footerLeft, margin, pageHeight - margin + 6.5);
    const rightWidth = doc.getTextWidth(footerRight);
    doc.text(footerRight, margin + contentWidth - rightWidth, pageHeight - margin + 6.5);
  }

  // Save the PDF
  const filename = `Curriculo_${PROFILE_INFO.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
