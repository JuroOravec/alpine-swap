import Alpine from 'alpinejs'
import './src/index.css'
import Wire from './src/index.js'

window.Alpine = Alpine

Alpine.plugin(Wire)

Alpine.start()