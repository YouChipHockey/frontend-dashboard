import React, { useRef, useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';

const generateData = (raw_array) => {
  const data = [];

  for (var element of raw_array) {
    let totalCount = element.count;

    data.push({
      x: 0,
      y: totalCount,
      value: totalCount,
    });
  }


  return data;
};

const HeatMap = () => {
  const [heatmapData, setHeatmapData] = useState([]);
  const [fetchData, setfetchData] = useState([]);
  const [playerData, setplayerData] = useState([]);
  const serverUrl = 'http://81.19.137.188:5000/api/square_counts'
  const canvasRef = useRef(null);

  const generateHeatmapData = (data) => {
    const heatmapData = [];

    for (var element of data){
      heatmapData.push({
      name: 'A',
      data: generateData(element),
    })
    };

    setHeatmapData(heatmapData);
  };

  const fetchDataAndGenHeatmap = async () => {
    try {
      const response = await fetch(serverUrl);
      if (response.ok) {
        const data = await response.json()
        console.log(data);
        generateHeatmapData(data);
        setplayerData(data);

        let my_data = data.map(row => row && row.map(cell => {
          if (cell) {
            const totalCount = cell.count;
            return [totalCount]; // Возвращаем новый массив с суммарным значением count
          }
          return cell; // Возвращаем неизмененный cell, если он пустой или не существует
        }));
        

        setfetchData(my_data);


      } else {
        console.warn('Server responded with an error:', response.status);
      }
    } catch (error) {
      console.error('Error fetching player coordinates:', error);
    }
  };

  useEffect(() => {
    // generateHeatmapData();
    const canvas = canvasRef.current;
    fetchDataAndGenHeatmap();
    const ctx = canvas.getContext('2d');
    ctx.globalAlpha = 0.5;


    ctx.beginPath();
    ctx.moveTo(77, 0);
    ctx.lineTo(77, 616);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(466, 0);
  ctx.lineTo(466, 616);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(753, 0);
  ctx.lineTo(753, 616);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.moveTo(1142, 0);
  ctx.lineTo(1142, 616);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.closePath();


  ctx.beginPath();
  ctx.arc(217 + 15, 122 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(217 + 15, 472 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(507 + 15, 122 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(507 + 15, 472 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(698 + 15, 122 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(698 + 15, 472 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(988 + 15, 122 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(988 + 15, 472 + 15, 7.5, 0, 2 * Math.PI);
  ctx.fillStyle = "#FF0000";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(217 + 15, 122 + 15, 88.5, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(217 + 15, 472 + 15, 88.5, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(988 + 15, 122 + 15, 88.5, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.arc(988 + 15, 472 + 15, 88.5, 0, 2 * Math.PI);
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.closePath();
  }, []);

  const options = {
    chart: {
      type: 'heatmap',
      toolbar: {
        show: false
      },
    },
    tooltip: {
      enabled: true,
      followCursor: true,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        if (
          playerData &&
          playerData.length > seriesIndex &&
          playerData[seriesIndex] &&
          playerData[seriesIndex].length > dataPointIndex &&
          playerData[seriesIndex][dataPointIndex]
        ) {
          let players = playerData[seriesIndex][dataPointIndex].top_players;
    
          if (players) {
            let maxCount = Math.max(...fetchData[seriesIndex]);
    
            let topPlayersString = players.slice(0, 5)
              .map(player => player !== '' ?
                `<div >
                  '<span class=></span>'
                  ${player}                
                  </div>`
                : '')
              .join('');
    
            return `
              <div class="custom-tooltip">
                ${topPlayersString}
              </div>`;
          } else {
            console.error("Invalid or empty players array:", players);
            return "";
          }
        } else {
          console.error("Invalid seriesIndex or dataPointIndex:", seriesIndex, dataPointIndex);
          return "";
        }
    

    }
    
    
    
  
    },
    plotOptions: {
      heatmap: {
        shadeIntensity: 0.5,
        useFillColorAsStroke: true,
        colorScale: {
          ranges: [
            { from: 0, to: Math.max(...fetchData.map(row => Math.max(...row)))/1.65, color: '#2E318F', name: "Низкая активность" },
            { from: Math.max(...fetchData.map(row => Math.max(...row)))/1.65 + 1, to: Math.max(...fetchData.map(row => Math.max(...row))), color: '#FF0000', name: "Высокая активность"},
          ],
        },

      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      labels: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: false,
      },
    },
    stroke: {
      width: 1,
    },
    grid: {
      width: "100%",
      height: 616.5,
      radius: 45, 
      // background: 'rgba(255, 255, 255, 0.7)', // Set background color with opacity
      column: {
        colors: undefined,
        opacity: 0.1
      },
      row: {
        colors: undefined,
        opacity: 0.5
      },

    },
  };

  return (
    <div style={{ width: '1220px', height: '100%', position: 'relative' }}>
      <div >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', top: 45, left: 18, border: '4px solid black', backgroundColor: 'white', borderRadius: '45px' }}
        width={1220}
        height={616.5}
      />      
      <svg className="center-svg" width="197" height="195" viewBox="0 0 197 195" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g opacity="0.5">
      <path d="M98.89 194.49C152.97 194.49 196.81 151.071 196.81 97.51C196.81 43.9494 152.97 0.529999 98.89 0.529999C44.8103 0.529999 0.969971 43.9494 0.969971 97.51C0.969971 151.071 44.8103 194.49 98.89 194.49Z" fill="white"/>
      <path d="M99.41 188.84C149.85 188.84 190.74 147.95 190.74 97.51C190.74 47.0698 149.85 6.17999 99.41 6.17999C48.9698 6.17999 8.08002 47.0698 8.08002 97.51C8.08002 147.95 48.9698 188.84 99.41 188.84Z" fill="#0D162B" stroke="#FF0000" stroke-width="3" stroke-miterlimit="10"/>
      <path d="M141.78 55.14H57.04V139.88H141.78V55.14Z" fill="white"/>
      <path d="M138.02 58.91H60.81V136.12H138.02V58.91Z" fill="#0D162B"/>
      <path d="M128.6 68.32H70.22V126.7H128.6V68.32Z" fill="white"/>
      <path d="M59.35 92.8H34.87V102.22H59.35V92.8Z" fill="white"/>
      <path d="M59.35 66.44H34.87V75.86H59.35V66.44Z" fill="white"/>
      <path d="M81.95 34.43H72.53V58.91H81.95V34.43Z" fill="white"/>
      <path d="M164.8 66.44H140.32V75.86H164.8V66.44Z" fill="white"/>
      <path d="M164.8 92.8H140.32V102.22H164.8V92.8Z" fill="white"/>
      <path d="M164.8 119.17H140.32V128.59H164.8V119.17Z" fill="white"/>
      <path d="M59.35 119.17H34.87V128.59H59.35V119.17Z" fill="white"/>
      <path d="M104.12 34.43H94.7V58.91H104.12V34.43Z" fill="white"/>
      <path d="M126.53 34.43H117.11V58.91H126.53V34.43Z" fill="white"/>
      <path d="M126.53 137.38H117.11V161.86H126.53V137.38Z" fill="white"/>
      <path d="M81.95 137.38H72.53V161.86H81.95V137.38Z" fill="white"/>
      <path d="M104.12 137.38H94.7V161.86H104.12V137.38Z" fill="white"/>
      </g>
      </svg>
      </div>
        <ReactApexChart options={options} series={heatmapData} type="heatmap" width="1262px" height="679px" />
    </div>
  );
};

export default HeatMap;
