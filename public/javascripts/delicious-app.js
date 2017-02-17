import '../sass/style.scss';

import { $, $$ } from './modules/bling';
import makeMap from './modules/map';
import autocomplete from './modules/autocomplete';
import ajaxHeart from './modules/heart';
import typeAhead from './modules/typeAhead';

autocomplete($('#address-name'), $('#lat'), $('#lng'));
makeMap($('#map'));

const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);

const search = $('.search');
typeAhead(search);
