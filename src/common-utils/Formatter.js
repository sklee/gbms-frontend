import {DateTime} from 'luxon';

export const formatDate = (dateString) => {
    const dateISOString = new Date(dateString).toISOString();
    const formattedDateTime = DateTime.fromISO(dateISOString);
    return formattedDateTime.setLocale('ko').toLocaleString(DateTime.DATE_FULL);
}

export const formatCurrency = (amount) => `₩${new Intl.NumberFormat('ko-KR').format(amount)}`;
