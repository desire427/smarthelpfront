// fichier main.js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// Import des icônes
import { OhVueIcon, addIcons } from "oh-vue-icons";
import { 
  HiPhotograph,
  HiMicrophone,
  HiUpload,
  HiDocumentText,
  HiCheck,
  HiX,
  HiClock
} from "oh-vue-icons/icons";

// Ajouter les icônes que vous voulez utiliser
addIcons(
  HiPhotograph,
  HiMicrophone,
  HiUpload,
  HiDocumentText,
  HiCheck,
  HiX,
  HiClock
);

const app = createApp(App)

// Enregistrer le composant d'icône globalement
app.component('v-icon', OhVueIcon)

app.mount('#app')