package com.movie.movie.modal.domain;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "video_collection")
public class Video implements Serializable {
    private static final long serialVersionUID = 6900009364684268016L;

    @Data
    public class SegmentPair {
        private Integer segmentId;
        private Integer emotionId;
        private Float startVolume;
        private Float endVolume;
        private Float maxVolume;
        private Float minVolume;
        private String time;
    }

    @Id
    private Integer videoId;
    private String videoPath;
    private String type;
    private String title;
    private String uri;
    private String contributor;
    private Object audioSpectrum;
    private List<SegmentPair> emotionList;
    private List<Integer> emotionOrder;
    private String pictureUrl;
    private String captionUrl;
    private String videoUrl;
    private String coloredUrl;

}
