import {initSelects} from '../components/select.js';

// Страница "Создание объявления", построенная на схемах (data-driven).
//
// Поток:
// 1) Пользователь выбирает "Раздел" (селект из add.html).
// 2) Мы рендерим следующий шаг(и) (категория/подкатегория) в [data-add-dynamic].
// 3) Когда выбор доходит до листа в ADD_TREE, становится доступна кнопка "Выбрать".
// 4) По клику "Выбрать" строим форму по схеме из FORM_SCHEMAS и рендерим в [data-add-builder].
//
// Примечания:
// - Это прототип UI: отправки/сохранения формы здесь нет, только отрисовка.
// - Значения кладем в hidden inputs, чтобы использовать существующий компонент select.

function escapeHtml(value) {
  // Защитное экранирование строк, которые вставляются в HTML через шаблонные строки.
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderSelect({
                        name,
                        placeholder,
                        options,
                        withIcon = false,
                        selectedValue = '',
                        extraAttrs = '',
                      }) {
  // Рендерит разметку, совместимую с components/select.js и событием "select:change".
  const selectClass = withIcon ? 'select select--with-icon' : 'select';

  const iconMarkup = withIcon
    ? `
      <svg class="select__icon" width="20" height="20">
        <use xlink:href=""></use>
      </svg>
    `
    : '';

  const selected = selectedValue ? options.find((o) => o.value === selectedValue) : null;
  const triggerText = selected?.label ?? (placeholder ?? '');
  const hiddenValue = selected?.value ?? '';

  const optionsMarkup = options.map((opt) => {
    const icon = opt.iconValue
      ? `
        <svg width="20" height="20">
          <use xlink:href="/icons.svg#${escapeHtml(opt.iconValue)}"></use>
        </svg>
      `
      : '';

    const iconData = opt.iconValue ? ` data-icon-value="${escapeHtml(opt.iconValue)}"` : '';

    return `
      <button class="select__option" data-value="${escapeHtml(opt.value)}"${iconData} type="button">
        ${icon}${escapeHtml(opt.label)}
      </button>
    `;
  }).join('');

  return `
    <div class="${selectClass}" data-add-select="${escapeHtml(name)}" ${extraAttrs}>
      <button class="select__trigger" type="button">
        ${iconMarkup}
        <span>${escapeHtml(triggerText)}</span>
        <svg width="24" height="24">
          <use xlink:href="/icons.svg#arrow-bottom"></use>
        </svg>
      </button>
      <div class="select__dropdown custom-scroll">
        ${optionsMarkup}
      </div>
      <input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(hiddenValue)}">
    </div>
  `;
}


function normalizeCarAutoNewSchema() {
  // Собираем схему "без пробега" на базе схемы "с пробегом".
  // Храним одну основную схему (used) и получаем new, удаляя поле пробега.
  // Если car_auto_new уже задан явно в FORM_SCHEMAS, не перетираем его.
  if (FORM_SCHEMAS.car_auto_new) return;
  const used = FORM_SCHEMAS.car_auto_used;
  const cloned = JSON.parse(JSON.stringify(used));
  cloned.title = 'Автомобили (без пробега)';
  const productSection = cloned.sections.find((s) => s.title === 'Информация о товаре');
  if (productSection) {
    productSection.fields = productSection.fields.filter((f) => f.name !== 'mileage');
  }
  FORM_SCHEMAS.car_auto_new = cloned;
}

function renderField(field) {
  // Рендер одного поля из схем FORM_SCHEMAS[*].sections[*].fields[*].
  const label = field.label ? `<h5 class="title title--semibold h-18 add__item-title">
${escapeHtml(field.label)}</h5>` : '';
  const isRequiredByStar = typeof field.label === 'string' && field.label.includes('*');
  const isRequired = field.required === true || isRequiredByStar;
  const requiredAttr = isRequired ? ' data-add-required="true"' : '';

  if (field.type === 'input') {
    const inputMode = field.inputMode ? ` inputmode="${escapeHtml(field.inputMode)}"` : '';
    return `
      <div class="add__field">
        ${label}
        <input class="input" name="${escapeHtml(field.name)}" placeholder="${escapeHtml(
      field.placeholder ?? '')}"${inputMode}${requiredAttr}>
      </div>
    `;
  }

  if (field.type === 'textarea') {
    return `
      <div class="add__field add__field--full">
        ${label}
        <textarea class="add__textarea" name="${escapeHtml(field.name)}"${requiredAttr} placeholder="${escapeHtml(
      field.placeholder ?? '')}"></textarea>
      </div>
    `;
  }

  if (field.type === 'select') {
    const selectRequiredAttr = isRequired ? 'data-add-required="true"' : '';
    const selectHtml = renderSelect({
      name: field.name,
      placeholder: field.placeholder ?? '',
      options: field.options ?? [],
      extraAttrs: selectRequiredAttr,
    });

    return `
      <div class="add__field">
        ${label}
        ${selectHtml}
      </div>
    `;
  }

  if (field.type === 'segmented') {
    const opts = field.options ?? [];
    const buttons = opts.map((o, i) => {
      return `
 
        <label class="add__segmented-label radio-input">
<input class="add__radio-input" 
type="radio" 
value="${escapeHtml(o.label)}" ${i === 0 ? 'selected' : ''} name="${escapeHtml(field.name)}">
<span> ${escapeHtml(o.label)}</span>
</label>
      `;
    }).join('');

    return `
      <div class="add__field">
        ${label}
        <div class="add__segmented" data-add-segmented="${escapeHtml(field.name)}">
          ${buttons}
        </div>
      </div>
    `;
  }

  if (field.type === 'checkboxes') {
    const options = field.options ?? [];
    const items = options.map((text, idx) => {
      const id = `${field.name}-${idx}`;
      return `
        <label class="checkbox add__checkbox">
          <input type="checkbox" 
          name="${escapeHtml(field.name)}" value="${escapeHtml(text)}" id="${escapeHtml(id)}">
          <span class="checkbox__box"></span>
          <span class="checkbox__text">${escapeHtml(text)}</span>
        </label>
      `;
    }).join('');

    return `
      <div class="add__field add__field--full">
        ${label ? label :
      `<h5 class="title title--semibold h-18 add__item-title">${escapeHtml(field.label ?? '')}</h5>`}
        <div class="add__checkboxes">
          ${items}
        </div>
      </div>
    `;
  }

  if (field.type === 'map') {
    const chips =
      (field.chips ?? []).map((chip) => `<button class="add__chip" type="button">
${escapeHtml(chip)}</button>`).join('');

    return `
      <div class="add__field add__field--full" data-add-map>
        ${label}
        <input class="input" name="${escapeHtml(field.name)}" placeholder="${escapeHtml(field.placeholder ?? '')}"${requiredAttr}>
        ${chips ? `<div class="add__chips">${chips}</div>` : ''}
        <div class="add__map">
          <img class="add__map-img" src="${escapeHtml(field.imageSrc ?? '')}" alt="Карта">
        </div>
      </div>
    `;
  }

  if (field.type === 'photos') {
    const max = typeof field.max === 'number' ? field.max : 10;
    const accept = field.accept ?? 'image/*';
    return `
      <div class="add__field add__field--full">
        <div class="add__photos" data-add-photos data-add-photos-max="${escapeHtml(max)}">
          <input class="add__photos-input" type="file" accept="${escapeHtml(accept)}" ${field.multiple === false ? '' :
      'multiple'} hidden>
          <button class="add__photo add__photo--add" type="button" aria-label="Добавить фото" data-add-photos-add>
            <svg width="48" height="48">
              <use xlink:href="/icons.svg#add-plus"></use>
            </svg>
          </button>
        </div>
      </div>
    `;
  }

  if (field.type === 'actions') {
    return `
      <div class="add__field add__field--full">
        <div class="add__actions">
          <button class="button " type="button">Опубликовать</button>
          <button class="button  button--secondary" type="button">Сохранить в черновик</button>
        </div>
        <label class="checkbox add__agree">
          <input type="checkbox" name="agree" value="yes">
          <span class="checkbox__box"></span>
          <span class="checkbox__text">Ваше согласие с правилами публикации</span>
        </label>
      </div>
    `;
  }

  return '';
}

function renderSegmentedInner(field) {
  // Общий рендер segmented-контрола для случаев, когда нужен кастомный layout (пара в одной строке).
  const label = field.label ? `<h5 class="title title--semibold h-18 add__item-title">${escapeHtml(field.label)}</h5>` :
    '';
  const opts = field.options ?? [];
  const defaultValue = field.defaultValue ?? (opts[0]?.value ?? '');
  const buttons = opts.map((o) => {
    return `
      <label class="add__segmented-label radio-input">
          <input class="add__radio-input" type="radio" value="${escapeHtml(o.label)}" name="${escapeHtml(field.name)}">
           <span>${escapeHtml(o.label)}</span>
      </label>
    `;
  }).join('');

  return `
    ${label}
    <div class="add__segmented" data-add-segmented="${escapeHtml(field.name)}">
      ${buttons}
      <input type="hidden" name="${escapeHtml(field.name)}" value="${escapeHtml(defaultValue)}">
    </div>
  `;
}

function renderSegmentedPair(a, b) {
  // Требование макета: два подряд segmented должны стоять рядом в одной строке.
  return `
    <div class="add__field add__segmented-pair add__field--full">
      <div class="add__segmented-pair-item">
        ${renderSegmentedInner(a)}
      </div>
      <div class="add__segmented-pair-item">
        ${renderSegmentedInner(b)}
      </div>
    </div>
  `;
}

function renderSegmentedRow(fields) {
  // Любое количество подряд идущих segmented объединяем в один ряд (full width).
  const items = (fields ?? []).map((f) => {
    return `
      <div class="add__segmented-row-item">
        ${renderSegmentedInner(f)}
      </div>
    `;
  }).join('');

  return `
    <div class="add__field add__segmented-row add__field--full">
      ${items}
    </div>
  `;
}

function renderSchema(schema) {
  const sectionsHtml = (schema.sections ?? []).map((section) => {
    const note = section.requiredNote ? `<div class="add__required-note">${escapeHtml(section.requiredNote)}</div>` :
      '';
    const list = section.fields ?? [];
    const rendered = [];

    for (let i = 0; i < list.length; i++) {
      const f = list[i];
      const next = list[i + 1];

      // Два подряд segmented объединяем в один блок (как в дизайне: "Был ли ДТП?" + "Автомобиль на ходу?").
      if (f?.type === 'segmented') {
        let j = i;
        while (j < list.length && list[j]?.type === 'segmented') j += 1;
        const runLen = j - i;

        if (runLen >= 2) {
          rendered.push(renderSegmentedRow(list.slice(i, j)));
          i = j - 1;
          continue;
        }
      }

      rendered.push(renderField(f));
    }

    const fields = rendered.join('');

    // Некоторые типы полей сами содержат сетки/блоки и должны занимать всю ширину.
    const gridClass = (section.fields ?? []).some(
      (f) => f.type === 'map' || f.type === 'checkboxes' || f.type === 'photos' || f.type === 'actions' || f.type ===
        'textarea')
      ? 'add__grid add__grid--mixed'
      : 'add__grid';

    return `
      <div class="add__block">
        <div class="add__section-header">
          <h3 class="add__section-title">${escapeHtml(section.title)}</h3>
          ${note}
        </div>
        <div class="${gridClass}">
          ${fields}
        </div>
      </div>
    `;
  }).join('');

  return `
    <form class="add__form" data-add-form>
      ${sectionsHtml}
    </form>
  `;
}

function getNodePath(state) {
  // Превращает текущий выбор (section + произвольная глубина state.path) в ключ схемы формы (если дошли до листа).
  const section = state.section && ADD_TREE[state.section];
  if (!section) return null;

  let node = section;
  const keys = Array.isArray(state.path) ? state.path : [];

  for (const key of keys) {
    if (!key) break;
    node = node?.children?.[key];
    if (!node) return {section, node: null, leaf: null};
  }

  const form = node?.form ?? null;
  return {section, node, leaf: form ? {form} : null};
}

function initPhotos(root) {
  // Простой UI для фотографий:
  // - Берет файлы из <input type="file"> и добавляет превью в сетку.
  // - Ограничивает количество по [data-add-photos-max].
  root.querySelectorAll('[data-add-photos]').forEach((photosRoot) => {
    if (photosRoot.dataset.addPhotosInitialized === 'true') return;
    photosRoot.dataset.addPhotosInitialized = 'true';

    const input = photosRoot.querySelector('.add__photos-input');
    const addBtn = photosRoot.querySelector('[data-add-photos-add]');
    if (!input || !addBtn) return;

    const max = Number(photosRoot.dataset.addPhotosMax || '10') || 10;

    function countItems() {
      return photosRoot.querySelectorAll('[data-add-photo-item]').length;
    }

    function syncAddVisibility() {
      const c = countItems();
      addBtn.hidden = c >= max;
    }

    function addFiles(fileList) {
      const files = Array.from(fileList || []).slice(0, Math.max(0, max - countItems()));
      files.forEach((file) => {
        const url = URL.createObjectURL(file);

        const item = document.createElement('div');
        item.className = 'add__photo add__photo--item';
        item.dataset.addPhotoItem = 'true';

        item.innerHTML = `
          <img src="${escapeHtml(url)}" alt="Фото">
          <button class="add__photo-remove" type="button" aria-label="Удалить фото" data-add-photo-remove>
            <svg width="18" height="18" style="--icon-color: #ffffff;">
              <use xlink:href="/icons.svg#close"></use>
            </svg>
          </button>
        `;

        // Сохраняем File на DOM-элементе, чтобы при отправке формы можно было собрать список.
        item._file = file;
        item._objectUrl = url;

        photosRoot.insertBefore(item, addBtn);
      });

      syncAddVisibility();
    }

    addBtn.addEventListener('click', () => {
      input.click();
    });

    input.addEventListener('change', () => {
      addFiles(input.files);
      // Разрешаем выбрать тот же файл снова после удаления.
      input.value = '';
    });

    photosRoot.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-add-photo-remove]');
      if (!removeBtn) return;

      const item = removeBtn.closest('[data-add-photo-item]');
      if (!item) return;

      if (item._objectUrl) URL.revokeObjectURL(item._objectUrl);
      item.remove();
      syncAddVisibility();
    });

    syncAddVisibility();
  });
}

function initMapChips(root) {
  root.querySelectorAll('[data-add-map]').forEach((mapBlock) => {
    const input = mapBlock.querySelector('input');
    if (!input) return;

    mapBlock.addEventListener('click', (e) => {
      const chip = e.target.closest('.add__chip');
      if (!chip) return;

      input.value = chip.textContent.trim();

      input.dispatchEvent(new Event('input', {bubbles: true}));
      input.dispatchEvent(new Event('change', {bubbles: true}));
    });
  });
}

const ADD_TREE = {
  car: {
    label: 'Транспорт',
    children: {
      automobiles: {
        label: 'Автомобили',
        children: {
          used: {
            label: 'С пробегом',  form: 'car_auto_used'
          },
          new: {
            label: 'Без пробега', form: 'car_auto_new',
          },
        },
      },

    },
  },
  estate: {
    label: 'Недвижимость',
    children: {
      rent: {label: 'Квартиры', children: {
        secondary: {
          label: 'Вторичка', form: 'estate_rent_secondary',
        }
        }},
    },
  },

};

const FORM_SCHEMAS = {
  car_auto_used: {
    title: 'Автомобили (с пробегом)',
    sections: [
      {
        title: 'Общая информация',
        requiredNote: '*обязательные к заполнению поля',
        fields: [
          {type: 'input', label: 'Заголовок*', name: 'title', placeholder: 'Название объявления'},
          {
            type: 'select',
            label: 'Срок публикации*',
            name: 'publish_term',
            placeholder: 'Выберите срок',
            options: [
              {value: '1w', label: '1 неделя'},
              {value: '2w', label: '2 недели'},
              {value: '1m', label: '1 месяц'},
            ],
          },
          {type: 'input', label: 'Цена, руб*', name: 'price', placeholder: '1 000 000', inputMode: 'numeric'},
          {
            type: 'select',
            label: 'Регион*',
            name: 'region',
            placeholder: 'Выберите регион',
            options: [
              {value: 'ru_all', label: 'Вся Россия'},
              {value: 'ru_msk', label: 'Москва'},
              {value: 'ru_spb', label: 'Санкт-Петербург'},
            ],
          },
          {
            type: 'map',
            label: 'Адрес, где находится товар*',
            name: 'address',
            placeholder: 'Введите адрес',
            chips: [
              'Россия, г. Копейск, Калинина ул., д. 1 кв.98',
              'Россия, г. Чита, Набережная ул., д. 10 кв.74',
            ],
            imageSrc: '/images/map.png',
          },
        ],
      },
      {
        title: 'Информация о товаре',
        fields: [
          {
            type: 'select', label: 'Марка авто*', name: 'brand',
            placeholder: 'Выберите',
            options:
              [
                {value: 'lada', label: 'LADA'},
                {value: 'toyota', label: 'Toyota'}
              ]
          },
          {type: 'input', label: 'Год выпуска', name: 'year', placeholder: '2026', inputMode: 'numeric'},
          {
            type: 'select',
            label: 'Тип кузова',
            name: 'body',
            placeholder: 'Выберите',
            options: [{value: 'sedan', label: 'Седан'}, {value: 'suv', label: 'Внедорожник'}]
          },
          {type: 'input', label: 'Количество дверей', name: 'doors', placeholder: '3', inputMode: 'numeric'},
          {
            type: 'select',
            label: 'Тип двигателя',
            name: 'engine_type',
            placeholder: 'Выберите',
            options: [
              {value: 'gasoline', label: 'Бензин'}, {value: 'diesel', label: 'Дизель'},
              {value: 'electric', label: 'Электро'}
            ]
          },
          {
            type: 'input',
            label: 'Объем двигателя, см³',
            name: 'engine_volume',
            placeholder: '1598',
            inputMode: 'numeric'
          },
          {
            type: 'select',
            label: 'КПП',
            name: 'gearbox',
            placeholder: 'Выберите',
            options: [{value: 'manual', label: 'Механическая'}, {value: 'auto', label: 'Автомат'}]
          },
          {
            type: 'select',
            label: 'Привод',
            name: 'drive',
            placeholder: 'Выберите',
            options: [
              {value: 'fwd', label: 'Передний'}, {value: 'rwd', label: 'Задний'}, {value: 'awd', label: 'Полный'}
            ]
          },
          {
            type: 'select',
            label: 'Руль',
            name: 'steering',
            placeholder: 'Выберите',
            options: [{value: 'left', label: 'Левый'}, {value: 'right', label: 'Правый'}]
          },
          {
            type: 'select',
            label: 'Цвет',
            name: 'color',
            placeholder: 'Выберите',
            options: [
              {value: 'white', label: 'Белый'}, {value: 'black', label: 'Черный'}, {value: 'gray', label: 'Серый'}
            ]
          },
          {
            type: 'segmented',
            label: 'Был ли ДТП?',
            name: 'crash',
            options: [{value: 'yes', label: 'Да'}, {value: 'no', label: 'Нет'}],
            defaultValue: 'yes'
          },
          {
            type: 'segmented',
            label: 'Автомобиль на ходу?',
            name: 'running',
            options: [{value: 'yes', label: 'Да'}, {value: 'no', label: 'Нет'}],
            defaultValue: 'yes'
          },{
            type: 'segmented',
            label: 'Автомобиль на хоdsadду?',
            name: 'runnadsaing',
            options: [{value: 'yes', label: 'Да'}, {value: 'no', label: 'Нет'}],
            defaultValue: 'yes'
          },
          {
            type: 'checkboxes',
            label: 'Дополнительные опции',
            name: 'options',
            options: [
              'Усилитель руля',
              'Электростеклоподъемники',
              'Камера заднего вида',
              'Система контроля слепых зон',
              'Парктроник',
              'Круиз-контроль',
              'Бортовой компьютер',
              'Сигнализация',
              'Центральный замок',
              'Иммобилайзер',
              'Подушки безопасности',
              'Антиблокировка тормозов',
              'Антипробуксовка',
              'Курсовая устойчивость',
              'Блокировка дифференциала',
              'Распред. тормозных усилий',
              'Экстренное торможение',
              'Обогрев зеркал',
              'Обогрев сидений',
              'Обогрев руля',
            ],
          },
        ],
      },
      {
        title: 'Текстовое описание',
        fields: [
          {type: 'textarea', label: '', name: 'description', placeholder: 'Введите текст'},

        ],
      },
      {
        title: 'Фотографии товара',
        fields: [
          {type: 'photos', name: 'photos'},
          {type: 'actions', name: 'actions'},
        ],
      },
    ],
  },
  car_auto_new: {
    title: 'Автомобили (новая)',
    sections: [
      {
        title: 'Общая информация',
        requiredNote: '*обязательные к заполнению поля',
        fields: [
          {type: 'input', label: 'Заголовок*', name: 'title', placeholder: 'Название объявления'},
          {
            type: 'select',
            label: 'Срок публикации*',
            name: 'publish_term',
            placeholder: 'Выберите срок',
            options: [
              {value: '1w', label: '1 неделя'},
              {value: '2w', label: '2 недели'},
              {value: '1m', label: '1 месяц'},
            ],
          },
          {type: 'actions', name: 'actions'},

        ],
      },

    ]
  },
  estate_rent_secondary: {
    title: 'Квартиры вторичка',
    sections: [
      {
        title: 'Общая информация',
        requiredNote: '*обязательные к заполнению поля',
        fields: [
          {type: 'input',
            label: 'Заголовок*',
            name: 'title', placeholder: 'Название объявления'},
          {
            type: 'select',
            label: 'Срок публикации*',
            name: 'publish_term',
            placeholder: 'Выберите срок',
            options: [
              {value: '1w', label: '1 неделя'},
              {value: '2w', label: '2 недели'},
              {value: '1m', label: '1 месяц'},
            ],
          },
          {type: 'input', label: 'Цена, руб*', name: 'price', placeholder: '1 000 000', inputMode: 'numeric'},
          {
            type: 'select',
            label: 'Регион*',
            name: 'region',
            placeholder: 'Выберите регион',
            options: [
              {value: 'ru_all', label: 'Вся Россия'},
              {value: 'ru_msk', label: 'Москва'},
              {value: 'ru_spb', label: 'Санкт-Петербург'},
            ],
          },
          {
            type: 'map',
            label: 'Адрес, где находится квартира*',
            name: 'address',
            placeholder: 'Введите адрес',
            chips: [
              'Россия, г. Копейск, Калинина ул., д. 1 кв.98',
              'Россия, г. Чита, Набережная ул., д. 10 кв.74',
            ],
            imageSrc: '/images/map.png',
          },
          {type: 'actions', name: 'actions'},
        ],
      },


    ]
  }
};

export function initAddPage() {
  normalizeCarAutoNewSchema();

  // Базовая разметка из add.html (контейнеры для шагов и билдера формы).
  const form = document.querySelector('.add__main-form');
  const dynamic = document.querySelector('[data-add-dynamic]');
  const chooseBtn = document.querySelector('[data-add-choose]');
  const builder = document.querySelector('[data-add-builder]');

  if (!form || !dynamic || !chooseBtn || !builder) return;

  // Кнопку "Выбрать" показываем только когда выбор дошел до листа дерева категорий.
  chooseBtn.hidden = true;

  // Состояние выбора (повторяет путь по дереву категорий).
  const state = {
    section: '',
    path: [],
  };

  let requiredValidation = null;

  function initRequiredValidation(root) {
    const requiredEls = Array.from(
      root.querySelectorAll('input[data-add-required="true"], textarea[data-add-required="true"]'),
    );
    const requiredSelects = Array.from(root.querySelectorAll('.select[data-add-required="true"]'));

    const REQUIRED_MESSAGE_TEXT = 'не заполнено';

    function getOrCreateFieldMessage(fieldEl, describedForEl) {
      if (!fieldEl) return null;
      let msg = fieldEl.querySelector('.add__field-error');
      if (!msg) {
        msg = document.createElement('div');
        msg.className = 'add__field-error';
        msg.hidden = true;
        msg.textContent = REQUIRED_MESSAGE_TEXT;
        fieldEl.appendChild(msg);
      }

      // Best-effort accessibility wiring.
      if (describedForEl && describedForEl instanceof Element) {
        if (!msg.id) {
          const name = describedForEl.getAttribute('name') || describedForEl.getAttribute('data-add-select') || '';
          const safe = String(name).replaceAll(/[^a-zA-Z0-9_-]+/g, '_');
          msg.id = safe ? `add_req_msg_${safe}` : `add_req_msg_${Math.random().toString(16).slice(2)}`;
        }
        const prev = describedForEl.getAttribute('aria-describedby') || '';
        if (!prev.split(/\\s+/).includes(msg.id)) {
          describedForEl.setAttribute('aria-describedby', `${prev} ${msg.id}`.trim());
        }
      }

      return msg;
    }

    function setFieldMessage(fieldEl, describedForEl, on) {
      const msg = getOrCreateFieldMessage(fieldEl, describedForEl);
      if (!msg) return;
      msg.hidden = !on;
    }

    function setError(el, on) {
      el.classList.toggle('input--error', on);
      el.setAttribute('aria-invalid', on ? 'true' : 'false');
      setFieldMessage(el.closest('.add__field'), el, on);
    }

    function setSelectError(selectEl, on) {
      selectEl.classList.toggle('select-error', on);
      const trigger = selectEl.querySelector('.select__trigger') || selectEl.querySelector('.select__empty-trigger');
      if (trigger) trigger.setAttribute('aria-invalid', on ? 'true' : 'false');
      setFieldMessage(selectEl.closest('.add__field'), trigger || selectEl, on);
    }

    function validateOne(el) {
      const ok = String(el.value ?? '').trim().length > 0;
      setError(el, !ok);
      return ok;
    }

    function validateSelect(selectEl) {
      const hidden = selectEl.querySelector('input[type="hidden"]');
      const ok = String(hidden?.value ?? '').trim().length > 0;
      setSelectError(selectEl, !ok);
      return ok;
    }

    requiredEls.forEach((el) => {
      el.addEventListener('blur', () => validateOne(el));
      el.addEventListener('input', () => {
        // Убираем ошибку сразу как пользователь ввел что-то валидное.
        if (el.classList.contains('input--error') && String(el.value ?? '').trim().length > 0) {
          setError(el, false);
        }
      });
    });

    // Снимаем ошибку с required select как только выбрали значение.
    root.addEventListener('select:change', (e) => {
      const selectEl = e.target.closest('.select[data-add-required="true"]');
      if (!selectEl) return;
      if (String(e.detail?.value ?? '').trim().length > 0) {
        setSelectError(selectEl, false);
      }
    });

    function validateAll() {
      let firstInvalid = null;
      requiredEls.forEach((el) => {
        const ok = validateOne(el);
        if (!ok && !firstInvalid) firstInvalid = el;
      });

      requiredSelects.forEach((sel) => {
        const ok = validateSelect(sel);
        if (!ok && !firstInvalid) firstInvalid = sel;
      });

      if (firstInvalid) {
        const focusEl =
          firstInvalid instanceof Element && firstInvalid.classList.contains('select')
            ? (firstInvalid.querySelector('.select__trigger') || firstInvalid.querySelector('.select__empty-trigger'))
            : firstInvalid;
        focusEl?.focus?.();
        (focusEl ?? firstInvalid).scrollIntoView({block: 'center', behavior: 'smooth'});
        return false;
      }

      return true;
    }

    return {validateAll};
  }

  function resetBuilder() {
    chooseBtn.disabled = true;
    chooseBtn.hidden = true;
    builder.hidden = true;
    builder.innerHTML = '';
    requiredValidation = null;
  }

  function resetBelow(level) {
    // Сбрасывает зависимые выборы и UI, когда меняется более высокий уровень.
    if (level === 'section') {
      state.path = [];
    }

    dynamic.innerHTML = '';
    resetBuilder();
  }

  function updateChooseAvailability() {
    // "Выбрать" доступна только если текущий путь указывает на схему формы.
    const path = getNodePath(state);
    const formKey = path?.leaf?.form ?? null;
    chooseBtn.disabled = !formKey;
    chooseBtn.hidden = !formKey;
  }

  function renderPathSteps() {
    // Рендерит цепочку селектов любой глубины по ADD_TREE.
    if (!state.section) {
      dynamic.innerHTML = '';
      return;
    }

    let node = ADD_TREE[state.section];
    if (!node) {
      dynamic.innerHTML = '';
      return;
    }

    let selectsHtml = '';

    for (let level = 0; node?.children; level += 1) {
      const options = Object.entries(node.children ?? {}).map(([value, child]) => ({
        value,
        label: child.label,
      }));

      const selectedValue = state.path[level] ?? '';
      const placeholder = level === 0 ? 'Выберите категорию' : 'Выберите';

      selectsHtml += `
        ${renderSelect({
        name: `add_path_${level}`,
        placeholder,
        options,
        selectedValue,
        extraAttrs: `data-add-path-level="${level}"`,
      })}
      `;

      if (!selectedValue) break;
      const next = node.children?.[selectedValue];
      if (!next) break;
      node = next;
    }

    dynamic.innerHTML = `
      <div class="add__item">
        <h5 class="title title--semibold h-18 add__item-title">Категория</h5>
        ${selectsHtml}
      </div>
    `;
    initSelects(dynamic);
  }

  function renderBuilder() {
    // Строит финальную форму по схеме, найденной в листе дерева категорий.
    const path = getNodePath(state);
    const formKey = path?.leaf?.form ?? null;
    if (!formKey) return;

    const schema = FORM_SCHEMAS[formKey];
    if (!schema) return;

    builder.innerHTML = renderSchema(schema);
    builder.hidden = false;

    initSelects(builder);
    initPhotos(builder);
    initMapChips(builder);
    requiredValidation = initRequiredValidation(builder);


    // Локальная логика segmented: переключаем активную кнопку и синхронизируем hidden input.
    builder.querySelectorAll('[data-add-segmented]').forEach((seg) => {
      seg.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-add-segment-value]');
        if (!btn) return;

        seg.querySelectorAll('.add__segmented-btn').forEach((b) => b.classList.remove('add__segmented-btn--active'));
        btn.classList.add('add__segmented-btn--active');

        const input = seg.querySelector('input[type="hidden"]');
        if (input) input.value = btn.dataset.addSegmentValue ?? '';
      });
    });
  }

  // Слушаем изменения селектов (components/select.js генерирует событие "select:change").
  form.addEventListener('select:change', (e) => {
    const selectEl = e.target.closest('.select');
    const name = selectEl?.querySelector('input[type="hidden"]')?.name;
    const value = e.detail?.value ?? '';

    if (name === 'section') {
      // Шаг 1: выбран раздел -> показываем категории.
      state.section = value;
      resetBelow('section');
      renderPathSteps();
      updateChooseAvailability();
      return;
    }

    // Динамические уровни пути по дереву категорий (любая глубина).
    const levelRaw = selectEl?.dataset?.addPathLevel;
    if (levelRaw != null && levelRaw !== '') {
      const level = Number(levelRaw);
      if (!Number.isNaN(level) && level >= 0) {
        state.path[level] = value;
        state.path.length = level + 1;
        resetBuilder();
        renderPathSteps();
        updateChooseAvailability();
      }
    }
  });

  chooseBtn.addEventListener('click', () => {
    // Финальный шаг: пользователь подтверждает путь по категориям, рендерим форму по схеме.
    builder.hidden = true;
    builder.innerHTML = '';
    renderBuilder();
  });

  // При клике "Опубликовать" прогоняем простую валидацию обязательных полей.
  builder.addEventListener('click', (e) => {
    const btn = e.target.closest('.add__actions .button');
    if (!btn) return;
    if (!/Опубликовать/i.test(btn.textContent || '')) return;

    requiredValidation?.validateAll();
  });
}
