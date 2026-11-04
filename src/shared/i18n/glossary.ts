import { getStaticLocale, lookup } from './static';
import type { Locale } from './config';
import { transliterate } from './translit';

/**
 * Mock data stores its labels as Uzbek source strings (branch names, positions,
 * rule triggers, camera names…). This maps such a literal to a message key so it
 * can be rendered in the active language. Anything not listed falls through to
 * transliteration (uz-Cyrl) or is shown as-is.
 */
const VALUE_KEYS: Record<string, string> = {
  // ---- attendance statuses (shared/data/attendanceStatuses) ----
  'Ishga kelganlar': 'data.statusLabel.present',
  'Kechikib kelganlar': 'data.statusLabel.late',
  'Ishga kelmaganlar': 'data.statusLabel.absent',
  'Dam olishda': 'data.statusLabel.leave',
  Keldi: 'data.dayState.present',
  Kechikdi: 'data.dayState.late',
  Kelmagan: 'data.dayState.absent',
  Kelmadi: 'data.dayStateShort.absent',
  'Ta’til': 'data.dayState.leave',
  'Ta’tilda': 'data.dayStateShort.leave',
  'Dam olish': 'data.dayState.off',
  'Kelgusi kun': 'data.dayState.future',
  // ---- work types & schedule notes ----
  Oddiy: 'data.workType.Oddiy',
  Smenali: 'data.workType.Smenali',
  Sikl: 'data.workType.Sikl',
  'Dushanba – Juma': 'data.workTypeNote.monFri',
  'Dushanba — Juma': 'data.workTypeNote.monFri',
  'Dushanba – Shanba': 'data.workTypeNote.monSat',
  'Dushanba — Shanba': 'data.workTypeNote.monSat',
  'Kunduzgi smena': 'data.workTypeNote.dayShift',
  'Kechki smena': 'data.workTypeNote.eveningShift',
  '2 kun ish / 2 kun dam': 'data.workTypeNote.cycle22',
  '1 kun ish / 3 kun dam': 'data.workTypeNote.cycle13',
  Kunduzgi: 'data.shift.day',
  Kechki: 'data.shift.evening',
  Tungi: 'data.shift.night',
  // ---- pay & employment ----
  'Oylik maosh': 'data.payType.monthly',
  Soatbay: 'data.payType.hourly',
  Kunbay: 'data.payType.daily',
  'Oklad + foiz': 'data.payType.commission',
  'Doimiy ish': 'data.employment.permanent',
  'Muddatli shartnoma': 'data.employment.contract',
  Amaliyot: 'data.employment.intern',
  'Siyqaviy stavka': 'data.employment.partTime',
  // ---- branches ----
  'Markaziy ofis': 'data.branch.hq',
  'Chilonzor filiali': 'data.branch.chilonzor',
  'Yunusobod filiali': 'data.branch.yunusobod',
  'Sergeli filiali': 'data.branch.sergeli',
  'Mirzo Ulug’bek filiali': 'data.branch.mirzo',
  'Yakkasaroy filiali': 'data.branch.yakkasaroy',
  'Olmazor filiali': 'data.branch.olmazor',
  'Chirchiq filiali': 'data.branch.chirchiq',
  'Olmaliq filiali': 'data.branch.olmaliq',
  'Angren filiali': 'data.branch.angren',
  'Samarqand markaziy filiali': 'data.branch.samarqand',
  'Kattaqo’rg’on filiali': 'data.branch.kattaqorgon',
  'Farg’ona filiali': 'data.branch.fargona',
  'Andijon filiali': 'data.branch.andijon',
  'Namangan filiali': 'data.branch.namangan',
  'Qo’qon filiali': 'data.branch.qoqon',
  'Buxoro filiali': 'data.branch.buxoro',
  'Navoiy filiali': 'data.branch.navoiy',
  'Qarshi filiali': 'data.branch.qarshi',
  'Nukus filiali': 'data.branch.nukus',
  'Urganch filiali': 'data.branch.urganch',
  'Barcha filiallar': 'data.branch.all',
  // ---- branch regions ----
  'Toshkent shahri': 'data.region.tashkentCity',
  'Toshkent viloyati': 'data.region.tashkentRegion',
  'Samarqand viloyati': 'data.region.samarkandRegion',
  'Farg’ona vodiysi': 'data.region.ferganaValley',
  'Boshqa hududlar': 'data.region.other',
  // ---- positions ----
  'Bosh dasturchi': 'data.position.leadDev',
  'Frontend dasturchi': 'data.position.frontend',
  'Backend dasturchi': 'data.position.backend',
  'HR menejer': 'data.position.hr',
  Buxgalter: 'data.position.accountant',
  Kassir: 'data.position.cashier',
  Operator: 'data.position.operator',
  'Sotuv menejeri': 'data.position.sales',
  Omborchi: 'data.position.storekeeper',
  Haydovchi: 'data.position.driver',
  'Xavfsizlik xodimi': 'data.position.security',
  'Texnik mutaxassis': 'data.position.technician',
  'Tizim administratori': 'data.position.sysadmin',
  'Filial rahbari': 'data.position.branchHead',
  Marketolog: 'data.position.marketer',
  Dizayner: 'data.position.designer',
  // ---- payroll rules ----
  Kechikish: 'data.rule.trigger.late',
  'Erta ketish': 'data.ruleName.early',
  'Sababsiz kelmaslik': 'data.ruleName.absent',
  'Qo’shimcha ish soati': 'data.rule.trigger.overtime',
  'Dam olish / bayram kuni ishlash': 'data.rule.trigger.holiday_work',
  'Tungi soatlarda ishlash': 'data.rule.trigger.night_shift',
  'Oy davomida kechikmaslik': 'data.rule.trigger.perfect_month',
  'Savdo rejasini bajarish': 'data.rule.trigger.sales_plan',
  Davomat: 'data.rule.group.attendance',
  'Ish vaqti': 'data.rule.group.worktime',
  Natija: 'data.rule.group.result',
  'Qat’iy summa': 'data.rule.calc.fixed',
  'Birlik uchun': 'data.rule.calc.per_unit',
  'Okladdan %': 'data.rule.calc.percent',
  'Pog’onali': 'data.rule.calc.tiered',
  Jarima: 'data.rule.kind.penalty',
  Jarimalar: 'data.rule.kind.penaltyPlural',
  Bonus: 'data.rule.kind.bonus',
  Bonuslar: 'data.rule.kind.bonusPlural',
  'Necha daqiqadan ko’p kechiksa': 'data.rule.threshold.late',
  'Necha daqiqa oldin ketsa': 'data.rule.threshold.early_leave',
  'Kamida necha soat': 'data.rule.threshold.overtime',
  'Reja necha foizdan ko’p bajarilsa': 'data.rule.threshold.sales_plan',
  'oyda 4 marta, har safar 25 daqiqa kechiksa': 'data.rule.sample.late',
  'oyda 2 marta, 40 daqiqa erta ketsa': 'data.rule.sample.early_leave',
  'oyda 1 kun sababsiz kelmasa': 'data.rule.sample.absent',
  'oyda jami 6 soat ortiqcha ishlasa': 'data.rule.sample.overtime',
  'oyda 2 ta bayram kuni ishlasa': 'data.rule.sample.holiday_work',
  'oyda jami 40 soat tunda ishlasa': 'data.rule.sample.night_shift',
  'oy davomida birorta ham kechikmasa': 'data.rule.sample.perfect_month',
  'rejani 120% bajarsa': 'data.rule.sample.sales_plan',
  daqiqa: 'data.unit.minute',
  soat: 'data.unit.hour',
  kun: 'data.unit.day',
  oy: 'data.unit.month',
  'Kechikish jarimasi': 'data.ruleName.late',
  'Qo’shimcha soat to’lovi': 'data.ruleName.overtime',
  'Bayram kuni ishlash': 'data.ruleName.holiday',
  'Tungi smena ustamasi': 'data.ruleName.night',
  'Intizom bonusi': 'data.ruleName.perfect',
  'Reja bajarilishi': 'data.ruleName.sales',
  // ---- payroll templates ----
  'Ofis xodimlari': 'data.template.office.name',
  'Belgilangan oylik, kechikish va erta ketish uchun jarima, intizom bonusi': 'data.template.office.desc',
  'Kassirlar — smenali': 'data.template.hourly.name',
  'Soatbay to’lov, tungi va qo’shimcha soatlar uchun ustama': 'data.template.hourly.desc',
  'Sotuv bo’limi': 'data.template.sales.name',
  'Oklad + savdodan ulush, rejani bajarganlik uchun bonus': 'data.template.sales.desc',
  'Xavfsizlik va haydovchilar': 'data.template.daily.name',
  'Kunbay to’lov, bayram va tungi ish uchun qo’shimcha': 'data.template.daily.desc',
  'Rahbarlar va texnik xodimlar': 'data.template.managers.name',
  'Yuqori oylik, faqat sababsiz kelmaslik uchun jarima': 'data.template.managers.desc',
  // ---- monitoring events & devices ----
  Ketdi: 'data.event.outLabel',
  Begona: 'data.event.unknown',
  'Begona shaxslar': 'data.event.unknownTab',
  Kirish: 'data.event.directionIn',
  Chiqish: 'data.event.directionOut',
  Aniqlanmadi: 'data.event.directionUnknown',
  'Kirish · Asosiy eshik': 'data.device.mainDoorIn',
  'Chiqish · Asosiy eshik': 'data.device.mainDoorOut',
  'Kirish · Turniket 1': 'data.device.turnstile1In',
  'Kirish · Turniket 2': 'data.device.turnstile2In',
  'Chiqish · Turniket 1': 'data.device.turnstile1Out',
  'Chiqish · Turniket 2': 'data.device.turnstile2Out',
  'Lobbi · Kamera 4': 'data.device.lobbyCam4',
  'Qabulxona · Kamera 2': 'data.device.receptionCam2',
  // ---- short weekday labels ----
  Du: 'dates.weekdaysShort.mon',
  Se: 'dates.weekdaysShort.tue',
  Ch: 'dates.weekdaysShort.wed',
  Pa: 'dates.weekdaysShort.thu',
  Ju: 'dates.weekdaysShort.fri',
  Sh: 'dates.weekdaysShort.sat',
  Ya: 'dates.weekdaysShort.sun',
  // ---- long weekday labels ----
  Dushanba: 'dates.weekdays.mon',
  Seshanba: 'dates.weekdays.tue',
  Chorshanba: 'dates.weekdays.wed',
  Payshanba: 'dates.weekdays.thu',
  Juma: 'dates.weekdays.fri',
  Shanba: 'dates.weekdays.sat',
  Yakshanba: 'dates.weekdays.sun',
  // ---- months ----
  Yanvar: 'dates.months.jan',
  Fevral: 'dates.months.feb',
  Mart: 'dates.months.mar',
  Aprel: 'dates.months.apr',
  May: 'dates.months.may',
  Iyun: 'dates.months.jun',
  Iyul: 'dates.months.jul',
  Avgust: 'dates.months.aug',
  Sentabr: 'dates.months.sep',
  Oktabr: 'dates.months.oct',
  Noyabr: 'dates.months.nov',
  Dekabr: 'dates.months.dec',
};

/** Uzbek writes several letters with a modifier apostrophe; treat them all as one. */
const norm = (s: string) => s.replace(/[‘’ʼʻ`´]/g, "'").trim();

const KEYS = new Map(Object.entries(VALUE_KEYS).map(([k, v]) => [norm(k), v]));

/** Translate a mock-data literal into the given locale. */
export function glossValue(locale: Locale, value: string): string {
  if (!value || locale === 'uz') return value;
  const path = KEYS.get(norm(value));
  if (path) {
    const translated = lookup(locale, path);
    if (translated) return translated;
  }
  return locale === 'uz-Cyrl' ? transliterate(value) : value;
}

/** Same, for the language currently being rendered. */
export const text = (value: string) => glossValue(getStaticLocale(), value);
