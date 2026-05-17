// ─── SEED-СКРИПТ: вставь это в консоль браузера на своём сайте (будучи залогиненным) ───
// Открой http://localhost:5173, залогинься, нажми F12 → Console, вставь этот код и нажми Enter

(async () => {
  const { supabase } = await import('/src/lib/supabaseClient.js');

  // Проверяем сессию
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { console.error('❌ Ты не залогинен! Сначала войди в аккаунт.'); return; }
  console.log('✅ Залогинен как:', session.user.email);
  const userId = session.user.id;

  // ─── Шаг 1: Загружаем локальные фото из /public/img/ в Supabase Storage ───
  const localImages = [
    'apart1.jpg','apart2.jpg','apart3.jpg','apart4.jpg','apart5.jpg',
    'apart6.jpg','apart7.jpg','apart8.jpg','apart9.jpg',
    'bungalo.jpg','domik banya.jpg','domik v lesu.jpg',
    'hotel1.jpg','hotel2.jpg','hotel3.jpg','hotel4.jpg','hotel5.jpg',
    'hotel6.jpg','hotel7.jpg',
    'villa.jpg','villa2.jpg','villa3.jpg','villa4.jpg','villa5.jpg',
    'villa6.jpg','villa7.jpg','villa8.jpg',
  ];

  console.log('📤 Загружаю локальные фото в Supabase Storage...');
  const imgUrlMap = {};

  for (const fname of localImages) {
    const localPath = `/img/${fname}`;
    try {
      const resp = await fetch(localPath);
      if (!resp.ok) { console.warn(`⚠️ Не найдено: ${localPath}`); continue; }
      const blob = await resp.blob();

      const storagePath = `seed/${userId}/${fname.replace(/\s/g, '_')}`;
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(storagePath, blob, { cacheControl: '3600', upsert: true });

      if (error) {
        console.warn(`⚠️ Ошибка загрузки ${fname}:`, error.message);
        continue;
      }

      const { data: urlData } = supabase.storage.from('property-images').getPublicUrl(data.path);
      imgUrlMap[localPath] = urlData.publicUrl;
      console.log(`  ✅ ${fname} → загружено`);
    } catch (e) {
      console.warn(`⚠️ Пропущено ${fname}:`, e.message);
    }
  }

  console.log(`📸 Загружено ${Object.keys(imgUrlMap).length} фото в Storage`);

  // ─── Шаг 2: Создаём объекты ───
  const AMENITY_MAP = {
    'Wi-Fi':'wifi','Бассейн':'pool','Парковка':'parking','Кондиционер':'ac',
    'С питомцами':'pets','Кухня':'kitchen','Стиральная машина':'laundry',
    'Двуспальная кровать':'bed','Камин':'fireplace','Баня':'bathhouse',
    'Мангал':'bbq','Двор':'yard','Сад':'garden','Терраса':'terrace',
    'Балкон':'balcony','Печь':'stove','Гамак':'hammock','Завтрак':'breakfast',
    'Питание':'dining','Спа':'spa','Душ':'shower','Джакузи':'jacuzzi',
    'Виноградник':'vineyard','Охрана':'security','Ресторан':'restaurant',
    'Вид на море':'sea_view','Вид на горы':'mountain_view','Вид на город':'city_view',
    'Вид на лес':'forest_view','Шезлонги':'sunbeds','Барбекю':'bbq',
    'Лыжная комната':'ski_room','Банкетный зал':'banquet','Кострище':'campfire',
    'Постельное бельё':'linens','Источник':'spring','Эко-отопление':'eco_heat','ТВ':'tv',
  };

  const TYPE_MAP = {
    'Квартира':'apartment','Гостиница':'guesthouse','Отель':'hotel','Дом / Вилла':'house',
  };

  const properties = [
    { name:"Вилла у моря", description:"Роскошная вилла с панорамным видом на Чёрное море. Собственный бассейн и терраса для загара.", price:12500, type:"Гостиница", rooms:6, city:"Геленджик", address:"ул. Ривьерская, 15", owner_phone:"+7 (918) 234-56-78", amenities:["Бассейн","Парковка","Wi-Fi","Кондиционер"], img:"/img/villa.jpg" },
    { name:"Солнечная мансарда", description:"Уютная мансарда на верхнем этаже с видом на горы. Идеально для пары.", price:4800, type:"Квартира", rooms:2, city:"Геленджик", address:"ул. Кирова, 33", owner_phone:"+7 (928) 345-67-89", amenities:["Wi-Fi","Балкон","Кондиционер"], img:"/img/apart1.jpg" },
    { name:"Домик в сосновом бору", description:"Деревянный дом среди сосен. Тишина, свежий воздух и грибная тропа прямо от крыльца.", price:5600, type:"Гостиница", rooms:4, city:"Геленджик", address:"ул. Сосновая, 8", owner_phone:"+7 (918) 456-78-90", amenities:["Мангал","Парковка","Wi-Fi","Двор"], img:"/img/domik v lesu.jpg" },
    { name:"Студия на набережной", description:"Современная студия с видом на набережную. Шаг до пляжа — 2 минуты.", price:3200, type:"Квартира", rooms:1, city:"Геленджик", address:"ул. Набережная, 27", owner_phone:"+7 (928) 567-89-01", amenities:["Wi-Fi","Кондиционер","Вид на море"], img:"/img/apart2.jpg" },
    { name:"Коттедж с баней", description:"Просторный коттедж с русской баней на дровах. Отлично для семейного отдыха.", price:8900, type:"Гостиница", rooms:7, city:"Геленджик", address:"ул. Маячная, 5", owner_phone:"+7 (918) 678-90-12", amenities:["Баня","Мангал","Парковка","Wi-Fi"], img:"/img/domik banya.jpg" },
    { name:"Лофт в центре", description:"Стильный лофт в самом центре Геленджика. Высокие потолки, кирпичные стены.", price:7200, type:"Квартира", rooms:3, city:"Геленджик", address:"ул. Толстого, 12", owner_phone:"+7 (918) 789-01-23", amenities:["Wi-Fi","Стиральная машина","Кухня"], img:"/img/apart3.jpg" },
    { name:"Хижина у водопада", description:"Уединённая хижина рядом с горным ручьём. Романтика и природа.", price:4100, type:"Гостиница", rooms:2, city:"Геленджик", address:"ул. Горная, 3", owner_phone:"+7 (928) 890-12-34", amenities:["Камин","Терраса","Вид на горы"], img:"/img/apart4.jpg" },
    { name:"Апартаменты с видом на залив", description:"Светлые апартаменты с огромным окном на Геленджикскую бухту.", price:6300, type:"Квартира", rooms:3, city:"Геленджик", address:"ул. Лермонтова, 21", owner_phone:"+7 (918) 901-23-45", amenities:["Wi-Fi","Кондиционер","Вид на море","Балкон"], img:"/img/villa2.jpg" },
    { name:"Горное шале", description:"Шале в альпийском стиле у подножия гор Маркотх. Летом — треккинг, зимой — уют у камина.", price:9800, type:"Гостиница", rooms:5, city:"Геленджик", address:"ул. Чехова, 9", owner_phone:"+7 (928) 012-34-56", amenities:["Камин","Лыжная комната","Wi-Fi","Парковка"], img:"/img/villa3.jpg" },
    { name:"Квартира на Петроградке", description:"Уютная квартира с видом на бухту и набережную.", price:5500, type:"Квартира", rooms:2, city:"Геленджик", address:"ул. Петроградская, 7", owner_phone:"+7 (918) 123-45-67", amenities:["Wi-Fi","Стиральная машина","Кухня"], img:"/img/apart5.jpg" },
    { name:"Пентхаус с террасой", description:"Пентхаус на 15 этаже с панорамной террасой. Джакузи под звёздами.", price:18500, type:"Квартира", rooms:3, city:"Геленджик", address:"ул. Курортный проспект, 18", owner_phone:"+7 (928) 234-56-78", amenities:["Джакузи","Терраса","Wi-Fi","Кондиционер"], img:"/img/villa4.jpg" },
    { name:"Рыбацкий домик", description:"Домик на берегу залива. Удочки в подарок. Идеально для любителей рыбалки.", price:2900, type:"Гостиница", rooms:3, city:"Геленджик", address:"ул. Рыбацкая, 2", owner_phone:"+7 (918) 345-67-89", amenities:["Мангал","Двор","Парковка"], img:"/img/domik v lesu.jpg" },
    { name:"Вилла с виноградником", description:"Старинная вилла с собственным виноградником. Дегустация вина включена.", price:11200, type:"Гостиница", rooms:6, city:"Геленджик", address:"ул. Виноградная, 7", owner_phone:"+7 (928) 456-78-90", amenities:["Бассейн","Виноградник","Wi-Fi","Парковка"], img:"/img/villa5.jpg" },
    { name:"Юрта в степи", description:"Аутентичная юрта на окраине Геленджика. Небо без светового загрязнения.", price:2200, type:"Гостиница", rooms:1, city:"Геленджик", address:"ул. Степная, 1", owner_phone:"+7 (918) 567-89-01", amenities:["Кострище","Постельное бельё"], img:"/img/apart6.jpg" },
    { name:"Дом на сваях", description:"Дом на сваях прямо над водой. Просыпайтесь под шум волн.", price:6700, type:"Гостиница", rooms:3, city:"Геленджик", address:"ул. Приморская, 14", owner_phone:"+7 (918) 678-90-12", amenities:["Вид на море","Терраса","Wi-Fi"], img:"/img/domik v lesu.jpg" },
    { name:"Квартира у парка", description:"Квартира с видом на парк Олимп. Две минуты пешком до набережной.", price:8400, type:"Квартира", rooms:2, city:"Геленджик", address:"ул. Мира, 45", owner_phone:"+7 (918) 789-01-23", amenities:["Wi-Fi","Кондиционер","Вид на город"], img:"/img/apart7.jpg" },
    { name:"Дача с садом", description:"Классическая дача с фруктовым садом. Гамак и качели для детей.", price:3400, type:"Гостиница", rooms:4, city:"Геленджик", address:"ул. Садовая, 19", owner_phone:"+7 (918) 890-12-34", amenities:["Сад","Мангал","Парковка","Гамак"], img:"/img/domik v lesu.jpg" },
    { name:"Спа-отель на берегу", description:"Номер в спа-отеле с полным сервисом. Массаж, бассейн и здоровое питание.", price:7600, type:"Отель", rooms:1, city:"Геленджик", address:"ул. Курортная, 11", owner_phone:"+7 (928) 901-23-45", amenities:["Спа","Бассейн","Питание","Wi-Fi"], img:"/img/hotel1.jpg" },
    { name:"Таунхаус у парка", description:"Современный таунхаус рядом с парком. Три этажа комфорта.", price:5800, type:"Гостиница", rooms:5, city:"Геленджик", address:"ул. Парковая, 6", owner_phone:"+7 (918) 012-34-56", amenities:["Парковка","Wi-Fi","Двор","Стиральная машина"], img:"/img/apart8.jpg" },
    { name:"Бунгало на пляже", description:"Бунгало прямо на песчаном пляже. Шезлонги и зонтики в наличии.", price:5100, type:"Гостиница", rooms:1, city:"Геленджик", address:"ул. Пляжная, 1", owner_phone:"+7 (928) 123-45-67", amenities:["Вид на море","Шезлонги","Wi-Fi"], img:"/img/bungalo.jpg" },
    { name:"Замок на холме", description:"Реконструкция средневекового замка на склоне Маркотхского хребта.", price:15000, type:"Гостиница", rooms:9, city:"Геленджик", address:"ул. Замковая, 1", owner_phone:"+7 (918) 234-56-78", amenities:["Камин","Парковка","Wi-Fi","Банкетный зал"], img:"/img/villa6.jpg" },
    { name:"Каюта на яхте", description:"Стационарная яхта в марине Геленджика. Жизнь на воде с комфортом отеля.", price:6900, type:"Гостиница", rooms:1, city:"Геленджик", address:"ул. Портовая, 3", owner_phone:"+7 (928) 345-67-89", amenities:["Вид на море","Wi-Fi","Кондиционер"], img:"/img/apart9.jpg" },
    { name:"Эко-дом под землёй", description:"Частично заглублённый эко-дом с зелёной крышей. Нулевой углеродный след.", price:3800, type:"Гостиница", rooms:3, city:"Геленджик", address:"ул. Эко-парковая, 4", owner_phone:"+7 (918) 456-78-90", amenities:["Камин","Эко-отопление","Wi-Fi"], img:"/img/domik v lesu.jpg" },
    { name:"Квартира с камином", description:"Тёплая квартира с настоящим камином. Идеально для прохладных вечеров.", price:4600, type:"Квартира", rooms:2, city:"Геленджик", address:"ул. Некрасова, 28", owner_phone:"+7 (918) 567-89-01", amenities:["Камин","Wi-Fi","Стиральная машина"], img:"/img/apart1.jpg" },
    { name:"Вилла с подогреваемым бассейном", description:"Бассейн с подогревом круглый год. Тропический сад и зона барбекю.", price:14200, type:"Гостиница", rooms:6, city:"Геленджик", address:"ул. Приморская, 30", owner_phone:"+7 (928) 678-90-12", amenities:["Бассейн","Барбекю","Wi-Fi","Парковка"], img:"/img/villa7.jpg" },
    { name:"Маяк-отель", description:"Номер в бывшем маяке Толстый мыс. Круговой вид на море с верхней площадки.", price:7200, type:"Отель", rooms:1, city:"Геленджик", address:"ул. Маячная, 1", owner_phone:"+7 (918) 789-01-23", amenities:["Вид на море","Wi-Fi","Ресторан"], img:"/img/hotel2.jpg" },
    { name:"Дом с русской печью", description:"Традиционный русский дом с работающей печью. Лежанка и самовар.", price:3100, type:"Гостиница", rooms:3, city:"Геленджик", address:"ул. Печная, 10", owner_phone:"+7 (928) 890-12-34", amenities:["Печь","Мангал","Двор"], img:"/img/domik v lesu.jpg" },
    { name:"Панорамный лофт", description:"Лофт с панорамным остеклением на последнем этаже. Бухта как на ладони.", price:4900, type:"Квартира", rooms:2, city:"Геленджик", address:"ул. Ленина, 55", owner_phone:"+7 (918) 901-23-45", amenities:["Wi-Fi","Вид на город","Кухня"], img:"/img/apart2.jpg" },
    { name:"Кемпинг-глэмпинг", description:"Роскошный глэмпинг с кроватью, душем и утренним кофе в постель.", price:3500, type:"Гостиница", rooms:1, city:"Геленджик", address:"ул. Лесная, 2", owner_phone:"+7 (918) 012-34-56", amenities:["Душ","Завтрак","Вид на море"], img:"/img/bungalo.jpg" },
    { name:"Квартира в хрущёвке", description:"Аутентичная хрущёвка с советским интерьером. Ностальгия и уют.", price:1800, type:"Квартира", rooms:2, city:"Геленджик", address:"ул. Советская, 77", owner_phone:"+7 (918) 123-45-67", amenities:["Wi-Fi","Кухня"], img:"/img/apart3.jpg" },
    { name:"Дом у минерального источника", description:"Дом рядом с минеральным источником. Здоровье и отдых в одном месте.", price:4200, type:"Гостиница", rooms:4, city:"Геленджик", address:"ул. Источная, 5", owner_phone:"+7 (928) 234-56-78", amenities:["Источник","Wi-Fi","Мангал","Парковка"], img:"/img/domik v lesu.jpg" },
    { name:"Черноморская резиденция", description:"Элитная резиденция на первой линии. Закрытая территория и охрана.", price:25000, type:"Гостиница", rooms:8, city:"Геленджик", address:"ул. Черноморская, 1", owner_phone:"+7 (928) 345-67-89", amenities:["Бассейн","Охрана","Парковка","Wi-Fi","Спа"], img:"/img/villa8.jpg" },
    { name:"Домик на дереве", description:"Детский меч — дом на дереве! Для взрослых тоже безопасно и волшебно.", price:3900, type:"Гостиница", rooms:1, city:"Геленджик", address:"ул. Дубовая, 15", owner_phone:"+7 (918) 456-78-90", amenities:["Вид на лес","Wi-Fi","Терраса"], img:"/img/domik v lesu.jpg" },
    { name:"Квартира у набережной", description:"Квартира с видом на набережную Геленджика. Вечерние прогулки у воды.", price:3200, type:"Квартира", rooms:2, city:"Геленджик", address:"ул. Набережная, 40", owner_phone:"+7 (918) 567-89-01", amenities:["Wi-Fi","Вид на море","Кухня"], img:"/img/apart4.jpg" },
    { name:"Фермерский дом", description:"Дом на действующей ферме. Свежие яйца, молоко и деревенский хлеб.", price:2500, type:"Гостиница", rooms:4, city:"Геленджик", address:"ул. Фермерская, 3", owner_phone:"+7 (918) 678-90-12", amenities:["Завтрак","Двор","Парковка"], img:"/img/domik v lesu.jpg" },
    { name:"Квартира в сталинке", description:"Высокие потолки, лепнина и паркет. Квартира в сталинском доме.", price:6100, type:"Квартира", rooms:3, city:"Геленджик", address:"ул. Островского, 22", owner_phone:"+7 (918) 789-01-23", amenities:["Wi-Fi","Стиральная машина","Кухня"], img:"/img/apart3.jpg" },
  ];

  // Преобразуем в формат Supabase
  const rows = properties.map(p => {
    const imgUrl = imgUrlMap[p.img] || p.img;
    const amenityKeys = (p.amenities || []).map(a => AMENITY_MAP[a] || a.toLowerCase());
    return {
      name: p.name,
      description: p.description,
      type: TYPE_MAP[p.type] || p.type,
      city: p.city,
      address: p.address,
      rooms: p.rooms,
      price: p.price,
      owner_phone: p.owner_phone,
      amenities: amenityKeys,
      legal_status: 'individual',
      is_published: true,
      user_id: userId,
      img: imgUrl,
      images: [imgUrl],
    };
  });

  // Вставляем батчами по 5
  let created = 0;
  for (let i = 0; i < rows.length; i += 5) {
    const batch = rows.slice(i, i + 5);
    const { data, error } = await supabase.from('properties').insert(batch).select();
    if (error) {
      console.error(`❌ Ошибка на батче ${i}:`, error.message);
    } else {
      created += data.length;
      console.log(`✅ Создано ${data.length} объектов (всего ${created}/${rows.length})`);
    }
  }

  console.log(`\n🎉 Готово! Создано ${created} объектов из ${rows.length}`);
})();
