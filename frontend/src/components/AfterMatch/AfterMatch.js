import React, { useState } from 'react';
import HeatMapCanvas from './HeatMap.js';
import { Tabs, Tab } from '@mui/material';
import { styled} from '@mui/material/styles';
import PlayerTrajectories from './Trajectory/PlayerTrajectories.js';
import MatchAnalytics from './MatchAnalytics.js'

const StyledTabs = styled(Tabs)({
 marginTop:"15px",
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

const AfterMatch = () => {
 const [selectedTab, setSelectedTab] = useState('1');

 const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
 };

 return (
    <div className='mapcontainer'>
      <StyledTabs value={selectedTab} defaultValue={'1'} onChange={handleTabChange} textColor="white">
        <StyledTab value='1' label="HeatMap" />
        <StyledTab value='2' label="Траектории и передвижение" />
        <StyledTab value='3' label="Ускорения и виражи" />
        <StyledTab value='4' label="Аналитика по матчу" />
      </StyledTabs>

      {selectedTab === '1' && <div><HeatMapCanvas /></div>}
      {selectedTab === '2' && <div><PlayerTrajectories /></div>}
      {selectedTab === '4' && <div><MatchAnalytics /></div>}
    </div>
 );
};

export default AfterMatch;