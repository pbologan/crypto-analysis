import * as dayjs from 'dayjs';

export interface DateRangePickerProps {
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
  onStartDateChange: (date: dayjs.Dayjs | null) => void;
  onEndDateChange: (date: dayjs.Dayjs | null) => void;
}
