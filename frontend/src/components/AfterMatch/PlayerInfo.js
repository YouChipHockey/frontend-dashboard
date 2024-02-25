// PlayerInfo.js

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ApexCharts from 'react-apexcharts';


const PlayerInfo = ({ match }) => {
    const { playerId } = useParams();

  const [playerData, setPlayerData] = useState(null);
  const [chartData, setChartData] = useState({});

  const generateRandomDatax = () => ({
    Goals: Math.floor(Math.random() * 10),
    Assists: Math.floor(Math.random() * 10),
    Points: Math.floor(Math.random() * 20),
    BlockedShots: Math.floor(Math.random() * 15),
    TimeOnIce: Math.floor(Math.random() * 30),
    ShootingPercentage: Math.random() * 100,
    FaceoffPercentage: Math.random() * 100,
    PlusMinus: Math.floor(Math.random() * 5) - 2, // Генерация от -2 до 2
    PenaltyMinutes: Math.floor(Math.random() * 10),
  });

  const [chartOptions, setChartOptions] = useState({
    chart: {
      type: 'radar',
      radar: {
        size: 200
    },
    markers: {
        size: 4,
        colors: ['#fff'],
        strokeColor: '#FF4560',
        strokeWidth: 2,
      },
    },
    series: [{
      name: 'Player Stats',
      data: Object.values(generateRandomDatax()),
    }],
    labels: Object.keys(generateRandomDatax()),
  });


  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await fetch(`http://81.19.137.188:5000/api/player/${playerId}`);
        if (response.ok) {
          const newPlayersData = await response.json();
          console.log(newPlayersData);
          setPlayerData(newPlayersData);

          // Assuming newPlayersData contains speed-related information
          const speedChartDataConfig = {
            options: {
              chart: {
                id: 'speed-chart',
              },
              xaxis: {
                categories: newPlayersData.speeds.map(entry => entry.minute),
              },
            },
            series: [
              {
                name: 'Speed',
                data: newPlayersData.speeds.map(entry => entry.average_speed),
              },
            ],
          };

          setChartData(speedChartDataConfig);
        } else {
          console.warn('Server responded with an error:', response.status);
        }
      } catch (error) {
        console.error('Error fetching player data:', error);
      }
    };

    fetchPlayerData();
  }, [playerId]);

  return (
    <div className='PlayerDet'>
      {playerData ? (
        <div className='PlayerStartCard'>
        <div className='PlayerMainInfo'>
      <div className='PlayerAvatar'>
      <img className='imageInsideDiv'
        src={`data:image/jpeg;base64,${playerData.image}`}
        alt={`Player ${playerData.id} Image`}
      />
      </div>
      <div className='PlayerMainDetails'>
        <div className='PlayerHeader'>
          <h3>{playerData.name} {playerData.surname}</h3>
          <h3># {playerData.num}</h3>
        </div>
        <div className='PlayerBodyDet'>
          <h3>Хват: {playerData.grip}</h3>
          <h3>Позиция: {playerData.position}</h3>
          <h3>Команда: {playerData.team}</h3>
          <h3>Рост: {playerData.height}</h3>
          <h3>Дата рождения: {playerData.birth_date}</h3>
          <h3>Вес: {playerData.weight}</h3>
          <h3>Возраст: {playerData.age}</h3>
        </div>
      </div>
    </div>
        <h1>Статистика игрока</h1>
        <div className='chartsPlayer'>
            <ApexCharts options={chartOptions} series={chartOptions.series} type="radar" height={450} width={500}  />
            <ApexCharts options={chartData.options} series={chartData.series} type="line" height={350} width={900}/>
        </div>
        <h1>Показатели катания</h1>
        <div className='PlayerMainInfo'>
        <div className='PlayerStatDet'>
          <h3>Cр. скорость:
          {playerData.avg_speed} км/ч</h3>
          <h3>Макс. скорость:
          {playerData.max_speed} км/ч</h3>
          <h3>Ускорений:
          {playerData.accelerations}</h3>
          <h3>Торможений:
          {playerData.decelerations}</h3>
          <h3>Время для макс. скор.:
- с.</h3>
          <h3>Виражей:
-</h3>
          <h3>Время выпол.Виража:
-</h3>

<h3>Время выпол.Виража:
-</h3>

<h3>Время выпол.Виража:
-</h3>

<h3>Расстояние:
{playerData.dist} м.</h3>

<h3>Время:
{playerData.time} с.</h3>

<h3>Макс. угол наклона:
-</h3>


        </div>
        </div>
        </div>
      ) : (
        <p>Loading player data...</p>
      )}
    </div>
  );
};

export default PlayerInfo;
