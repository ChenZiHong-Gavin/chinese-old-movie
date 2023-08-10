import Script from "react-load-script";
import { useState, useEffect } from "react";
import Styles from "./SoundLine.module.scss";
import { useRef } from "react";
import { inject, observer } from "mobx-react";

function SoundLine(props) {
  const { emotionStore } = props;
  const { toggleModal } = emotionStore;
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(false);
  const [audioData, setData] = useState(null);
  const graphRef = useRef(null);

  useEffect(() => {
    setData(props.audioSpectrum);
  }, [props.audioSpectrum]);


  useEffect(() => {
    if (!graphRef.current) return;
    if (!props.audioSpectrum) return;
    const Plotly = window.Plotly;

    const prepData = (data) => {
      return [
        {
          mode: "lines",
          x: data.x,
          y: data.y,
        },
      ];
    };

    var data = prepData(audioData);
    var layout = {
      title: "频谱分析dB/s(ref=max)",
      xaxis: {
        rangeslider: {},
        tickfont: {
          color: "white",
        },
      },
      yaxis: {
        fixedrange: true,
      },
      plot_bgcolor: "rgba(255, 240, 240, 0.4)",
      paper_bgcolor: "rgba(255, 255, 255, 0)",
      titlefont: {
        color: "white",
      },
    };
    Plotly.plot("soundGraph", data, layout, { showSendToCloud: false });
    const handleResize = () => {
      graphRef.current.innerHTML = "";
      setStart(!start);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      const graphElement = document.getElementById("soundGraph");
      if (graphElement) {
        Plotly.purge(graphElement);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [loading, start]);


  return (
    <>
      <Script
        url={process.env.PUBLIC_URL + "/plotly.min.js"}
        onLoad={() => setLoading(false)}
      />
      <div id="soundGraph" ref={graphRef} className={Styles.graphContainer}></div>
    </>
  );
}

export default inject("emotionStore")(observer(SoundLine));
