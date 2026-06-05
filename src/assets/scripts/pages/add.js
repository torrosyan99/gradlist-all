import { initSelects } from '../components/select.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderSelect({ name, placeholder, options, withIcon = false }) {
  const selectClass = withIcon ? 'select select--with-icon' : 'select';

  const iconMarkup = withIcon
    ? `
      <svg class="select__icon" width="20" height="20">
        <use xlink:href=""></use>
      </svg>
    `
    : '';

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
    <div class="${selectClass}" data-add-select="${escapeHtml(name)}">
      <button class="select__trigger" type="button">
        ${iconMarkup}
        <span>${escapeHtml(placeholder ?? '')}</span>
        <svg width="24" height="24">
          <use xlink:href="/icons.svg#arrow-bottom"></use>
        </svg>
      </button>
      <div class="select__dropdown custom-scroll">
        ${optionsMarkup}
      </div>
      <input type="hidden" name="${escapeHtml(name)}" value="">
    </div>
  `;
}


function normalizeCarAutoNewSchema() {
  // Build 'new' based on 'used' at runtime (remove mileage).
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
  const label = field.label ? `<div class="add__label">${escapeHtml(field.label)}</div>` : '';

  if (field.type === 'input') {
    const inputMode = field.inputMode ? ` inputmode="${escapeHtml(field.inputMode)}"` : '';
    return `
      <div class="add__field">
        ${label}
        <input class="input" name="${escapeHtml(field.name)}" placeholder="${escapeHtml(field.placeholder ?? '')}"${inputMode}>
      </div>
    `;
  }

  if (field.type === 'textarea') {
    return `
      <div class="add__field add__field--full">
        ${label}
        <textarea class="add__textarea" name="${escapeHtml(field.name)}" placeholder="${escapeHtml(field.placeholder ?? '')}"></textarea>
      </div>
    `;
  }

  if (field.type === 'select') {
    const selectHtml = renderSelect({
      name: field.name,
      placeholder: field.placeholder ?? '',
      options: field.options ?? [],
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
    const defaultValue = field.defaultValue ?? (opts[0]?.value ?? '');
    const buttons = opts.map((o) => {
      const active = o.value === defaultValue ? ' add__segmented-btn--active' : '';
      return `
        <button class="add__segmented-btn${active}" type="button" data-add-segment-value="${escapeHtml(o.value)}">
          ${escapeHtml(o.label)}
        </button>
      `;
    }).join('');

    return `
      <div class="add__field">
        ${label}
        <div class="add__segmented" data-add-segmented="${escapeHtml(field.name)}">
          ${buttons}
          <input type="hidden" name="${escapeHtml(field.name)}" value="${escapeHtml(defaultValue)}">
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
          <input type="checkbox" name="${escapeHtml(field.name)}" value="${escapeHtml(text)}" id="${escapeHtml(id)}">
          <span class="checkbox__box"></span>
          <span class="checkbox__text">${escapeHtml(text)}</span>
        </label>
      `;
    }).join('');

    return `
      <div class="add__field add__field--full">
        ${label ? label : `<div class="add__label">${escapeHtml(field.label ?? '')}</div>`}
        <div class="add__checkboxes">
          ${items}
        </div>
      </div>
    `;
  }

  if (field.type === 'map') {
    const chips = (field.chips ?? []).map((chip) => `<button class="add__chip" type="button">${escapeHtml(chip)}</button>`).join('');

    return `
      <div class="add__field add__field--full">
        ${label}
        <input class="input" name="${escapeHtml(field.name)}" placeholder="${escapeHtml(field.placeholder ?? '')}">
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
          <input class="add__photos-input" type="file" accept="${escapeHtml(accept)}" ${field.multiple === false ? '' : 'multiple'} hidden>
          <button class="add__photo add__photo--add" type="button" aria-label="Добавить фото" data-add-photos-add>
            <svg width="24" height="24">
              <use xlink:href="/icons.svg#plus"></use>
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
          <button class="button button--sm" type="button">Опубликовать</button>
          <button class="button button--sm button--secondary" type="button">Сохранить в черновик</button>
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

function renderSchema(schema) {
  const sectionsHtml = (schema.sections ?? []).map((section) => {
    const note = section.requiredNote ? `<div class="add__required-note">${escapeHtml(section.requiredNote)}</div>` : '';
    const fields = (section.fields ?? []).map(renderField).join('');

    const gridClass = (section.fields ?? []).some((f) => f.type === 'map' || f.type === 'checkboxes' || f.type === 'photos' || f.type === 'actions' || f.type === 'textarea')
      ? 'add__grid add__grid--mixed'
      : 'add__grid';

    return `
      <div class="add__block">
        <div class="add__section-header">
          <h3 class="title title--semibold add__section-title">${escapeHtml(section.title)}</h3>
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
  const section = state.section && ADD_TREE[state.section];
  if (!section) return null;

  const category = state.category && section.children?.[state.category];
  if (!category) return { section, category: null, leaf: null };

  if (category.form) return { section, category, leaf: { form: category.form } };

  const sub = state.sub && category.children?.[state.sub];
  if (!sub) return { section, category, leaf: null };

  return { section, category, leaf: { form: sub.form } };
}

function initPhotos(root) {
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

        // Keep the File on the element so it can be collected on submit later.
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
      // Allow selecting the same file again after delete.
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
const ADD_TREE = {
  car: {
    label: 'Транспорт',
    children: {
      automobiles: {
        label: 'Автомобили',
        children: {
          used: { label: 'С пробегом', form: 'car_auto_used' },
          new: { label: 'Без пробега', form: 'car_auto_new' },
        },
      },
    },
  },
  estate: {
    label: 'Недвижимость',
    children: {
      rent: { label: 'Аренда', form: 'estate_rent_stub' },
      sale: { label: 'Продажа', form: 'estate_sale_stub' },
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
          { type: 'input', label: 'Заголовок*', name: 'title', placeholder: 'Название объявления' },
          {
            type: 'select',
            label: 'Срок публикации*',
            name: 'publish_term',
            placeholder: 'Выберите срок',
            options: [
              { value: '1w', label: '1 неделя' },
              { value: '2w', label: '2 недели' },
              { value: '1m', label: '1 месяц' },
            ],
          },
          { type: 'input', label: 'Цена, руб*', name: 'price', placeholder: '1 000 000', inputMode: 'numeric' },
          {
            type: 'select',
            label: 'Регион*',
            name: 'region',
            placeholder: 'Выберите регион',
            options: [
              { value: 'ru_all', label: 'Вся Россия' },
              { value: 'ru_msk', label: 'Москва' },
              { value: 'ru_spb', label: 'Санкт-Петербург' },
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
          { type: 'select', label: 'Марка авто*', name: 'brand', placeholder: 'Выберите', options: [{ value: 'lada', label: 'LADA' }, { value: 'toyota', label: 'Toyota' }] },
          { type: 'input', label: 'Год выпуска', name: 'year', placeholder: '2026', inputMode: 'numeric' },
          { type: 'select', label: 'Тип кузова', name: 'body', placeholder: 'Выберите', options: [{ value: 'sedan', label: 'Седан' }, { value: 'suv', label: 'Внедорожник' }] },
          { type: 'input', label: 'Количество дверей', name: 'doors', placeholder: '3', inputMode: 'numeric' },
          { type: 'select', label: 'Тип двигателя', name: 'engine_type', placeholder: 'Выберите', options: [{ value: 'gasoline', label: 'Бензин' }, { value: 'diesel', label: 'Дизель' }, { value: 'electric', label: 'Электро' }] },
          { type: 'input', label: 'Объем двигателя, см³', name: 'engine_volume', placeholder: '1598', inputMode: 'numeric' },
          { type: 'input', label: 'Пробег, км', name: 'mileage', placeholder: '120 000', inputMode: 'numeric' },
          { type: 'select', label: 'КПП', name: 'gearbox', placeholder: 'Выберите', options: [{ value: 'manual', label: 'Механическая' }, { value: 'auto', label: 'Автомат' }] },
          { type: 'select', label: 'Привод', name: 'drive', placeholder: 'Выберите', options: [{ value: 'fwd', label: 'Передний' }, { value: 'rwd', label: 'Задний' }, { value: 'awd', label: 'Полный' }] },
          { type: 'select', label: 'Руль', name: 'steering', placeholder: 'Выберите', options: [{ value: 'left', label: 'Левый' }, { value: 'right', label: 'Правый' }] },
          { type: 'select', label: 'Цвет', name: 'color', placeholder: 'Выберите', options: [{ value: 'white', label: 'Белый' }, { value: 'black', label: 'Черный' }, { value: 'gray', label: 'Серый' }] },
          { type: 'segmented', label: 'Был ли ДТП?', name: 'crash', options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }], defaultValue: 'yes' },
          { type: 'segmented', label: 'Автомобиль на ходу?', name: 'running', options: [{ value: 'yes', label: 'Да' }, { value: 'no', label: 'Нет' }], defaultValue: 'yes' },
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
          { type: 'textarea', label: '', name: 'description', placeholder: 'Введите текст' },
        ],
      },
      {
        title: 'Фотографии товара',
        fields: [
          { type: 'photos', name: 'photos' },
          { type: 'actions', name: 'actions' },
        ],
      },
    ],
  },
  estate_rent_stub: {
    title: 'Недвижимость (аренда)',
    sections: [
      {
        title: 'Общая информация',
        requiredNote: '*обязательные к заполнению поля',
        fields: [
          { type: 'input', label: 'Заголовок*', name: 'title', placeholder: 'Название объявления' },
          { type: 'input', label: 'Цена, руб*', name: 'price', placeholder: '50 000', inputMode: 'numeric' },
          { type: 'actions', name: 'actions' },
        ],
      },
    ],
  },
  estate_sale_stub: {
    title: 'Недвижимость (продажа)',
    sections: [
      {
        title: 'Общая информация',
        requiredNote: '*обязательные к заполнению поля',
        fields: [
          { type: 'input', label: 'Заголовок*', name: 'title', placeholder: 'Название объявления' },
          { type: 'input', label: 'Цена, руб*', name: 'price', placeholder: '5 000 000', inputMode: 'numeric' },
          { type: 'actions', name: 'actions' },

        ],
      },
    ],
  },
};

export function initAddPage() {
  normalizeCarAutoNewSchema();

  const form = document.querySelector('.add__main-form');
  const dynamic = document.querySelector('[data-add-dynamic]');
  const chooseBtn = document.querySelector('[data-add-choose]');
  const builder = document.querySelector('[data-add-builder]');

  if (!form || !dynamic || !chooseBtn || !builder) return;

  // Hide "Choose" until the user reaches a leaf in the category tree.
  chooseBtn.hidden = true;

  const state = {
    section: '',
    category: '',
    sub: '',
  };

  function resetBelow(level) {
    if (level === 'section') {
      state.category = '';
      state.sub = '';
    }
    if (level === 'category') {
      state.sub = '';
    }

    dynamic.innerHTML = '';
    chooseBtn.disabled = true;
    chooseBtn.hidden = true;
    builder.hidden = true;
    builder.innerHTML = '';
  }

  function renderCategoryStep(sectionKey) {
    const section = ADD_TREE[sectionKey];
    if (!section) return;

    const categories = Object.entries(section.children ?? {}).map(([value, node]) => ({
      value,
      label: node.label,
    }));

    dynamic.innerHTML = `
      <div class="add__item">
        <h5 class="title title--semibold h-18 add__item-title">Категория</h5>
        ${renderSelect({
          name: 'category',
          placeholder: 'Выберите категорию',
          options: categories,
        })}
        <div data-add-sub></div>
      </div>
    `;

    initSelects(dynamic);
  }

  function renderSubStep(sectionKey, categoryKey) {
    const section = ADD_TREE[sectionKey];
    const category = section?.children?.[categoryKey];
    const subRoot = dynamic.querySelector('[data-add-sub]');
    if (!category || !subRoot) return;

    const children = category.children ?? null;
    if (!children) {
      subRoot.innerHTML = '';
      state.sub = '';
      return;
    }

    const subOptions = Object.entries(children).map(([value, node]) => ({
      value,
      label: node.label,
    }));

    subRoot.innerHTML = renderSelect({
      name: 'sub',
      placeholder: 'Выберите',
      options: subOptions,
    });

    initSelects(subRoot);
  }

  function updateChooseAvailability() {
    const path = getNodePath(state);
    const formKey = path?.leaf?.form ?? null;
    chooseBtn.disabled = !formKey;
    chooseBtn.hidden = !formKey;
  }

  function renderBuilder() {
    const path = getNodePath(state);
    const formKey = path?.leaf?.form ?? null;
    if (!formKey) return;

    const schema = FORM_SCHEMAS[formKey];
    if (!schema) return;

    builder.innerHTML = renderSchema(schema);
    builder.hidden = false;

    initSelects(builder);
    initPhotos(builder);

    // Local segmented controls: toggle active state and sync hidden input.
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

  // Listen for changes from existing "Раздел" select.
  form.addEventListener('select:change', (e) => {
    const selectEl = e.target.closest('.select');
    const name = selectEl?.querySelector('input[type="hidden"]')?.name;
    const value = e.detail?.value ?? '';

    if (name === 'section') {
      state.section = value;
      resetBelow('section');
      if (state.section) renderCategoryStep(state.section);
      updateChooseAvailability();
      return;
    }

    if (name === 'category') {
      state.category = value;
      resetBelow('category');
      // Re-render category item to keep current selection visible, then add sub-step if exists.
      renderCategoryStep(state.section);
      // Restore category selection text/value in DOM (select component handles view only on click; this re-render loses it).
      const catSelect = dynamic.querySelector('[data-add-select="category"]');
      if (catSelect) {
        const hidden = catSelect.querySelector('input[type="hidden"]');
        const span = catSelect.querySelector('.select__trigger span');
        const label = ADD_TREE[state.section]?.children?.[state.category]?.label ?? '';
        if (hidden) hidden.value = state.category;
        if (span) span.textContent = label;
      }

      renderSubStep(state.section, state.category);
      updateChooseAvailability();
      return;
    }

    if (name === 'sub') {
      state.sub = value;
      builder.hidden = true;
      builder.innerHTML = '';
      updateChooseAvailability();
    }
  });

  chooseBtn.addEventListener('click', () => {
    builder.hidden = true;
    builder.innerHTML = '';
    renderBuilder();
  });
}


