import Alpine from 'alpinejs'
import './src/index.css'
import Swap from './src/index.js'

window.Alpine = Alpine

Alpine.plugin(Swap)

Alpine.start()