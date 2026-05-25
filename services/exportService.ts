
/**
 * Service to handle document exports.
 * Refined for high-fidelity Microsoft Word compatibility.
 */

export const exportToWord = (content: string, filename: string = 'Alpha-Layout-Export.doc') => {
  if (!content) return;

  // Split content into logical paragraphs (UI uses \n\n as separator)
  const segments = content.split(/\n\n+/).filter(p => p.trim().length > 0);

  // Microsoft Word specific CSS and structure
  // Using 'mso-margin-bottom-alt' and specific line-heights for Word consistency
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Alpha Smart Layout Export</title>
      <style>
        @page {
          size: 8.5in 11in;
          margin: 1.0in 1.0in 1.0in 1.0in;
          mso-header-margin: .5in;
          mso-footer-margin: .5in;
          mso-paper-source: 0;
        }
        body {
          font-family: 'PingFang SC', 'Microsoft YaHei', 'SimSun', 'Segoe UI', sans-serif;
          line-height: 1.8;
          color: #1A1A1A;
        }
        p {
          margin: 0;
          margin-bottom: 14pt;
          text-align: justify;
          mso-pagination: widow-orphan;
          mso-margin-top-alt: auto;
          mso-margin-bottom-alt: 14pt;
        }
        .sentence-break {
          mso-special-character: line-break;
        }
      </style>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
    </head>
    <body>
  `;

  const footer = "</body></html>";
  
  // Convert segments to HTML paragraphs. 
  // Any single \n within a segment is treated as a manual line break (common in lists/headers)
  const body = segments
    .map(p => {
      const cleanP = p.trim().replace(/\n/g, '<br class="sentence-break">');
      return `<p>${cleanP}</p>`;
    })
    .join('');

  const sourceHTML = header + body + footer;
  
  // Create a Blob from the HTML source with UTF-8 BOM for Word encoding detection
  const blob = new Blob(['\ufeff', sourceHTML], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
