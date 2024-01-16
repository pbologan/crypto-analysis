import { Box, CircularProgress } from '@mui/material';
import { FC } from 'react';
import { LoadingProps } from 'src/components/Loading/Loading.props.ts';

export const Loading: FC<LoadingProps> = ({ active }) => {
  return (
    <Box sx={{
      position: "absolute",
      display: `${active ? "flex": "none"}`,
      justifyContent: "center",
      alignItems: "center",
      width: "100%",
      height: "100vh",
      bgcolor: "#ffffff80"
    }}>
      <CircularProgress size={80}/>
    </Box>
  );
};
