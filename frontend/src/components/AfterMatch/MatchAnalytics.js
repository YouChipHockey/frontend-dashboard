import React, { useState, useEffect } from 'react';
import ApexChart from 'react-apexcharts';
import './HockeyMatchAnalytics.css';
import { Link } from 'react-router-dom';

const HockeyMatchAnalytics = ({ matchId }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [playersData, setplayersData] = useState([]);
  const serverUrl = 'http://147.45.68.109:5000/api/players';


  useEffect(() => {
    const fetchData = async () => {
        try {
          const response = await fetch(serverUrl);
          if (response.ok) {
            const newPlayersData = await response.json();
            setplayersData(newPlayersData)
            console.log(newPlayersData)
          } else {
            console.warn('Server responded with an error:', response.status);
          }
        } catch (error) {
          console.error('Error fetching player coordinates:', error);
        }
      };

    const simulatedData = {
        matchId: '1 ',
      duration: '2h 15min',
      totalDistanceOnline: '12 km',
      totalDistanceByPeriod: [5, 4, 3, 1, 4, 2, 4, 5, 6],
      averageDistanceByPeriod: [1.5, 2, 1.2],
      accelerations: 50,
      speedData: [10, 15, 20, 25, 18, 22, 30, 28, 25],
      accelerationData: [5, 8, 10, 12, 7, 9, 15, 14, 11],
      accelerationsOverTime: [
        { time: '0s', count: 2 },
        { time: '30s', count: 5 },
        { time: '1m', count: 8 },
        { time: '1m 30s', count: 12 },
        { time: '2m', count: 10 },
        { time: '2m 30s', count: 7 },
        { time: '3m', count: 9 },
        { time: '3m 30s', count: 15 },
        { time: '4m', count: 11 },
      ],
      playerSpeedByShift: [18, 20, 22, 25, 23, 28, 30, 26, 24],
      onlineAcceleration: 7,
    };

    fetchData();

    // Устанавливаем симуляционные данные
    setAnalyticsData(simulatedData);
  }, [matchId]);

  const chartOptionsTotalDistanceByPeriod = {
    xaxis: {
      categories: ['0s', '30s', '1m', '1m 30s', '2m', '2m 30s', '3m', '3m 30s', '4m'],
    },
    chart: {
      toolbar: {
        show: false,
      },
    },
    title: {
        text: 'Общая пройденная дистанция по времени',
        align: 'center',
      },
  };

  const chartOptionsAverageDistanceByPeriod = {
    xaxis: {
      categories: ['0s', '30s', '1m', '1m 30s', '2m', '2m 30s', '3m', '3m 30s', '4m'],
    },
    chart: {
      toolbar: {
        show: false,
      },
    },
  };
  const chartOptionsSpeed = {
    xaxis: {
      categories: ['0s', '30s', '1m', '1m 30s', '2m', '2m 30s', '3m', '3m 30s', '4m'],
    },
    chart: {
      toolbar: {
        show: false,
      },
    },
    title: {
      text: 'График скорости',
      align: 'center',
    },
  };

  const chartOptionsAcceleration = {
    xaxis: {
      categories: ['0s', '30s', '1m', '1m 30s', '2m', '2m 30s', '3m', '3m 30s', '4m'],
    },
    chart: {
      toolbar: {
        show: false,
      },
    },
    title: {
      text: 'График ускорения',
      align: 'center',
    },
  };

  const chartOptionsAccelerationsOverTime = {
    xaxis: {
      categories: analyticsData?.accelerationsOverTime?.map(item => item.time) || [],
    },
    chart: {
      toolbar: {
        show: false,
      },
    },
    title: {
      text: 'График количества ускорений по времени',
      align: 'center',
    },
  };

  const chartOptionsPlayerSpeedByShift = {
    xaxis: {
      categories: ['Shift 1', 'Shift 2', 'Shift 3', 'Shift 4', 'Shift 5', 'Shift 6', 'Shift 7', 'Shift 8', 'Shift 9'],
    },
    chart: {
      toolbar: {
        show: false,
      },
    },
    title: {
      text: 'График скорости хоккеиста по сменам',
      align: 'center',
    },
  };



  return (
    <div>
    <div className="hockey-analytics-container">
      {analyticsData ? (
        <div className="charts-grid">
          {/* Вывод данных аналитики */}
          
          <h1>Аналитика по прошедшему матчу</h1>
          <div>
            <p>Match ID: {analyticsData.matchId}</p>
            <p>Длительность матча: {analyticsData.duration}</p>
            <p>Суммарное пройденное расстояние: {analyticsData.totalDistanceOnline}</p>
            <p>Ускорение в режиме онлайн: {analyticsData.onlineAcceleration}</p>
          </div>

          {/* Графики */}
          <ApexChart
            options={chartOptionsTotalDistanceByPeriod}
            series={[{ name: 'Пройденное расстояние', data: analyticsData.totalDistanceByPeriod }]}
            type="area"
            height={200}
          />

        <ApexChart
            options={chartOptionsSpeed}
            series={[{ name: 'Скорость', data: analyticsData.speedData }]}
            type="line"
            height={300}
          />

          <ApexChart
            options={chartOptionsAcceleration}
            series={[{ name: 'Ускорение', data: analyticsData.accelerationData }]}
            type="line"
            height={300}
          />


          <ApexChart
            options={chartOptionsAverageDistanceByPeriod}
            series={[{ name: 'Средний пробег', data: analyticsData.averageDistanceByPeriod }]}
            type="bar"
            height={300}
          />

          <ApexChart
            options={chartOptionsAccelerationsOverTime}
            series={[{ name: 'Количество ускорений', data: analyticsData?.accelerationsOverTime?.map(item => item.count) || [] }]}
            type="bar"
            height={300}
          />

          <ApexChart
            options={chartOptionsPlayerSpeedByShift}
            series={[{ name: 'Скорость хоккеиста', data: analyticsData.playerSpeedByShift }]}
            type="line"
            height={300}
            width={500}

          />
        </div>
      ) : (
        <p>Loading hockey analytics data...</p>
      )}
    </div>
    <h1>Игроки матча</h1>
    <div className='meow'>
    {playersData.map((player =>
    <Link to={`/players/${player.id}`} style={{ textDecoration: 'none' }}>

    <div className='PlayerMainInfo'>
      <div className='PlayerAvatar'>
      <img className='imageInsideDiv'
        src={`data:image/jpeg;base64,${player.image}`}
        alt={`Player ${player.id} Image`}
      />
      </div>
      <div className='PlayerMainDetails'>
        <div className='PlayerHeader'>
          <h3>{player.name} {player.surname}</h3>
          <h3># {player.num}</h3>
        </div>
        <div className='PlayerBody'>
          <h3>Хват: левый</h3>
          <h3>Позиция: НАП</h3>
          <h3>Команда: {player.team}</h3>
        </div>
      </div>
    </div>
    </Link>
    ))}
    </div>
    </div>
  );
};

export default HockeyMatchAnalytics;
