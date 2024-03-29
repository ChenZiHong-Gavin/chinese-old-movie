package com.movie.movie.vo;

import com.movie.movie.modal.domain.Video;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VideoInfoVO implements Serializable {
    private static final long serialVersionUID = 8098876129519848332L;

    private Integer videoId;
    private String videoPath;
    private String type;
    private String title;
    private String uri;
    private String contributor;
    private Object audioSpectrum;
    private List<Video.SegmentPair> emotionList;
    private String captionUrl;
    private String videoUrl;
    private String coloredUrl;
}
