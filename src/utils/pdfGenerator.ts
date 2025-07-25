import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Helper function to split recommendations into sections
function splitRecommendations(markdown: string): string[] {
  // Split on markdown headers (##) followed by numbers 1-10 and a dot
  const sections = markdown.split(/(?=\n##\s*(?:[1-9]|10)\.\s+)/);
  
  if (sections.length <= 1) {
    // No numbered sections found, return the whole text as one item
    return [markdown];
  }

  // Filter out empty sections and return
  return sections.map(section => section.trim()).filter(Boolean);
}

// Convert markdown to HTML for PDF
function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/^##\s*(.+)$/gm, '<h2 style="color: #002B5C; font-size: 18px; margin: 20px 0 10px 0;">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-*]\s+(.+)$/gm, '<li style="margin: 5px 0;">$1</li>')
    .replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin: 5px 0;">$1</li>')
    .replace(/\n\n/g, '</p><p style="margin: 10px 0;">')
    .replace(/^(.+)$/gm, '<p style="margin: 10px 0;">$1</p>')
    .replace(/<p style="margin: 10px 0;"><\/p>/g, '')
    .replace(/<p style="margin: 10px 0;"><h2/g, '<h2')
    .replace(/<\/h2><\/p>/g, '</h2>')
    .replace(/<p style="margin: 10px 0;"><li/g, '<ul style="margin: 10px 0; padding-left: 20px;"><li')
    .replace(/<\/li><\/p>/g, '</li></ul>');
}

export interface PDFDownloadOptions {
  companyName: string;
  recommendations: { output_EN: string; output_TH: string };
  isThaiLanguage: boolean;
  fileName?: string;
}

export async function downloadRecommendationsAsPDF(options: PDFDownloadOptions): Promise<void> {
  const { companyName, recommendations, isThaiLanguage, fileName } = options;
  
  try {
    // Create a temporary container for the PDF content
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.color = 'black';
    tempContainer.style.padding = '40px';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    tempContainer.style.fontSize = '14px';
    tempContainer.style.lineHeight = '1.6';
    
    // Add header
    const header = document.createElement('div');
    header.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #002B5C; font-size: 28px; margin-bottom: 10px;">BBL Product Recommendations</h1>
        <h2 style="color: #004299; font-size: 20px; margin-bottom: 5px;">${companyName}</h2>
        <p style="color: #666; font-size: 14px;">Generated on ${new Date().toLocaleDateString()}</p>
      </div>
    `;
    tempContainer.appendChild(header);
    
    // Add recommendations content
    const content = document.createElement('div');
    const currentLanguage = isThaiLanguage ? recommendations.output_TH : recommendations.output_EN;
    const sections = splitRecommendations(currentLanguage);
    
    sections.forEach((section) => {
      const sectionDiv = document.createElement('div');
      sectionDiv.style.marginBottom = '30px';
      sectionDiv.style.pageBreakInside = 'avoid';
      
      sectionDiv.innerHTML = markdownToHtml(section);
      content.appendChild(sectionDiv);
    });
    
    tempContainer.appendChild(content);
    document.body.appendChild(tempContainer);
    
    // Convert to canvas and then to PDF
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    document.body.removeChild(tempContainer);
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Download the PDF
    const defaultFileName = `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_BBL_Recommendations_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName || defaultFileName);
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
} 