export const EXCEL_TEMPLATES = [
  {
    id: 'budget_simple',
    name: 'ميزانية منزلية بسيطة',
    description: 'تتبع الدخل والمصروفات الشهرية',
    data: {
      'A1': { value: 'البند' }, 'B1': { value: 'المبلغ' },
      'A2': { value: 'الراتب' }, 'B2': { value: '5000' },
      'A3': { value: 'إيجار' }, 'B3': { value: '1500' },
      'A4': { value: 'طعام' }, 'B4': { value: '500' },
      'A5': { value: 'الإجمالي' }, 'B5': { formula: '=B2-B3-B4' }
    },
    colCount: 2,
    rowCount: 10
  },
  {
    id: 'invoice_basic',
    name: 'فاتورة مبيعات',
    description: 'فاتورة أساسية للمنتجات',
    data: {
      'A1': { value: 'المنتج' }, 'B1': { value: 'الكمية' }, 'C1': { value: 'السعر' },
      'A2': { value: 'مادة 1' }, 'B2': { value: '2' }, 'C2': { value: '100' }
    },
    colCount: 3,
    rowCount: 15
  }
];
