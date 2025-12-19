# @listing-platform/export

Export SDK for PDF generation, CSV export, and data downloads.

## Features

- **PDF Export** - Generate listing PDFs
- **CSV Export** - Export data as CSV
- **Excel Export** - Generate Excel spreadsheets
- **Report Generation** - Custom report templates
- **Bulk Export** - Export multiple items

## Usage

```tsx
import { ExportButton, useExport } from '@listing-platform/export';

// Export button component
<ExportButton format="pdf" data={listingData} filename="listing" />

// Export hook
const { exportPDF, exportCSV, isExporting } = useExport();
await exportPDF(listings, { template: 'detailed' });
```

## License

MIT
