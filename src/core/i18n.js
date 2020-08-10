import i18n from 'i18next';
import { windowLocalStorage } from 'matsumoto/src/core/misc/window-storage';
import matsumotoEnglish from 'matsumoto/src/translation/english';
import matsumotoArabic from 'matsumoto/src/translation/arabic';
import shuriEnglish from 'shuri/translation/english';
import shuriArabic from 'shuri/translation/english';
import settings from 'settings';

i18n.init({
    lng: windowLocalStorage.get('locale') || settings.default_culture,
    resources: {
        en: {
            translations: {
                ...matsumotoEnglish.translations,
                ...shuriEnglish.translations
            }
        },
        ar: {
            translations: {
                ...matsumotoArabic.translations,
                ...shuriArabic.translations
            }
        },
    },
    fallbackLng: 'en',
    // eslint-disable-next-line no-undef
    debug: __localhost,
    ns: ['translations'],
    defaultNS: 'translations',
    keySeparator: true,
    interpolation: {
        escapeValue: false,
        formatSeparator: ','
    },
    react: {
        wait: true
    }
});

export default i18n;
