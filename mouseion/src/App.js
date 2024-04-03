import './App.css';
import { Box } from "@mui/material";
import { MostCheckedOutBooksBarChart } from './visualizations/basicGraphs';
import { SurgeTimeGraph } from './visualizations/surgeTimeGraph';

function App() {

  return (
    <Box sx={{background: "white", width: "100vw", height: "100vh", overflow: "auto"}}>
      <SurgeTimeGraph />
    </Box>
  );
}

export default App;
