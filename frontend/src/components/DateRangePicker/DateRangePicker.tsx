import { Box } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateRangePickerProps } from './DateRangePicker.props.ts';
import * as dayjs from 'dayjs';
import { FC } from 'react';

const today = dayjs();
const yesterday = dayjs().subtract(1, 'day');

export const DateRangePicker: FC<DateRangePickerProps> = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{
        display: "flex",
        flexDirection: "row",
        minWidth: 400
      }}>
        <DatePicker

          label="Start Date"
          defaultValue={yesterday}
          views={['year', 'month', 'day']}
          maxDate={yesterday}
          value={startDate}
          onChange={onStartDateChange}
          sx={{ mr: 2 }}
        />
        <DatePicker
          label="End Date"
          disableFuture
          defaultValue={today}
          views={['year', 'month', 'day']}
          value={endDate}
          onChange={onEndDateChange}
        />
      </Box>
    </LocalizationProvider>
  );
}
