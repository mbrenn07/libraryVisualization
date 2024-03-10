import './App.css';
import { Box } from "@mui/material";
import { MostCheckedOutBooksBarChart } from './visualizations/basicGraphs';

function App() {

  return (
    <Box sx={{background: "cornsilk", width: "100vw", height: "100vh", overflow: "auto"}}>
      <MostCheckedOutBooksBarChart />
    </Box>
  );
}

export default App;
