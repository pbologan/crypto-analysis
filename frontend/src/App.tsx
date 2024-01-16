import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography,
} from '@mui/material';
import * as dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer, Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { isHttpError } from 'api/http-types';
import { DateRangePicker } from './components/DateRangePicker';
import { Loading } from './components/Loading';
import { Coin, FearGreedChartData, PriceChartData } from './types';
import dataService from './dataService';

const chartHeight = 400

function App() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [prices, setPrices] = useState<PriceChartData[]>([]);
  const [fearGreedIndexes, setFearGreedIndexes] = useState<FearGreedChartData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentCoin, setCurrentCoin] = useState<Coin | undefined>(undefined);
  const [startDate, setStartDate] = useState<dayjs.Dayjs>(dayjs().subtract(1, 'day'));
  const [endDate, setEndDate] = useState<dayjs.Dayjs>(dayjs());
  const [histogramPricesData, setHistogramPricesData] = useState<any[][]>([]);
  const [histogramFAGData, setHistogramFAGData] = useState<any[][]>([]);
  const [scatterData, setScatterData] = useState<{ fearGreed: any; price: number; }[]>([]);
  const [pValue, setPValue] = useState<number | null>(null);
  const [pearson, setPearson] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  useEffect(() => {
    setLoading(true);
    dataService.getCoins()
      .then(data => {
        if (isHttpError(data)) {
          setError(data.reason);
        } else {
          setCoins(data);
          setCurrentCoin(data[0])
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {

  }, [currentCoin, coins]);

  const handleCoinSelect = (e: SelectChangeEvent) => {
    const selectedCoinName = e.target.value;
    const foundCoin = coins.find(c => c.name === selectedCoinName);
    if (foundCoin !== undefined) {
      setCurrentCoin(foundCoin);
    }
  };

  const handleGetDataClick = () => {
    if (coins.length > 0 && currentCoin !== undefined) {
      setLoading(true);
      dataService.getChartData({ coinId: currentCoin.id, start: startDate, end: endDate })
        .then(data => {
          if (isHttpError(data)) {
            setError(data.reason);
          } else {
            setPrices(data.prices);
            setFearGreedIndexes(data.fearGreed);
            setPValue(data.pValue);
            setPearson(data.pearson);

            const fag = new Map();
            data.fearGreed.forEach(f => {
              fag.set(f.timestamp, f.value);
            });

            const scatter = data.prices.map(p => {
              return {
                fearGreed: fag.get(p.timestamp),
                price: p.value
              }
            });

            setScatterData(scatter);

            const pricesData: any[][] = [["Price", "Value"]];
            const fagData: any[][] = [["Fear And Greed", "Value"]];
            data.prices.forEach(p => {
              pricesData.push([String(p.value), p.value]);
            });
            data.fearGreed.forEach(fag => {
              fagData.push([String(fag.value), fag.value]);
            });
            setHistogramPricesData(pricesData);
            setHistogramFAGData(fagData);
          }
          setLoading(false);
        });
    }
  };

  const handleStartDateChange = (date: dayjs.Dayjs | null) => {
    if (date !== null) {
      setStartDate(date);
    }
  };

  const handleEndDateChange = (date: dayjs.Dayjs | null) => {
    if (date !== null) {
      setEndDate(date);
    }
  };

  return (
    <Box sx={{
      width: "100%",
      height: "100vh",
      bgcolor: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center"
    }}>
      <Box
        sx={{
          minWidth: 150,
          height: 60,
          display: "flex",
          flexDirection: "row",
          p: 2,
          mt: 2
        }}
      >
        {currentCoin !== undefined && <FormControl fullWidth>
          <InputLabel id="coin-select">Coin</InputLabel>
          <Select
              sx={{ mr: 2 }}
              labelId="coin-select"
              label="Coin"
              value={currentCoin?.name}
              onChange={handleCoinSelect}
          >
            {coins.map(coin => {
              return <MenuItem key={coin.id} value={coin.name}>{coin.name}</MenuItem>
            })}
          </Select>
        </FormControl>}
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
        />
        <Button
          variant="contained"
          onClick={handleGetDataClick}
          disabled={coins.length === 0 || currentCoin === undefined}
          sx={{ height: 55, minWidth: 90, ml: 2 }}
        >
          Get Data
        </Button>
        <Button
          variant="contained"
          onClick={async () => {
            if (currentCoin !== undefined) {
              await dataService.getCSV({
                coinId: currentCoin.id,
                start: startDate,
                end: endDate
              })
            }
          }}
          disabled={coins.length === 0 || currentCoin === undefined}
          sx={{ height: 55, minWidth: 120, ml: 2 }}
        >
          Download CSV
        </Button>
      </Box>
      {prices.length > 0 && <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%"
        }}
      >
        <Typography variant="h5" align="center" sx={{ mb: 1, mt: 1 }}>{`График стоимостей ${currentCoin?.name}`}</Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart
            syncId="charts"
            data={prices}
          >
            <Line
              type="monotone"
              dataKey="value"
              dot={false}
            />
            <XAxis dataKey="time" />
            <YAxis dataKey="value" />
            <Tooltip />
            <CartesianGrid strokeDasharray=" 3 3" />
          </LineChart>
        </ResponsiveContainer>
      </Box>}
      {fearGreedIndexes.length > 0 && <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%"
        }}
      >
        <Typography variant="h5" align="center" sx={{ mb: 1, mt: 1 }}>{`График индексов страха и жадности ${currentCoin?.name}`}</Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <LineChart
            syncId="charts"
            data={fearGreedIndexes}
          >
            <Line
              type="monotone"
              dataKey="value"
              dot={false}
            />
            <XAxis dataKey="time" />
            <YAxis dataKey="value" />
            <Tooltip />
            <CartesianGrid strokeDasharray=" 3 3" />
          </LineChart>
        </ResponsiveContainer>
      </Box>}
      {scatterData.length > 0 && <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%"
        }}
      >
        <Typography variant="h5" align="center" sx={{ mb: 1, mt: 1 }}>{`Диаграмма рассеяния ${currentCoin?.name}`}</Typography>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ScatterChart>
            <CartesianGrid strokeDasharray=" 3 3"  />
            <XAxis type="number" dataKey="price" name="Price" />
            <YAxis type="number" dataKey="fearGreed" name="Fear And Greed Index" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter data={scatterData} fill="#8884d8" />
          </ScatterChart>
        </ResponsiveContainer>
      </Box>}
      <Box
        sx={{
          width: "100%",
          height: 400,
          display: "flex",
          flexDirection: "row"
        }}
      >
        <Box sx={{  maxWidth: 700, flexGrow: 1 }}>
          {histogramPricesData.length > 0 && <Chart
              chartType="Histogram"
              width="100%"
              height="400px"
              data={histogramPricesData}
              options={{
                title: `Гистограмма стоимостей ${currentCoin?.name}`,
                legend: { position: "bottom"}
              }}
          />}
        </Box>
        {(pValue !== null && pearson !== null) &&
            <Box sx={{ maxWidth: 400, flexGrow: 1, pt: 4 }}>
              <table style={{ border: "1px solid black", padding: "4px" }}>
                <tbody>
                <tr>
                  <th style={{ borderBottom: "1px solid gray", padding: "2px" }}>Pearson</th>
                  <td style={{ borderBottom: "1px solid gray", padding: "2px" }}>{pearson.toFixed(4)}</td>
                </tr>
                <tr>
                  <th>P Value</th>
                  <td>{pValue}</td>
                </tr>
                </tbody>
              </table>
            </Box>}
        <Box sx={{ maxWidth: 700, flexGrow: 1 }}>
          {histogramFAGData.length > 0 && <Chart
              chartType="Histogram"
              width="100%"
              height="400px"
              data={histogramFAGData}
              options={{
                title: `Гистограмма индексов страха и жадности ${currentCoin?.name}`,
                legend: { position: "bottom"}
              }}
          />}
        </Box>
      </Box>
      <Dialog
        open={error !== null}
        onClose={() => setError(null)}
      >
        <DialogTitle>
        Error
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {error}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setError(null)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Loading active={loading} />
    </Box>
  )
}

export default App
