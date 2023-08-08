package com.movie.movie.service.impl;
import com.movie.movie.modal.domain.Video;
import com.movie.movie.repository.VideoCusRepository;
import com.movie.movie.repository.VideoRepository;
import com.movie.movie.service.VideoService;
import com.movie.movie.vo.VideoInfoVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.util.ArrayList;
import java.util.Optional;

@Service
public class VideoServiceImpl implements VideoService {
    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private VideoCusRepository videoCusRepository;

    @Override
    public VideoInfoVO getVideoSelected(Integer videoId) {
        Optional<Video> video = videoRepository.findById(videoId);
        VideoInfoVO videoInfoVO = VideoInfoVO.builder()
                .videoId(video.get().getVideoId())
                .videoPath(video.get().getVideoPath())
                .type(video.get().getType())
                .title(video.get().getTitle())
                .uri(video.get().getUri())
                .contributor(video.get().getContributor())
                .audioSpectrum(video.get().getAudioSpectrum())
                .emotionList(video.get().getEmotionList())
                .build();

        return videoInfoVO;
    }

    @Override
    public VideoInfoVO getVideoSelectedByEmotionOrder(String emotionOrder) {
        String[] emotionOrderArray = emotionOrder.split(";");
        ArrayList<Integer> emotionOrderList = new ArrayList<>();
        for (String s : emotionOrderArray) {
            if (s.equals("")) {
                continue;
            }
            emotionOrderList.add(Integer.parseInt(s));
        }
        Video video = videoCusRepository.findVideoByEmotionOrder(emotionOrderList);
        VideoInfoVO videoInfoVO = VideoInfoVO.builder()
                .videoId(video.getVideoId())
                .videoPath(video.getVideoPath())
                .type(video.getType())
                .title(video.getTitle())
                .uri(video.getUri())
                .contributor(video.getContributor())
                .audioSpectrum(video.getAudioSpectrum())
                .emotionList(video.getEmotionList())
                .build();
        return videoInfoVO;
    }
}
