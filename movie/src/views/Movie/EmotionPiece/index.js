import Styles from "./EmotionPiece.module.scss";
import { useState, useEffect } from 'react';
import { Heatmap } from '@ant-design/plots';

const EmotionPiece = (props) => {
  const emotionData = props.emotionData;
    const [data, setData] = useState([]);

  useEffect(() => {
    asyncFetch();
  }, []);

  const asyncFetch = () => {
    fetch('https://gw.alipayobjects.com/os/bmw-prod/68d3f380-089e-4683-ab9e-4493200198f9.json')
      .then((response) => response.json())
      .then((json) => setData(json))
      .catch((error) => {
        console.log('fetch data failed', error);
      });
  };
  const config = {
    data,
    xField: 'name',
    yField: 'country',
    colorField: 'value',
    sizeField: 'value',
    shape: 'square',
    color: ['#dddddd', '#9ec8e0', '#5fa4cd', '#2e7ab6', '#114d90'],
    label: {
      style: {
        fill: '#fff',
        shadowBlur: 2,
        shadowColor: 'rgba(0, 0, 0, .45)',
      },
    },
  };

  return (
    <div className={Styles.emotionPiece}>
      <Heatmap {...config} />
    </div>
  );
};

export default EmotionPiece;
