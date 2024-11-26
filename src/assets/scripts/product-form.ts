import { DatePicker } from './packages/date-picker.js'
import type { LanguageConfig } from './packages/date-picker.js'

document.addEventListener('DOMContentLoaded', () => {
  new DatePicker({
    input: {
      type: 'two',
      elements: {
        start: {
          id: 'departure-date',
          focusContainer: 'departure-container',
        },
        end: {
          id: 'return-date',
          focusContainer: 'return-container',
        },
      },
    },
    elements: {
      container: 'date-picker-container',
      monthContainer: 'date-picker-current-month-name',
      daysContainer: 'date-picker-days',
      buttons: {
        prev: 'prev-month-btn',
        next: 'next-month-btn',
        reset: 'reset-to-today-btn',
        resetAll: 'reset-all-btn',
      },
    },
    minDate: new Date(),
    maxDate: new Date(8640000000000000),
    autoClose: true,
    autoSwitchInput: true,
    output: {
      order: ['day', 'month', 'year'],
      slash: '.',
      between: ' & ',
    },
    language: [turkishLanguage, englishLanguage, arabicLanguage],
  })
})

const turkishLanguage: LanguageConfig = {
  language: 'tr',
  monthNames: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  dayNames: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
}

const arabicLanguage: LanguageConfig = {
  language: 'sa',
  monthNames: [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
  dayNames: ['إثن', 'ثلا', 'أرع', 'خمي', 'جمع', 'سبت', 'الأحد'],
}

const englishLanguage: LanguageConfig = {
  language: 'en',
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}
