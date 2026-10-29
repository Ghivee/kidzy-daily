import { $ } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { shell } from '../core/shell.js';
import { mountKidzy } from '../kidzy.js';

shell('');
mountKidzy($('#nfkz'), { mood: 'wow', label: t('mood.wow') });
