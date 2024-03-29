import * as d3 from "d3";
import { useEffect } from "react";
import { useRef } from "react";
import Styles from "./EmotionMap.module.scss";
import { inject, observer } from "mobx-react";
import { parseTimeString } from "../../../../../utils/time";

const EmotionMap = ({ emotionStore }) => {
  const {
    fetchSegmentsGroupByEmotion,
    segmentsGroupByEmotion,
    rerender,
    setRerender,
    setRoseData,
    setWordCloudData,
    toggleModal,
    setSegmentInfo,
  } = emotionStore;
  const svgRef = useRef();
  const padding = 5;
  const clusterPadding = 20;
  const numClusters = 8;
  const minRadius = 80;
  const maxRadius = 150;
  // const color = d3
  //   .scaleOrdinal(d3.schemeCategory10)
  //   .domain(d3.range(numClusters));
  // const color = [
  //   "#2b2f3a",
  //   "#8f9f85",
  //   "#8f6447",
  //   "#733712",
  //   "#CABE89",
  //   "#ede6d9",
  //   "#6d6d6e"
  // ]
  const color = d3
    .scaleOrdinal()
    .domain(d3.range(numClusters))
    .range([
      "#423E14",
      "#2b2f3a",
      "#8f9f85",
      "#993712",
      "#8f6447",
      "#ECBC31",
      "#ed96d9",
      "#6d6d6e",
    ]);
  const line = d3.line().curve(d3.curveBasisClosed);
  const emotions = ["难过", "愉快", "喜欢", "愤怒", "害怕", "惊讶", "厌恶"];
  const numberRange = [
    [20, 40],
    [20, 30],
    [5, 10],
    [10, 20],
    [10, 20],
    [2, 10],
    [2, 10],
  ];
  const numbers = d3.range(7).map((idx) => {
    const range = numberRange[idx];
    return Math.floor(Math.random() * (range[1] - range[0]) + range[0]);
  });

  // type: emotion, value: number
  const roseData = emotions.map((e, idx) => ({
    type: e,
    value: numbers[idx],
  }));

  useEffect(() => {
    fetchSegmentsGroupByEmotion();
  }, []);

  // 生成节点数据
  const generateNodes = (width, height, segments) => {
    const radius = (r) => Math.sqrt(r);
    const noClusterNodes = d3.range(50).map((idx) => ({
      id: idx,
      cluster: 0,
      radius: 5,
      x: Math.random() * width,
      y: Math.random() * height,
    }));
    const totalNumber = numbers.reduce((a, b) => a + b, 0);
    const clusterNodes = d3.range(totalNumber).map((idx) => {
      let i = 0,
        sum = numbers[i];
      while (idx >= sum) {
        sum += numbers[++i];
      }
      const r = (Math.random() * (maxRadius - minRadius) + minRadius) * 1.2;
      return {
        id: idx + 50,
        cluster: i + 1,
        radius: radius(r),
        x: Math.random() * width,
        y: Math.random() * height,
      };
    });
    if (segments && segments.length > 0) {
      // 按照segments修改clusterNodes的属性
      let index = 0;
      segments.forEach((segment) => {
        segment.segmentList.forEach((s, idx) => {
          for (let key in s) {
            clusterNodes[index + idx][key] = s[key];
          }
        });
        index += segment.segmentList.length;
      });
    }
    const titleNodes = d3.range(7).map((idx) => ({
      id: idx + 200,
      cluster: idx + 1,
      radius: 40,
      x: Math.random() * width,
      y: Math.random() * height,
      title: emotions[idx],
    }));

    return noClusterNodes.concat(clusterNodes).concat(titleNodes);
  };

  // 根据节点数据生成群集对象
  const generateClusters = (nodes) => {
    const clusterMap = {};
    nodes.forEach((n) => {
      if (!clusterMap[n.cluster] || n.radius > clusterMap[n.cluster].radius)
        clusterMap[n.cluster] = n;
    });
    return clusterMap;
  };

  // 计算点的坐标数组
  const hullPoints = (data) => {
    let pointArr = [];
    const padding = 2.5;
    data.each((d) => {
      const pad = d.radius + padding;
      pointArr = pointArr.concat([
        [d.x - pad, d.y - pad],
        [d.x - pad, d.y + pad],
        [d.x + pad, d.y - pad],
        [d.x + pad, d.y + pad],
      ]);
    });
    return pointArr;
  };

  useEffect(() => {
    if (!segmentsGroupByEmotion || segmentsGroupByEmotion.length === 0) return;
    const segmentsGroup = JSON.parse(JSON.stringify(segmentsGroupByEmotion));
    const segments = [];
    if (segmentsGroup && segmentsGroup.length > 0) {
      segmentsGroup.sort((a, b) => {
        return (
          emotions.indexOf(a.emotionType) - emotions.indexOf(b.emotionType)
        );
      });
      numbers.forEach((num, idx) => {
        segments.push({
          emotionType: segmentsGroup[idx].emotionType,
          segmentList: segmentsGroup[idx].segmentList.slice(0, num),
        });
      });
      const wordCloudData = [];
      segments.forEach((s) => {
        s.segmentList.forEach((seg) => {
          let timeList = seg.time.split(" --> ");
          let startTime = timeList[0];
          let endTime = timeList[1];
          let timestamp1 = parseTimeString(startTime);
          let timestamp2 = parseTimeString(endTime);
          let timeDiffInMs = Math.abs(timestamp2 - timestamp1);

          wordCloudData.push({
            segmentId: seg.segmentId,
            text: seg.content,
            value: timeDiffInMs,
            emotion: s.emotionType,
            order: seg.order,
            videoUrl: seg.videoUrl,
            time: seg.time,
            videoId: seg.videoId,
            content: seg.content,
          });
        });
      });
      setWordCloudData(wordCloudData);
    }
    const svg = d3.select(svgRef.current);
    svg.attr("class", "emotion-map");
    const { width, height } = svg.node().getBoundingClientRect();
    const nodes = generateNodes(width, height, segments);
    const clusters = generateClusters(nodes);

    setRoseData(roseData);

    function collide(alpha) {
      const quadtree = d3
        .quadtree()
        .x(function (d) {
          return d.x;
        })
        .y(function (d) {
          return d.y;
        })
        .extent([
          [0, 0],
          [width, height],
        ])
        .addAll(nodes);
      return function (d) {
        let r = d.radius + maxRadius * 8 + Math.max(padding, clusterPadding),
          nx1 = d.x - r,
          nx2 = d.x + r,
          ny1 = d.y - r,
          ny2 = d.y + r;
        quadtree.visit(function (quad, x1, y1, x2, y2) {
          let data = quad.data;
          if (data && data !== d) {
            let x = d.x - data.x,
              y = d.y - data.y,
              l = Math.sqrt(x * x + y * y),
              r =
                d.radius +
                data.radius +
                (d.cluster == data.cluster ? padding : clusterPadding);
            if (l < r) {
              l = ((l - r) / l) * alpha;
              d.x -= x *= l;
              d.y -= y *= l;
              data.x += x;
              data.y += y;
            }
          }
          return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
        });
      };
    }
    function cluster(alpha) {
      return function (d) {
        const cluster = clusters[d.cluster];
        if (cluster === d || d.cluster == 0) return;
        let x = d.x - cluster.x,
          y = d.y - cluster.y,
          l = Math.sqrt(x * x + y * y),
          r = d.radius + cluster.radius + 3;
        if (l != r) {
          l = ((l - r) / l) * alpha;
          d.x -= x *= l;
          d.y -= y *= l;
          cluster.x += x;
          cluster.y += y;
        }
      };
    }
    const hullG = svg.append("g").attr("class", "hulls");
    const defs = svg.append("defs").attr("class", "emotion-defs");
    const clusteredNodes = nodes.filter((d) => d.cluster != 0);
    clusteredNodes.forEach((d) => {
      defs
        .append("pattern")
        .attr("id", `image${d.id}`)
        .attr("width", d.radius * 2)
        .attr("height", d.radius * 2)
        .attr("patternUnits", "objectBoundingBox")
        .append("image")
        .attr("href", d.thumbnail)
        .attr("width", d.radius * 2)
        .attr("height", d.radius * 2);
    });

    // 创建节点
    const node = svg
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(nodes.filter((d) => d.id))
      .enter()
      .append("circle")
      .attr("class", (d) => `cluster${d.cluster}`)
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => color(+d.cluster))
      // .attr("fill", "url(#circle-pattern)")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    node
      .filter((d) => d.cluster != 0 && !d.title)
      .attr("fill", (d) => `url(#image${d.id})`)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", handleNodeClick);

    function handleMouseOver() {
      //cursor: pointer;
      d3.select(this)
        .style("cursor", "pointer")
        .attr("stroke", "red")
        .attr("stroke-width", 2);
    }

    function handleMouseOut() {
      d3.select(this).style("cursor", "default");
      d3.select(this).attr("stroke", "none");
    }

    function handleNodeClick(d, i) {
      setSegmentInfo(i);
      toggleModal(true);
    }

    const hulls = hullG
      .selectAll("path")
      .data(
        Object.keys(clusters)
          .map((c) => ({
            cluster: c,
            nodes: node.filter((d) => d.cluster == c),
          }))
          .filter((d) => d.cluster != 0),
        (d) => d.cluster
      )
      .enter()
      .append("path")
      .attr("d", (d) => line(d3.polygonHull(hullPoints(d.nodes))))
      .attr("fill", (d) => color(+d.cluster))
      .attr("opacity", 0.4);

    const handleZoom = (event) => {
      svg
        .select(".nodes")
        .transition()
        .duration(1000)
        .attr("transform", event.transform);
      svg
        .select(".hulls")
        .transition()
        .duration(1000)
        .attr("transform", event.transform);
    };

    const titles = d3
      .select("svg.emotion-map")
      .select("g.nodes")
      .selectAll("text")
      .data(nodes.filter((d) => d.title))
      .enter()
      .append("text")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("fill", "black")
      .attr("stroke", "white")
      .attr("stroke-width", "1px")
      .attr("font-size", "20px")
      .attr("font-weight", "bold")
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("pointer-events", "none")
      .text((d) => d.title)
      .attr("id", (d) => "title-" + d.id);

    const zoomBehavior = d3
      .zoom()
      .scaleExtent([1, 2.0])
      .interpolate(d3.interpolateZoom)
      .filter((event) => {
        // 禁用缩放拖拽功能，只允许滚轮缩放
        return event.type === "wheel";
      })
      .on("zoom", handleZoom);

    svg.call(zoomBehavior);

    function ticked() {
      node
        .each(cluster(0.2))
        .each(collide(0.2))
        .attr(
          "cx",
          (d) => (d.x = Math.max(d.radius, Math.min(width - d.radius, d.x)))
        )
        .attr(
          "cy",
          (d) => (d.y = Math.max(d.radius, Math.min(height - d.radius, d.y)))
        );

      hulls.attr("d", (d) => line(d3.polygonHull(hullPoints(d.nodes))));
      if (simulation.alpha() < 0.005) {
        simulation.alphaTarget(0.1).restart();
      }

      titles.attr("x", (d) => d.x).attr("y", (d) => d.y);
    }

    const simulation = d3
      .forceSimulation()
      .alpha(0.3)
      .force(
        "center",
        d3
          .forceCenter()
          .x(width / 2)
          .y(height / 2)
      )
      .force(
        "collide",
        d3.forceCollide((d) => d.radius + padding)
      )
      .nodes(nodes, (d) => d.id)
      .on("tick", ticked)
      .restart();

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.1).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    function resize() {
      simulation.stop();
      svg.selectAll(".hulls").remove();
      svg.selectAll(".nodes").remove();
      svg.selectAll(".emotion-defs").remove();
      setRerender(!rerender);
    }

    window.addEventListener("resize", resize);

    return () => {
      simulation.stop();
      svg.selectAll(".hulls").remove();
      svg.selectAll(".nodes").remove();
      svg.selectAll(".emotion-defs").remove();
      window.removeEventListener("resize", resize);
      // remove zoom event
      svg.on(".zoom", null);
      setRoseData([]);
    };
  }, [segmentsGroupByEmotion, rerender]);

  return (
    <div className={Styles.cells}>
      <svg ref={svgRef}></svg>
    </div>
  );
};

export default inject("emotionStore")(observer(EmotionMap));
