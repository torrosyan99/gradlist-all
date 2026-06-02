import 'swiper/css';
import 'swiper/css/navigation';

import './main.css'


import './assets/scripts/components/modal.js'
import './assets/scripts/components/select.js'
import './assets/scripts/components/tabs.js'
import './assets/scripts/components/dropdown.js'
import './assets/scripts/components/profile-menu.js'
import './assets/scripts/components/phone-input.js'


import { initHomePage } from './assets/scripts/pages/home.js';
import {initProductPage} from "./assets/scripts/pages/product.js";
import {initMessagesPage} from "./assets/scripts/pages/messages.js";

if (document.body.classList.contains('page-home')) initHomePage();
if (document.body.classList.contains('page-product')) initProductPage();
if (document.body.classList.contains('page-messages')) initMessagesPage();
