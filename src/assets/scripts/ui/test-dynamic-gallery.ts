// Veri tipleri için interface'ler
import { createIcons, icons } from '../deps/lucide-icons.js'

interface Room {
  src: string
  alt: string
}

interface BedroomInfo {
  title: string
  bedrooms: string[]
  price: string
  originalPrice: string
}

interface DataSet {
  images: Room[]
  rows: BedroomInfo[]
}

interface TestData {
  set1: DataSet
  set2: DataSet
  [key: string]: DataSet // İndeks imzası
}

// Test verisi
const testData: TestData = {
  set1: {
    images: [
      {
        src: 'https://images.project-test.info/1.webp',
        alt: "Dubai'de Balayı Tatili 1",
      },
      {
        src: 'https://images.project-test.info/2.webp',
        alt: "Dubai'de Balayı Tatili 2",
      },
      {
        src: 'https://images.project-test.info/3.webp',
        alt: "Dubai'de Balayı Tatili 3",
      },
      {
        src: 'https://images.project-test.info/4.webp',
        alt: "Dubai'de Balayı Tatili 4",
      },
    ],
    rows: [
      {
        title: 'Deluxe 2 Yataklı Daire',
        bedrooms: [
          'Yatak Odası 1: 2 tek kişilik yatak',
          'Yatak Odası 2: 1 ekstra büyük çift kişilik yatak',
        ],
        price: '1300',
        originalPrice: '1500',
      },
      {
        title: 'Premium 2 Yataklı Daire',
        bedrooms: [
          'Yatak Odası 1: 1 çift kişilik yatak',
          'Yatak Odası 2: 2 tek kişilik yatak',
        ],
        price: '1500',
        originalPrice: '1800',
      },
      {
        title: 'Deluxe Plus Daire',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 1 çift kişilik yatak',
        ],
        price: '1800',
        originalPrice: '2200',
      },
      {
        title: 'Executive Daire',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 2 tek kişilik yatak',
        ],
        price: '2000',
        originalPrice: '2400',
      },
    ],
  },
  set2: {
    images: [
      {
        src: 'https://images.project-test.info/5.webp',
        alt: "Dubai'de Balayı Tatili 5",
      },
      {
        src: 'https://images.project-test.info/6.webp',
        alt: "Dubai'de Balayı Tatili 6",
      },
      {
        src: 'https://images.project-test.info/7.webp',
        alt: "Dubai'de Balayı Tatili 7",
      },
      {
        src: 'https://images.project-test.info/8.webp',
        alt: "Dubai'de Balayı Tatili 8",
      },
    ],
    rows: [
      {
        title: 'Suit Daire',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 1 çift kişilik yatak',
        ],
        price: '2000',
        originalPrice: '2500',
      },
      {
        title: 'Aile Suiti',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 2 tek kişilik yatak',
          'Yatak Odası 3: 1 çift kişilik yatak',
        ],
        price: '2800',
        originalPrice: '3500',
      },
      {
        title: 'Penthouse Daire',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 1 queen size yatak',
        ],
        price: '3500',
        originalPrice: '4000',
      },
      {
        title: 'Royal Suite',
        bedrooms: [
          'Yatak Odası 1: 1 king size yatak',
          'Yatak Odası 2: 1 queen size yatak',
          'Yatak Odası 3: 2 tek kişilik yatak',
        ],
        price: '4000',
        originalPrice: '5000',
      },
    ],
  },
}

// Global değişkenler
let currentSet: keyof TestData = 'set1'

// Tablo satırı oluşturma fonksiyonu
function createTableRow(rowData: BedroomInfo): string {
  return `
    <tr class="border-b border-gray-200 hover:bg-gray-50">
      <!-- Daire Tipi -->
      <td class="translate-y-[-0.25rem] border-r border-gray-200 px-3.5 py-2">
        <div class="space-y-2">
          <button class="dynamic-gallery-button flex items-center gap-2 font-semibold text-primary-600 underline">
            <i data-lucide="image" class="size-4"></i>
            <span>${rowData.title}</span>
          </button>
          <div class="space-y-1 text-sm text-gray-600">
            ${rowData.bedrooms.map(room => `<p>${room}</p>`).join('')}
            <p class="text-gray-500">Ücretsiz bebek karyolası talep üzerine mevcuttur</p>
          </div>
        </div>
      </td>

      <!-- Konuk Sayısı -->
      <td class="border-r border-gray-200 px-4 py-2.5 align-top">
        <div class="flex gap-1">
          ${Array(4).fill('<i data-lucide="user" class="size-5 text-gray-600"></i>').join('')}
        </div>
      </td>

      <!-- Fiyatlar -->
      <td class="border-r border-gray-200 px-3.5 py-2.5 align-top">
        <div class="flex flex-shrink-0 flex-col">
          <span class="text-xs font-semibold text-lime-600">%25 İndirim</span>
          <div class="flex items-center gap-2">
            <span class="text-xs font-medium text-gray-500 line-through">${rowData.originalPrice} AED</span>
            <span class="text-lg font-semibold text-primary-500">${rowData.price} AED</span>
          </div>
        </div>
      </td>

      <!-- Özellikleriniz -->
      <td class="border-r border-gray-200 px-3.5 py-2.5 align-top">
        <div class="space-y-2">
          <!-- Avantajlar -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <i data-lucide="check" class="size-5 text-lime-600"></i>
              <span class="text-sm">Dahili park yeri</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="check" class="size-5 text-lime-600"></i>
              <span class="text-sm">Yüksek hızlı internet</span>
            </div>
          </div>

          <!-- Önemli Bilgiler -->
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <i data-lucide="info" class="size-5 text-primary-500"></i>
              <span class="text-sm text-gray-600">İade edilemez</span>
            </div>
            <div class="flex items-center gap-2">
              <i data-lucide="info" class="size-5 text-blue-500"></i>
              <span class="text-sm text-gray-600">Varıştan önce tesiste ödeme yapın</span>
            </div>
          </div>
        </div>
      </td>

      <!-- Daire Seç -->
      <td class="px-3.5 py-2.5 align-top">
        <div class="flex justify-end">
          <div class="inline-flex items-center">
            <button class="rounded-l bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-700 active:scale-95">
              Seç ve Devam Et
            </button>
            <div class="relative flex h-10 w-12 items-center justify-between rounded-r border-b border-r border-t border-gray-200">
              <select class="h-full w-full appearance-none bg-transparent pl-2.5 pr-1 focus:outline-none focus:ring-0">
                <option>0</option>
                <option>1</option>
                <option>2</option>
              </select>
              <i data-lucide="chevron-down" class="pointer-events-none absolute right-1.5 top-[50%] size-4 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
        </div>
      </td>
    </tr>
  `
}

// İçerik güncelleme fonksiyonu
function updateContent(): void {
  // Görsel gruplarını güncelle
  const container = document.getElementById('multi-gallery-images-container')
  if (container) {
    const newSet = testData[currentSet]
    const galleryHTML = newSet.images
      .map(
        img => `
        <ul class="dynamic-gallery">
          <img
            data-src="${img.src}"
            src="/assets/images/gray-placeholder.webp"
            alt="${img.alt}"
            class="dynamic-gallery-item"
          />
        </ul>
      `,
      )
      .join('')

    container.innerHTML = galleryHTML
  }

  // Tablo içeriğini güncelle
  const tableBody = document.querySelector('#otel-price-table tbody')
  if (tableBody) {
    tableBody.innerHTML = testData[currentSet].rows
      .map(row => createTableRow(row))
      .join('')
  }

  // Lucide ikonlarını yeniden initialize et
  if ((window as any).lucide) {
    ;(window as any).lucide.createIcons()
  }

  // Set'i değiştir
  currentSet = currentSet === 'set1' ? 'set2' : 'set1'

  console.log('Content updated to:', currentSet)

  createIcons({ icons: { ...icons } })
}

// Klavye event listener'ı
document.addEventListener('keydown', (event: KeyboardEvent) => {
  if (event.key.toLowerCase() === 't') {
    updateContent()
  }
})
