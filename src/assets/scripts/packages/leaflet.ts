import * as leaflet from '../deps/leaflet.js'
const L = leaflet as any

// Interfaces
interface MapModalElements {
  modalId: string
  modalContentId: string
  mapContainerId: string
  closeButtonId: string
  mapId?: string
}

interface MapIconOptions {
  iconPath?: string // İkon dosyalarının bulunduğu klasör yolu
  markerIconUrl?: string // Özel marker ikonu URL'si
  markerIconSize?: [number, number] // Marker ikonu boyutu
  markerIconAnchor?: [number, number] // Marker ikonu anchor noktası
}

interface EmbeddedMapConfig {
  containerId: string
  coordinate: string
  iconOptions?: MapIconOptions
}

interface MapLayer {
  url: string
  options: L.TileLayerOptions
  name: string
}

export enum MapLayerType {
  OpenStreetMap = 'openStreetMap',
  OpenTopoMap = 'openTopoMap',
  CycleMap = 'cycleMap',
  Satellite = 'satellite',
  DarkMatter = 'darkMatter', // Yeni
  Voyager = 'voyager', // Yeni
  Watercolor = 'watercolor', // Yeni
  Streets = 'streets', // Yeni
}

const mapLayers: { [key in MapLayerType]: MapLayer } = {
  [MapLayerType.OpenStreetMap]: {
    name: 'Open Street Map',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  [MapLayerType.OpenTopoMap]: {
    name: 'Open Topo Map',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    options: {
      maxZoom: 17,
      attribution: '© OpenTopoMap contributors',
    },
  },
  [MapLayerType.CycleMap]: {
    name: 'Cycle Map',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    options: {
      maxZoom: 20,
      attribution: '© CyclOSM contributors',
    },
  },
  [MapLayerType.Satellite]: {
    name: 'ESRI Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    options: {
      maxZoom: 19,
      attribution: '© Esri',
    },
  },
  [MapLayerType.DarkMatter]: {
    name: 'Dark Matter',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      attribution: '© CARTO',
    },
  },
  [MapLayerType.Voyager]: {
    name: 'Voyager',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      attribution: '© CARTO',
    },
  },
  [MapLayerType.Watercolor]: {
    name: 'Light',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    options: {
      maxZoom: 19,
      attribution: '© CARTO',
    },
  },
  [MapLayerType.Streets]: {
    name: 'Streets',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    options: {
      maxZoom: 19,
      attribution:
        '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team',
    },
  },
}

// Global map instances yönetimi
class MapInstanceManager {
  private static instances: Map<string, ModalMap> = new Map()

  static addInstance(id: string, instance: ModalMap): void {
    this.instances.set(id, instance)
  }

  static getInstance(id: string): ModalMap | undefined {
    return this.instances.get(id)
  }

  static refreshInstance(id: string): boolean {
    const instance = this.instances.get(id)
    if (instance) {
      instance.refreshButtons()
      return true
    }
    return false
  }
}

declare global {
  interface Window {
    RefreshMapButtons: (mapId: string) => boolean
  }
}

window.RefreshMapButtons = function (mapId: string): boolean {
  return MapInstanceManager.refreshInstance(mapId)
}

// Modal Map Class
class ModalMap {
  private modal: HTMLElement
  private container: HTMLElement
  private closeButton: HTMLElement
  private elements: MapModalElements
  private mapButtons: NodeListOf<Element>
  private map: L.Map | null = null
  private iconOptions: MapIconOptions
  private currentLayer: L.TileLayer | null = null
  private layerControl: L.Control.Layers | null = null
  private defaultLayerType: MapLayerType

  constructor(
    options: Partial<MapModalElements> = {},
    iconOptions: MapIconOptions = {},
  ) {
    const defaultElements: MapModalElements = {
      modalId: 'map-modal',
      modalContentId: 'map-modal-content',
      mapContainerId: 'map-container',
      closeButtonId: 'close-map-modal',
    }

    this.elements = { ...defaultElements, ...options }
    this.iconOptions = iconOptions

    // DOM elementlerini başlat
    this.modal = document.getElementById(this.elements.modalId)!
    this.container = document.getElementById(this.elements.mapContainerId)!
    this.closeButton = document.getElementById(this.elements.closeButtonId)!
    this.mapButtons = document.querySelectorAll('.map-ctr-button')

    // data-layer attribute'undan default layer'ı al
    this.defaultLayerType = this.getDefaultLayerType()

    if (this.elements.mapId) {
      MapInstanceManager.addInstance(this.elements.mapId, this)
    }

    // Leaflet ikonlarının yolunu ayarla
    if (this.iconOptions.iconPath) {
      L.Icon.Default.imagePath = this.iconOptions.iconPath
    }

    this.bindEvents()
    this.refreshButtons()
  }

  private getDefaultLayerType(): MapLayerType {
    const containerLayer = this.container.getAttribute('data-layer')
    console.log(containerLayer)
    switch (containerLayer) {
      case 'satellite':
        return MapLayerType.Satellite
      case 'openTopoMap':
        return MapLayerType.OpenTopoMap
      case 'cycleMap':
        return MapLayerType.CycleMap
      case 'openStreetMap':
        return MapLayerType.OpenStreetMap
      case 'darkMatter':
        return MapLayerType.DarkMatter
      case 'voyager':
        return MapLayerType.Voyager
      case 'watercolor':
        return MapLayerType.Watercolor
      case 'streets':
        return MapLayerType.Streets
      default:
        return MapLayerType.OpenStreetMap
    }
  }

  private addMapLayers(): void {
    if (!this.map) return

    const baseLayers: { [key: string]: L.TileLayer } = {}

    Object.entries(mapLayers).forEach(([layerType, layer]) => {
      const tileLayer = L.tileLayer(layer.url, layer.options)

      if (layerType === this.defaultLayerType) {
        this.currentLayer = tileLayer
        tileLayer.addTo(this.map!)
      }

      baseLayers[layer.name] = tileLayer
    })

    this.layerControl = L.control
      .layers(
        baseLayers,
        {},
        {
          position: 'topleft',
        },
      )
      .addTo(this.map)
  }

  public openMap(lat: number, lng: number): void {
    this.container.innerHTML = ''

    const mapDiv = document.createElement('div')
    mapDiv.className = 'w-full h-full'
    this.container.appendChild(mapDiv)

    try {
      this.map = L.map(mapDiv, {
        zoomControl: false,
        attributionControl: true,
      }).setView([lat, lng], 15)

      this.addMapLayers()

      if (this.map) {
        this.createCustomMarker(lat, lng).addTo(this.map)
      }

      const zoomControl = L.control.zoom({
        position: 'bottomright',
      })
      zoomControl.addTo(this.map)

      this.modal.setAttribute('data-state', 'open')
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  private createCustomMarker(lat: number, lng: number): L.Marker {
    if (this.iconOptions.markerIconUrl) {
      const customIcon = L.icon({
        iconUrl: this.iconOptions.markerIconUrl,
        iconSize: this.iconOptions.markerIconSize || [25, 41],
        iconAnchor: this.iconOptions.markerIconAnchor || [12, 41],
      })
      return L.marker([lat, lng], { icon: customIcon })
    }
    return L.marker([lat, lng])
  }

  private parseCoordinates(
    coordString: string,
  ): { lat: number; lng: number } | null {
    try {
      const [lat, lng] = coordString.split(',').map(Number)
      if (isNaN(lat) || isNaN(lng)) return null
      return { lat, lng }
    } catch {
      return null
    }
  }

  private bindEvents(): void {
    // Map button click events
    this.mapButtons.forEach(button => {
      button.addEventListener('click', e => {
        const coordStr = (e.currentTarget as HTMLElement).getAttribute(
          'data-coordinate',
        )
        if (coordStr) {
          const coordinates = this.parseCoordinates(coordStr)
          if (coordinates) {
            this.openMap(coordinates.lat, coordinates.lng)
          }
        }
      })
    })

    // Close button event
    this.closeButton.addEventListener('click', () => this.closeMap())

    // Outside click handling
    this.modal.addEventListener('click', e => {
      const content = document.getElementById(this.elements.modalContentId)
      if (content && !content.contains(e.target as Node)) {
        this.closeMap()
      }
    })

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (
        this.modal.getAttribute('data-state') === 'open' &&
        e.key === 'Escape'
      ) {
        this.closeMap()
      }
    })
  }

  private closeMap(): void {
    if (this.map) {
      if (this.layerControl) {
        this.layerControl.remove()
        this.layerControl = null
      }
      if (this.currentLayer) {
        this.currentLayer.remove()
        this.currentLayer = null
      }
      this.map.remove()
      this.map = null
    }
    this.modal.setAttribute('data-state', 'closed')
  }

  public refreshButtons(): void {
    this.mapButtons = document.querySelectorAll('.map-ctr-button')
    this.bindEvents()
  }
}

// Embedded Map Class
class EmbeddedMap {
  private container: HTMLElement
  private config: EmbeddedMapConfig
  private map: L.Map | null = null
  private currentLayer: L.TileLayer | null = null
  private layerControl: L.Control.Layers | null = null
  private defaultLayerType: MapLayerType

  constructor(containerId: string, iconOptions: MapIconOptions = {}) {
    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`)
    }
    this.container = container

    // data-layer attribute'undan default layer'ı al
    this.defaultLayerType = this.getDefaultLayerType()

    const coordinate = container.getAttribute('data-coordinate')
    if (!coordinate) {
      throw new Error(`Container must have a "data-coordinate" attribute`)
    }
    this.config = {
      containerId,
      coordinate,
      iconOptions,
    }

    if (iconOptions.iconPath) {
      L.Icon.Default.imagePath = iconOptions.iconPath
    }
    this.initialize()
  }

  private getDefaultLayerType(): MapLayerType {
    const containerLayer = this.container.getAttribute('data-layer')

    // Enum değerlerini dizi olarak al
    const validLayers = Object.values(MapLayerType)

    // Eğer containerLayer varsa ve geçerli bir değerse kullan
    if (
      containerLayer &&
      validLayers.includes(containerLayer as MapLayerType)
    ) {
      return containerLayer as MapLayerType
    }

    return MapLayerType.OpenStreetMap
  }

  private addMapLayers(): void {
    if (!this.map) return

    // Base layers objesi
    const baseLayers: { [key: string]: L.TileLayer } = {}

    // Her bir katmanı ekle
    Object.entries(mapLayers).forEach(([layerType, layer]) => {
      const tileLayer = L.tileLayer(layer.url, layer.options)

      // Eğer bu default layer ise ekle
      if (layerType === this.defaultLayerType) {
        this.currentLayer = tileLayer
        tileLayer.addTo(this.map!)
      }

      baseLayers[layer.name] = tileLayer
    })

    // Katman kontrolünü ekle
    this.layerControl = L.control
      .layers(
        baseLayers,
        {},
        {
          position: 'topright',
        },
      )
      .addTo(this.map)
  }

  private createCustomMarker(lat: number, lng: number): L.Marker {
    if (this.config.iconOptions?.markerIconUrl) {
      const customIcon = L.icon({
        iconUrl: this.config.iconOptions.markerIconUrl,
        iconSize: this.config.iconOptions.markerIconSize || [25, 41],
        iconAnchor: this.config.iconOptions.markerIconAnchor || [12, 41],
      })
      return L.marker([lat, lng], { icon: customIcon })
    }
    return L.marker([lat, lng])
  }

  private parseCoordinates(
    coordString: string,
  ): { lat: number; lng: number } | null {
    try {
      const [lat, lng] = coordString.split(',').map(Number)
      if (isNaN(lat) || isNaN(lng)) return null
      return { lat, lng }
    } catch {
      return null
    }
  }

  private initialize(): void {
    const coordinates = this.parseCoordinates(this.config.coordinate)
    if (!coordinates) return

    const mapContainer = this.container.querySelector('.map-container')
    if (!mapContainer) return

    mapContainer.innerHTML = ''

    const mapDiv = document.createElement('div')
    mapDiv.className = 'absolute inset-0 w-full h-full'
    mapContainer.appendChild(mapDiv)

    try {
      this.map = L.map(mapDiv, {
        zoomControl: false,
        attributionControl: true,
      }).setView([coordinates.lat, coordinates.lng], 14)

      // Harita katmanlarını ekle
      this.addMapLayers()

      // Özel marker'ı ekle
      if (this.map) {
        this.createCustomMarker(coordinates.lat, coordinates.lng).addTo(
          this.map,
        )
      }

      const zoomControl = L.control.zoom({
        position: 'bottomright',
      })
      zoomControl.addTo(this.map)
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  public refresh(): void {
    if (this.map) {
      if (this.layerControl) {
        this.layerControl.remove()
        this.layerControl = null
      }
      if (this.currentLayer) {
        this.currentLayer.remove()
        this.currentLayer = null
      }
      this.map.remove()
      this.map = null
    }
    this.initialize()
  }
}

export { ModalMap, EmbeddedMap, type MapModalElements, type EmbeddedMapConfig }
