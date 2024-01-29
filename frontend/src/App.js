import React, { useState, useEffect } from 'react';
import './App.css';
import HockeyMap from './components/RealTime/HockeyMap.js';
import MatchControl from './components/RealTime/MatchControl.js';
import AfterMatch from './components/AfterMatch/AfterMatch.js';
import { Tabs, Tab } from '@mui/material';
import { styled} from '@mui/material/styles';


const StyledTabs = styled(Tabs)({
  marginTop:"10px",
  backgroundColor: '#333333',
  borderBottom: 'none',
  borderRadius: "10px",
  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    height: "100%",
    backgroundColor: "transparent"
  },
});

const StyledTab = styled(Tab)({
  color: 'white',
  paddingLeft: "20px",
  paddingRight: "20px",
  '&.Mui-selected': {
    backgroundColor: '#4D4D4D',
    borderRadius: "10px",
    border: "None"
  },
  borderBottom: 'none',
  fontFamily: 'Gilroy, sans-serif',

});




const App = () => {
  const [selectedTab, setSelectedTab] = React.useState('1');

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <div className='mapcontainer'>
      <StyledTabs value={selectedTab} defaultValue={'1'} onChange={handleTabChange} textColor="white">
        <StyledTab value='1' label="Live Match" />
        <StyledTab value='2' label="After Match" />
      </StyledTabs>

      {selectedTab === '1' && (
        <div>
          <MatchControl />
          <HockeyMap className="map" />
        </div>
      )}
      {selectedTab === '2' && <AfterMatch />}
    </div>
  );
};

export default App;
